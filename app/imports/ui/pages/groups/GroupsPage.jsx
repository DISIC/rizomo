import React, { useRef, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Fade from '@material-ui/core/Fade';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import Collapse from '@material-ui/core/Collapse';
import TextField from '@material-ui/core/TextField';
import InputAdornment from '@material-ui/core/InputAdornment';
import Tooltip from '@material-ui/core/Tooltip';

import SearchIcon from '@material-ui/icons/Search';
import ViewListIcon from '@material-ui/icons/ViewList';
import DashboardIcon from '@material-ui/icons/Dashboard';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import ToggleButton from '@material-ui/lab/ToggleButton';
import Switch from '@material-ui/core/Switch';
import ClearIcon from '@material-ui/icons/Clear';
import Pagination from '@material-ui/lab/Pagination';
import i18n from 'meteor/universe:i18n';
import { Roles } from 'meteor/alanning:roles';
import { useTracker } from 'meteor/react-meteor-data';
// components
import Groups from '../../../api/groups/groups';
import GroupDetails from '../../components/groups/GroupDetails';
import { useAppContext } from '../../contexts/context';
import { usePagination } from '../../utils/hooks';
import GroupDetailsList from '../../components/groups/GroupDetailsList';

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
  cardGrid: {
    marginBottom: '0px',
  },
  mobileButtonContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '0 !important',
  },
  spaceBetween: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  gridItem: {
    display: 'flex',
    justifyContent: 'center',
  },
  pagination: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
  filterButton: {
    color: 'black',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  checkedButton: {
    color: 'black',
    display: 'flex',
    margin: 20,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
}));

const ITEM_PER_PAGE = 9;

