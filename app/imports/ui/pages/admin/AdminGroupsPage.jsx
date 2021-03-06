import React from 'react';
import { Meteor } from 'meteor/meteor';
import PropTypes from 'prop-types';
import i18n from 'meteor/universe:i18n';
import { withTracker } from 'meteor/react-meteor-data';
import { useHistory } from 'react-router-dom';
import MaterialTable from '@material-table/core';
import Container from '@material-ui/core/Container';
import edit from '@material-ui/icons/Edit';
import add from '@material-ui/icons/Add';
import Spinner from '../../components/system/Spinner';
import Groups from '../../../api/groups/groups';
import { removeGroup } from '../../../api/groups/methods';
import setMaterialTableLocalization from '../../components/initMaterialTableLocalization';

function AdminGroupsPage({ groups, loading, user }) {
  const history = useHistory();
  const columns = [
    {
      title: i18n.__('pages.AdminGroupsPage.columnName'),
      field: 'name',
    },
    {
      title: i18n.__('pages.AdminGroupsPage.columnInfo'),
      field: 'description',
    },
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
      customSort: (a, b) => a.members.length - b.members.length,
    },
    {
      title: i18n.__('pages.AdminGroupsPage.columnCandidates'),
      field: '',
      render: (rowData) => (rowData && rowData.candidates ? rowData.candidates.length : null),
      // check for candidates field presence, it can be undefined when previous
      // publication data without candidates information is still in memory
      customSort: (a, b) => (a.candidates && b.candidates ? a.candidates.length - b.candidates.length : 1),
      defaultSort: 'desc',
    },
  ];

  const createNewGoup = () => {
    if (user.groupCount < user.groupQuota) {
      history.push('/admingroups/new');
    } else {
      msg.error(i18n.__('api.groups.toManyGroup'));
    }
  };

  const options = {
    pageSize: 10,
    pageSizeOptions: [10, 20, 50, 100],
    paginationType: 'stepped',
    actionsColumnIndex: 6,
    addRowPosition: 'first',
    emptyRowsWhenPaging: false,
  };

  return (
    <>
      {loading ? (
        <Spinner />
      ) : (
        <Container style={{ overflowX: 'auto' }}>
          <MaterialTable
            // other props
            title={`${i18n.__('pages.AdminGroupsPage.title')} (${user.groupCount}/${user.groupQuota})`}
            columns={columns}
            data={groups.map((row) => ({ ...row, id: row._id }))}
            options={options}
            localization={setMaterialTableLocalization('pages.AdminGroupsPage')}
            actions={[
              {
                icon: edit,
                tooltip: i18n.__('pages.AdminGroupsPage.materialTableLocalization.body_editTooltip'),
                onClick: (event, rowData) => {
                  history.push(`/admingroups/${rowData._id}`);
                },
              },
              {
                icon: add,
                tooltip: i18n.__('pages.AdminGroupsPage.materialTableLocalization.body_addTooltip'),
                isFreeAction: true,
                onClick: () => {
                  createNewGoup();
                },
              },
            ]}
            editable={{
              onRowDelete: (oldData) =>
                new Promise((resolve, reject) => {
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
  user: PropTypes.objectOf(PropTypes.any).isRequired,
};

export default withTracker(() => {
  const groupsHandle = Meteor.subscribe('groups.adminof');
  const loading = !groupsHandle.ready();
  const user = Meteor.users.findOne({ userId: this.userId });
  const groups = Groups.find({}, { sort: { name: 1 } }).fetch();
  return {
    groups,
    loading,
    user,
  };
})(AdminGroupsPage);
