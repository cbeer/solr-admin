import React, { Suspense } from 'react';
import clsx from 'clsx';
import useFetch from 'use-http';
import { useHistory, useParams } from "react-router-dom";
import Paper from '@material-ui/core/Paper';
import List from '@material-ui/core/List';
import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import Avatar from '@material-ui/core/Avatar';
import AddIcon from '@material-ui/icons/AddBoxSharp';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Properties, { transformData } from '../components/Properties';
import CoreListItem from '../components/CoreListItem';
import CreateCollectionDialog from '../components/CreateCollectionDialog';

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    display: 'flex',
  },
  tabs: {
    borderRight: `1px solid ${theme.palette.divider}`,
    minHeight: '300px',
    overflowY: 'scroll',
    marginRight: '1rem',
  },
  collectionTab: {
    textAlign: 'left',
    textTransform: 'none',
    width: '100%',
  },
  small: {
    fontSize: '0.7rem',
    width: theme.spacing(2),
    height: theme.spacing(2),
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

function CollectionInfo({ collection }) {
  const { data: response } = useFetch(
    '/solr/admin/collections?action=COLSTATUS&collection=' + collection + '&coreInfo=true&segments=true&fieldInfo=true&sizeInfo=true',
    { suspense: true }, []);

  const { data: v2Response, post } = useFetch(
    '/v2/c/' + collection,
    { suspense: true }, []);

  const { data: introspect } = useFetch(
    '/v2/c/' + collection + '/_introspect',
    { suspense: true }, []);

  async function onSave (data) {
   await post('', { 'modify': transformData(data, true) });
  }

  const collectionData = v2Response && v2Response.cluster && v2Response.cluster.collections[collection];

  return <div>
    <Typography variant="h2">{collection}</Typography>
    <Grid container>
    <Grid item xs style={{ maxWidth: 400 }}>
      <Properties onSave={onSave} data={response && response[collection] && response[collection].properties} schema={introspect && introspect.spec && introspect.spec[1].commands.modify} />
    </Grid>
    <Grid item xs>
    <Typography variant="h3">Shards</Typography>
    {collectionData && Object.keys(collectionData.shards).map((shard) => {
      const cores = Object.keys(collectionData.shards[shard].replicas).map((replica) => (
        { ...collectionData.shards[shard].replicas[replica], key: replica, collection: collectionData.shards[shard].replicas[replica].node_name, shard: replica }
      ));
      return (
        <div key={shard}>
          <Typography variant="h4">{shard}</Typography>
          <Typography variant="h5">Replicas</Typography>
          <List dense>
            {cores.sort((a, b) => a.collection.localeCompare(b.collection)).map((c) => (
              <CoreListItem key={c.key} core={c} />
            ))}
          </List>
        </div>
      )
    })}
    </Grid>
    </Grid>
    <Typography variant="h3">Schema</Typography>
  </div>;
}

export default ({ create = false }) => {
  const history = useHistory();
  const classes = useStyles();
  const { data: clusterStatus } = useFetch('/solr/admin/collections?action=CLUSTERSTATUS&wt=json', {
    data: { cluster: { collections: {} } },
    suspense: true // can put it in 2 places. Here or in Provider
  }, []) // onMount
  const collections = Object.keys(clusterStatus.cluster.collections).sort();
  const { collection: value = collections[0] } = useParams();


  const handleChange = (event, newValue) => {
    history.push(`/collections/view/${newValue}`);
  };
  const onCreate = () => { history.push(`/collections/new`)};
  return <React.Fragment>
    <Grid container direction="row" justify="space-between" alignItems="center">
      <Typography variant="h2">Collections</Typography>
      <Button color="primary" variant="contained" onClick={onCreate} startIcon={<AddIcon />}>Create</Button>
    </Grid>
    <CreateCollectionDialog open={create} onSave={(coll) => { history.push(`/collections/view/${coll}`)}} onClose={() => { history.push('/collections')}} />
    <Paper elevation={1} className={classes.root}>
      <Tabs
        orientation="vertical"
        variant="scrollable"
        value={value || (collections || [])[0]}
        onChange={handleChange}
        className={classes.tabs}
      >
        {collections && collections.map(coll => (
          <Tab key={coll} value={coll} label={(
            <Typography className={classes.collectionTab} variant="body2">
              {coll}
              <Grid container>
                <Avatar className={clsx(classes.small)}>
                  {Object.keys(clusterStatus.cluster.collections[coll].shards).length}
                </Avatar>&nbsp; / &nbsp;
                {
                  Object.entries(
                    Object.values(clusterStatus.cluster.collections[coll].shards)
                      .reduce((a, s) => [...a, ...Object.values(s.replicas)], [])
                      .reduce((h, c) => ({ ...h, [c.state]: (h[c.state] || 0) + 1 }), {}))
                      .map(([k,v]) => (<Avatar component="span" className={clsx(classes.small, classes[k])} key={k}>{v}</Avatar>))}
              </Grid>
            </Typography>
          )} />
        ))}
      </Tabs>
      <Suspense fallback='Loading...'>
        { value && <CollectionInfo key={value} collection={value} /> }
      </Suspense>
    </Paper>
  </React.Fragment>;
};
