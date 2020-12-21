import { connect as socketIoConnect } from "socket.io-client";
import { Action, store } from "./state";
import {
  ClientEvent,
  Ack,
  RequestAddNode,
  RequestRemoveNode,
  ServerEvent,
  Node,
} from "./common";
import { Encoder } from "io-ts";
import { isLeft } from "fp-ts/lib/Either";
import { formatValidationErrors } from "io-ts-reporters";

console.log(`Opening websocket connection...`);
const socket = socketIoConnect("http://localhost:1234");
socket.connect();
console.log(` - connected: ${socket.connected}`);
socket.on("axd", (rawEvent: unknown) => {
  const event = ServerEvent.decode(rawEvent);
  if (isLeft(event)) {
    console.error("error decoding server event:");
    formatValidationErrors(event.left).forEach((err) => {
      console.error(err);
    });
    throw new Error("error decoding server event");
  }
  switch (event.right.key) {
    case "NodeRemoved": {
      return store.dispatch(Action.RemoveNode(event.right.node));
    }
    case "NodeUpdated": {
      return store.dispatch(Action.UpdateNode(event.right.node));
    }
  }
});

const emit = async <T extends ClientEvent>(
  encoder: Encoder<T, unknown>,
  event: T
): Promise<void> => {
  console.log(`Sending event: ${JSON.stringify(encoder.encode(event))}`);
  return new Promise((res, rej) => {
    console.log(`Sending and waiting for ack.`);
    socket.emit("axd", encoder.encode(event), (response: unknown) => {
      const ack = Ack.decode(response);
      if (isLeft(ack) || ack.right.status === "error") {
        rej("error getting acknowledgment");
      } else {
        res();
      }
    });
  });
};

export const Server = {
  AddNode: async (addr: string): Promise<void> =>
    await emit(RequestAddNode, {
      key: "RequestAddNode",
      addr,
    }),
  RemoveNode: async (node: Node): Promise<void> =>
    await emit(RequestRemoveNode, {
      key: "RequestRemoveNode",
      node,
    }),
};
