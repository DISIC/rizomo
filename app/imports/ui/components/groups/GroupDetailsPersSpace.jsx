import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Card from '@material-ui/core/Card';
import { useHistory } from 'react-router-dom';
import Tooltip from '@material-ui/core/Tooltip';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardActions from '@material-ui/core/CardActions';
import CardHeader from '@material-ui/core/CardHeader';
import Button from '@material-ui/core/Button';
import Zoom from '@material-ui/core/Zoom';
import PublishIcon from '@material-ui/icons/Publish';

import i18n from 'meteor/universe:i18n';
import GroupAvatar from './GroupAvatar';
import GroupBadge from './GroupBadge';

const useStyles = ({ type }, admin, member, candidate) =>
  makeStyles((theme) => ({
    avatar: {
      backgroundColor: member ? 'green' : type === 0 ? theme.palette.primary.main : theme.palette.secondary.main,
      width: theme.spacing(5),
      height: theme.spacing(5),
      margin: 'auto',
    },
    card: {
      height: '100%',
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
    },
    buttonText: {
      textTransform: 'none',
      color: member
        ? 'green'
        : candidate
        ? theme.palette.secondary.main
        : admin
        ? theme.palette.primary.main
        : theme.palette.text.disabled,
      fontWeight: 'bold',
    },
    serviceName: {
      color: theme.palette.primary.main,
    },
    cardHeaderContent: { display: 'grid' },
    cardActions: {
      justifyContent: 'space-between',
      paddingTop: 0,
    },
    cardActionsUnique: {
      justifyContent: 'end',
      paddingTop: 0,
    },
    fab: {
      textTransform: 'none',
      color: theme.palette.primary.main,
      borderColor: theme.palette.primary.main,
      backgroundColor: theme.palette.tertiary.main,
      '&:hover': {
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.tertiary.main,
      },
    },
  }));

function GroupDetailsPersSpace({
  group = {},
  member,
  candidate,
  admin,
  animator,
  globalAdmin,
  isMobile,
  customDrag,
  isSorted,
}) {
  const history = useHistory();
  const { type } = group;
  const classes = useStyles(group, admin, member || animator, candidate)();

  // const icon = () => {
  //   if (member || animator) {
  //     return type === 0 ? <CheckIcon /> : <VerifiedUserIcon />;
  //   }
  //   if (type === 0) {
  //     return <ExitToAppIcon />;
  //   }
  //   if (candidate) {
  //     return <WatchLaterIcon />;
  //   }
  //   return <LockIcon />;
  // };

  const text = () => {
    if (animator) {
      return i18n.__('components.GroupDetails.groupAnimator');
    }
    if (member) {
      return i18n.__('components.GroupDetails.groupMember');
    }
    if (candidate) {
      return i18n.__('components.GroupDetailsPersSpace.groupCandidate');
    }
    if (admin) {
      return i18n.__('components.GroupDetailsPersSpace.groupAdmin');
    }
    return i18n.__('components.GroupDetailsPersSpace.groupNone');
  };
  const hasAdmin = admin || globalAdmin;

  const backToDefaultButtonLabel = i18n.__('components.GroupDetailsPersSpace.backToDefault');

  const handleBackToDefault = () => {
    Meteor.call('personalspaces.backToDefaultElement', { elementId: group._id, type: 'group' }, (err) => {
      if (err) {
        msg.error(err.reason);
      }
    });
  };

  return (
    <Card className={classes.card} elevation={3}>
      <Tooltip
        TransitionComponent={Zoom}
        enterDelay={600}
        title={
          <>
            <Typography>{group.name}</Typography>
            {i18n.__('pages.PersonalPage.typeGroup')}
          </>
        }
        aria-label={group.name}
      >
        {/* this span is to allow display of tooltip when CardActionArea is disabled 
        (occur when a service is disabled) */}
        <span>
          <CardActionArea className={classes.actionarea} onClick={() => history.push(`/groups/${group.slug}`)}>
            <CardHeader
              classes={{ content: classes.cardHeaderContent }}
              avatar={
                animator || hasAdmin ? (
                  <GroupBadge
                    overlap="circular"
                    className={classes.badge}
                    color="error"
                    badgeContent={group.numCandidates}
                  >
                    <GroupAvatar type={type} avatar={group.avatar} className={classes.avatar} />
                  </GroupBadge>
                ) : (
                  <GroupAvatar type={type} avatar={group.avatar} className={classes.avatar} />
                )
              }
              title={
                <Typography className={classes.serviceName} gutterBottom noWrap={!isMobile} variant="h6" component="h2">
                  {group.name}
                </Typography>
              }
              subheader={
                <Typography className={classes.buttonText} variant="body2" component="p">
                  {text()}
                </Typography>
              }
            />
          </CardActionArea>
        </span>
      </Tooltip>
      {/* <CardActions className={classes.cardActionsUnique}>
        {hasAdmin || globalAdmin && (
          <Tooltip
            title={i18n.__('components.GroupDetails.manageGroupButtonLabel')}
            aria-label={i18n.__('components.GroupDetails.manageGroupButtonLabel')}
          >
            <Link to={`/admingroups/${group._id}`}>
              <Button variant="outlined" size="small" className={classes.button}>
                <EditIcon />
              </Button>
            </Link>
          </Tooltip>
        )}
      </CardActions> */}
      {customDrag && isSorted ? (
        <CardActions className={classes.cardActionsUnique}>
          <Tooltip title={backToDefaultButtonLabel} aria-label={backToDefaultButtonLabel}>
            <Button variant="outlined" size="small" className={classes.fab} onClick={handleBackToDefault}>
              <PublishIcon />
            </Button>
          </Tooltip>
        </CardActions>
      ) : null}
    </Card>
  );
}

GroupDetailsPersSpace.propTypes = {
  group: PropTypes.objectOf(PropTypes.any).isRequired,
  member: PropTypes.bool.isRequired,
  candidate: PropTypes.bool.isRequired,
  admin: PropTypes.bool.isRequired,
  animator: PropTypes.bool.isRequired,
  isMobile: PropTypes.bool.isRequired,
  globalAdmin: PropTypes.bool.isRequired,
  customDrag: PropTypes.bool.isRequired,
  isSorted: PropTypes.bool.isRequired,
};

export default GroupDetailsPersSpace;
