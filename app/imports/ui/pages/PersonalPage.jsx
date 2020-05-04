import React, { useEffect, useState } from 'react';
import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import PropTypes from 'prop-types';
import { withTracker } from 'meteor/react-meteor-data';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import { Link } from 'react-router-dom';
import Grid from '@material-ui/core/Grid';
import i18n from 'meteor/universe:i18n';
import {
  Typography, Fade, IconButton, Button, Divider,
} from '@material-ui/core';
import Switch from '@material-ui/core/Switch';
import LockIcon from '@material-ui/icons/Lock';
import LockOpenIcon from '@material-ui/icons/LockOpen';
import AddBoxIcon from '@material-ui/icons/AddBox';
import NavigateNextIcon from '@material-ui/icons/NavigateNext';
import Groups from '../../api/groups/groups';
import Services from '../../api/services/services';
import Spinner from '../components/system/Spinner';
import PersonalSpaces from '../../api/personalspaces/personalspaces';
import PersonalZone from '../components/personalspace/PersonalZone';

const useStyles = makeStyles((theme) => ({
  flex: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardGrid: {
    paddingTop: theme.spacing(5),
    paddingBottom: theme.spacing(5),
  },
  chip: {
    margin: theme.spacing(1),
  },
  badge: { position: 'inherit' },
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
    marginTop: 30,
    opacity: 0.5,
    cursor: 'pointer',
    '&:hover': {
      opacity: 1,
      color: theme.palette.error.main,
    },
  },
  divider: {
    marginTop: 30,
  },
  goIcon: {
    marginLeft: 8,
    verticalAlign: 'bottom',
  },
}));

