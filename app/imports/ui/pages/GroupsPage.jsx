import React, { useContext, useRef, useEffect } from 'react';
import { Meteor } from 'meteor/meteor';
import PropTypes from 'prop-types';
import { withTracker } from 'meteor/react-meteor-data';
import { makeStyles } from '@material-ui/core/styles';
import {
  Fade, Container, Grid, Typography, IconButton, Collapse, TextField, InputAdornment,
} from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';
import ViewListIcon from '@material-ui/icons/ViewList';
import DashboardIcon from '@material-ui/icons/Dashboard';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import ToggleButton from '@material-ui/lab/ToggleButton';
import ClearIcon from '@material-ui/icons/Clear';
import i18n from 'meteor/universe:i18n';

// components
import Spinner from '../components/Spinner';
import Groups from '../../api/groups/groups';
import GroupDetails from '../components/GroupDetails';
import { Context } from '../contexts/context';

const useStyles = makeStyles(() => ({
  small: {
    padding: '5px !important',
    transition: 'all 300ms ease-in-out',
  },
  flex: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  spaceBetween: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  gridItem: {
    display: 'flex',
    justifyContent: 'center',
  },
}));

function GroupsPage({ groups, loading }) {
  const [{ isMobile, groupPage }, dispatch] = useContext(Context);
  const classes = useStyles();

  const {
    search = '',
    searchToggle = false,
    viewMode = 'card', // Possible values : "card" or "list"
  } = groupPage;

  const inputRef = useRef(null);

  // focus on search input when it appears
  useEffect(() => {
    if (inputRef.current && searchToggle) {
      inputRef.current.focus();
    }
  }, [searchToggle]);

  const updateGlobalState = (key, value) => dispatch({
    type: 'groupPage',
    data: {
      ...groupPage,
      [key]: value,
    },
  });

  const toggleSearch = () => updateGlobalState('searchToggle', !searchToggle);
  const updateSearch = (e) => updateGlobalState('search', e.target.value);
  const resetSearch = () => updateGlobalState('search', '');
  const changeViewMode = (_, value) => updateGlobalState('viewMode', value);

  const filterGroups = (group) => {
    let searchText = group.name + group.info + group.digest;
    searchText = searchText.toLowerCase();
    if (!search) return true;
    return searchText.indexOf(search.toLowerCase()) > -1;
  };
  const mapList = (func) => groups.filter((group) => filterGroups(group)).map(func);

  const toggleButtons = (
    <ToggleButtonGroup value={viewMode} exclusive aria-label={i18n.__('pages.GroupsPage.viewMode')}>
      <ToggleButton
        value="card"
        onClick={changeViewMode}
        title={i18n.__('pages.GroupsPage.viewCard')}
        aria-label={i18n.__('pages.GroupsPage.viewCard')}
      >
        <DashboardIcon color="primary" />
      </ToggleButton>
      <ToggleButton
        value="list"
        onClick={changeViewMode}
        title={i18n.__('pages.GroupsPage.viewList')}
        aria-label={i18n.__('pages.GroupsPage.viewList')}
      >
        <ViewListIcon color="primary" />
      </ToggleButton>
    </ToggleButtonGroup>
  );

  const searchField = (
    <Grid item xs={12} sm={12} md={6} className={searchToggle ? null : classes.small}>
      <Collapse in={searchToggle} collapsedHeight={0}>
        <TextField
          margin="normal"
          id="search"
          label={i18n.__('pages.GroupsPage.searchText')}
          name="search"
          fullWidth
          onChange={updateSearch}
          type="text"
          value={search}
          variant="outlined"
          inputProps={{
            ref: inputRef,
          }}
          // eslint-disable-next-line react/jsx-no-duplicate-props
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: search ? (
              <InputAdornment position="end">
                <IconButton onClick={resetSearch}>
                  <ClearIcon />
                </IconButton>
              </InputAdornment>
            ) : null,
          }}
        />
      </Collapse>
    </Grid>
  );

  return (
    <>
      {loading ? (
        <Spinner />
      ) : (
        <Fade in>
          <Container>
            <Grid container spacing={4}>
              <Grid item xs={12} className={isMobile ? null : classes.flex}>
                <Typography variant={isMobile ? 'h6' : 'h4'} className={classes.flex}>
                  {i18n.__('pages.GroupsPage.title')}
                  <IconButton onClick={toggleSearch}>
                    <SearchIcon fontSize="large" />
                  </IconButton>
                </Typography>
                <div className={classes.spaceBetween}>{!isMobile && toggleButtons}</div>
              </Grid>
            </Grid>
            <Grid container spacing={4}>
              {searchField}
            </Grid>
            <Grid container spacing={isMobile ? 2 : 4}>
              {mapList((group) => (
                <Grid className={classes.gridItem} item key={group._id} xs={12} sm={12} md={6} lg={4}>
                  <GroupDetails key={group.name} group={group} />
                </Grid>
              ))}
            </Grid>
          </Container>
        </Fade>
      )}
    </>
  );
}

GroupsPage.propTypes = {
  groups: PropTypes.arrayOf(PropTypes.object).isRequired,
  loading: PropTypes.bool.isRequired,
};

export default withTracker(() => {
  const groupsHandle = Meteor.subscribe('groups.memberof');
  const groupsAll = Meteor.subscribe('groups.all');
  const loading = !groupsHandle.ready() || !groupsAll.ready();
  const groups = Groups.find({}, { sort: { name: 1 } }).fetch();
  return {
    groups,
    loading,
  };
})(GroupsPage);
