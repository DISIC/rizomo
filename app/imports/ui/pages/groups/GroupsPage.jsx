import React, { useContext, useRef, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {
  Fade,
  Container,
  Grid,
  Typography,
  IconButton,
  Collapse,
  TextField,
  InputAdornment,
  Button,
} from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';
import ViewListIcon from '@material-ui/icons/ViewList';
import DashboardIcon from '@material-ui/icons/Dashboard';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import ToggleButton from '@material-ui/lab/ToggleButton';
import ClearIcon from '@material-ui/icons/Clear';
import i18n from 'meteor/universe:i18n';

// components
import Spinner from '../../components/system/Spinner';
import Groups from '../../../api/groups/groups';
import GroupDetails from '../../components/groups/GroupDetails';
import { Context } from '../../contexts/context';
import { usePagination, useOnScreen } from '../../utils/hooks';
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
}));

function GroupsPage() {
  const [{ isMobile, groupPage }, dispatch] = useContext(Context);
  const classes = useStyles();
  const ref = useRef();
  const onScreen = useOnScreen(ref, '0px');
  const {
    search = '',
    searchToggle = false,
    viewMode = 'card', // Possible values : "card" or "list"
  } = groupPage;
  const {
    nextPage, loading, items, total,
  } = usePagination('groups.all', { search }, Groups, {}, {});

  const inputRef = useRef(null);

  // focus on search input when it appears
  useEffect(() => {
    if (inputRef.current && searchToggle) {
      inputRef.current.focus();
    }
  }, [searchToggle]);

  useEffect(() => {
    if (onScreen && !loading && total !== items.length) {
      nextPage();
    }
  }, [onScreen]);

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
    let searchText = group.name + group.description + group.digest;
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
    <Fade in>
      <Container>
        <Grid container spacing={4}>
          <Grid item xs={12} className={isMobile ? null : classes.flex}>
            <Typography variant={isMobile ? 'h6' : 'h4'} className={classes.flex}>
              {i18n.__('pages.GroupsPage.title')}
              {' '}
              (
              {total}
              )
              <IconButton onClick={toggleSearch}>
                <SearchIcon fontSize="large" />
              </IconButton>
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
        <Grid container spacing={isMobile ? 2 : 4}>
          {isMobile && viewMode === 'list'
            ? mapList((group) => (
              <Grid className={classes.gridItem} item key={group._id} xs={12} sm={12} md={6} lg={4}>
                <GroupDetailsList key={group.name} group={group} />
              </Grid>
            ))
            : mapList((group) => (
              <Grid className={classes.gridItem} item key={group._id} xs={12} sm={12} md={6} lg={4}>
                <GroupDetails key={group.name} group={group} isShort={!isMobile && viewMode === 'list'} />
              </Grid>
            ))}
          <Grid ref={ref} item xs={12} sm={12} md={12} lg={12}>
            {loading && <Spinner />}
            {total === items.length && !loading && (
              <Button variant="contained" fullWidth>
                {i18n.__('pages.GroupsPage.endOfList')}
              </Button>
            )}
          </Grid>
        </Grid>
      </Container>
    </Fade>
  );
}

export default GroupsPage;
