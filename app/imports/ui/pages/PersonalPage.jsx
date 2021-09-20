import React, { useEffect, useState, useRef } from 'react';
import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import PropTypes from 'prop-types';
import { withTracker } from 'meteor/react-meteor-data';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import { Link } from 'react-router-dom';
import Grid from '@material-ui/core/Grid';
import i18n from 'meteor/universe:i18n';
import Typography from '@material-ui/core/Typography';
import Fade from '@material-ui/core/Fade';
import IconButton from '@material-ui/core/IconButton';
import Button from '@material-ui/core/Button';
import Collapse from '@material-ui/core/Collapse';
import TextField from '@material-ui/core/TextField';
import InputAdornment from '@material-ui/core/InputAdornment';

import Switch from '@material-ui/core/Switch';
import LockIcon from '@material-ui/icons/Lock';
import LockOpenIcon from '@material-ui/icons/LockOpen';
import AddBoxIcon from '@material-ui/icons/AddBox';
import NavigateNextIcon from '@material-ui/icons/NavigateNext';
import SearchIcon from '@material-ui/icons/Search';
import ClearIcon from '@material-ui/icons/Clear';
import Groups from '../../api/groups/groups';
import Services from '../../api/services/services';
import Spinner from '../components/system/Spinner';
import PersonalSpaces from '../../api/personalspaces/personalspaces';
import PersonalZone from '../components/personalspace/PersonalZone';
import Animation from '../components/screencast/Animation';
import { useAppContext } from '../contexts/context';
import UserBookmarks from '../../api/userBookmarks/userBookmarks';

const useStyles = (isMobile) =>
  makeStyles((theme) => ({
    small: {
      padding: '5px !important',
      transition: 'all 300ms ease-in-out',
    },
    search: {
      marginBottom: 20,
      marginLeft: 16,
    },

    mobileButtonContainer: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingTop: '0 !important',
    },
    zoneButtonContainer: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    },
    flex: {
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      justifyContent: 'space-between',
      alignItems: isMobile ? 'flex-start' : 'center',
    },
    flexGrow: {},
    cardGrid: {
      paddingTop: theme.spacing(0),
      paddingBottom: theme.spacing(2),
    },
    chip: {
      margin: theme.spacing(1),
    },
    badge: { position: 'inherit' },
    modeEdition: { width: 'max-content' },
    gridItem: {
      position: 'relative',
      '&.sortable-ghost': { opacity: 0.3 },
    },
    ghost: {
      opacity: '1 !important',
    },
    titleButtons: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
    },
    handle: {
      cursor: 'grab',
      position: 'absolute',
      textAlign: 'center',
      width: 'calc(100% - 32px)',
      backgroundColor: theme.palette.primary.main,
      opacity: 0.2,
      height: 20,
      borderTopLeftRadius: theme.shape.borderRadius,
      borderTopRightRadius: theme.shape.borderRadius,
      '&::after': {
        content: '""',
        width: '80%',
        height: '3px',
        backgroundColor: 'white',
        display: 'inline-block',
        marginBottom: '3px',
        borderRadius: theme.shape.borderRadius,
      },
    },
    zoneButtonEnd: {
      opacity: 0.7,
      textTransform: 'none',
      // width: '80%',
      cursor: 'pointer',
      '&:hover': {
        opacity: 1,
        color: theme.palette.primary.main,
        backgroundColor: theme.palette.tertiary.main,
      },
    },
    divider: {
      marginTop: 20,
      marginBottom: 20,
      backgroundColor: '#cbd0ed',
    },
    goIcon: {
      marginLeft: 8,
      verticalAlign: 'bottom',
    },
    castTuto: {
      marginTop: 30,
      marginBottom: 15,
    },
    screen: {
      marginTop: 60,
    },
  }));

