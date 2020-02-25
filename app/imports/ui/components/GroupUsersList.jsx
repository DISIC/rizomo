import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { withTracker } from 'meteor/react-meteor-data';
import MaterialTable from 'material-table';
import PersonAddIcon from '@material-ui/icons/PersonAdd';
import i18n from 'meteor/universe:i18n';
import { Button, makeStyles, Collapse } from '@material-ui/core';
import setMaterialTableLocalization from './initMaterialTableLocalization';
import UserFinder from './UserFinder';

const useStyles = makeStyles(() => ({
  adduser: {
    display: 'flex',
    justifyContent: 'flex-end',
    margin: '5px',
  },
}));

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
  const addMethods = {
    candidate: 'users.setCandidateOf',
    member: 'users.setMemberOf',
    animator: 'users.setAnimatorOf',
    admin: 'users.setAdminOf',
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
    pageSize: 10,
    pageSizeOptions: [5, 10, 20, 50, 100],
    paginationType: 'stepped',
    actionsColumnIndex: 4,
    addRowPosition: 'first',
    emptyRowsWhenPaging: false,
  };

  const [data, setData] = useState([]);
  const [title, setTitle] = useState('');
  const [user, setUser] = useState(null);
  const [showSearch, setShowSearch] = useState(false);
  const classes = useStyles();

  const addUser = () => {
    Meteor.call(addMethods[role], { groupId, userId: user._id }, (err, _) => {
      if (err) {
        msg.error(err.reason);
      } else {
        msg.success(i18n.__('components.GroupUsersList.userAdded'));
      }
    });
  };

  useEffect(() => {
    if (ready === true) {
      setData(userIds.map((userId) => Meteor.users.findOne(userId)));
      setTitle(i18n.__('components.GroupUsersList.title'));
    } else {
      setTitle(i18n.__('components.GroupUsersList.loadingTitle'));
    }
  }, [ready]);

  actions = [
    {
      icon: 'add',
      tooltip: i18n.__('components.GroupUsersList.materialTableLocalization.body_addTooltip'),
      isFreeAction: true,
      onClick: () => setShowSearch(!showSearch),
    },
  ];
  if (role === 'candidate') {
    actions.push({
      icon: PersonAddIcon,
      tooltip: i18n.__('components.GroupUsersList.validate_tooltip'),
      onClick: (_, rowData) => {
        Meteor.call('users.setMemberOf', { userId: rowData._id, groupId }, (err) => {
          if (err) {
            msg.error(err.reason);
          } else {
            msg.success(i18n.__('components.GroupUsersList.memberAdded'));
          }
        });
      },
    });
  }

  return (
    <>
      <Collapse in={showSearch} collapsedHeight={0}>
        <div className={classes.adduser}>
          <UserFinder onSelected={setUser} />
          <Button variant="contained" disabled={!user} color="primary" onClick={addUser}>
            {i18n.__('components.GroupUsersList.addUserButton')}
          </Button>
        </div>
      </Collapse>
      <MaterialTable
        // other props
        title={title}
        columns={columns}
        data={data}
        options={options}
        localization={setMaterialTableLocalization('components.GroupUsersList')}
        actions={actions}
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