function GroupsPage() {
  const [{ isMobile, groupPage, userId }, dispatch] = useAppContext();
  const [filterChecked, setFilterChecked] = React.useState(false);
  const classes = useStyles();
  const {
    search = '',
    searchToggle = false,
    viewMode = 'list', // Possible values : "card" or "list"
  } = groupPage;
  const { changePage, page, items, total } = !filterChecked
    ? usePagination('groups.all', { search }, Groups, {}, { sort: { name: 1 } }, ITEM_PER_PAGE)
    : usePagination('groups.memberOf', { search, userId }, Groups, {}, { sort: { name: 1 } }, ITEM_PER_PAGE);

  const animatorGroups = useTracker(() => Roles.getScopesForUser(userId, 'animator'));
  const memberGroups = useTracker(() => Roles.getScopesForUser(userId, 'member'));
  const candidateGroups = useTracker(() => Roles.getScopesForUser(userId, ['candidate']));
  const managedGroups = useTracker(() => Roles.getScopesForUser(userId, ['animator', 'admin']));
  const isAdmin = Roles.userIsInRole(userId, 'admin');

  const inputRef = useRef(null);
  const handleChangePage = (event, value) => {
    changePage(value);
  };

  // focus on search input when it appears
  useEffect(() => {
    if (inputRef.current && searchToggle) {
      inputRef.current.focus();
    }
  }, [searchToggle]);
  useEffect(() => {
    if (page !== 1) {
      changePage(1);
    }
  }, [search]);

  const updateGlobalState = (key, value) =>
    dispatch({
      type: 'groupPage',
      data: {
        ...groupPage,
        [key]: value,
      },
    });

  const updateFilterCheck = () => {
    setFilterChecked(!filterChecked);
    changePage(1);
  };

  const toggleSearch = () => updateGlobalState('searchToggle', !searchToggle);
  const updateSearch = (e) => updateGlobalState('search', e.target.value);
  const resetSearch = () => updateGlobalState('search', '');
  const changeViewMode = (_, value) => updateGlobalState('viewMode', value);
  const checkEscape = (e) => {
    if (e.keyCode === 27) {
      // ESCAPE key
      groupPage.search = '';
      groupPage.searchToggle = false;
      updateGlobalState('searchToggle', false); // all groupPage values will be saved with this call
    }
  };

  const filterGroups = (group) => {
    let searchText = group.name + group.description + group.digest || '';
    searchText = searchText.toLowerCase();
    if (!search) return true;
    return searchText.indexOf(search.toLowerCase()) > -1;
  };
  const mapList = (func) => items.filter((group) => filterGroups(group)).map(func);

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
      <Collapse in={searchToggle} collapsedSize={0}>
        <TextField
          margin="normal"
          id="search"
          label={i18n.__('pages.GroupsPage.searchText')}
          name="search"
          fullWidth
          onChange={updateSearch}
          onKeyDown={checkEscape}
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
    <Fade in>
      <Container>
        <Grid container spacing={4}>
          <Grid item xs={12} className={isMobile ? null : classes.flex}>
            <Typography variant={isMobile ? 'h6' : 'h4'} className={classes.flex}>
              {`${i18n.__('pages.GroupsPage.title')} (${total})`}
              <IconButton onClick={toggleSearch}>
                <SearchIcon fontSize="large" />
              </IconButton>
              <Tooltip
                title={
                  filterChecked
                    ? `${i18n.__('pages.GroupsPage.disableFilterGroup')}`
                    : `${i18n.__('pages.GroupsPage.filterGroup')}`
                }
              >
                <Switch
                  color={filterChecked ? 'primary' : 'default'}
                  inputProps={{ 'aria-label': 'checkbox with default color' }}
                  onChange={updateFilterCheck}
                />
              </Tooltip>
            </Typography>
            <div className={classes.spaceBetween}>{!isMobile && toggleButtons}</div>
          </Grid>
        </Grid>
        <Grid container spacing={4}>
          {searchField}
          {isMobile && (
            <Grid item xs={12} sm={12} className={classes.mobileButtonContainer}>
              <div />
              {toggleButtons}
            </Grid>
          )}
        </Grid>
        {total > 0 ? (
          <Grid container className={classes.cardGrid} spacing={isMobile ? 2 : 4}>
            {total > ITEM_PER_PAGE && (
              <Grid item xs={12} sm={12} md={12} lg={12} className={classes.pagination}>
                <Pagination count={Math.ceil(total / ITEM_PER_PAGE)} page={page} onChange={handleChangePage} />
              </Grid>
            )}
            {isMobile && viewMode === 'list'
              ? mapList((group) => (
                  <Grid className={classes.gridItem} item key={group._id} xs={12} sm={12} md={6} lg={4}>
                    <GroupDetailsList
                      key={group.name}
                      group={group}
                      candidate={candidateGroups.includes(group._id)}
                      member={memberGroups.includes(group._id)}
                      animator={animatorGroups.includes(group._id)}
                      admin={isAdmin || managedGroups.includes(group._id)}
                    />
                  </Grid>
                ))
              : mapList((group) => (
                  <Grid className={classes.gridItem} item key={group._id} xs={12} sm={12} md={6} lg={4}>
                    <GroupDetails
                      key={group.name}
                      group={group}
                      isShort={!isMobile && viewMode === 'list'}
                      candidate={candidateGroups.includes(group._id)}
                      member={memberGroups.includes(group._id)}
                      animator={animatorGroups.includes(group._id)}
                      admin={isAdmin || managedGroups.includes(group._id)}
                    />
                  </Grid>
                ))}
            {total > ITEM_PER_PAGE && (
              <Grid item xs={12} sm={12} md={12} lg={12} className={classes.pagination}>
                <Pagination count={Math.ceil(total / ITEM_PER_PAGE)} page={page} onChange={handleChangePage} />
              </Grid>
            )}
          </Grid>
        ) : (
          <p>{i18n.__('pages.GroupsPage.noGroup')}</p>
        )}
      </Container>
    </Fade>
  );
}

export default GroupsPage;
