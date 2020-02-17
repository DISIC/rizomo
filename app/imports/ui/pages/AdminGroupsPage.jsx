import React from 'react';
import { Meteor } from 'meteor/meteor';
import PropTypes from 'prop-types';
import i18n from 'meteor/universe:i18n';
import { withTracker } from 'meteor/react-meteor-data';
import MaterialTable from 'material-table';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import { Container } from '@material-ui/core';
import Spinner from '../components/Spinner';
import Groups from '../../api/groups/groups';
import { createGroup, updateGroup, removeGroup } from '../../api/groups/methods';
import setMaterialTableLocalization from '../components/initMaterialTableLocalization';

function selectGroupType({ value, onChange }) {
  return (
    <Select labelId="type-select-label" id="type-select" value={value} onChange={(e) => onChange(e.target.value)}>
      {Object.keys(Groups.typeLabels).map((val) => (
        <MenuItem key={val} value={val}>
          {i18n.__(Groups.typeLabels[val])}
        </MenuItem>
      ))}
    </Select>
  );
}

selectGroupType.propTypes = {
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  onChange: PropTypes.func.isRequired,
};

function AdminGroupsPage({ groups, loading }) {
  const columns = [
    { title: i18n.__('pages.AdminGroupsPage.columnName'), field: 'name', defaultSort: 'asc' },
    { title: i18n.__('pages.AdminGroupsPage.columnInfo'), field: 'info' },
    {
      title: i18n.__('pages.AdminGroupsPage.columnType'),
      field: 'type',
      initialEditValue: Object.keys(Groups.typeLabels)[0],
      render: (rowData) => i18n.__(Groups.typeLabels[rowData.type]),
      editComponent: selectGroupType,
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
        <Container>
          <MaterialTable
            // other props
            title={i18n.__('pages.AdminGroupsPage.title')}
            columns={columns}
            data={groups}
            options={options}
            localization={setMaterialTableLocalization('pages.AdminGroupsPage')}
            editable={{
              onRowAdd: (newData) => new Promise((resolve, reject) => {
                createGroup.call(
                  {
                    name: newData.name,
                    info: newData.info,
                    type: Number(newData.type),
                    note: '',
                  },
                  (err, res) => {
                    if (err) {
                      msg.error(err.reason);
                      reject(err);
                    } else {
                      msg.success(i18n.__('api.methods.operationSuccessMsg'));
                      resolve(res);
                    }
                  },
                );
              }),
              onRowUpdate: (newData, oldData) => new Promise((resolve, reject) => {
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
                      msg.error(err.reason);
                      reject(err);
                    } else {
                      msg.success(i18n.__('api.methods.operationSuccessMsg'));
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
                      msg.error(err.reason);
                      reject(err);
                    } else {
                      msg.success(i18n.__('api.methods.operationSuccessMsg'));
                      resolve(res);
                    }
                  },
                );
              }),
            }}
          />
        </Container>
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