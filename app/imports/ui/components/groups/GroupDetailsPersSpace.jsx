import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import { Link } from 'react-router-dom';
import Tooltip from '@material-ui/core/Tooltip';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import SecurityIcon from '@material-ui/icons/Security';
import VerifiedUserIcon from '@material-ui/icons/VerifiedUser';
import CheckIcon from '@material-ui/icons/Check';
import WatchLaterIcon from '@material-ui/icons/WatchLater';
import PeopleIcon from '@material-ui/icons/People';
import LockIcon from '@material-ui/icons/Lock';
import EditIcon from '@material-ui/icons/Edit';
import { Button, Avatar, CardActionArea, CardActions } from '@material-ui/core';
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
    cardContent: {
      padding: 10,
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
    serviceName: {
      color: theme.palette.primary.main,
    },
    actionarea: {
      textAlign: 'center',
      marginTop: 20,
    },
    cardActions: {
      justifyContent: 'space-between',
      paddingTop: 0,
    },
    cardActionsUnique: {
      justifyContent: 'end',
      paddingTop: 0,
    },
    button: {
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

function GroupDetailsPersSpace({ group = {}, member, candidate, admin, animator }) {
  const { type } = group;
  const classes = useStyles(group, member || animator, candidate)();

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
      return i18n.__('components.GroupDetailsPersSpace.groupCandidate');
    }
    if (type === 5) {
      return i18n.__('components.GroupDetails.askToJoinModerateGroupButtonLabel');
    }
    return '';
  };
  const iconHeader = type === 0 ? <PeopleIcon /> : type === 10 ? <LockIcon /> : <SecurityIcon />;

  return (
    <Card className={classes.card} elevation={3}>
      <Link to={`/groups/${group.slug}`} className={classes.noUnderline} title={group.description}>
        <CardActionArea className={classes.actionarea}>
          {animator || admin ? (
            <GroupBadge overlap="circle" className={classes.badge} color="error" badgeContent={group.numCandidates}>
              <Avatar className={classes.avatar}>{iconHeader}</Avatar>
            </GroupBadge>
          ) : (
            <Avatar className={classes.avatar}>{iconHeader}</Avatar>
          )}
          <CardContent className={classes.cardContent}>
            <Typography className={classes.serviceName} gutterBottom noWrap variant="h6" component="h2">
              {group.name}
            </Typography>
          </CardContent>
        </CardActionArea>
      </Link>
      <CardActions className={!(member || animator || candidate) ? classes.cardActionsUnique : classes.cardActions}>
        {member || animator || candidate ? (
          <Button
            startIcon={icon()}
            className={classes.buttonText}
            size="large"
            variant="text"
            disableElevation
            disableRipple
          >
            {text()}
          </Button>
        ) : null}
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
      </CardActions>
    </Card>
  );
}

GroupDetailsPersSpace.propTypes = {
  group: PropTypes.objectOf(PropTypes.any).isRequired,
  member: PropTypes.bool.isRequired,
  candidate: PropTypes.bool.isRequired,
  admin: PropTypes.bool.isRequired,
  animator: PropTypes.bool.isRequired,
};

export default GroupDetailsPersSpace;
