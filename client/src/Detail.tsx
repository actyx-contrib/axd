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
  Link,
} from "@material-ui/core";
import KeyboardArrowUpIcon from "@material-ui/icons/KeyboardArrowUp";
import KeyboardArrowDownIcon from "@material-ui/icons/KeyboardArrowDown";
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import TrackChangesIcon from '@material-ui/icons/TrackChanges';
import LaunchIcon from "@material-ui/icons/Launch";
import { Option } from "fp-ts/Option";
import { Provider, useDispatch, useSelector } from "react-redux";
import { applyMiddleware, createStore } from "@reduxjs/toolkit";
import { reducer, State, Action, store } from "./state";
import { Server } from "./server";
import moment from "moment";
import { Node } from "./common";
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
  navigate: {
    "& > *": {
      marginRight: 10,
    },
  },
  swarmStateButton: {
    marginTop: theme.spacing(2)
  }
}));

interface Props {
  node: Node;
}

export const Detail = ({ node }: Props) => {
  const dispatch = useDispatch();
  const classes = useStyles();
  const goBack = () => {
    dispatch(Action.UnshowDetail());
  };
  const showMap = () => {
    dispatch(Action.ShowMap())
  }
  console.log('Rendering detail')
  return (
    <div className={classes.root}>
    <Grid container spacing={3}>
      <Grid item xs={12} className={classes.navigate}>
        <Button
          onClick={goBack}
          size="small"
          color="default"
          variant="contained"
        >
          Back
        </Button>
        <Button
          variant="contained"
          color="default"
          onClick={showMap}
          size="small"
        >
          MAP
        </Button>
      </Grid>
      <Grid item xs={12}>
        <Paper className={classes.paper}>
          <Typography className={classes.title} variant="h6" gutterBottom>Details about node at <span className={classes.data}>{node.addr}</span></Typography>
      <Accordion defaultExpanded={true}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1a-content"
          id="panel1a-header"
        >
          <Typography variant="button">Diagnostics</Typography>
        </AccordionSummary>
        <AccordionDetails className={classes.section}>
          <Typography variant="body1" gutterBottom>
            Sent last diagnostics request at: <span className={classes.data}>{!node.lastRequestAt ? 'never' : moment(node.lastRequestAt).format("HH:mm:ss")}</span>
          </Typography>
          <Typography variant="body1" gutterBottom>
            Received last diagnostics response at: <span className={classes.data}>{!node.lastResponseAt ? 'never' : moment(node.lastResponseAt).format("HH:mm:ss")}</span>
          </Typography>
          <Typography variant="body1" gutterBottom>
            Node settings available: <span className={classes.data}>{node.settings !== null ? 'yes' : 'no'}</span>
          </Typography>
        </AccordionDetails>
      </Accordion>
      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel2a-content"
          id="panel2a-header"
        >
          <Typography variant="button">Connectivity</Typography>
        </AccordionSummary>
        <AccordionDetails className={classes.section}>
          <Typography variant="body1">
            Listen addresses:
          </Typography>
          <List dense>
            {!node.listenAddrs &&
              <ListItem>
                <ListItemText
                  primary="no info"
                />
              </ListItem>
            }
            {node.listenAddrs && node.listenAddrs.length === 0 && 
              <ListItem>
                <ListItemText
                  primary="none"
                />
              </ListItem>
            }
            {node.listenAddrs && node.listenAddrs.map(addr => (
              <ListItem key={node.addr+'listen'+addr}>
                <ListItemText
                  primary={addr}
                />
              </ListItem>
            ))}
            </List>
          <Typography variant="body1">
            Configured bootstrap nodes:
          </Typography>
          <List dense>
            {!node.settings &&
              <ListItem>
                <ListItemText
                  primary="no settings"
                />
              </ListItem>
            }
            {node.settings && node.settings.general.bootstrapNodes.length === 0 && 
              <ListItem>
                <ListItemText
                  primary="none"
                />
              </ListItem>
            }
            {node.settings && node.settings.general.bootstrapNodes.map(addr => (
              <ListItem key={node.addr+'bootstrap'+addr}>
                <ListItemText
                  primary={addr}
                />
              </ListItem>
            ))}
            </List>
          <Typography variant="body1">
            Configured announce addresses:
          </Typography>
          <List dense>
            {!node.settings &&
              <ListItem>
                <ListItemText
                  primary="no settings"
                />
              </ListItem>
            }
            {node.settings && node.settings.general.announceAddresses.length === 0 && 
              <ListItem>
                <ListItemText
                  primary="none"
                />
              </ListItem>
            }
            {node.settings && node.settings.general.announceAddresses.map(addr => (
              <ListItem key={node.addr+'announce'+addr}>
                <ListItemIcon>
                  <TrackChangesIcon />
                </ListItemIcon>
                <ListItemText
                  primary={addr}
                />
              </ListItem>
            ))}
            </List>
        </AccordionDetails>
      </Accordion>
      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel2a-content"
          id="panel2a-header"
        >
          <Typography variant="button">Peers</Typography>
        </AccordionSummary>
        <AccordionDetails className={classes.section}>
          <Typography variant="body1">
            Connected:
          </Typography>
          <List dense>
            {!node.peers &&
              <ListItem>
                <ListItemText
                  primary="no info received"
                />
              </ListItem>
            }
            {node.peers && node.peers.filter(p => p.state === 'Connected').length === 0 && 
              <ListItem>
                <ListItemText
                  primary="none"
                />
              </ListItem>
            }
            {node.peers && node.peers.filter(p => p.state === 'Connected').sort((a,b) => a.id.localeCompare(b.id)).map(peer => (
              <ListItem key={node.addr+'peer'+peer.id}>
                <ListItemText
                  primary={`${peer.id.substr(0,10)} (${peer.state})`}
                  secondary={peer.addrs.join(', ')}
                />
              </ListItem>
            ))}
            </List>
          <Typography variant="body1">
            Disconnected:
          </Typography>
          <List dense>
            {!node.peers &&
              <ListItem>
                <ListItemText
                  primary="no info received"
                />
              </ListItem>
            }
            {node.peers && node.peers.filter(p => p.state !== 'Connected').length === 0 && 
              <ListItem>
                <ListItemText
                  primary="none"
                />
              </ListItem>
            }
            {node.peers && node.peers.filter(p => p.state !== 'Connected').sort((a,b) => a.state.localeCompare(b.state)).map(peer => (
              <ListItem key={node.addr+'peer'+peer.id}>
                <ListItemText
                  primary={`${peer.id.substr(0,10)} (${peer.state})`}
                  secondary={peer.addrs.join(', ')}
                />
              </ListItem>
            ))}
            </List>
        </AccordionDetails>
      </Accordion>
      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel3a-content"
          id="panel3a-header"
        >
          <Typography variant="button">Node settings</Typography>
        </AccordionSummary>
        <AccordionDetails className={classes.section}>
          {!node.settings && 
          <Typography variant="body1">
            No settings received.
          </Typography>}
          {node.settings && 
          <ReactJson
          src={node.settings}
          displayDataTypes={false}
          displayObjectSize={false}
          collapsed={false}
          enableClipboard={false}
          />
          }
        </AccordionDetails>
      </Accordion>
      <Button
      target="_blank" 
      rel="noopener"
      href={`http://${node.addr}:4457/_internal/swarm/state`}
      color="primary"
      startIcon={<LaunchIcon />}
      size="small"
      className={classes.swarmStateButton}
      >
        Open swarm state
      </Button>

        </Paper>
      </Grid>
      <Grid item xs={12}>
        <Paper className={classes.paper}>
          <Typography className={classes.title} variant="h6" gutterBottom>Raw data about node at <span className={classes.data}>{node.addr}</span></Typography>
          <ReactJson
          src={node}
          displayDataTypes={false}
          displayObjectSize={false}
          collapsed={true}
          enableClipboard={false}
          />
        </Paper>
      </Grid>
      </Grid>
    </div>
  );
};
