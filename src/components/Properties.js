import React, { useState } from 'react';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableRow from '@material-ui/core/TableRow';
import Link from '@material-ui/core/Link';
import Checkbox from '@material-ui/core/Checkbox';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import HelpIcon from '@material-ui/icons/Help';
import SaveIcon from '@material-ui/icons/Save';
import Autocomplete from '@material-ui/lab/Autocomplete';
import deepmerge from 'deepmerge';

const delim = '---';

function PropertyControl({ path, schema: { description, enum: options, properties, type }, value, setData }) {
  const transformValue = (value) => {
    switch (type) {
      case 'array':
        return value.split("\n");
      case 'string':
        return value.length === 0 ? null : value;
      case 'integer':
        return parseInt(value, 10) === 0 ? null : parseInt(value, 10);
      default:
        return value;
    }
  }
  const onChange = (e, value) => {
    const val = (options || type == 'boolean') ? value : transformValue(e.target.value);
    setData(path.reverse().reduce((a, k) => ({ [k]: a }), val))
  }

  if (options) {
    return <Autocomplete
      id={`properties_${path.join(delim)}`}
      value={value || (type === 'array' ?  [] : '')}
      multiple={type === 'array'}
      onChange={onChange}
      options={options}
      renderInput={(params) => (
        <TextField
          {...params}
          variant="standard"
          placeholder={'(blank)'}
        />
      )}
      />;
  }

  switch(type) {
    case 'array':
      return <TextField multiline helperText={description} onChange={onChange} id={`properties_${path.join(delim)}`} placeholder="(blank)" value={(value || []).join("\n")} />;
    case 'string':
      return <TextField helperText={description} onChange={onChange} id={`properties_${path.join(delim)}`} placeholder="(blank)" value={value || ''} />;
    case 'integer':
      return <TextField helperText={description} inputProps={{ min: 0 }} onChange={onChange} type="number" id={`properties_${path.join(delim)}`} placeholder="0" value={value || ''} />;
    case 'boolean':
      return <Checkbox onChange={onChange} id={`properties_${path.join(delim)}`} checked={(value && value !== 'false') || false} />;
    case 'object':
      return (<Table>
        <TableBody>
          <Properties path={path} properties={properties} data={value || {}} setData={setData}/>
        </TableBody>
      </Table>);
    default:
      return `(unknown type ${type})`;
  }
}

export function Properties({ path = [], properties, data, setData }) {
  const additionalKeys = Object.keys(data).filter(k => !properties[k]).reduce((a, k) => ({ ...a, [k]: {} }), {});
  return Object.entries({...properties, ...additionalKeys }).filter(([key, value]) => !value.skip).map(([key, value]) => (
    <TableRow key={key}>
      <TableCell>
        <Typography {...(value.type === 'object' ? {} : { component: 'label', htmlFor: `properties_${[...path,  key].join(delim)}`} )}>{key}</Typography>
        { value.deprecated && ' (deprecated)' }
      </TableCell>
      <TableCell>
        <PropertyControl path={[...path,  key]} schema={value} value={data[key]} setData={setData} />
      </TableCell>
    </TableRow>
  ));
}

export function transformData(data, initialData = {}, top = false) {
  let res;

  switch(typeof data) {
    case 'object':
      if (data === null) return null;
      if (Array.isArray(data)) {
        res = data.map(v => transformData(v)).filter(v => v === null);
        if (res.length === 0) return null;
        return res;
      }

      if (Object.keys(data).length === 0) return null;

      res = Object.keys(data).reduce((out, k) => ({ ...out, [k]: transformData(data[k], initialData[k]) }), {});
      if (!top && Object.values({ ...initialData, ...res }).every(v => v === null)) return null;

      return res;
    default:
      return data;
  }
}

export default function PropertiesContainer({ errata = {}, data: initialData = {}, onSave, schema = {} }) {
  const [data, setDataState] = useState({});
  const { documentation, properties = {} } = schema;
  const setData = (newData) => { setDataState(deepmerge(data, newData)) }
  const onSubmit = () => {
    onSave(data);
  };

  return <React.Fragment>
    <Grid container direction="row" justify="space-between" alignItems="center">
      <Typography variant="h3">Properties { documentation && <Link href={documentation} target="_blank" rel="noreferrer"><HelpIcon color="secondary"/></Link>}</Typography>
      <Button aria-label="save" color="primary" variant="contained" onClick={onSubmit} startIcon={<SaveIcon />}>Save</Button>
    </Grid>
    <TableContainer component={Paper}>
      <Table>
        <TableBody>
          <Properties properties={deepmerge(properties, errata)} data={deepmerge(initialData, data)} setData={setData} />
        </TableBody>
      </Table>
    </TableContainer>
    <Grid container direction="row" justify="flex-end" alignItems="center">
      <Button aria-label="save" color="primary" variant="contained" onClick={onSubmit} startIcon={<SaveIcon />}>Save</Button>
    </Grid>
  </React.Fragment>
}
