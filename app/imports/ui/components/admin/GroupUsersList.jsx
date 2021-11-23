import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { withTracker } from 'meteor/react-meteor-data';
import MaterialTable from '@material-table/core';
import GroupAddIcon from '@material-ui/icons/GroupAdd';
import PersonAddIcon from '@material-ui/icons/PersonAdd';
import ExpandLessIcon from '@material-ui/icons/ExpandLess';
import i18n from 'meteor/universe:i18n';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Collapse from '@material-ui/core/Collapse';
import IconButton from '@material-ui/core/IconButton';
import { Roles } from 'meteor/alanning:roles';
import add from '@material-ui/icons/Add';
import setMaterialTableLocalization from '../initMaterialTableLocalization';
import Finder from './Finder';
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
  const { ready, group, users, groupId, userRole } = props;

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
  const [groupAdd, setGroupAdd] = useState(null);
  const [showSearch, setShowSearch] = useState(false);
  const [showSearchGroup, setShowSearchGroup] = useState(false);
  const [finderId, setFinderId] = useState(new Date().getTime());
  const classes = useStyles();

  const addUser = () => {
    Meteor.call(addMethods[userRole], { groupId, userId: user._id }, (err) => {
      if (err) {
        msg.error(err.reason);
      } else {
        msg.success(i18n.__('components.GroupUsersList.userAdded'));
      }
    });
    setFinderId(new Date().getTime());
  };

  function userDeletable(userData) {
    if (userRole === 'admin' || userRole === 'animator') {
      // can only remove self if not admin
      return isAdmin || userData._id === userId;
    }
    return true;
  }

  const addGroup = () => {
    Meteor.call('groups.addGroupMembersToGroup', { groupId, otherGroupId: groupAdd._id }, (err, nb) => {
      if (err) {
        msg.error(err.reason);
      } else if (nb === 0) {
        msg.error(i18n.__('components.GroupUsersList.groupAddedButNoMember'));
      } else {
        msg.success(`${nb} ${i18n.__('components.GroupUsersList.groupAdded')}`);
      }
    });
    setFinderId(new Date().getTime());
  };

  useEffect(() => {
    if (ready === true) {
      const usersField = `${userRole}s`;
      const groupUsers = {};
      users.forEach((entry) => {
        groupUsers[entry._id] = entry;
      });
      setData(group[usersField].map((uId) => groupUsers[uId] || { ...unknownUser, _id: uId }));
      setTitle(i18n.__('components.GroupUsersList.title'));
    } else {
      setTitle(i18n.__('components.GroupUsersList.loadingTitle'));
    }
  }, [ready, users]);

  const actions = [
    {
      icon: add,
      tooltip: i18n.__('components.GroupUsersList.materialTableLocalization.body_addTooltip'),
      isFreeAction: true,
      onClick: () => setShowSearch(!showSearch),
    },
    {
      icon: GroupAddIcon,
      tooltip: i18n.__('components.GroupUsersList.materialTableLocalization.body_addGroupTooltip'),
      isFreeAction: true,
      onClick: () => setShowSearchGroup(!showSearchGroup),
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
      <Collapse in={showSearch} collapsedSize={0}>
        <div className={classes.adduser}>
          <Finder
            onSelected={setUser}
            key={finderId}
            hidden={!showSearch}
            exclude={{ groupId, role: userRole }}
            opened={showSearch}
            i18nCode="UserFinder"
            method="users.findUsers"
          />
          <Button variant="contained" disabled={!user} color="primary" onClick={addUser}>
            {i18n.__('components.GroupUsersList.addUserButton')}
          </Button>
          <IconButton onClick={() => setShowSearch(!showSearch)}>
            <ExpandLessIcon />
          </IconButton>
        </div>
      </Collapse>
      <Collapse in={showSearchGroup} collapsedSize={0}>
        <div className={classes.adduser}>
          <Finder
            onSelected={setGroupAdd}
            key={finderId}
            hidden={!showSearchGroup}
            exclude={{ groupId, role: userRole }}
            opened={showSearchGroup}
            i18nCode="GroupFinder"
            method="groups.findGroups"
          />
          <Button variant="contained" disabled={!groupAdd} color="primary" onClick={addGroup}>
            {i18n.__('components.GroupUsersList.addGroupButton')}
          </Button>
          <IconButton onClick={() => setShowSearch(!showSearchGroup)}>
            <ExpandLessIcon />
          </IconButton>
        </div>
      </Collapse>
      <MaterialTable
        // other props
        title={title}
        columns={columns}
        data={data.map((row) => ({ ...row, id: row._id }))}
        options={options}
        localization={setMaterialTableLocalization('components.GroupUsersList')}
        actions={actions}
        editable={{
          isDeletable: (rowData) => userDeletable(rowData),
          onRowDelete: (oldData) =>
            new Promise((resolve, reject) => {
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
  users: PropTypes.arrayOf(PropTypes.object).isRequired,
  ready: PropTypes.bool.isRequired,
  groupId: PropTypes.string.isRequired,
  userRole: PropTypes.string.isRequired,
};

export default withTracker(({ groupId, userRole }) => {
  const subUsers = Meteor.subscribe('groups.users', { groupId, role: userRole });
  const group = Groups.findOne(groupId);
  const users = Meteor.users.find({}).fetch();
  const ready = subUsers.ready();
  return {
    ready,
    group,
    groupId,
    userRole,
    users,
  };
})(GroupsUsersList);
