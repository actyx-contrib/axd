import * as express from "express";
import * as http from "http";
import { Server, Socket } from "socket.io";
import debug from "debug";
import * as path from 'path'
import {
  Ack,
  ClientEvent,
  ServerEvent,
  Node,
  NodeUpdated,
  NodeRemoved,
  NodeSettings,
} from "./common";
import { isLeft } from "fp-ts/Either";
import { formatValidationErrors } from "io-ts-reporters";
import { Encoder } from "io-ts";
import { CLI } from "./cli";
import * as fetch from "isomorphic-fetch";
import {
  Response_Internal_Swarm_State,
  Response_Internal_Swarm_State_Ok,
} from "./api-types";
import { axIsInstalled } from "./util";

const d = debug("axd");

export const run = async (host: string, port: number) => {

  if (!(await axIsInstalled())) {
    console.error(`Unable to find the Actyx CLI (ax) in your path. Please install it first.`)
    process.exit(1)
  }



  const app = express();

  app.use('/', express.static(path.join(__dirname, '..', 'static', 'client')))

  const server = http.createServer(app);

  const socket = new Server(server, {
    cors: {
      origin: "*",
    },
  });

  const emit = async <T extends ServerEvent>(
    encoder: Encoder<T, unknown>,
    event: T
  ): Promise<void> => {
    socket.emit("axd", encoder.encode(event));
  };

  let nodes: Node[] = [];

  const Actions = {
    AddNode: async (addr: string): Promise<void> => {
      if (nodes.map((n) => n.addr).includes(addr)) {
        d(`Not adding node at ${addr} since already added.`)
        return
      }
      const newNode: Node = {
        addr,
        lastRequestAt: null,
        lastResponseAt: null,
        peers: null,
        listenAddrs: null,
        settings: null,
      };
      nodes = nodes.concat([newNode]);

      d(`Added node at ${addr}`)
      emit(NodeUpdated, {
        key: "NodeUpdated",
        node: newNode,
      });
    },
    RemoveNode: async (node: Node): Promise<void> => {
      if (!nodes.map((n) => n.addr).includes(node.addr)) {
        d(`Unable to remove node at ${node.addr} since node not known.`)
        return
      }

      nodes = nodes.filter((n) => n.addr !== node.addr);
      d(`Removed node at ${node.addr}`)
      emit(NodeRemoved, {
        key: "NodeRemoved",
        node: node,
      });
    },
    UpdateNode: async (updatedNode: Node): Promise<void> => {
      if (!nodes.map((n) => n.addr).includes(updatedNode.addr)) {
        d(`Skipping update of node at ${updatedNode.addr} since it has been removed.`)
      }

      nodes = nodes
        .filter((n) => n.addr !== updatedNode.addr)
        .concat([updatedNode]);

      d(`Updated info about node at ${updatedNode.addr}.`)
      emit(NodeUpdated, {
        key: "NodeUpdated",
        node: updatedNode,
      });
    },
  };

  const onEvent = async (rawEvent: unknown, cb: any) => {
    const event = ClientEvent.decode(rawEvent);
    if (isLeft(event)) {
      cb(
        Ack.encode({
          status: "error",
          reason: formatValidationErrors(event.left).join(", "),
        })
      );
      return;
    }

    switch (event.right.key) {
      case "RequestAddNode": {
        try {
          await Actions.AddNode(event.right.addr);
          cb(Ack.encode({ status: "ok" }));
          return;
        } catch (error) {
          cb(Ack.encode({ status: "error", reason: error.toString() }));
          return;
        }
      }
      case "RequestRemoveNode": {
        try {
          await Actions.RemoveNode(event.right.node);
          cb(Ack.encode({ status: "ok" }));
          return;
        } catch (error) {
          cb(Ack.encode({ status: "error", reason: error.toString() }));
          return;
        }
      }
    }
  };

  const getInfoFromNodes = async () => {
    await Promise.all(
      nodes.map(async (node) => {
        d(`Requesting info from node ${node.addr}`)
        const updatedNode: Node = {
          ...node,
          lastRequestAt: new Date(),
        };

        // Check if the node if reachable
        try {
          d(`Checking connectivity to node ${node.addr}`)
          const res = await CLI.Nodes.Ls(node.addr);
          if (res.result[0].connection === "reachable") {
            updatedNode.lastResponseAt = new Date();
          }
        } catch (error) {
          d(`Did not get a response from node ${node.addr}`);
        }

        if (updatedNode.lastResponseAt === node.lastResponseAt) {
          d(`Unable to reach node ${node.addr}, skipping other requests.`)
          await Actions.UpdateNode({
            ...updatedNode,
            lastResponseAt: null,
            peers: null,
            settings: null,
            listenAddrs: null,
          });
          return
        }

        try {
          d(`Getting node settings for node ${node.addr}`)
          const res = await CLI.Settings.Get(node.addr, "com.actyx.os");
          if (res.code === "OK") {
            const decoded = NodeSettings.decode(res.result);
            if (isLeft(decoded)) {
              console.error(`Error decoding node settings from ${node.addr}:`);
              formatValidationErrors(decoded.left).forEach((err) => {
                console.error(err);
              });
              process.exit(1);
            }
            updatedNode.settings = decoded.right;
          }
        } catch (error) {
          d(`Did not get a response from node ${node.addr}`);
        }

        // Get the node's peers (try this even if ls fails)
        try {
          d(`Getting internal swarm state for node ${node.addr}`)
          const res = await fetch(
            `http://${node.addr}:4457/_internal/swarm/state`
          );
          if (res.status === 200) {
            const decoded = Response_Internal_Swarm_State.decode(
              await res.json()
            );
            if (isLeft(decoded)) {
              console.error(
                `Error decoding response from _internal/swarm/state. This is a bug; please let us know.`
              );
              formatValidationErrors(decoded.left).forEach(console.error);
              process.exit(1);
            }

            if ((decoded.right as any).Ok !== undefined) {
              const state = decoded.right as Response_Internal_Swarm_State_Ok;
              updatedNode.listenAddrs = state.Ok.swarm.listen_addrs;
              updatedNode.peers = Object.entries(state.Ok.swarm.peers).map(
                ([id, val]) => ({
                  id,
                  addrs: Object.keys(val.addresses),
                  state: val.connection_state as
                    | "Connected"
                    | "Disconnected"
                    | "Connecting",
                })
              );
            }
          } else {
            d(`Got unexpected status code ${res.status} checking internal swarm state for node ${node.addr}`)
          }
        } catch (error) {}

        await Actions.UpdateNode(updatedNode);
      })
    );
  }

  // Loop

  const loop = async () => {
    await getInfoFromNodes()
    setTimeout(loop, 5000)
  }
  loop()

  socket.on("connection", (socket: Socket) => {
    d(`New client connected (id: ${socket.id})`);
    socket.on("axd", onEvent);
  });

  server.listen(port, host, () => {
    console.log(`Open the AXD UI at http://${host}:${port}/`);
  });
};
