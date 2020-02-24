import React from 'react';
import PropTypes from 'prop-types';
import { withTracker } from 'meteor/react-meteor-data';
import MaterialTable from 'material-table';
import i18n from 'meteor/universe:i18n';
import setMaterialTableLocalization from './initMaterialTableLocalization';
import Spinner from './Spinner';

const GroupsUsersList = (props) => {
  const {
    ready, userIds, groupId, role,
  } = props;

  const removeMethods = {
    candidate: 'users.unsetCandidateOf',
    member: 'users.unsetMemberOf',
    animator: 'users.unsetAnimatorOf',
    admin: 'users.unsetAdminOf',
  };

  const columns = [
    { title: i18n.__('components.GroupUsersList.columnUsername'), field: 'username', defaultSort: 'asc' },
    { title: i18n.__('components.GroupUsersList.columnFirstName'), field: 'firstName' },
    { title: i18n.__('components.GroupUsersList.columnLastName'), field: 'lastName' },
    {
      title: i18n.__('components.GroupUsersList.columnEmail'),
      field: 'emails',
      render: (rowData) => rowData.emails.map((email) => email.address).join(', '),
    },
  ];

  const options = {
    pageSize: 5,
    pageSizeOptions: [5, 10, 20, 50, 100],
    paginationType: 'stepped',
    actionsColumnIndex: 4,
    addRowPosition: 'first',
    emptyRowsWhenPaging: false,
  };

  const data = userIds.map((userId) => Meteor.users.findOne(userId));

  return (
    <>
      {!ready ? (
        <Spinner />
      ) : (
        <MaterialTable
          // other props
          title={i18n.__('components.GroupUsersList.title')}
          columns={columns}
          data={data}
          options={options}
          localization={setMaterialTableLocalization('components.GroupUsersList')}
          actions={[
            {
              icon: 'add',
              tooltip: i18n.__('components.GroupUsersList.materialTableLocalization.body_addTooltip'),
              isFreeAction: true,
              onClick: () => alert('Not implemented'),
            },
          ]}
          editable={{
            onRowDelete: (oldData) => new Promise((resolve, reject) => {
              Meteor.call(
                removeMethods[role],
                {
                  userId: oldData._id,
                  groupId,
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
      )}
    </>
  );
};

GroupsUsersList.propTypes = {
  userIds: PropTypes.arrayOf(PropTypes.any).isRequired,
  ready: PropTypes.bool.isRequired,
  groupId: PropTypes.string.isRequired,
  role: PropTypes.string.isRequired,
};

export default withTracker(({ userIds, groupId, role }) => {
  const subUsers = Meteor.subscribe('users.fromlist', userIds);
  const ready = subUsers.ready();
  return {
    ready,
    userIds,
    groupId,
    role,
  };
})(GroupsUsersList);
