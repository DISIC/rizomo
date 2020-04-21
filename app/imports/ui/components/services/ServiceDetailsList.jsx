import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import Tooltip from '@material-ui/core/Tooltip';
import { Button, CardHeader, IconButton } from '@material-ui/core';
import i18n from 'meteor/universe:i18n';
import OpenInNewIcon from '@material-ui/icons/OpenInNew';
import { Link } from 'react-router-dom';
import { isUrlExternal } from '../../utils/utilsFuncs';

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

export default function ServiceDetails({ service }) {
  const classes = useStyles();

  // const handleFavorite = () => {
  //   if (favAction === 'unfav') {
  //     Meteor.call('users.unfavService', { serviceId: service._id }, (err) => {
  //       if (err) {
  //         msg.error(err.reason);
  //       } else {
  //         msg.success(i18n.__('components.ServiceDetails.unfavSuccessMsg'));
  //       }
  //     });
  //   } else {
  //     Meteor.call('users.favService', { serviceId: service._id }, (err) => {
  //       if (err) {
  //         msg.error(err.reason);
  //       } else {
  //         msg.success(i18n.__('components.ServiceDetails.favSuccessMsg'));
  //       }
  //     });
  //   }
  // };

  // const favButtonLabel = favAction === 'unfav'
  //   ? i18n.__('components.ServiceDetails.favButtonLabelNoFav')
  //   : i18n.__('components.ServiceDetails.favButtonLabelFav');

  const detailsButton = (
    <Tooltip
      title={i18n.__('components.ServiceDetails.singleServiceButtonLabel')}
      aria-label={i18n.__('components.ServiceDetails.singleServiceButtonLabel')}
    >
      <Link to={`/services/${service.slug}`}>
        <IconButton color="primary">
          <ChevronRightIcon fontSize="large" />
        </IconButton>
      </Link>
    </Tooltip>
  );
  // const actionButtons = (
  //   <div style={{ display: 'flex' }}>
  //     <Tooltip
  //       title={i18n.__('components.ServiceDetails.runServiceButtonLabel')}
  //       aria-label={i18n.__('components.ServiceDetails.runServiceButtonLabel')}
  //     >
  //       <Button
  //         className={classes.buttonText}
  //         variant="outlined"
  //         color="primary"
  //         onClick={() => window.open(service.url, '_blank')}
  //       >
  //         {i18n.__('components.ServiceDetails.open')}
  //       </Button>
  //     </Tooltip>
  //     <Tooltip title={favButtonLabel} aria-label={favButtonLabel}>
  //       <Button variant="text" color="primary" className={classes.fab} onClick={handleFavorite}>
  //         {favAction === 'fav' ? <FavoriteBorderIcon /> : <FavoriteIcon />}
  //       </Button>
  //     </Tooltip>
  //   </div>
  // );
  const isExternal = isUrlExternal(service.url);
  const button = (
    <Button
      color="primary"
      variant="contained"
      onClick={isExternal ? () => window.open(service.url, '_blank', 'noreferrer,noopener') : null}
    >
      <OpenInNewIcon fontSize="large" />
    </Button>
  );
  return (
    <Card className={classes.card} elevation={3}>
      <CardHeader
        classes={{ action: classes.action }}
        avatar={isExternal ? button : <Link to={service.url.replace(Meteor.absoluteUrl(), '/')}>{button}</Link>}
        action={detailsButton}
        title={service.title}
        titleTypographyProps={{
          variant: 'h6',
          color: 'primary',
        }}
        subheader={service.usage}
        subheaderTypographyProps={{ variant: 'body2', color: 'primary' }}
      />
    </Card>
  );
}

ServiceDetails.propTypes = {
  service: PropTypes.objectOf(PropTypes.any).isRequired,
  // favAction: PropTypes.string.isRequired,
};
