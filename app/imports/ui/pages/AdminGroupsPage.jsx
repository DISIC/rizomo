import React from 'react';
import { Meteor } from 'meteor/meteor';
import PropTypes from 'prop-types';
import i18n from 'meteor/universe:i18n';
import { withTracker } from 'meteor/react-meteor-data';
import { useHistory } from 'react-router-dom';
import MaterialTable from 'material-table';
import { Container } from '@material-ui/core';
import Spinner from '../components/Spinner';
import Groups from '../../api/groups/groups';
import { removeGroup } from '../../api/groups/methods';
import setMaterialTableLocalization from '../components/initMaterialTableLocalization';

function AdminGroupsPage({ groups, loading }) {
  const history = useHistory();
  const columns = [
    { title: i18n.__('pages.AdminGroupsPage.columnName'), field: 'name', defaultSort: 'asc' },
    { title: i18n.__('pages.AdminGroupsPage.columnInfo'), field: 'info' },
    {
      title: i18n.__('pages.AdminGroupsPage.columnType'),
      field: 'type',
      initialEditValue: Object.keys(Groups.typeLabels)[0],
      render: (rowData) => i18n.__(Groups.typeLabels[rowData.type]),
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
            actions={[
              {
                icon: 'edit',
                tooltip: i18n.__('pages.AdminGroupsPage.materialTableLocalization.body_editTooltip'),
                onClick: (event, rowData) => {
                  history.push(`/admingroups/${rowData._id}`);
                },
              },
              {
                icon: 'add',
                tooltip: i18n.__('pages.AdminGroupsPage.materialTableLocalization.body_addTooltip'),
                isFreeAction: true,
                onClick: () => history.push('/admingroups/new'),
              },
            ]}
            editable={{
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
