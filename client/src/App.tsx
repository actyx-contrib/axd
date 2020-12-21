import React, { useEffect } from "react";
import "./App.css";
import {
  AppBar,
  CssBaseline,
  makeStyles,
  Toolbar,
  Typography,
} from "@material-ui/core";
import { Provider,  useSelector } from "react-redux";
import { State, store } from "./state";
import { Overview } from "./Overview";
import { Detail } from "./Detail";
import { Map } from "./Map";

const useStyles = makeStyles({
  root: {
    width: "100%",
    maxWidth: "100%",
  },
  content: {
    padding: 20,
  },
  table: {
    minWidth: 650,
  },
});

const Content = () => {
  const allNodes = useSelector((s: State) => s.nodes);
  const nodeToShowDetail = useSelector((s: State) => s.currentDetailNode);
  const showingMap = useSelector((s: State) => s.showingMap);
  return showingMap ? <Map nodes={allNodes} /> : nodeToShowDetail ? <Detail node={nodeToShowDetail} /> : <Overview nodes={allNodes} />
};

const App = () => {
  const classes = useStyles();

  return (
    <Provider store={store}>
        <div className={classes.root}>
          <CssBaseline />
          <AppBar position="static">
            <Toolbar>
              <Typography variant="h6">Actyx Diagnostics</Typography>
            </Toolbar>
          </AppBar>
          <div className={classes.content}>
            <Content />
          </div>
        </div>
      </Provider>
    );
};

export default App;
