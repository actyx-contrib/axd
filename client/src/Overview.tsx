import React, { useEffect, useState } from "react";
import logo from "./logo.svg";
import "./App.css";
import {
  AppBar,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Collapse,
  Container,
  CssBaseline,
  Grid,
  IconButton,
  makeStyles,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Toolbar,
  Typography,
} from "@material-ui/core";
import KeyboardArrowUpIcon from "@material-ui/icons/KeyboardArrowUp";
import KeyboardArrowDownIcon from "@material-ui/icons/KeyboardArrowDown";
import { Option } from "fp-ts/Option";
import { Provider, useDispatch, useSelector } from "react-redux";
import { applyMiddleware, createStore } from "@reduxjs/toolkit";
import { reducer, State, Action, store } from "./state";
import { Server } from "./server";
import moment from "moment";
import { Node } from "./common";

interface ValOrNoneProps<T> {
  value: T | T[] | undefined | null;
  label?: string;
  transform?: (val: T) => string;
  none?: string;
  filter?: (val: T) => boolean;
}
const ValueOrNone = <T extends unknown>({
  value,
  label,
  transform,
  none,
  filter,
}: ValOrNoneProps<T>) => {
  const noneStr = none || "None";

  if (
    value === undefined ||
    value === null ||
    (Array.isArray(value) && value.length < 1)
  ) {
    return (
      <>
        {label ? `${label}: ` : ""}
        {noneStr}
      </>
    );
  }
  if (Array.isArray(value) && value.length > 1) {
    return (
      <>
        {label ? `${label}: ` : ""}
        <ul>
          {value
            .filter((v) => (filter ? filter(v) : true))
            .map((v, i) => {
              <li key={v + i.toString()}>
                {transform
                  ? transform(v)
                  : typeof v === "string"
                  ? v
                  : JSON.stringify(v)}
              </li>;
            })}
        </ul>
      </>
    );
  }

  if (!Array.isArray(value)) {
    return (
      <>
        {label ? `${label}: ` : ""}
        {transform
          ? transform(value)
          : typeof value === "string"
          ? value
          : JSON.stringify(value)}
      </>
    );
  }

  return <>Unknown value</>;
};

const useStyles = makeStyles({
  table: {
    minWidth: 650,
  },
});

