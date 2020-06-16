import React, { useState } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import PropTypes from 'prop-types';
import i18n from 'meteor/universe:i18n';
import { Roles } from 'meteor/alanning:roles';
import { Link, useHistory } from 'react-router-dom';
import { Container, makeStyles, Button, Typography, Grid, Avatar, Fade, Divider } from '@material-ui/core';
import ArrowBack from '@material-ui/icons/ArrowBack';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import SecurityIcon from '@material-ui/icons/Security';
import VerifiedUserIcon from '@material-ui/icons/VerifiedUser';
import CheckIcon from '@material-ui/icons/Check';
import WatchLaterIcon from '@material-ui/icons/WatchLater';
import PeopleIcon from '@material-ui/icons/People';
import LockIcon from '@material-ui/icons/Lock';
import ClearIcon from '@material-ui/icons/Clear';
import EditIcon from '@material-ui/icons/Edit';
import BookmarkIcon from '@material-ui/icons/Bookmark';
import BookmarkBorderIcon from '@material-ui/icons/BookmarkBorder';
import Tooltip from '@material-ui/core/Tooltip';
import { useAppContext } from '../../contexts/context';
import Groups from '../../../api/groups/groups';
import Services from '../../../api/services/services';
import Spinner from '../../components/system/Spinner';
import ServiceDetails from '../../components/services/ServiceDetails';

const useStyles = (member, candidate, type) =>
  makeStyles((theme) => ({
    root: {
      flexGrow: 1,
      marginTop: theme.spacing(3),
    },
    cardGrid: {
      paddingTop: theme.spacing(5),
      paddingBottom: theme.spacing(5),
      marginBottom: theme.spacing(3),
    },
    flex: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    favoriteButton: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
      paddingTop: theme.spacing(5),
      paddingBottom: theme.spacing(5),
      marginBottom: theme.spacing(3),
    },
    actionButtons: {
      flexDirection: 'inherit',
      alignItems: 'flex-end',
    },
    titleContainer: {
      display: 'flex',
      alignItems: 'center',
    },
    icon: {
      height: 60,
      width: 60,
    },
    title: {
      marginLeft: theme.spacing(3),
    },
    smallTitle: {
      marginBottom: theme.spacing(1),
    },
    openedContent: {
      textAlign: 'justify',
      marginBottom: theme.spacing(3),
      '& p': {
        marginTop: 0,
        marginBottom: 0,
      },
    },
    content: {
      textAlign: 'justify',
      position: 'relative',
      marginBottom: theme.spacing(3),
      maxHeight: 150,
      overflow: 'hidden',
      '&::after': {
        content: '""',
        position: 'absolute',
        bottom: 0,
        height: '20px',
        left: '0px',
        right: '0px',
        background: `linear-gradient(rgba(255,255,255,0), ${theme.palette.background.default})`,
      },
    },
    screenshot: {
      width: '100%',
    },
    category: {
      marginLeft: theme.spacing(1),
    },
    buttonText: {
      textTransform: 'none',
      backgroundColor:
        member || candidate ? null : type === 0 ? theme.palette.primary.main : theme.palette.secondary.main,
      color: member ? 'green' : candidate ? theme.palette.secondary.main : theme.palette.tertiary.main,
      fontWeight: 'bold',
      '&:hover': {
        color: member || candidate ? null : type === 0 ? theme.palette.primary.main : theme.palette.secondary.main,
        backgroundColor: member || candidate ? null : theme.palette.tertiary.main,
      },
    },
    buttonAdmin: {
      textTransform: 'none',
      backgroundColor: theme.palette.primary.main,
      color: theme.palette.tertiary.main,
      fontWeight: 'bold',
      '&:hover': {
        color: theme.palette.primary.main,
        backgroundColor: theme.palette.tertiary.main,
      },
    },
    buttonFav: {
      color: theme.palette.primary.main,
      backgroundColor: theme.palette.tertiary.main,
      '&:hover': {
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.tertiary.main,
      },
    },
    fab: {},
    avatar: {
      backgroundColor: member ? 'green' : type === 0 ? theme.palette.primary.main : theme.palette.secondary.main,
      height: 100,
      width: 100,
    },
  }));