function PersonalPage({ personalspace, isLoading, allServices, allGroups, allLinks }) {
  const AUTOSAVE_INTERVAL = 3000;
  const [{ user, loadingUser, isMobile }] = useAppContext();
  const [customDrag, setcustomDrag] = useState(false);
  const [search, setSearch] = useState('');
  const [searchToggle, setSearchToggle] = useState(false);
  const classes = useStyles(isMobile)();
  const inputRef = useRef(null);

  const updateSearch = (e) => {
    setSearch(e.target.value);
  };
  const checkEscape = (e) => {
    if (e.keyCode === 27) {
      // ESCAPE key
      setSearchToggle(false);
      setSearch('');
    }
  };
  const resetSearch = () => setSearch('');
  const toggleSearch = () => setSearchToggle(!searchToggle);

  const filterSearch = (element) => {
    if (!search) return true;
    let searchText = '';
    switch (element.type) {
      case 'service': {
        const service = Services.findOne(element.element_id);
        searchText = service !== undefined ? service.title : '';
        break;
      }
      case 'group': {
        const group = Groups.findOne(element.element_id);
        searchText = group !== undefined ? group.name : '';
        break;
      }
      case 'link': {
        const userBookmark = UserBookmarks.findOne(element.element_id);
        searchText = userBookmark !== undefined ? `${userBookmark.name} ${userBookmark.url}` : '';
        break;
      }
      default:
        searchText = '';
        break;
    }
    searchText = searchText.toLowerCase();
    return searchText.indexOf(search.toLowerCase()) > -1;
  };

  const filterLink = (element) => {
    return element.type === 'link';
  };

  const filterGroup = (element) => {
    return element.type === 'group';
  };

  const filterService = (element) => {
    return element.type === 'service';
  };
  // focus on search input when it appears
  useEffect(() => {
    if (inputRef.current && searchToggle) {
      inputRef.current.focus();
    }
  }, [searchToggle]);

  const handleCustomDrag = (event) => {
    if (event.target.checked) {
      setSearchToggle(false);
      setSearch('');
    }
    setcustomDrag(event.target.checked);
  };

  const [localPS, setLocalPS] = useState({});
  useEffect(() => {
    if (personalspace && allServices && allGroups && allLinks) {
      // Called once
      Meteor.call('personalspaces.checkPersonalSpace', {}, (err) => {
        if (err) {
          msg.error(err.reason);
        }
      });
    }
  }, []);

  useEffect(() => {
    if (personalspace && allServices && allGroups && allLinks) {
      setLocalPS(personalspace);
    }
  }, [personalspace]);

  const updatePersonalSpace = () => {
    Meteor.call('personalspaces.updatePersonalSpace', { data: localPS }, (err) => {
      if (err) {
        msg.error(err.reason);
      }
    });
  };

  const [psNeedUpdate, setPsNeedUpdate] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => {
      if (psNeedUpdate) {
        updatePersonalSpace();
        setPsNeedUpdate(false);
      }
    }, AUTOSAVE_INTERVAL);
    return () => clearTimeout(timer);
  }, [psNeedUpdate]);

  const setExpanded = (index) => {
    if (typeof index === 'number') {
      const { sorted } = localPS;
      sorted[index].isExpanded = !sorted[index].isExpanded;
      setLocalPS({ ...localPS, sorted });
      setPsNeedUpdate(true);
    }
  };

  const setZoneTitle = (index, title) => {
    if (typeof index === 'number') {
      const { sorted } = localPS;
      if (sorted[index].name !== title) {
        sorted[index].name = title.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
        setLocalPS({ ...localPS, sorted });
        setPsNeedUpdate(true);
      }
    }
  };

  const setZoneList = (type) => (index) => (list) => {
    if (typeof index === 'number') {
      const { sorted } = localPS;
      if (list) {
        sorted[index].elements = list;
        setLocalPS({ ...localPS, sorted });
      }
    } else if (type === 'service') {
      setLocalPS({
        ...localPS,
        unsorted: [...list, ...localPS.unsorted.filter(filterGroup), ...localPS.unsorted.filter(filterLink)],
      });
    } else if (type === 'link') {
      setLocalPS({
        ...localPS,
        unsorted: [...list, ...localPS.unsorted.filter(filterGroup), ...localPS.unsorted.filter(filterService)],
      });
    } else {
      setLocalPS({
        ...localPS,
        unsorted: [...list, ...localPS.unsorted.filter(filterService), ...localPS.unsorted.filter(filterLink)],
      });
    }
  };

  const suspendUpdate = () => {
    // Called on onStart event of reactsortable zone
    setPsNeedUpdate(false); // will be true again on end drag event (updateList)
  };

  const updateList = () => {
    // Called on onEnd event of reactsortable zone
    setPsNeedUpdate(true);
  };

  const delZone = (index) => {
    const { sorted } = localPS;
    sorted.splice(index, 1);
    setLocalPS({ ...localPS, sorted });
    setPsNeedUpdate(true);
  };

  const upZone = (zoneIndex) => {
    const { sorted } = localPS;
    const movedItem = sorted[zoneIndex];
    const remainingItems = sorted.filter((item, index) => index !== zoneIndex);

    setLocalPS({
      ...localPS,
      sorted: [...remainingItems.slice(0, zoneIndex - 1), movedItem, ...remainingItems.slice(zoneIndex - 1)],
    });
    setPsNeedUpdate(true);
  };

  const downZone = (zoneIndex) => {
    const { sorted } = localPS;
    const movedItem = sorted[zoneIndex];
    const remainingItems = sorted.filter((item, index) => index !== zoneIndex);

    setLocalPS({
      ...localPS,
      sorted: [...remainingItems.slice(0, zoneIndex + 1), movedItem, ...remainingItems.slice(zoneIndex + 1)],
    });
    setPsNeedUpdate(true);
  };

  const addZone = (where) => {
    const { sorted } = localPS;
    const newZone = {
      zone_id: Random.id(),
      name: i18n.__('pages.PersonalPage.newZone'),
      isExpanded: true,
      elements: [],
    };
    if (where === 0) {
      sorted.unshift(newZone);
    } else {
      sorted.push(newZone);
    }
    setLocalPS({ ...localPS, sorted });
    setPsNeedUpdate(true);
  };

  const notReady = isLoading || loadingUser;

  return (
    <>
      {notReady ? (
        <Spinner />
      ) : (
        <Fade in>
          <Container className={classes.cardGrid}>
            <Grid container spacing={4}>
              <Grid item xs={12} sm={12} md={12} className={classes.flex}>
                <Grid container alignItems="center" spacing={1}>
                  <Grid item>
                    <Typography variant={isMobile ? 'h5' : 'h4'}>{i18n.__('pages.PersonalPage.welcome')}</Typography>
                  </Grid>
                  <Grid item style={isMobile ? { width: '100%' } : { flexGrow: 1 }}>
                    <Grid container className={classes.titleButtons}>
                      <Grid item style={{ flexGrow: 1 }}>
                        <IconButton onClick={toggleSearch} disabled={customDrag}>
                          <SearchIcon fontSize="large" />
                        </IconButton>
                      </Grid>
                      {user.advancedPersonalPage ? (
                        <Grid item>
                          <Grid
                            className={classes.modeEdition}
                            component="label"
                            container
                            alignItems="center"
                            spacing={1}
                            title={i18n.__('pages.PersonalPage.toggleEdition')}
                          >
                            <Grid item>
                              <LockIcon />
                            </Grid>
                            <Grid item>
                              <Switch
                                checked={customDrag}
                                onChange={handleCustomDrag}
                                value="customDrag"
                                color="primary"
                              />
                            </Grid>
                            <Grid item>
                              <LockOpenIcon />
                            </Grid>
                          </Grid>
                        </Grid>
                      ) : null}
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
              <Grid container spacing={4}>
                <Grid item xs={12} sm={12} md={6} className={searchToggle ? classes.search : classes.small}>
                  <Collapse in={searchToggle} collapsedSize={0}>
                    <TextField
                      margin="normal"
                      id="search"
                      label={i18n.__('pages.PersonalPage.searchText')}
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
              </Grid>
              {localPS.unsorted.length === 0 && localPS.sorted.length === 0 ? (
                <Grid>
                  <Animation />
                  <div className={classes.screen}>
                    <Link to="/services">
                      {i18n.__('pages.PersonalPage.noFavYet')}
                      <NavigateNextIcon className={classes.goIcon} />
                    </Link>
                  </div>
                </Grid>
              ) : null}
            </Grid>
            {localPS.unsorted.filter(filterGroup).length !== 0
              ? [
                  <PersonalZone
                    key="zone-favGroup-000000000000"
                    elements={localPS.unsorted.filter(filterSearch).filter(filterGroup)}
                    title={i18n.__('pages.PersonalPage.unsortedGroup')}
                    setList={setZoneList('group')}
                    suspendUpdate={suspendUpdate}
                    updateList={updateList}
                    customDrag={customDrag}
                  />,
                ]
              : null}
            {localPS.unsorted.filter(filterService).length !== 0
              ? [
                  <PersonalZone
                    key="zone-favService-000000000000"
                    elements={localPS.unsorted.filter(filterSearch).filter(filterService)}
                    title={i18n.__('pages.PersonalPage.unsortedService')}
                    setList={setZoneList('service')}
                    suspendUpdate={suspendUpdate}
                    updateList={updateList}
                    customDrag={customDrag}
                  />,
                ]
              : null}
            {localPS.unsorted.filter(filterLink).length !== 0
              ? [
                  <PersonalZone
                    key="zone-favUserBookmark-000000000000"
                    elements={localPS.unsorted.filter(filterSearch).filter(filterLink)}
                    title={i18n.__('pages.PersonalPage.unsortedLinks')}
                    setList={setZoneList('link')}
                    suspendUpdate={suspendUpdate}
                    updateList={updateList}
                    customDrag={customDrag}
                  />,
                ]
              : null}
            {customDrag && localPS.sorted.length >= 1 ? (
              <div className={classes.zoneButtonContainer}>
                <Button
                  startIcon={<AddBoxIcon />}
                  onClick={() => addZone(0)}
                  className={classes.zoneButtonEnd}
                  variant="contained"
                  color="primary"
                  fullWidth
                >
                  {i18n.__('pages.PersonalPage.addZoneHere')}
                </Button>
              </div>
            ) : null}
            {localPS.sorted.map(({ zone_id: zoneId, elements, name, isExpanded }, index) => [
              <PersonalZone
                key={`zone-${zoneId}`}
                elements={elements.filter(filterSearch)}
                index={index}
                title={name}
                setTitle={setZoneTitle}
                setList={setZoneList('')}
                suspendUpdate={suspendUpdate}
                updateList={updateList}
                delZone={delZone}
                lastZone={localPS.sorted.length === index + 1}
                moveDownZone={downZone}
                moveUpZone={upZone}
                customDrag={customDrag}
                isSorted
                isExpanded={isExpanded}
                setExpanded={setExpanded}
              />,
              // localPS.sorted.length !== index + 1 ? (
              //   <Divider className={classes.divider} key={`div-${zoneId}`} />
              // ) : null,
            ])}
            {customDrag ? (
              <div className={classes.zoneButtonContainer}>
                <Button
                  startIcon={<AddBoxIcon />}
                  onClick={() => addZone(1)}
                  className={classes.zoneButtonEnd}
                  variant="contained"
                  color="primary"
                  fullWidth
                >
                  {i18n.__('pages.PersonalPage.addZoneHere')}
                </Button>
              </div>
            ) : null}
          </Container>
        </Fade>
      )}
    </>
  );
}

PersonalPage.propTypes = {
  personalspace: PropTypes.objectOf(PropTypes.any).isRequired,
  isLoading: PropTypes.bool.isRequired,
  allServices: PropTypes.arrayOf(PropTypes.object).isRequired,
  allGroups: PropTypes.arrayOf(PropTypes.object).isRequired,
  allLinks: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default withTracker(() => {
  const subscription = Meteor.subscribe('personalspaces.self');
  const personalspace = PersonalSpaces.findOne() || { userId: this.userId, unsorted: [], sorted: [] };
  const allServices = Services.find().fetch();
  const allGroups = Groups.find().fetch();
  const allLinks = UserBookmarks.find().fetch();
  return {
    personalspace,
    isLoading: !subscription.ready(),
    allServices,
    allGroups,
    allLinks,
  };
})(PersonalPage);
