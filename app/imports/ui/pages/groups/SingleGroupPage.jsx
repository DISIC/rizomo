import React, { useState } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import PropTypes from 'prop-types';
import i18n from 'meteor/universe:i18n';
import { Roles } from 'meteor/alanning:roles';
import { Link, useHistory } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Fade from '@material-ui/core/Fade';

import ArrowBack from '@material-ui/icons/ArrowBack';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import VerifiedUserIcon from '@material-ui/icons/VerifiedUser';
import CheckIcon from '@material-ui/icons/Check';
import WatchLaterIcon from '@material-ui/icons/WatchLater';
import PeopleIcon from '@material-ui/icons/People';
import TodayIcon from '@material-ui/icons/Today';
import PollIcon from '@material-ui/icons/Poll';
import LockIcon from '@material-ui/icons/Lock';
import BookmarksIcon from '@material-ui/icons/Bookmarks';
import ClearIcon from '@material-ui/icons/Clear';
import EditIcon from '@material-ui/icons/Edit';
import AddIcon from '@material-ui/icons/Add';
import RemoveIcon from '@material-ui/icons/Remove';
import FolderIcon from '@material-ui/icons/Folder';
import VoiceChatIcon from '@material-ui/icons/VoiceChat';
import LibraryBooksIcon from '@material-ui/icons/LibraryBooks';
import Tooltip from '@material-ui/core/Tooltip';
import { useAppContext } from '../../contexts/context';
import Groups from '../../../api/groups/groups';
import Services from '../../../api/services/services';
import Spinner from '../../components/system/Spinner';
import ServiceDetails from '../../components/services/ServiceDetails';
import GroupAvatar from '../../components/groups/GroupAvatar';
import { Polls } from '../../../api/polls/polls';
import { EventsAgenda } from '../../../api/eventsAgenda/eventsAgenda';
import Bookmarks from '../../../api/bookmarks/bookmarks';

