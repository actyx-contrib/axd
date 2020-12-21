import React, { useEffect, useState } from "react";
import logo from "./logo.svg";
import "./App.css";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  AppBar,
  Box,
  Button,
  Collapse,
  Container,
  CssBaseline,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
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
  Chip,
} from "@material-ui/core";
import Alert from '@material-ui/lab/Alert';
import LaunchIcon from "@material-ui/icons/Launch";
import { Option } from "fp-ts/Option";
import { Provider, useDispatch, useSelector } from "react-redux";
import { applyMiddleware, createStore } from "@reduxjs/toolkit";
import { reducer, State, Action, store } from "./state";
import { Server } from "./server";
import moment from "moment";
import { Node, isConnectedTo } from "./common";
import ReactJson from 'react-json-view'

const useStyles = makeStyles(theme => ({
  root: {
    wordBreak: "break-word"
  },
  paper: {
    padding: theme.spacing(2),
  },
  content: {
    padding: 20,
  },
  table: {
    minWidth: 650,
  },
  title: {
    paddingBottom: theme.spacing(2),
  },
  data: {
    backgroundColor: "#eaeaea",
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
    paddingTop: theme.spacing(0.5),
    paddingBottom: theme.spacing(0.5),
    fontFamily: "monospace",
    fontWeight: 600,
    color: "#3f51b5",
  },
  section: {
    display: "block",
  },
  connectedChip: {
    color: "#4caf50",
    borderColor: "#4caf50" 
  },
  launchIcon: {
    fontSize: '1rem',
  }
}));

export const Map = ({ nodes }: { nodes: Node[] }) => {
  const dispatch = useDispatch();
  const classes = useStyles();
  const goBack = () => {
    dispatch(Action.UnshowMap());
  };

  const showDetail = (node: Node) => {
    dispatch(Action.ShowDetail(node))
  }

  return (
    <div className={classes.root}>
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Button
          onClick={goBack}
          size="small"
          color="default"
          variant="contained"
        >
          Overview
        </Button>
      </Grid>
      {nodes.length < 2 && <Grid item xs={12}>
        <Alert severity="warning">
            Map will only show when at least two nodes are available.
        </Alert>
      </Grid>}
      {nodes.length > 1 && <Grid item xs={12}>
           <TableContainer component={Paper} className={classes.paper}>
      <Table className={classes.table} size="small" aria-label="a dense table">
        <TableHead>
          <TableRow>
            <TableCell>From</TableCell>
            <TableCell>To</TableCell>
            <TableCell>State</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {nodes.sort((a,b) => a.addr.localeCompare(b.addr)).map(from => 
            nodes.filter(n => n.addr !== from.addr).sort((a,b) => a.addr.localeCompare(b.addr)).map((to, index) => 
              <TableRow key={from.addr+to.addr}>
                <TableCell component="th" scope="row">
                  {index == 0 ? <>
                  {from.addr}
                  <IconButton color="default" size="small" onClick={() => showDetail(from)}>
                    <LaunchIcon className={classes.launchIcon} />
                  </IconButton>
                    </>: ''}
                  </TableCell>
                  <TableCell>
                  {to.addr}
                </TableCell>
                <TableCell>
                  {isConnectedTo(from, to) ? (
                    <Chip className={classes.connectedChip} label="CONNECTED" color="primary" size="small" variant="outlined" />
                  ) : (
                    <Chip label="DISCONNECTED" color="secondary" size="small" variant="outlined" />
                  )}
                </TableCell>
              </TableRow>
              )

          )}
        </TableBody>
      </Table>
    </TableContainer>
      </Grid>}
    </Grid>
    </div>
  );
};
