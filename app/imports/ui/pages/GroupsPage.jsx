import React from 'react';
import { Meteor } from 'meteor/meteor';
import PropTypes from 'prop-types';
import { withTracker } from 'meteor/react-meteor-data';
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import Spinner from '../components/Spinner';
import withUser from '../contexts/withUser';
import Groups from '../../api/groups/groups';
import GroupDetails from '../components/GroupDetails';

const useStyles = makeStyles(() => ({
  loading: {
    width: '100%',
    textAlign: 'center',
    marginTop: 50,
  },
}));

function GroupsPage({ groups, loading, searchString }) {
  const classes = useStyles();

  const filterGroups = (group) => {
    let searchText = group.name + group.info + group.digest;
    searchText = searchText.toLowerCase();
    if (!searchString) return true;
    return searchText.indexOf(searchString.toLowerCase()) > -1;
  };

  return (
    <>
      {loading ? (
        <Spinner />
      ) : (
        <Paper className={classes.paper}>
          <h1>Groupes</h1>
          <Table className={classes.table} aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell>Nom du groupe</TableCell>
                <TableCell>Infos</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {groups
                .filter((group) => filterGroups(group))
                .map((group) => (
                  <GroupDetails key={group.name} group={group} />
                ))}
            </TableBody>
          </Table>
        </Paper>
      )}
    </>
  );
}

GroupsPage.propTypes = {
  groups: PropTypes.arrayOf(PropTypes.object).isRequired,
  loading: PropTypes.bool.isRequired,
  searchString: PropTypes.string.isRequired,
};

export default withTracker(() => {
  const groupsHandle = Meteor.subscribe('groups.all');
  const loading = !groupsHandle.ready();
  const groups = Groups.find({}, { sort: { title: 1 } }).fetch();
  return {
    groups,
    loading,
  };
})(withUser(GroupsPage));