const NodeRow = ({ node }: { node: Node }) => {
  const [open, setOpen] = React.useState(false);
  const classes = makeStyles({
    root: {
      "& > *": {
        borderBottom: "unset",
      },
    },
  })();

  return (
    <>
      <TableRow className={classes.root}>
        <TableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell component="th" scope="row">
          {node.addr}
        </TableCell>
        <TableCell>
          <ValueOrNone
            value={node.lastRequestAt}
            transform={(val) => moment(val).format("HH:mm:ss")}
          />
        </TableCell>
        <TableCell>
          <ValueOrNone
            value={node.lastResponseAt}
            transform={(val) => moment(val).format("HH:mm:ss")}
          />
        </TableCell>
        <TableCell>
          {!node.peers
            ? "None "
            : node.peers
                .filter((p) => p.state === "Connected")
                .length.toString()}
        </TableCell>
        <TableCell></TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box margin={1}>
              <Typography variant="body2">
                <ul>
                  <li>
                    {!node.peers || node.peers.length < 1 ? (
                      "Peers: none"
                    ) : (
                      <>
                        Peers
                        <ul>
                          {node.peers.map((p) => (
                            <li key={p.id}>
                              <strong>{p.state}</strong> {p.id}:
                              <ul>
                                {p.addrs.map((addr) => (
                                  <li key={p.id + addr}>{addr}</li>
                                ))}
                              </ul>
                            </li>
                          ))}
                        </ul>
                      </>
                    )}
                  </li>
                  <li>
                    <ValueOrNone
                      value={node.listenAddrs}
                      label="Listen addresses"
                    />
                  </li>
                  <li>
                    Announce addresses:
                    {(node.settings as any) &&
                    (node.settings as any).general &&
                    (node.settings as any).general.announceAddresses.length >
                      1 ? (
                      <ul>
                        {(node.settings as any).general.announceAddresses.map(
                          (addr: any) => (
                            <li>{addr}</li>
                          )
                        )}
                      </ul>
                    ) : (
                      "none."
                    )}
                  </li>
                  <li>
                    Bootstrap nodes:
                    {(node.settings as any) &&
                    (node.settings as any).general &&
                    (node.settings as any).general.bootstrapNodes.length > 1 ? (
                      <ul>
                        {(node.settings as any).general.bootstrapNodes.map(
                          (addr: any) => (
                            <li>{addr}</li>
                          )
                        )}
                      </ul>
                    ) : (
                      "none."
                    )}
                  </li>
                </ul>
              </Typography>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};

const NodesTable = () => {
  const classes = useStyles();
  const nodes = useSelector((s: State) => s.nodes);

  return (
    <TableContainer component={Paper}>
      <Table className={classes.table} size="small">
        <TableHead>
          <TableRow>
            <TableCell></TableCell>
            <TableCell>Address</TableCell>
            <TableCell>Last request</TableCell>
            <TableCell>Last response</TableCell>
            <TableCell>Peers</TableCell>
            <TableCell>Addresses</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {nodes
            .sort((a, b) => a.addr.localeCompare(b.addr))
            .map((node) => (
              <NodeRow key={node.addr} node={node} />
            ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

const AddNodeForm = () => {
  const classes = makeStyles((theme) => ({
    root: {
      padding: theme.spacing(1),
    },
    form: {
      display: "flex",
      flexDirection: "row",
      alignItems: "baseline",
      "& > *": {
        marginRight: 10,
      },
    },
  }))();

  const [addr, setAddr] = useState("");
  const [err, setErr] = useState("");
  const dispatch = useDispatch();
  const nodes = useSelector((s: State) => s.nodes);
  
  const showMap = () => {
    dispatch(Action.ShowMap())
  }

  const onChangeValue = (value: string) => {
    setAddr(value);
    if (nodes.map((n) => n.addr).includes(value)) {
      setErr("Node already added");
    } else if (err === "Node already added") {
      setErr("");
    }
  };

  const doAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await Server.AddNode(addr);
    setAddr("");
  };

  return (
    <div className={classes.root}>
      <form
        className={classes.form}
        noValidate
        autoComplete="off"
        onSubmit={doAdd}
      >
        <TextField
          label="Address"
          value={addr}
          onChange={(e) => onChangeValue(e.target.value)}
          error={err !== ""}
          helperText={err}
          variant="standard"
        />
        <Button
          variant="contained"
          color="primary"
          disabled={addr.length === 0 || err !== ""}
          type="submit"
        >
          ADD NODE
        </Button>
        <Button
          variant="contained"
          color="secondary"
          onClick={showMap}
        >
          VIEW MAP
        </Button>
      </form>
    </div>
  );
};

const Debug = () => {
  const classes = makeStyles((theme) => ({
    root: {
      padding: theme.spacing(1),
    },
  }))();
  const state = useSelector((s: State) => s);
  return (
    <div className={classes.root}>
      <p>State:</p>
      <pre>{JSON.stringify(state, null, 2)}</pre>
    </div>
  );
};

export const NodeCard = ({ node }: { node: Node }) => {
  const dispatch = useDispatch();
  const classes = makeStyles({
    root: {
      width: "100%",
    },
    title: {
      fontSize: 14,
    },
    pos: {
      marginBottom: 12,
    },
  })();

  const showDetail = (node: Node) => {
    dispatch(Action.ShowDetail(node));
  };

  const removeNode = async (node: Node) => {
    await Server.RemoveNode(node);
  };

  return (
    <Card className={classes.root}>
      <CardContent>
        <Typography
          className={classes.title}
          color="textSecondary"
          gutterBottom
        >
          {node.lastResponseAt
            ? moment(node.lastResponseAt).format("[Last seen at] HH:mm:ss")
            : "Never seen"}
        </Typography>
        <Typography variant="h5" component="h2">
          {node.addr}
        </Typography>
        <Typography variant="body2" component="p">
          {node.settings === null
            ? "No information about node available."
            : `Connected to ${
                node.peers === null
                  ? "?"
                  : node.peers.filter((p) => p.state === "Connected").length
              } peers. Using ${
                node.settings.general.bootstrapNodes.length
              } bootstrap nodes. Announcing ${
                node.listenAddrs === null ? "?" : node.listenAddrs.length
              } addresses.`}
        </Typography>
      </CardContent>
      <CardActions>
        <Button onClick={() => showDetail(node)} size="small" color="primary">
          View details
        </Button>
        <Button onClick={() => removeNode(node)} size="small" color="secondary">
          Remove
        </Button>
      </CardActions>
    </Card>
  );
};

export const Overview = ({ nodes }: {nodes: Node[]}) => {
  const classes = useStyles();
  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <AddNodeForm />
      </Grid>
      {nodes
        .sort((a, b) => a.addr.localeCompare(b.addr))
        .map((node) => (
          <Grid key={node.addr} item lg={3} md={4} sm={6} xs={12}>
            <NodeCard node={node} />
          </Grid>
        ))}
      </Grid>
  );
};
