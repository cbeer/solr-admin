import React from 'react';
import useFetch from 'use-http';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import deepmerge from 'deepmerge';
import Autocomplete, { createFilterOptions } from '@material-ui/lab/Autocomplete';
import { Properties } from './Properties';
import { getCommand } from '../lib/solr/introspect';

const filter = createFilterOptions();

const errata = {
  properties: { skip: true },
};

export default function CreateCollectionDialog({ open, onClose, onSave}) {
  const [state, setState] = React.useState({});

  const { data: { configSets } } = useFetch('/v2/cluster/configs', {
    data: { configSets: [] },
    suspense: true // can put it in 2 places. Here or in Provider
  }, []) // onMount

  const { data: { nodes } } = useFetch('/v2/cluster/nodes', {
    data: { nodes: [] },
    suspense: true // can put it in 2 places. Here or in Provider
  }, []) // onMount

  const { data: introspect } = useFetch('/v2/c/_introspect', {
    data: { spec: [{ commands: {} }] },
    suspense: true // can put it in 2 places. Here or in Provider
  }, []) // onMount

  const setProperties = (properties) => {
    setState({ ...state, ...properties});
  }

  const handleSubmit = () => {
    onSave(state);
    onClose();
  }

  const handleCancel = () => {
    setState({});
    onClose();
  }

  const schema = (getCommand(introspect, 'create') || {}).properties;

  const data = {
    nodeSet: {
      enum: nodes,
    },
    config: {
      enum: configSets,
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleCancel}
      aria-labelledby="collections-modal-title"
    >
      <DialogTitle id="collections-modal-title">Create collection</DialogTitle>
      <DialogContent>
        <Table>
          <TableBody>
            <Properties properties={deepmerge(schema, deepmerge(errata, data))} data={state} setData={setProperties} />
          </TableBody>
        </Table>
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
