import React from 'react';
import clsx from 'clsx';
import Typography from '@material-ui/core/Typography';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import Tooltip from '@material-ui/core/Tooltip';
import Avatar from '@material-ui/core/Avatar';
import LeaderIcon from '@material-ui/icons/StarSharp';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  small: {
    width: theme.spacing(3),
    height: theme.spacing(3),
  },
  active: {
    backgroundColor: theme.palette.success.light,
  },
  inactive: {
    backgroundColor: theme.palette.text.disabled,
  },
  recovering: {
    backgroundColor: theme.palette.warning.light,
  },
  down: {
    backgroundColor: theme.palette.error.light,
  },
  recovery_failed: {
    backgroundColor: theme.palette.error.dark,
  },
  leader: {
    // border: '3px solid black',
    // borderColor: theme.palette.primary.main,
  }
}));


export default function CoreListItem ({ core: { collection, shard, state, leader = false, replicas = 0, type } }) {
  const classes = useStyles();

  return (
    <ListItem alignItems="flex-start" disableGutters>
      <ListItemAvatar>
        <Tooltip title={`${leader ? 'Leader; ' : ''}${state}`}>
          <Avatar className={clsx(classes.small, classes[state], { [classes.leader]: leader })}>
            {leader ? <LeaderIcon /> : ''}
          </Avatar>
        </Tooltip>
      </ListItemAvatar>
      <ListItemText primary={
        <React.Fragment>{collection}</React.Fragment>
      } secondary={
        <React.Fragment><Typography variant="subtitle2" component="span">{shard} <small>({replicas})</small></Typography> {type}</React.Fragment>
      } />
    </ListItem>
  );
}