function PersonalPage({
  personalspace, isLoading, allServices, allGroups,
}) {
  const classes = useStyles();
  const [customDrag, setcustomDrag] = useState(false);

  const checkElementExists = (elem) => {
    switch (elem.type) {
      case 'service': {
        return Services.findOne(elem.element_id) !== undefined;
      }
      case 'group': {
        return Groups.findOne(elem.element_id) !== undefined;
      }
      default: {
        return true;
      }
    }
  };

  const checkPersonalSpace = (ps) => {
    let didDelete = false;

    for (let i = ps.unsorted.length - 1; i >= 0; i -= 1) {
      if (!checkElementExists(ps.unsorted[i])) {
        ps.unsorted.splice(i, 1);
        didDelete = true;
      }
    }

    ps.sorted.map((zone, zi) => {
      for (let i = zone.elements.length - 1; i >= 0; i -= 1) {
        if (!checkElementExists(zone.elements[i])) {
          ps.sorted[zi].elements.splice(i, 1);
          didDelete = true;
        }
      }
      return true;
    });

    if (didDelete) {
      Meteor.call('personalspaces.updatePersonalSpace', { data: ps }, (err) => {
        if (err) {
          msg.error(err.reason);
        }
      });
    }

    return ps;
  };

  const [localPS, setLocalPS] = useState({});
  useEffect(() => {
    if (personalspace && allServices && allGroups) {
      setLocalPS(checkPersonalSpace(personalspace));
    }
  }, [personalspace]);

  const updatePersonalSpace = () => {
    Meteor.call('personalspaces.updatePersonalSpace', { data: localPS }, (err) => {
      if (err) {
        msg.error(err.reason);
      }
    });
  };

  const handleCustomDrag = (event) => {
    setcustomDrag(event.target.checked);
    if (!event.target.checked) {
      updatePersonalSpace();
    }
  };

  const setZoneTitle = (index, title) => {
    if (typeof index === 'number') {
      const { sorted } = localPS;
      if (sorted[index].name !== title) {
        sorted[index].name = title.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
        setLocalPS({ ...localPS, sorted });
      }
    }
  };

  const setZoneList = (index) => (list) => {
    if (typeof index === 'number') {
      const { sorted } = localPS;
      if (list) {
        sorted[index].elements = list;
        setLocalPS({ ...localPS, sorted });
      }
    } else {
      setLocalPS({ ...localPS, unsorted: list });
    }
  };

  const delZone = (index) => {
    const { sorted } = localPS;
    sorted.splice(index, 1);
    setLocalPS({ ...localPS, sorted });
  };

  const upZone = (zoneIndex) => {
    const { sorted } = localPS;
    const movedItem = sorted[zoneIndex];
    const remainingItems = sorted.filter((item, index) => index !== zoneIndex);

    setLocalPS({
      ...localPS,
      sorted: [...remainingItems.slice(0, zoneIndex - 1), movedItem, ...remainingItems.slice(zoneIndex - 1)],
    });
  };

  const downZone = (zoneIndex) => {
    const { sorted } = localPS;
    const movedItem = sorted[zoneIndex];
    const remainingItems = sorted.filter((item, index) => index !== zoneIndex);

    setLocalPS({
      ...localPS,
      sorted: [...remainingItems.slice(0, zoneIndex + 1), movedItem, ...remainingItems.slice(zoneIndex + 1)],
    });
  };

  const addZone = (where) => {
    const { sorted } = localPS;
    const newZone = {
      zone_id: Random.id(),
      name: i18n.__('pages.PersonalPage.newZone'),
      elements: [],
    };
    if (where === 0) {
      sorted.unshift(newZone);
    } else {
      sorted.push(newZone);
    }
    setLocalPS({ ...localPS, sorted });
  };

  const addLink = (zoneIndex) => {
    const { sorted } = localPS;
    const newLink = {
      type: 'link',
      element_id: Random.id(),
      title: '',
      url: '',
    };
    sorted[zoneIndex].elements.unshift(newLink);
    setLocalPS({ ...localPS, sorted });
  };

  const updateLink = (zoneIndex, link) => {
    const { sorted } = localPS;
    const linkIndex = sorted[zoneIndex].elements.map((item) => item.element_id).indexOf(link.element_id);
    sorted[zoneIndex].elements[linkIndex].title = link.title;
    sorted[zoneIndex].elements[linkIndex].url = link.url;
    setLocalPS({ ...localPS, sorted });
    updatePersonalSpace();
  };

  const delLink = (zoneIndex, linkId) => () => {
    const { sorted } = localPS;
    const removeIndex = sorted[zoneIndex].elements.map((item) => item.element_id).indexOf(linkId);
    sorted[zoneIndex].elements.splice(removeIndex, 1);
    setLocalPS({ ...localPS, sorted });
    updatePersonalSpace();
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
                <Typography variant="h4">{i18n.__('pages.PersonalPage.welcome')}</Typography>
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
              {localPS.unsorted.length === 0 && localPS.sorted.length === 0 ? (
                <Typography>
                  <Link to="/services">
                    {i18n.__('pages.PersonalPage.noFavYet')}
                    <NavigateNextIcon className={classes.goIcon} />
                  </Link>
                </Typography>
              ) : null}
            </Grid>
            {localPS.unsorted.length !== 0
              ? [
                <PersonalZone
                  key="zone-000000000000"
                  elements={localPS.unsorted}
                  title={
                      localPS.sorted.length === 0
                        ? i18n.__('pages.PersonalPage.unsortedFav')
                        : i18n.__('pages.PersonalPage.unsorted')
                    }
                  setList={setZoneList}
                  customDrag={customDrag}
                />,
                <Divider key="div-000000000000" className={classes.divider} />,
              ]
              : null}
            {localPS.sorted.map(({ zone_id: zoneId, elements, name }, index) => [
              <PersonalZone
                key={`zone-${zoneId}`}
                elements={elements}
                index={index}
                title={name}
                setTitle={setZoneTitle}
                setList={setZoneList}
                delZone={delZone}
                lastZone={localPS.sorted.length === index + 1}
                moveDownZone={downZone}
                moveUpZone={upZone}
                addPersonalLink={addLink}
                updatePersonalLink={updateLink}
                delPersonalLink={delLink}
                customDrag={customDrag}
                isSorted
              />,
              localPS.sorted.length !== index + 1 ? (
                <Divider className={classes.divider} key={`div-${zoneId}`} />
              ) : null,
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
