import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import Tooltip from '@material-ui/core/Tooltip';
import { Button, CardHeader, IconButton } from '@material-ui/core';
import i18n from 'meteor/universe:i18n';
import { Link } from 'react-router-dom';
import SecurityIcon from '@material-ui/icons/Security';
import VerifiedUserIcon from '@material-ui/icons/VerifiedUser';
import CheckIcon from '@material-ui/icons/Check';
import PeopleIcon from '@material-ui/icons/People';
import WatchLaterIcon from '@material-ui/icons/WatchLater';
import GroupBadge from './GroupBadge';

const useStyles = makeStyles((theme) => ({
  action: {
    display: 'flex',
    alignItems: 'center',
    marginTop: 'auto',
    height: '100%',
  },
  card: {
    height: '100%',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    padding: 5,
    '& .MuiCardHeader-root': {
      padding: 8,
    },
  },
  cardMedia: {
    maxWidth: '50px',
    objectFit: 'contain',
    borderRadius: theme.shape.borderRadius,
  },
  fab: {
    '&:hover': {
      color: 'red',
    },
  },
}));

const GroupDetailsList = ({ group, member, candidate, animator, admin }) => {
  const { type } = group;
  const classes = useStyles();

  const groupType = animator
    ? i18n.__('components.GroupDetails.groupAnimator')
    : member
    ? i18n.__('components.GroupDetails.groupMember')
    : candidate
    ? i18n.__('components.GroupDetails.groupCandidate')
    : type === 0
    ? i18n.__('components.GroupDetails.publicGroup')
    : i18n.__('components.GroupDetails.moderateGroup');

  const iconHeader =
    candidate && type === 5 ? (
      <WatchLaterIcon fontSize="large" />
    ) : (animator || member) && type === 0 ? (
      <CheckIcon fontSize="large" />
    ) : (animator || member) && type === 5 ? (
      <VerifiedUserIcon fontSize="large" />
    ) : type === 0 ? (
      <PeopleIcon fontSize="large" />
    ) : (
      <SecurityIcon fontSize="large" />
    );

  const detailsButton = (
    <Tooltip
      title={i18n.__('components.GroupDetail.singleServiceButtonLabel')}
      aria-label={i18n.__('components.GroupDetail.singleServiceButtonLabel')}
    >
      <Link to={`/groups/${group.slug}`}>
        <IconButton color="primary">
          <ChevronRightIcon fontSize="large" />
        </IconButton>
      </Link>
    </Tooltip>
  );
  return (
    <Card className={classes.card} elevation={3}>
      <CardHeader
        classes={{ action: classes.action }}
        avatar={
          animator || admin ? (
            <GroupBadge overlap="circle" className={classes.badge} color="error" badgeContent={group.numCandidates}>
              <Button
                style={{
                  color: 'white',
                  backgroundColor: member || animator ? 'green' : null,
                }}
                color={type === 5 ? 'secondary' : 'primary'}
                variant="contained"
              >
                {iconHeader}
              </Button>
            </GroupBadge>
          ) : (
            <Button
              style={{
                color: 'white',
                backgroundColor: member || animator ? 'green' : null,
              }}
              color={type === 5 ? 'secondary' : 'primary'}
              variant="contained"
            >
              {iconHeader}
            </Button>
          )
        }
        action={detailsButton}
        title={group.name}
        titleTypographyProps={{
          variant: 'h6',
          color: 'primary',
        }}
        subheader={groupType}
        subheaderTypographyProps={{
          variant: 'body2',
          color: type === 5 ? 'secondary' : 'primary',
          style: { color: member || animator ? 'green' : null },
        }}
      />
    </Card>
  );
};

GroupDetailsList.propTypes = {
  group: PropTypes.objectOf(PropTypes.any).isRequired,
  member: PropTypes.bool.isRequired,
  candidate: PropTypes.bool.isRequired,
  animator: PropTypes.bool.isRequired,
  admin: PropTypes.bool.isRequired,
};

export default GroupDetailsList;
