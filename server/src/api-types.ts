import * as io from "io-ts";

export const Response_Internal_Swarm_State_Ok = io.type({
  Ok: io.type({
    swarm: io.type({
      listen_addrs: io.array(io.string),
      peer_id: io.string,
      peers: io.record(
        io.string,
        io.type({
          addresses: io.record(
            io.string,
            io.type({
              provenance: io.string,
              state: io.union([
                io.string,
                io.type({ Connected: io.type({ since: io.number }) }),
                io.type({ Disconnected: io.type({ since: io.number }) }),
              ]),
            })
          ),
          connection_state: io.string,
        })
      ),
    }),
  }),
});

export type Response_Internal_Swarm_State_Ok = io.TypeOf<
  typeof Response_Internal_Swarm_State_Ok
>;

export const Response_Internal_Swarm_State_Err = io.type({
  Err: io.type({ code: io.string, message: io.string }),
});

export type Response_Internal_Swarm_State_Err = io.TypeOf<
  typeof Response_Internal_Swarm_State_Err
>;

export const Response_Internal_Swarm_State = io.union([
  Response_Internal_Swarm_State_Ok,
  Response_Internal_Swarm_State_Err,
]);

export type Response_Internal_Swarm_State = io.TypeOf<
  typeof Response_Internal_Swarm_State
>;
