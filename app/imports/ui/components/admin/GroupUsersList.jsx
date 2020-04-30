import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { withTracker } from 'meteor/react-meteor-data';
import MaterialTable from 'material-table';
import PersonAddIcon from '@material-ui/icons/PersonAdd';
import ExpandLessIcon from '@material-ui/icons/ExpandLess';
import i18n from 'meteor/universe:i18n';
import {
  Button, makeStyles, Collapse, IconButton,
} from '@material-ui/core';
import { Roles } from 'meteor/alanning:roles';
import setMaterialTableLocalization from '../initMaterialTableLocalization';
import UserFinder from './UserFinder';
import Groups from '../../../api/groups/groups';
import { useAppContext } from '../../contexts/context';

const useStyles = makeStyles(() => ({
  adduser: {
    display: 'flex',
    justifyContent: 'flex-end',
    margin: '10px',
  },
}));

const GroupsUsersList = (props) => {
  const {
    ready, group, groupId, userRole,
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

  const [{ userId }] = useAppContext();
  const isAdmin = Roles.userIsInRole(userId, 'admin', groupId);

  const unknownUser = {
    username: `<${i18n.__('api.groups.userNotFound')}>`,
    firstName: '---',
    lastName: '---',
    emails: [{ address: '---', verified: false }],
  };

  const [data, setData] = useState([]);
  const [title, setTitle] = useState('');
  const [user, setUser] = useState(null);
  const [showSearch, setShowSearch] = useState(false);
  const classes = useStyles();

  const addUser = () => {
    Meteor.call(addMethods[userRole], { groupId, userId: user._id }, (err) => {
      if (err) {
        msg.error(err.reason);
      } else {
        msg.success(i18n.__('components.GroupUsersList.userAdded'));
      }
    });
  };

  function userDeletable(userData) {
    if (userRole === 'admin' || userRole === 'animator') {
      // can only remove self if not admin
      return isAdmin || userData._id === userId;
    }
    return true;
  }

  useEffect(() => {
    if (ready === true) {
      const usersField = `${userRole}s`;
      const users = {};
      Meteor.users
        .find()
        .fetch()
        .forEach((entry) => {
          users[entry._id] = entry;
        });
      setData(group[usersField].map((uId) => users[uId] || { ...unknownUser, _id: uId }));
      setTitle(i18n.__('components.GroupUsersList.title'));
    } else {
      setTitle(i18n.__('components.GroupUsersList.loadingTitle'));
    }
  }, [ready, group]);

  const actions = [
    {
      icon: 'add',
      tooltip: i18n.__('components.GroupUsersList.materialTableLocalization.body_addTooltip'),
      isFreeAction: true,
      onClick: () => setShowSearch(!showSearch),
    },
  ];
  if (userRole === 'candidate') {
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
          <UserFinder
            onSelected={setUser}
            hidden={!showSearch}
            exclude={{ groupId, role: userRole }}
            opened={showSearch}
          />
          <Button variant="contained" disabled={!user} color="primary" onClick={addUser}>
            {i18n.__('components.GroupUsersList.addUserButton')}
          </Button>
          <IconButton onClick={() => setShowSearch(!showSearch)}>
            <ExpandLessIcon />
          </IconButton>
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
          isDeletable: (rowData) => userDeletable(rowData),
          onRowDelete: (oldData) => new Promise((resolve, reject) => {
            Meteor.call(
              removeMethods[userRole],
              {
                userId: oldData._id,
                groupId,
              },
              (err, res) => {
                if (err) {
                  msg.error(err.reason);
                  reject(err);
                } else {
                  msg.success(i18n.__('components.GroupUsersList.userRemoved'));
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
  group: PropTypes.objectOf(PropTypes.any).isRequired,
  ready: PropTypes.bool.isRequired,
  groupId: PropTypes.string.isRequired,
  userRole: PropTypes.string.isRequired,
};

export default withTracker(({ groupId, userRole }) => {
  const subUsers = Meteor.subscribe('groups.users', { groupId, role: userRole });
  const group = Groups.findOne(groupId);
  const ready = subUsers.ready();
  return {
    ready,
    group,
    groupId,
    userRole,
  };
})(GroupsUsersList);
