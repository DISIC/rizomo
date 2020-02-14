import React from 'react';
import { Meteor } from 'meteor/meteor';
import PropTypes from 'prop-types';
import i18n from 'meteor/universe:i18n';
import { withTracker } from 'meteor/react-meteor-data';
import MaterialTable from 'material-table';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import Spinner from '../components/Spinner';
import Groups from '../../api/groups/groups';
import { createGroup, updateGroup, removeGroup } from '../../api/groups/methods';
import setMaterialTableLocalization from '../components/initMaterialTableLocalization';

function AdminGroupsPage({ groups, loading }) {
  const columns = [
    { title: i18n.__('pages.AdminGroupsPage.columnName'), field: 'name', defaultSort: 'asc' },
    { title: i18n.__('pages.AdminGroupsPage.columnInfo'), field: 'info' },
    {
      title: i18n.__('pages.AdminGroupsPage.columnType'),
      field: 'type',
      initialEditValue: Object.keys(Groups.typeLabels)[0],
      render: (rowData) => i18n.__(Groups.typeLabels[rowData.type]),
      editComponent: (props) => (
        <Select
          labelId="type-select-label"
          id="type-select"
          value={props.value}
          onChange={(e) => props.onChange(e.target.value)}
        >
          {Object.keys(Groups.typeLabels).map((val) => (
            <MenuItem key={val} value={val}>
              {i18n.__(Groups.typeLabels[val])}
            </MenuItem>
          ))}
        </Select>
      ),
    },
    {
      title: i18n.__('pages.AdminGroupsPage.columnMembers'),
      field: '',
      render: (rowData) => (rowData && rowData.members ? rowData.members.length : null),
    },
  ];

  const options = {
    pageSize: 10,
    pageSizeOptions: [10, 20, 50, 100],
    paginationType: 'stepped',
    actionsColumnIndex: 4,
    addRowPosition: 'first',
    emptyRowsWhenPaging: false,
  };

  return (
    <>
      {loading ? (
        <Spinner />
      ) : (
        <MaterialTable
          // other props
          title={i18n.__('pages.AdminGroupsPage.title')}
          columns={columns}
          data={groups}
          options={options}
          localization={setMaterialTableLocalization('pages.AdminGroupsPage')}
          editable={{
            onRowAdd: (newData) => new Promise((resolve, reject) => {
              console.log('CREATE GROUP : ', newData);
              createGroup.call(
                {
                  name: newData.name,
                  info: newData.info,
                  type: Number(newData.type),
                  note: '',
                },
                (err, res) => {
                  if (err) {
                    console.log(err);
                    reject(err);
                  } else {
                    resolve(res);
                  }
                },
              );
            }),
            onRowUpdate: (newData, oldData) => new Promise((resolve, reject) => {
              console.log('DATA: ', newData);
              updateGroup.call(
                {
                  groupId: oldData._id,
                  data: {
                    name: newData.name,
                    info: newData.info,
                    type: Number(newData.type),
                  },
                },
                (err, res) => {
                  if (err) {
                    console.log(err);
                    reject(err);
                  } else {
                    resolve(res);
                  }
                },
              );
            }),
            onRowDelete: (oldData) => new Promise((resolve, reject) => {
              removeGroup.call(
                {
                  groupId: oldData._id,
                },
                (err, res) => {
                  if (err) {
                    console.log(err);
                    reject(err);
                  } else {
                    resolve(res);
                  }
                },
              );
            }),
          }}
        />
      )}
    </>
  );
}

AdminGroupsPage.propTypes = {
  groups: PropTypes.arrayOf(PropTypes.object).isRequired,
  loading: PropTypes.bool.isRequired,
};

export default withTracker(() => {
  const groupsHandle = Meteor.subscribe('groups.adminof');
  const loading = !groupsHandle.ready();
  const groups = Groups.find({}, { sort: { name: 1 } }).fetch();
  return {
    groups,
    loading,
  };
})(AdminGroupsPage);
