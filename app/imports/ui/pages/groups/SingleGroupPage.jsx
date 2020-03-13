import React, { useContext, useState } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import PropTypes from 'prop-types';
import i18n from 'meteor/universe:i18n';
import { Roles } from 'meteor/alanning:roles';
import { Link } from 'react-router-dom';
import {
  Container, makeStyles, Button, Typography, Grid, Avatar, Fade, Divider,
} from '@material-ui/core';
import ArrowBack from '@material-ui/icons/ArrowBack';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import SecurityIcon from '@material-ui/icons/Security';
import VerifiedUserIcon from '@material-ui/icons/VerifiedUser';
import CheckIcon from '@material-ui/icons/Check';
import WatchLaterIcon from '@material-ui/icons/WatchLater';
import PeopleIcon from '@material-ui/icons/People';
import LockIcon from '@material-ui/icons/Lock';
import ClearIcon from '@material-ui/icons/Clear';
import { Context } from '../../contexts/context';
import Groups from '../../../api/groups/groups';
import Services from '../../../api/services/services';
import Spinner from '../../components/system/Spinner';
import ServiceDetails from '../../components/services/ServiceDetails';

const useStyles = (member, candidate, type) => makeStyles((theme) => ({
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
  fab: {},
  avatar: {
    backgroundColor: member ? 'green' : type === 0 ? theme.palette.primary.main : theme.palette.secondary.main,
    height: 100,
    width: 100,
  },
}));

const SingleGroupPage = ({ group = {}, ready, services }) => {
  const { type } = group;
  const [{ userId }] = useContext(Context);
  const [loading, setLoading] = useState(false);
  const [openedContent, toggleOpenedContent] = useState(false);
  const member = Roles.userIsInRole(userId, ['member', 'animator'], group._id);
  const candidate = Roles.userIsInRole(userId, ['candidate'], group._id);
  const classes = useStyles(member, candidate, type)();

  const handleOpenedContent = () => {
    toggleOpenedContent(!openedContent);
  };

  const handleJoinGroup = () => {
    const method = member
      ? 'unsetMemberOf'
      : type === 0
        ? 'setMemberOf'
        : candidate
          ? 'unsetCandidateOf'
          : 'setCandidateOf';
    const message = member ? 'groupLeft' : type === 0 ? 'groupJoined' : candidate ? 'candidateCancel' : 'candidateSent';

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
  const groupType = i18n.__(`components.GroupDetails.${type === 0 ? 'publicGroup' : 'moderateGroup'}`);

  const IconHeader = (props) => (type === 0 ? <PeopleIcon {...props} /> : <SecurityIcon {...props} />);

  const icon = () => {
    if (member) {
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
    if (member) {
      return i18n.__('components.GroupDetails.groupMember');
    }
    if (type === 0) {
      return i18n.__('components.GroupDetails.joinPublicGroupButtonLabel');
    }
    if (candidate) {
      return i18n.__('components.GroupDetails.waitingForValidation');
    }
    return i18n.__('components.GroupDetails.askToJoinModerateGroupButtonLabel');
  };

  return (
    <Fade in>
      <Container className={classes.root}>
        {!ready && !loading && <Spinner full />}
        <Grid container spacing={2}>
          <Grid item xs={12} sm={12} md={12} className={classes.flex}>
            <Link to="/groups">
              <Button color="primary" startIcon={<ArrowBack />}>
                {i18n.__('pages.SingleGroupPage.backToList')}
              </Button>
            </Link>
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
            <Button
              startIcon={icon()}
              className={classes.buttonText}
              size="large"
              variant={member || candidate ? 'text' : 'contained'}
              disableElevation={member || candidate}
              onClick={member || candidate ? null : handleJoinGroup}
            >
              {text()}
            </Button>
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
          {(member || type === 0) && (
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

            {(member || candidate) && (
              <Button
                style={{ border: 'red', color: 'red' }}
                color="primary"
                startIcon={<ClearIcon />}
                disableElevation
                variant="outlined"
                onClick={handleJoinGroup}
              >
                {i18n.__(`pages.SingleGroupPage.${member ? 'leaveGroup' : 'cancelCandidate'}`)}
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