const useStyles = (member, candidate, type) =>
  makeStyles((theme) => ({
    root: {
      flexGrow: 1,
      marginTop: theme.spacing(3),
    },
    cardGrid: {
      marginBottom: theme.spacing(1),
    },
    flex: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    groupInfos: {
      display: 'flex',
      flexDirection: 'row',
      gap: theme.spacing(1),
    },
    buttonQuit: {
      backgroundColor: 'red',
      '&:hover': {
        color: 'red',
        backgroundColor: theme.palette.tertiary.main,
      },
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
    membershipText: {
      textTransform: 'none',
      color: member ? 'green' : candidate ? theme.palette.secondary.main : theme.palette.tertiary.main,
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

const SingleGroupPage = ({ group = {}, ready, services, polls, events, bookmarks }) => {
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
  const { groupPlugins, enableBBB } = Meteor.settings.public;

  // chekc if group resources are available and should be displayed
  let showResources = false;
  if (member || animator) {
    if (
      enableBBB ||
      Object.keys(group.plugins || {}).filter(
        (plug) => group.plugins[plug] === true && groupPlugins[plug].enable === true,
      ).length > 0
    ) {
      showResources = true;
    }
  }

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

  const membershipText = () => {
    if (animator) {
      return i18n.__('components.GroupDetails.groupAnimator');
    }
    if (member) {
      return i18n.__('components.GroupDetails.groupMember');
    }
    if (candidate) {
      return i18n.__('components.GroupDetails.groupCandidate');
    }
    return '';
  };

  const buttonText = () => {
    if (animator || member || candidate) {
      return i18n.__(`pages.SingleGroupPage.${animator ? 'stopAnimating' : member ? 'leaveGroup' : 'cancelCandidate'}`);
    }
    if (type === 5) {
      return i18n.__('components.GroupDetails.askToJoinModerateGroupButtonLabel');
    }
    return i18n.__('components.GroupDetails.joinPublicGroupButtonLabel');
  };

  const goBack = () => {
    history.goBack();
  };

  const openMeeting = () => {
    Meteor.call('groups.getMeetingURL', { groupId: group._id }, (err, res) => {
      if (err) {
        msg.error(err.reason);
      } else {
        window.open(res, '_blank');
      }
    });
  };

  const openBlog = () => {
    window.open(`${Meteor.settings.public.laboiteBlogURL}/groups/${group.slug}`, '_blank');
  };

  const openGroupFolder = (plugin) => {
    const resourceURL = groupPlugins[plugin].groupURL
      .replace('[URL]', groupPlugins[plugin].URL)
      .replace('[GROUPNAME]', encodeURIComponent(group.name))
      .replace('[GROUPSLUG]', group.slug);
    window.open(resourceURL, '_blank');
  };

  const groupPluginsShow = (plugin) => {
    if (group.plugins[plugin]) {
      return (
        <Grid item key={`${plugin}_${group._id}`} className={classes.cardGrid}>
          <Button
            startIcon={<FolderIcon />}
            className={classes.buttonAdmin}
            size="large"
            variant="contained"
            onClick={() => openGroupFolder(plugin)}
          >
            {i18n.__(`api.${plugin}.buttonLinkPlugin`)}
          </Button>
        </Grid>
      );
    }
    return null;
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
              <GroupAvatar type={type || 0} avatar={group.avatar} />
              <div className={classes.title}>
                <Typography variant="h5">{group.name}</Typography>
                <div className={classes.groupInfos}>
                  <Typography color={type === 0 ? 'primary' : 'secondary'} variant="h6">
                    {groupType}
                  </Typography>
                  {animator || member || candidate ? (
                    <Typography className={classes.membershipText} variant="h6">
                      {`(${membershipText()})`}
                    </Typography>
                  ) : null}
                </div>
              </div>
            </div>
          </Grid>
          <Grid item xs={12} sm={12} md={6} className={classes.favoriteButton}>
            <Grid container className={classes.actionButtons} spacing={1}>
              {type !== 10 || admin || member || animator ? (
                <Grid item>
                  {animator || member || candidate ? (
                    <Button
                      className={classes.buttonQuit}
                      startIcon={<ClearIcon />}
                      color="primary"
                      variant="contained"
                      onClick={handleJoinGroup}
                    >
                      {i18n.__(
                        `pages.SingleGroupPage.${
                          animator ? 'stopAnimating' : member ? 'leaveGroup' : 'cancelCandidate'
                        }`,
                      )}
                    </Button>
                  ) : (
                    <Button
                      startIcon={icon()}
                      className={classes.buttonText}
                      size="large"
                      variant="contained"
                      onClick={handleJoinGroup}
                    >
                      {buttonText()}
                    </Button>
                  )}
                </Grid>
              ) : null}
              {admin && (
                <Grid item>
                  <Link to={`/admingroups/${group._id}`} tabIndex={-1}>
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
                      {favorite ? <RemoveIcon /> : <AddIcon />}
                    </Button>
                  </Tooltip>
                </Grid>
              )}
            </Grid>
          </Grid>
          {showResources ? (
            <>
              <Grid item xs={12} sm={12} md={12} className={classes.cardGrid}>
                <Typography className={classes.smallTitle} variant="h5">
                  {i18n.__('pages.SingleGroupPage.resources')}
                </Typography>
              </Grid>
              <Grid container className={classes.cardGrid} spacing={1}>
                {enableBBB ? (
                  <Grid item key={`meeting_${group._id}`} className={classes.cardGrid}>
                    <Button
                      startIcon={<VoiceChatIcon />}
                      className={classes.buttonAdmin}
                      size="large"
                      variant="contained"
                      onClick={() => openMeeting()}
                    >
                      {i18n.__(`api.bbb.joinMeeting`)}
                    </Button>
                  </Grid>
                ) : null}
                {Meteor.settings.public.laboiteBlogURL !== '' ? (
                  <Grid item key={`groupblog_${group._id}`} className={classes.cardGrid}>
                    <Button
                      startIcon={<LibraryBooksIcon />}
                      className={classes.buttonAdmin}
                      size="large"
                      variant="contained"
                      onClick={() => openBlog()}
                    >
                      {i18n.__(`pages.SingleGroupPage.groupArticles`)}
                    </Button>
                  </Grid>
                ) : null}
                {Object.keys(groupPlugins)
                  .filter((p) => groupPlugins[p].enable === true)
                  .map((p) => {
                    return groupPluginsShow(p);
                  })}
              </Grid>
            </>
          ) : null}

          <Grid item xs={12} sm={12} md={12} className={classes.cardGrid}>
            <Typography className={classes.smallTitle} variant="h5">
              {i18n.__('pages.SingleGroupPage.apps')}
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
          {(admin || member || animator || type === 0) && (
            <Grid item xs={12} sm={12} md={6} lg={4} className={classes.cardGrid}>
              <ServiceDetails
                service={{
                  _id: 'events',
                  usage: i18n.__('pages.SingleGroupPage.EventsUsage'),
                  logo: <TodayIcon className={classes.icon} color="primary" fontSize="large" />,
                  title:
                    events === undefined
                      ? `${i18n.__('pages.SingleGroupPage.Events')}`
                      : `${i18n.__('pages.SingleGroupPage.Events')} (${events})`,
                  url: `/groups/${group.slug}/events`,
                }}
                isShort
              />
            </Grid>
          )}
          {(admin || member || animator || type === 0) && (
            <Grid item xs={12} sm={12} md={6} lg={4} className={classes.cardGrid}>
              <ServiceDetails
                service={{
                  _id: 'polls',
                  usage: i18n.__('pages.SingleGroupPage.PollUsage'),
                  logo: <PollIcon className={classes.icon} color="primary" fontSize="large" />,
                  title:
                    polls === undefined
                      ? `${i18n.__('pages.SingleGroupPage.Polls')}`
                      : `${i18n.__('pages.SingleGroupPage.Polls')} (${polls})`,
                  url: `/groups/${group.slug}/poll`,
                }}
                isShort
              />
            </Grid>
          )}
          {(admin || member || animator || type === 0) && (
            <Grid item xs={12} sm={12} md={6} lg={4} className={classes.cardGrid}>
              <ServiceDetails
                service={{
                  _id: 'bookmarks',
                  usage: i18n.__('pages.SingleGroupPage.BookmarksUsage'),
                  logo: <BookmarksIcon className={classes.icon} color="primary" fontSize="large" />,
                  title:
                    polls === undefined
                      ? `${i18n.__('pages.SingleGroupPage.Bookmarks')}`
                      : `${i18n.__('pages.SingleGroupPage.Bookmarks')} (${bookmarks})`,
                  url: `/groups/${group.slug}/bookmarks`,
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
    const subGroup = Meteor.subscribe('groups.single', { slug });
    const group = Groups.findOne({ slug }) || {};
    const polls = Polls.find({}).count();
    const bookmarks = Bookmarks.find({}).count();
    const events = EventsAgenda.find({}).count();
    const subServices = Meteor.subscribe('services.group', { ids: group.applications });
    const services = Services.findFromPublication('services.group', {}, { sort: { name: 1 } }).fetch() || [];
    const ready = subGroup.ready() && subServices.ready();
    return {
      group,
      ready,
      services,
      polls,
      bookmarks,
      events,
    };
  },
)(SingleGroupPage);

SingleGroupPage.defaultProps = {
  group: {},
  services: [],
  polls: undefined,
  bookmarks: undefined,
  events: undefined,
};

SingleGroupPage.propTypes = {
  group: PropTypes.objectOf(PropTypes.any),
  ready: PropTypes.bool.isRequired,
  services: PropTypes.arrayOf(PropTypes.any),
  polls: PropTypes.number,
  bookmarks: PropTypes.number,
  events: PropTypes.number,
};
