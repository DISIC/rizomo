import React, { useContext, useState } from 'react';
import PropTypes from 'prop-types';
import { Meteor } from 'meteor/meteor';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
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

import {
  Button, CardHeader, Avatar, IconButton,
} from '@material-ui/core';
import i18n from 'meteor/universe:i18n';

import { Context } from '../../contexts/context';
import Spinner from '../system/Spinner';

const useStyles = ({ type }, member, candidate, isShort) => makeStyles((theme) => ({
  avatar: {
    backgroundColor: member ? 'green' : type === 0 ? theme.palette.primary.main : theme.palette.secondary.main,
    width: theme.spacing(7),
    height: theme.spacing(7),
  },
  cardActions: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  cardActionShort: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignSelf: 'end',
    width: '100%',
  },
  cardHeader: {
    paddingLeft: 32,
    paddingRight: 32,
    paddingBottom: isShort ? 10 : 32,
    paddingTop: 24,
  },
  card: {
    height: '100%',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
  },
  cardMedia: {
    maxWidth: '50px',
    objectFit: 'contain',
    borderRadius: theme.shape.borderRadius,
  },
  cardContent: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    flexGrow: 1,
    backgroundColor: theme.palette.primary.light,
    paddingLeft: 32,
    paddingRight: 32,
    paddingBottom: 32,
    paddingTop: 24,
  },
  cardContentMobile: {
    flexGrow: 1,
    paddingLeft: 32,
    paddingRight: 32,
    paddingBottom: 32,
    paddingTop: 0,
    display: 'flex',
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
  paperChip: {
    display: 'flex',
    justifyContent: 'left',
    flexWrap: 'wrap',
    marginTop: theme.spacing(2),
    padding: theme.spacing(1),
    backgroundColor: 'transparent',
  },
  chip: {
    margin: theme.spacing(0.5),
  },
  fab: {
    textTransform: 'none',
    color: theme.palette.primary.main,
    backgroundColor: theme.palette.tertiary.main,
    '&:hover': {
      backgroundColor: theme.palette.primary.main,
      color: theme.palette.tertiary.main,
    },
  },
}));

function GroupDetails({
  group = {}, isShort, member, candidate, admin, animator,
}) {
  const { type } = group;
  const [{ userId }] = useContext(Context);
  const [loading, setLoading] = useState(false);

  const classes = useStyles(group, member || animator, candidate, isShort)();

  const handleJoinGroup = () => {
    const method = member ? 'unsetMemberOf' : type === 0 ? 'setMemberOf' : 'setCandidateOf';
    const message = member ? 'groupLeft' : type === 0 ? 'groupJoined' : 'candidateSent';
    if (candidate) {
      msg.info(i18n.__('components.GroupDetails.alreadyCandidate'));
    } else {
      setLoading(true);
      Meteor.call(`users.${method}`, { userId, groupId: group._id }, (err) => {
        setLoading(false);
        if (err) {
          msg.error(err.reason);
        } else {
          msg.success(i18n.__(`components.GroupDetails.${message}`));
        }
      });
    }
  };

  const icon = () => {
    if (member || animator) {
      return type === 5 ? <VerifiedUserIcon /> : <CheckIcon />;
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
    if (type === 0) {
      return i18n.__('components.GroupDetails.joinPublicGroupButtonLabel');
    }
    if (candidate) {
      return i18n.__('components.GroupDetails.groupCandidate');
    }
    return i18n.__('components.GroupDetails.askToJoinModerateGroupButtonLabel');
  };

  const groupType = type === 0
    ? i18n.__('components.GroupDetails.publicGroup')
    : i18n.__('components.GroupDetails.moderateGroup');
  const iconHeader = type === 0 ? <PeopleIcon /> : <SecurityIcon />;

  return (
    <Card className={classes.card} elevation={3}>
      {loading && <Spinner full />}
      <CardHeader
        className={classes.cardHeader}
        avatar={<Avatar className={classes.avatar}>{iconHeader}</Avatar>}
        action={(
          <Tooltip
            title={i18n.__('components.GroupDetails.singleGroupButtonLabel')}
            aria-label={i18n.__('components.GroupDetails.singleGroupButtonLabel')}
          >
            <Link to={`/groups/${group.slug}`}>
              <IconButton color="primary">
                <ChevronRightIcon />
              </IconButton>
            </Link>
          </Tooltip>
        )}
        title={group.name}
        titleTypographyProps={{
          variant: 'h6',
          color: 'primary',
          className: classes.title,
        }}
        subheader={groupType}
        subheaderTypographyProps={{
          variant: 'body2',
          color: type === 0 ? 'primary' : 'secondary',
          style: {
            color: member || animator ? 'green' : null,
            display: 'flex',
            alignItems: 'center',
          },
        }}
      />
      <CardContent className={isShort ? classes.cardContentMobile : classes.cardContent}>
        {!isShort && <Typography variant="body1">{group.description}</Typography>}
        <div className={isShort ? classes.cardActionShort : classes.cardActions}>
          <Button
            startIcon={icon()}
            className={classes.buttonText}
            size="large"
            variant={member || animator || candidate ? 'text' : 'contained'}
            disableElevation={member || animator || candidate}
            onClick={member || animator || candidate ? null : handleJoinGroup}
          >
            {text()}
          </Button>
          {admin && (
            <Tooltip
              title={i18n.__('components.GroupDetails.manageGroupButtonLabel')}
              aria-label={i18n.__('components.GroupDetails.manageGroupButtonLabel')}
            >
              <Link to={`/admingroups/${group._id}`}>
                <IconButton color="primary">
                  <EditIcon />
                </IconButton>
              </Link>
            </Tooltip>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

GroupDetails.propTypes = {
  group: PropTypes.objectOf(PropTypes.any).isRequired,
  isShort: PropTypes.bool.isRequired,
  member: PropTypes.bool.isRequired,
  candidate: PropTypes.bool.isRequired,
  admin: PropTypes.bool.isRequired,
  animator: PropTypes.bool.isRequired,
};

export default GroupDetails;
