import React from 'react';
import PropTypes from 'prop-types';
import { Meteor } from 'meteor/meteor';
import { makeStyles } from '@material-ui/core/styles';
import { useHistory } from 'react-router-dom';
import Typography from '@material-ui/core/Typography';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import RemoveIcon from '@material-ui/icons/Remove';
import Tooltip from '@material-ui/core/Tooltip';
import { Button, CardActionArea, CardActions } from '@material-ui/core';
import i18n from 'meteor/universe:i18n';

import { isUrlExternal } from '../../utils/utilsFuncs';

const useStyles = makeStyles((theme) => ({
  card: {
    height: '100%',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  cardContent: {
    padding: 10,
  },
  cardMedia: {
    maxWidth: '40px',
    objectFit: 'contain',
    borderRadius: theme.shape.borderRadius,
    margin: 'auto',
  },
  cardActions: {
    paddingTop: 0,
    justifyContent: 'end',
  },
  serviceName: {
    color: theme.palette.primary.main,
  },
  serviceNameDiasbled: {
    color: theme.palette.text.disabled,
  },
  actionarea: {
    textAlign: 'center',
    marginTop: 20,
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

function ServiceDetailsPersSpace({ service, customDrag, isMobile }) {
  const classes = useStyles();
  const history = useHistory();
  const favButtonLabel = i18n.__('components.ServiceDetails.favButtonLabelNoFav');

  const handleFavorite = () => {
    Meteor.call('services.unfavService', { serviceId: service._id }, (err) => {
      if (err) {
        msg.error(err.reason);
      } else {
        msg.success(i18n.__('components.ServiceDetails.unfavSuccessMsg'));
      }
    });
  };

  const handleClick = () => {
    if (isUrlExternal(service.url)) {
      window.open(service.url, '_blank', 'noreferrer,noopener');
    } else {
      history.push(service.url.replace(Meteor.absoluteUrl(), '/'));
    }
  };

  return (
    <Card className={classes.card} elevation={3}>
      <CardActionArea
        className={classes.actionarea}
        disabled={service.state === 5}
        title={service.usage}
        onClick={handleClick}
      >
        <CardMedia className={classes.cardMedia} component="img" alt={service.title} image={service.logo} />
        <CardContent className={classes.cardContent}>
          <Typography
            className={service.state === 5 ? classes.serviceNameDiasbled : classes.serviceName}
            gutterBottom
            noWrap={!isMobile}
            variant="h6"
            component="h2"
          >
            {service.title}
          </Typography>
          {/* {service.state === 5 ? (
            <Typography variant="body2" color="textSecondary" component="p">
              {i18n.__('pages.SingleServicePage.inactive')}
            </Typography>
          ) : (
            ''
          )} */}
        </CardContent>
      </CardActionArea>
      <CardActions className={classes.cardActions}>
        {customDrag ? (
          <Tooltip title={favButtonLabel} aria-label={favButtonLabel}>
            <Button variant="outlined" size="small" className={classes.fab} onClick={handleFavorite}>
              <RemoveIcon />
            </Button>
          </Tooltip>
        ) : null}
      </CardActions>
    </Card>
  );
}

ServiceDetailsPersSpace.propTypes = {
  service: PropTypes.objectOf(PropTypes.any).isRequired,
  customDrag: PropTypes.bool.isRequired,
  isMobile: PropTypes.bool.isRequired,
};

export default ServiceDetailsPersSpace;
