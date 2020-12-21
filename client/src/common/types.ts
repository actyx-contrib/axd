import * as io from 'io-ts'
import { DateFromISOString } from 'io-ts-types'

const NodeSettings_LogLevel = io.union([
  io.literal('TRACE'),
  io.literal('DEBUG'),
  io.literal('WARN'),
  io.literal('INFO'),
  io.literal('ERROR'),
  io.literal('FATAL'),
])

export const NodeSettings = io.type({
  general: io.type({
    displayName: io.string,
    swarmKey: io.string,
    bootstrapNodes: io.array(io.string),
    announceAddresses: io.array(io.string),
    logLevels: io.type({
      os: NodeSettings_LogLevel,
      apps: NodeSettings_LogLevel,
    }),
  }),
  services: io.type({
    eventService: io.type({
      topic: io.string,
      readOnly: io.boolean,
    }),
  }),
})

export const Node = io.type({
  addr: io.string,
  lastRequestAt: io.union([io.null, DateFromISOString]),
  lastResponseAt: io.union([io.null, DateFromISOString]),
  listenAddrs: io.union([io.null, io.array(io.string)]),
  peers: io.union([
    io.null,
    io.array(
      io.type({
        id: io.string,
        addrs: io.array(io.string),
        state: io.union([
          io.literal('Connected'),
          io.literal('Disconnected'),
          io.literal('Connecting'),
        ]),
      }),
    ),
  ]),
  settings: io.union([io.null, NodeSettings]),
})

export type Node = io.TypeOf<typeof Node>

// -- Events emitted by client
export const RequestAddNode = io.type({
  key: io.literal('RequestAddNode'),
  addr: io.string,
})
export type RequestAddNode = io.TypeOf<typeof RequestAddNode>

export const RequestRemoveNode = io.type({
  key: io.literal('RequestRemoveNode'),
  node: Node,
})
export type RequestRemoveNode = io.TypeOf<typeof RequestRemoveNode>

// -- Events emitted by server
export const NodeUpdated = io.type({
  key: io.literal('NodeUpdated'),
  node: Node,
})
export type NodeUpdated = io.TypeOf<typeof NodeUpdated>

export const NodeRemoved = io.type({
  key: io.literal('NodeRemoved'),
  node: Node,
})
export type NodeRemoved = io.TypeOf<typeof NodeRemoved>

export const ClientEvent = io.union([RequestAddNode, RequestRemoveNode])
export type ClientEvent = io.TypeOf<typeof ClientEvent>
export const ServerEvent = io.union([NodeUpdated, NodeRemoved])
export type ServerEvent = io.TypeOf<typeof ServerEvent>

export const Ack = io.union([
  io.type({
    status: io.literal('ok'),
  }),
  io.type({
    status: io.literal('error'),
    reason: io.string,
  }),
])
export type Ack = io.TypeOf<typeof Ack>
