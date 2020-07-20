import React from 'react';
import useFetch from 'use-http';
import Typography from '@material-ui/core/Typography';
import Chip from '@material-ui/core/Chip';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Divider from '@material-ui/core/Divider';
import Properties, { transformData } from '../components/Properties';

function LiveNode({ node, system = { lucene: {}, jvm: {} }, roles = []}) {
  return <ListItem dense alignItems="flex-start" style={{ marginBottom: '0.5rem', marginRight: '0.5rem', backgroundColor: '#fff', width: 'auto' }}>
    <ListItemText primary={node} secondary={<React.Fragment>
      <Typography title={system.lucene['solr-impl-version']} component="span">
        {`Solr ${system.lucene['solr-spec-version']}`}
      </Typography>
      {roles.map(r => <Chip key={r} label={r} variant="outlined" />)}
      </React.Fragment>} />
  </ListItem>;
}

function LiveNodes({ cluster: { live_nodes: nodes = [], roles = {}, collections = {} } }) {
  if (nodes.length === 0) return  null;

  const { data: nodesStatus = {} } = useFetch(`/solr/admin/info/system?nodes=${nodes.join(',')}&wt=json`, {
    suspense: true
  }, []) // onMount

  return <React.Fragment>
    <Typography variant="h3">Nodes</Typography>
      <List dense style={{ display: 'flex', flexWrap: 'wrap' }}>
      {nodes.sort().map(node => (
        <LiveNode
          key={node}
          node={node}
          system={nodesStatus[node]}
          roles={Object.keys(roles).filter(role => roles[role].includes(node))}
        />
      ))}
      </List>
  </React.Fragment>;
}

const errata = {
  collectionDefaults: { deprecated: true },
  maxCoresPerNode: { type: 'integer' },
};

export default () => {
  const { post } = useFetch('/v2/cluster/');

  const { data: clusterStatus } = useFetch('/solr/admin/collections?action=CLUSTERSTATUS&wt=json', {
    suspense: true // can put it in 2 places. Here or in Provider
  }, []) // onMount

  const { data: overseerStatus = {} } = useFetch('/v2/cluster/overseer', {
    suspense: true // can put it in 2 places. Here or in Provider
  }, []) // onMount

  const { data: introspect = { spec: [{ commands: {} }] } } = useFetch('/v2/cluster/_introspect', {
    suspense: true // can put it in 2 places. Here or in Provider
  }, []) // onMount

  const initialData = clusterStatus && clusterStatus.cluster && clusterStatus.cluster.properties;
  const schema = introspect && introspect.spec && introspect.spec[0].commands['set-obj-property'];

  async function onSave (data) {
    await post('', { 'set-obj-property': transformData(data, initialData, true) });
  }

  return <React.Fragment>
    <Typography variant="h2">Cluster</Typography>
    <LiveNodes cluster={(clusterStatus && clusterStatus.cluster) || {}} />
    <Divider />
    <Properties errata={errata} onSave={onSave} data={initialData} schema={schema}/>
  </React.Fragment>;
};
