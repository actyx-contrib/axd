import { Node } from "./types"

export const isConnectedTo = (fromNode: Node, toNode: Node): boolean => {
    if (!fromNode.peers) { return false }
    return fromNode.peers.filter(p => p.state === 'Connected').filter(p => p.addrs.some(addr => addr.includes(toNode.addr))).length > 0
}