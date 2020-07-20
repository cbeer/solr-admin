import React from 'react';
import useFetch from 'use-http';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Chip from '@material-ui/core/Chip';
import List from '@material-ui/core/List';
import CoreListItem from '../components/CoreListItem';

function LiveNode({ node, system = { lucene: {}, jvm: {} }, roles = [], cores = []}) {

  return <Card style={{ height: '100%' }}>
    <CardContent>
      {roles.map(r => <Chip key={r} label={r} variant="outlined" />)}
      <Typography component="h3" variant="h6">{node}</Typography>
      <dl>
        <dt>Solr</dt><dd><Typography color="textSecondary" title={system.lucene['solr-impl-version']}>{system.lucene['solr-spec-version']}</Typography></dd>
        <dt>Lucene</dt><dd><Typography color="textSecondary" title={system.lucene['lucene-impl-version']}>{system.lucene['lucene-spec-version']}</Typography></dd>
        <dt>JVM</dt><dd><Typography color="textSecondary">{system.jvm['version']}</Typography></dd>
      </dl>

      <Typography component="h5" variant="overline">Collections</Typography>
      <List dense>
        {cores.sort((a, b) => a.collection.localeCompare(b.collection)).map((c) => (
          <CoreListItem key={`${c.collection}-${c.shard}-${c.key}`}  core={c} />
        ))}
      </List>
    </CardContent>
  </Card>;
}

function LiveNodes({ cluster: { live_nodes: nodes = [], roles = {}, collections = {} } }) {
  if (nodes.length === 0) return  null;

  const { data: nodesStatus = {} } = useFetch(`/solr/admin/info/system?nodes=${nodes.join(',')}&wt=json`, {
    suspense: true
  }, []) // onMount

  return <React.Fragment>
    <Grid container spacing={3}>
      {nodes.sort().map(node => (
        <Grid key={node} item xs>
          <LiveNode
            node={node}
            system={nodesStatus[node]}
            roles={Object.keys(roles).filter(role => roles[role].includes(node))}
            cores={
              Object.keys(collections).reduce((arr, c) => [
                ...arr, ...Object.keys(collections[c].shards).reduce((a, s) => [
                  ...a,
                  ...Object.entries(collections[c].shards[s].replicas).filter(([_k, { node_name }]) => node_name === node).map(([k, v]) => (
                    { key: k, ...v, replicas: Object.keys(collections[c].shards[s].replicas).length, shard: s, collection: c }
                  ))
                ], [])
              ], [])
            }
          />
        </Grid>
      ))}
    </Grid>
  </React.Fragment>;
}

export default () => {
  const { data: clusterStatus } = useFetch('/solr/admin/collections?action=CLUSTERSTATUS&wt=json', {
    suspense: true // can put it in 2 places. Here or in Provider
  }, []) // onMount

  const { data: overseerStatus = {} } = useFetch('/v2/cluster/overseer', {
    suspense: true // can put it in 2 places. Here or in Provider
  }, []) // onMount

  const { data: introspect = { spec: [{ commands: {} }] } } = useFetch('/v2/cluster/_introspect', {
    suspense: true // can put it in 2 places. Here or in Provider
  }, []) // onMount

  return <React.Fragment>
    <Typography variant="h2">Nodes</Typography>
    <LiveNodes cluster={(clusterStatus && clusterStatus.cluster) || {}} />
  </React.Fragment>;
};
