import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardMedia from '@material-ui/core/CardMedia';
import FavoriteIcon from '@material-ui/icons/Favorite';
import FavoriteBorderIcon from '@material-ui/icons/FavoriteBorder';
import InfoIcon from '@material-ui/icons/Info';
import PlayCircleFilledIcon from '@material-ui/icons/PlayCircleFilled';
import Tooltip from '@material-ui/core/Tooltip';
import { Button, CardHeader } from '@material-ui/core';
import i18n from 'meteor/universe:i18n';
import { Link } from 'react-router-dom';

const useStyles = makeStyles(() => ({
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
  },
  cardMedia: {
    maxWidth: '50px',
    objectFit: 'contain',
  },
  fab: {
    '&:hover': {
      color: 'red',
    },
  },
}));

export default function ServiceDetails({ service, favAction }) {
  const classes = useStyles();

  const handleFavorite = () => {
    if (favAction === 'unfav') {
      Meteor.call('users.unfavService', { serviceId: service._id }, (err) => {
        if (err) {
          msg.error(err.reason);
        } else {
          msg.success(i18n.__('components.ServiceDetails.unfavSuccessMsg'));
        }
      });
    } else {
      Meteor.call('users.favService', { serviceId: service._id }, (err) => {
        if (err) {
          msg.error(err.reason);
        } else {
          msg.success(i18n.__('components.ServiceDetails.favSuccessMsg'));
        }
      });
    }
  };

  const favButtonLabel = favAction === 'unfav'
    ? i18n.__('components.ServiceDetails.favButtonLabelNoFav')
    : i18n.__('components.ServiceDetails.favButtonLabelFav');

  return (
    <Card className={classes.card} elevation={6}>
      <CardHeader
        classes={{ action: classes.action }}
        avatar={<CardMedia className={classes.cardMedia} component="img" alt={service.title} image={service.logo} />}
        action={(
          <>
            <Tooltip
              title={i18n.__('components.ServiceDetails.runServiceButtonLabel')}
              aria-label={i18n.__('components.ServiceDetails.runServiceButtonLabel')}
            >
              <Button className={classes.buttonText} color="primary" onClick={() => window.open(service.url, '_blank')}>
                <PlayCircleFilledIcon />
              </Button>
            </Tooltip>
            <Tooltip
              title={i18n.__('components.ServiceDetails.singleServiceButtonLabel')}
              aria-label={i18n.__('components.ServiceDetails.singleServiceButtonLabel')}
            >
              <Link to={`/services/${service.slug}`}>
                <Button color="primary">
                  <InfoIcon />
                </Button>
              </Link>
            </Tooltip>
            <Tooltip title={favButtonLabel} aria-label={favButtonLabel}>
              <Button variant="text" color="primary" className={classes.fab} onClick={handleFavorite}>
                {favAction === 'fav' ? <FavoriteBorderIcon /> : <FavoriteIcon />}
              </Button>
            </Tooltip>
          </>
        )}
        title={service.title}
        subheader={service.description}
      />
    </Card>
  );
}

ServiceDetails.propTypes = {
  service: PropTypes.objectOf(PropTypes.any).isRequired,
  favAction: PropTypes.string.isRequired,
};
