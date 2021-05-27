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
import Divider from '@material-ui/core/Divider';
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
    flex: {
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      justifyContent: 'space-between',
      alignItems: isMobile ? 'flex-start' : 'center',
    },
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
    spaceBetween: {
      display: 'flex',
      justifyContent: 'space-between',
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
    zoneButton: {
      color: theme.palette.primary.main,
      opacity: 0.5,
      cursor: 'pointer',
      '&:hover': {
        opacity: 1,
        color: theme.palette.error.main,
      },
    },
    zoneButtonEnd: {
      opacity: 0.5,
      cursor: 'pointer',
      '&:hover': {
        opacity: 1,
        color: theme.palette.error.main,
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

function PersonalPage({ personalspace, isLoading, allServices, allGroups }) {
  const AUTOSAVE_INTERVAL = 3000;
  const [{ isMobile }] = useAppContext();
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
        const service = Services.findOne({ _id: element.element_id });
        searchText = service !== undefined ? service.title : '';
        break;
      }
      case 'group': {
        const group = Groups.findOne(element.element_id);
        searchText = group !== undefined ? group.name : '';
        break;
      }
      case 'link': {
        searchText = element.title || '';
        break;
      }
      default:
        searchText = '';
        break;
    }
    searchText = searchText.toLowerCase();
    return searchText.indexOf(search.toLowerCase()) > -1;
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
    if (personalspace && allServices && allGroups) {
      // Called once
      Meteor.call('personalspaces.checkPersonalSpace', {}, (err) => {
        if (err) {
          msg.error(err.reason);
        }
      });
    }
  }, []);

  useEffect(() => {
    if (personalspace && allServices && allGroups) {
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
      setLocalPS({ ...localPS, unsorted: [...list, ...localPS.unsorted.filter(filterGroup)] });
    } else {
      setLocalPS({ ...localPS, unsorted: [...list, ...localPS.unsorted.filter(filterService)] });
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

  const addLink = (zoneIndex) => {
    const { sorted } = localPS;
    const newLink = {
      type: 'link',
      element_id: Random.id(),
      title: '',
      url: '',
    };
    if (sorted[zoneIndex].isExpanded !== true) {
      // Expand zone to add the new link
      sorted[zoneIndex].isExpanded = true;
    }
    sorted[zoneIndex].elements.unshift(newLink);
    setLocalPS({ ...localPS, sorted });
    setPsNeedUpdate(true);
  };

  const updateLink = (zoneIndex, link) => {
    const { sorted } = localPS;
    const linkIndex = sorted[zoneIndex].elements.map((item) => item.element_id).indexOf(link.element_id);
    sorted[zoneIndex].elements[linkIndex].title = link.title;
    sorted[zoneIndex].elements[linkIndex].url = link.url;
    setLocalPS({ ...localPS, sorted });
    setPsNeedUpdate(true);
  };

  const delLink = (zoneIndex, linkId) => () => {
    const { sorted } = localPS;
    const removeIndex = sorted[zoneIndex].elements.map((item) => item.element_id).indexOf(linkId);
    sorted[zoneIndex].elements.splice(removeIndex, 1);
    setLocalPS({ ...localPS, sorted });
    setPsNeedUpdate(true);
  };

  return (
    <>
      {isLoading ? (
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
                  <Grid item>
                    <IconButton onClick={toggleSearch} disabled={customDrag}>
                      <SearchIcon fontSize="large" />
                    </IconButton>
                  </Grid>
                </Grid>
                <div className={classes.spaceBetween}>
                  {customDrag ? (
                    <IconButton
                      onClick={() => addZone(0)}
                      className={classes.zoneButton}
                      title={i18n.__('pages.PersonalPage.addZoneStartButton')}
                    >
                      <AddBoxIcon />
                    </IconButton>
                  ) : null}
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
                      <Switch checked={customDrag} onChange={handleCustomDrag} value="customDrag" color="primary" />
                    </Grid>
                    <Grid item>
                      <LockOpenIcon />
                    </Grid>
                  </Grid>
                </div>
              </Grid>
              <Grid container spacing={4}>
                <Grid item xs={12} sm={12} md={6} className={searchToggle ? classes.search : classes.small}>
                  <Collapse in={searchToggle} collapsedHeight={0}>
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
            {localPS.unsorted.length !== 0 ? [<Divider key="div-000000000000" className={classes.divider} />] : null}
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
                addPersonalLink={addLink}
                updatePersonalLink={updateLink}
                delPersonalLink={delLink}
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
              <>
                <Divider className={classes.divider} key="div-addEnd" />
                <Button
                  onClick={() => addZone(1)}
                  className={classes.zoneButtonEnd}
                  variant="contained"
                  color="primary"
                  fullWidth
                >
                  {i18n.__('pages.PersonalPage.addZoneEndButton')}
                </Button>
              </>
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
};

export default withTracker(() => {
  const subscription = Meteor.subscribe('personalspaces.self');
  const personalspace = PersonalSpaces.findOne() || { userId: this.userId, unsorted: [], sorted: [] };
  const allServices = Services.find().fetch();
  const allGroups = Groups.find().fetch();
  return {
    personalspace,
    isLoading: !subscription.ready(),
    allServices,
    allGroups,
  };
})(PersonalPage);
