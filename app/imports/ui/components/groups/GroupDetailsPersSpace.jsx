import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Card from '@material-ui/core/Card';
import { Link } from 'react-router-dom';
import Tooltip from '@material-ui/core/Tooltip';
import SecurityIcon from '@material-ui/icons/Security';
// import ExitToAppIcon from '@material-ui/icons/ExitToApp';
// import VerifiedUserIcon from '@material-ui/icons/VerifiedUser';
// import CheckIcon from '@material-ui/icons/Check';
// import WatchLaterIcon from '@material-ui/icons/WatchLater';
// import EditIcon from '@material-ui/icons/Edit';
// import { Button, CardActions } from '@material-ui/core';
import PeopleIcon from '@material-ui/icons/People';
import LockIcon from '@material-ui/icons/Lock';
import { Avatar, CardActionArea, CardHeader, Zoom } from '@material-ui/core';
import i18n from 'meteor/universe:i18n';
import GroupBadge from './GroupBadge';

const useStyles = ({ type }, member, candidate) =>
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
      color: member ? 'green' : candidate ? theme.palette.secondary.main : theme.palette.text.disabled,
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
  }));

function GroupDetailsPersSpace({ group = {}, member, candidate, admin, animator, isMobile }) {
  const { type } = group;
  const classes = useStyles(group, member || animator, candidate)();

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
    if (type === 5) {
      return i18n.__('components.GroupDetails.askToJoinModerateGroupButtonLabel');
    }
    return i18n.__('components.GroupDetailsPersSpace.groupNone');
  };
  const iconHeader = type === 0 ? <PeopleIcon /> : type === 10 ? <LockIcon /> : <SecurityIcon />;

  return (
    <Card className={classes.card} elevation={3}>
      <Tooltip
        TransitionComponent={Zoom}
        enterDelay={2000}
        title={
          <>
            <Typography>{group.name}</Typography>
            {i18n.__('pages.PersonalPage.typeGroup')}
          </>
        }
        aria-label={group.name}
      >
        <Link to={`/groups/${group.slug}`} className={classes.noUnderline}>
          <CardActionArea className={classes.actionarea}>
            <CardHeader
              classes={{ content: classes.cardHeaderContent }}
              avatar={
                animator || admin ? (
                  <GroupBadge
                    overlap="circle"
                    className={classes.badge}
                    color="error"
                    badgeContent={group.numCandidates}
                  >
                    <Avatar className={classes.avatar}>{iconHeader}</Avatar>
                  </GroupBadge>
                ) : (
                  <Avatar className={classes.avatar}>{iconHeader}</Avatar>
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
        </Link>
      </Tooltip>
      {/* <CardActions className={classes.cardActionsUnique}>
        {admin && (
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
};

export default GroupDetailsPersSpace;
