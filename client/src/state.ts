import { Node } from "./common";
import { applyMiddleware, createStore } from "redux";
import { ThunkAction } from "redux-thunk";
import thunkMiddleware from "redux-thunk";

export interface State {
  nodes: Node[];
  showingMap: boolean;
  currentDetailNode: null | Node;
}

export const INITIAL_STATE: State = {
  nodes: [],
  showingMap: false,
  currentDetailNode: null,
};

interface RemoveNode {
  readonly type: "REMOVE_NODE";
  node: Node;
}

interface UpdateNode {
  readonly type: "UPDATE_NODE";
  node: Node;
}

interface ShowDetail {
  readonly type: "SHOW_DETAIL";
  node: Node;
}
interface UnshowDetail {
  readonly type: "UNSHOW_DETAIL";
}
interface ShowMap {
  readonly type: "SHOW_MAP";
}
interface UnshowMap {
  readonly type: "UNSHOW_MAP";
}

export type Action = RemoveNode | UpdateNode | ShowDetail | UnshowDetail | ShowMap | UnshowMap

export const Action = {
  RemoveNode: (node: Node): RemoveNode => ({
    type: "REMOVE_NODE",
    node,
  }),
  UpdateNode: (node: Node): UpdateNode => ({
    type: "UPDATE_NODE",
    node,
  }),
  ShowDetail: (node: Node): ShowDetail => ({
    type: "SHOW_DETAIL",
    node,
  }),
  UnshowDetail: (): UnshowDetail => ({
    type: "UNSHOW_DETAIL",
  }),
  ShowMap: (): ShowMap => ({
    type: "SHOW_MAP",
  }),
  UnshowMap: (): UnshowMap => ({
    type: "UNSHOW_MAP",
  }),
};

export const reducer = (state = INITIAL_STATE, action: Action): State => {
  switch (action.type) {
    case "REMOVE_NODE":
      return {
        ...state,
        nodes: state.nodes.filter((n) => n.addr !== action.node.addr),
        currentDetailNode:
          state.currentDetailNode === null ||
          state.currentDetailNode.addr === action.node.addr
            ? null
            : state.currentDetailNode,
      };
    case "UPDATE_NODE":
      return {
        ...state,
        nodes: state.nodes
          .filter((n) => n.addr !== action.node.addr)
          .concat([action.node]),
        currentDetailNode: state.currentDetailNode === null || state.currentDetailNode.addr !== action.node.addr 
          ? state.currentDetailNode
          : action.node
      };
    case "SHOW_DETAIL":
      return {
        ...state,
        currentDetailNode: action.node,
        showingMap: false
      };
    case "UNSHOW_DETAIL":
      return {
        ...state,
        currentDetailNode: null,
      };
    case "SHOW_MAP":
      return {
        ...state,
        // Remove detail node if set
        currentDetailNode: null,
        showingMap: true,
      };
    case "UNSHOW_MAP":
      return {
        ...state,
        showingMap: false,
      };
    default:
      return state;
  }
};

export const store = createStore(reducer, applyMiddleware(thunkMiddleware));
