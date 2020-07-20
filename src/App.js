import React, { Suspense } from 'react';
import clsx from 'clsx';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link as RouterLink,
} from "react-router-dom";
import { Provider } from 'use-http';
import CssBaseline from '@material-ui/core/CssBaseline';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import Drawer from '@material-ui/core/Drawer';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeftSharp';
import ChevronRightIcon from '@material-ui/icons/ChevronRightSharp';
import MenuIcon from '@material-ui/icons/MenuSharp';
import SettingsIcon from '@material-ui/icons/SettingsSharp';
import HomeIcon from '@material-ui/icons/HomeSharp';
import ClusterIcon from '@material-ui/icons/AccountTreeSharp';
import NodeIcon from '@material-ui/icons/ComputerSharp';
import CollectionsIcon from '@material-ui/icons/ListAltSharp';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import Home from './pages/Home';
import Cluster from './pages/Cluster';
import Node from './pages/Node';
import Collections from './pages/Collections';

const drawerWidth = 240;

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  appBarShift: {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  menuButton: {
    marginRight: 36,
  },
  hide: {
    display: 'none',
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: 'nowrap',
  },
  drawerOpen: {
    width: drawerWidth,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  drawerClose: {
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    overflowX: 'hidden',
    width: theme.spacing(7) + 1,
    [theme.breakpoints.up('sm')]: {
      width: theme.spacing(9) + 1,
    },
  },
  toolbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: theme.spacing(0, 1),
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
  },
}));

function ListItemLink(props) {
  const { icon, primary, to } = props;

  const renderLink = React.useMemo(
    () => React.forwardRef((itemProps, ref) => <RouterLink to={to} ref={ref} {...itemProps} />),
    [to],
  );

  return (
    <li>
      <ListItem button component={renderLink}>
        {icon ? <ListItemIcon>{icon}</ListItemIcon> : null}
        <ListItemText primary={primary} />
      </ListItem>
    </li>
  );
}

function SettingsModal({ open, settings, onClose, onSave}) {
  const [state, setState] = React.useState(settings);

  const handleSubmit = () => {
    onSave(state);
    onClose();
  }

  const handleCancel = () => {
    setState(settings);
    onClose();
  }

  return (
    <Dialog
      open={open}
      onClose={handleCancel}
      aria-labelledby="settings-modal-title"
    >
      <DialogTitle id="settings-modal-title">Settings</DialogTitle>
      <DialogContent>
        <TextField
          id="settings-url"
          label="URL"
          style={{ margin: 8 }}
          placeholder={settings.url || 'http://...'}
          value={state.url}
          onChange={(e) => setState({ ...state, url: e.target.value })}
          margin="normal"
          fullWidth
          InputLabelProps={{
            shrink: true,
          }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancel} color="primary">
          Cancel
        </Button>
        <Button onClick={handleSubmit} color="primary">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function App() {
  const classes = useStyles();
  const theme = useTheme();
  const [settings, setSettings] = React.useState({
    url: 'http://localhost:8010',
  });
  const [open, setOpen] = React.useState(false);
  const [showSettings, setShowSettings] = React.useState(false);

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const handleClick = () => { setShowSettings(true) }

  return <Router>
    <Provider url={settings.url} options={settings.options}>
      <div className={classes.root}>
        <CssBaseline>
          <AppBar
            position="fixed"
            className={clsx(classes.appBar, {
              [classes.appBarShift]: open,
            })}>
             <Toolbar>
               <IconButton edge="start" color="inherit" aria-label="menu" onClick={handleDrawerOpen}
                  className={clsx(classes.menuButton, {
                    [classes.hide]: open,
                  })}>
                 <MenuIcon />
               </IconButton>
               <Typography component="h1" variant="h6" noWrap>Solr Admin: {settings.url}</Typography>
               <div style={{ flexGrow: 1 }} />
               <IconButton onClick={handleClick} edge="end" color="inherit" aria-label="config">
                 <SettingsIcon />
               </IconButton>
             </Toolbar>
           </AppBar>
          <Drawer
            variant="permanent"
            className={clsx(classes.drawer, {
              [classes.drawerOpen]: open,
              [classes.drawerClose]: !open,
            })}
            classes={{
              paper: clsx({
                [classes.drawerOpen]: open,
                [classes.drawerClose]: !open,
              }),
            }}>
            <div className={classes.toolbar}>
              <IconButton onClick={handleDrawerClose}>
                {theme.direction === 'rtl' ? <ChevronRightIcon /> : <ChevronLeftIcon />}
              </IconButton>
            </div>
            <Divider />
            <List>
              <ListItemLink to="/" primary="Home" icon={<HomeIcon />} />
              <ListItemLink to="/cluster" primary="Cluster" icon={<ClusterIcon />} />
              <ListItemLink to="/node" primary="Node" icon={<NodeIcon />} />
              <ListItemLink to="/collections" primary="Node" icon={<CollectionsIcon />} />
            </List>
          </Drawer>
          <main className={classes.content}>
            <div className={classes.toolbar} />
            <Suspense fallback='Loading...'>
              <Switch>
                <Route path="/cluster">
                  <Cluster />
                </Route>
                <Route path="/node">
                  <Node />
                </Route>
                <Route path="/collections/new">
                  <Collections create={true}/>
                </Route>
                <Route path="/collections/view/:collection">
                  <Collections />
                </Route>
                <Route path="/collections">
                  <Collections />
                </Route>
                <Route path="/">
                  <Home />
                </Route>
              </Switch>
            </Suspense>
          </main>
          <SettingsModal open={showSettings} settings={settings} onSave={setSettings} onClose={() => setShowSettings(false)}/>
        </CssBaseline>
      </div>
    </Provider>
  </Router>
}

export default App