const SingleGroupPage = ({ group = {}, ready, services }) => {
  const { type } = group;
  const [{ userId, user }] = useAppContext();
  const [loading, setLoading] = useState(false);
  const [openedContent, toggleOpenedContent] = useState(false);
  const animator = Roles.userIsInRole(userId, 'animator', group._id);
  const member = Roles.userIsInRole(userId, 'member', group._id);
  const candidate = Roles.userIsInRole(userId, ['candidate'], group._id);
  const admin = Roles.userIsInRole(userId, ['admin', 'animator'], group._id);
  const favorite = user.favGroups.includes(group._id);
  const classes = useStyles(member || animator, candidate, type)();
  const history = useHistory();

  const handleOpenedContent = () => {
    toggleOpenedContent(!openedContent);
  };

  const handleJoinGroup = () => {
    const method = animator
      ? 'unsetAnimatorOf'
      : member
      ? 'unsetMemberOf'
      : type !== 5
      ? 'setMemberOf'
      : candidate
      ? 'unsetCandidateOf'
      : 'setCandidateOf';
    const message = animator
      ? 'animationLeft'
      : member
      ? 'groupLeft'
      : type !== 5
      ? 'groupJoined'
      : candidate
      ? 'candidateCancel'
      : 'candidateSent';

    setLoading(true);
    Meteor.call(`users.${method}`, { userId, groupId: group._id }, (err) => {
      setLoading(false);
      if (err) {
        msg.error(err.reason);
      } else {
        msg.success(i18n.__(`pages.SingleGroupPage.${message}`));
      }
    });
  };

  const handleFavorite = () => {
    if (favorite) {
      Meteor.call('groups.unfavGroup', { groupId: group._id }, (err) => {
        if (err) {
          msg.error(err.reason);
        } else {
          msg.success(i18n.__('components.ServiceDetails.unfavSuccessMsg'));
        }
      });
    } else {
      Meteor.call('groups.favGroup', { groupId: group._id }, (err) => {
        if (err) {
          msg.error(err.reason);
        } else {
          msg.success(i18n.__('components.ServiceDetails.favSuccessMsg'));
        }
      });
    }
  };

  const favButtonLabel = favorite
    ? i18n.__('components.ServiceDetails.favButtonLabelNoFav')
    : i18n.__('components.ServiceDetails.favButtonLabelFav');
  const showFavorite = admin && !candidate && !member && !animator;

  const groupType = i18n.__(
    `components.GroupDetails.${type === 0 ? 'publicGroup' : type === 10 ? 'closedGroup' : 'moderateGroup'}`,
  );

  const IconHeader = (props) =>
    type === 0 ? <PeopleIcon {...props} /> : type === 10 ? <LockIcon {...props} /> : <SecurityIcon {...props} />;

  const icon = () => {
    if (member || animator) {
      return type === 0 ? <CheckIcon /> : <VerifiedUserIcon />;
    }
    if (type === 0) {
      return <ExitToAppIcon />;
    }
    if (candidate) {
      return <WatchLaterIcon />;
    }
    return <LockIcon />;
  };

  const text = () => {
    if (animator) {
      return i18n.__('components.GroupDetails.groupAnimator');
    }
    if (member) {
      return i18n.__('components.GroupDetails.groupMember');
    }
    if (candidate) {
      return i18n.__('components.GroupDetails.groupCandidate');
    }
    if (type === 5) {
      return i18n.__('components.GroupDetails.askToJoinModerateGroupButtonLabel');
    }
    return i18n.__('components.GroupDetails.joinPublicGroupButtonLabel');
  };

  const goBack = () => {
    history.goBack();
  };

  return (
    <Fade in>
      <Container className={classes.root}>
        {!ready && !loading && <Spinner full />}
        <Grid container spacing={2}>
          <Grid item xs={12} sm={12} md={12} className={classes.flex}>
            <Button onClick={goBack} color="primary" startIcon={<ArrowBack />}>
              {i18n.__('pages.SingleServicePage.backToList')}
            </Button>
          </Grid>
          <Grid item xs={12} sm={12} md={6} className={classes.cardGrid}>
            <div className={classes.titleContainer}>
              <Avatar className={classes.avatar}>
                <IconHeader className={classes.icon} fontSize="large" />
              </Avatar>

              <div className={classes.title}>
                <Typography variant="h5">{group.name}</Typography>
                <Typography color={type === 0 ? 'primary' : 'secondary'} variant="h6">
                  {groupType}
                </Typography>
              </div>
            </div>
          </Grid>
          <Grid item xs={12} sm={12} md={6} className={classes.favoriteButton}>
            <Grid container className={classes.actionButtons} spacing={1}>
              {type !== 10 || admin || member || animator ? (
                <Grid item>
                  <Button
                    startIcon={icon()}
                    className={classes.buttonText}
                    size="large"
                    variant={member || animator || candidate ? 'text' : 'contained'}
                    disableElevation={member || animator || candidate}
                    onClick={animator || member || candidate ? null : handleJoinGroup}
                  >
                    {text()}
                  </Button>
                </Grid>
              ) : null}
              {admin && (
                <Grid item>
                  <Link to={`/admingroups/${group._id}`}>
                    <Button startIcon={<EditIcon />} className={classes.buttonAdmin} size="large" variant="contained">
                      {i18n.__('components.GroupDetails.manageGroupButtonLabel')}
                    </Button>
                  </Link>
                </Grid>
              )}
              {showFavorite && (
                <Grid item>
                  <Tooltip title={favButtonLabel} aria-label={favButtonLabel}>
                    <Button className={classes.buttonFav} size="large" variant="outlined" onClick={handleFavorite}>
                      {favorite ? <BookmarkIcon /> : <BookmarkBorderIcon />}
                    </Button>
                  </Tooltip>
                </Grid>
              )}
            </Grid>
          </Grid>

          <Grid item xs={12} sm={12} md={12} className={classes.cardGrid}>
            <Typography className={classes.smallTitle} variant="h5">
              Applications
            </Typography>
          </Grid>
          {services.map((service) => (
            <Grid item key={service._id} xs={12} sm={12} md={6} lg={4} className={classes.cardGrid}>
              <ServiceDetails service={service} isShort />
            </Grid>
          ))}
          {(admin || member || animator || type === 0) && (
            <Grid item xs={12} sm={12} md={6} lg={4} className={classes.cardGrid}>
              <ServiceDetails
                service={{
                  _id: 'addressbook',
                  usage: i18n.__('pages.SingleGroupPage.addressBookUsage'),
                  logo: <PeopleIcon className={classes.icon} color="primary" fontSize="large" />,
                  title: i18n.__('pages.SingleGroupPage.addressBook'),
                  url: `/groups/${group.slug}/addressbook`,
                }}
                isShort
              />
            </Grid>
          )}
          <Grid item xs={12} sm={12} md={12} className={classes.cardGrid}>
            <Typography className={classes.smallTitle} variant="h5">
              Description
            </Typography>
            <div
              className={openedContent ? classes.openedContent : classes.content}
              dangerouslySetInnerHTML={{ __html: group.content }}
            />
            <Button color="primary" disableElevation size="small" variant="outlined" onClick={handleOpenedContent}>
              {i18n.__(`pages.SingleGroupPage.${openedContent ? 'seeLess' : 'seeMore'}`)}
            </Button>
          </Grid>
          <Grid item xs={12} sm={12} md={12} className={classes.cardGrid}>
            <Divider style={{ marginBottom: 30 }} />

            {(animator || member || candidate) && (
              <Button
                style={{ border: 'red', color: 'red' }}
                color="primary"
                startIcon={<ClearIcon />}
                disableElevation
                variant="outlined"
                onClick={handleJoinGroup}
              >
                {i18n.__(
                  `pages.SingleGroupPage.${animator ? 'stopAnimating' : member ? 'leaveGroup' : 'cancelCandidate'}`,
                )}
              </Button>
            )}
          </Grid>
        </Grid>
      </Container>
    </Fade>
  );
};

export default withTracker(
  ({
    match: {
      params: { slug },
    },
  }) => {
    const subGroup = Meteor.subscribe('groups.one', { slug });
    const group = Groups.findOneFromPublication('groups.one', {}) || {};
    const subServices = Meteor.subscribe('services.group', { ids: group.applications });
    const services = Services.findFromPublication('services.group', {}, { sort: { name: 1 } }).fetch() || [];
    const ready = subGroup.ready() && subServices.ready();
    return {
      group,
      ready,
      services,
    };
  },
)(SingleGroupPage);

SingleGroupPage.defaultProps = {
  group: {},
  services: [],
};

SingleGroupPage.propTypes = {
  group: PropTypes.objectOf(PropTypes.any),
  ready: PropTypes.bool.isRequired,
  services: PropTypes.arrayOf(PropTypes.any),
};
