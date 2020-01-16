import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Fab from '@material-ui/core/Fab';
import FavoriteIcon from '@material-ui/icons/Favorite';
import RemoveIcon from '@material-ui/icons/Clear';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import Tooltip from '@material-ui/core/Tooltip';
import { Button } from '@material-ui/core';
import i18n from 'meteor/universe:i18n';
import { favService, unfavService } from '../../api/users/methods';

const useStyles = makeStyles(() => ({
  cardActions: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  card: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  cardMedia: {
    margin: '5px',
    paddingTop: '56.25%',
    backgroundSize: 'contain',
  },
  cardContent: {
    flexGrow: 1,
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
      unfavService.call({ serviceId: service._id }, (err) => {
        if (err) console.log('unable to remove service from favorites');
      });
    } else {
      favService.call({ serviceId: service._id }, (err) => {
        if (err) console.log('unable to set service as favorite');
      });
    }
  };

  const favButtonLabel = favAction === 'unfav'
    ? i18n.__('components.ServiceDetails.favButtonLabelNoFav')
    : i18n.__('components.ServiceDetails.favButtonLabelFav');

  return (
    <Card className={classes.card}>
      <CardMedia className={classes.cardMedia} image={service.logo} title={service.title} />
      <CardContent className={classes.cardContent}>
        <Typography gutterBottom variant="h5" component="h2">
          {service.title}
        </Typography>
        <Typography>{service.description}</Typography>
      </CardContent>
      <CardActions className={classes.cardActions}>
        <Tooltip
          title={i18n.__('components.ServiceDetails.runServiceButtonLabel')}
          aria-label={i18n.__('components.ServiceDetails.runServiceButtonLabel')}
        >
          <Button variant="contained" color="primary" onClick={() => window.open(service.url, service.target)}>
            <PlayArrowIcon />
          </Button>
        </Tooltip>
        <Tooltip title={favButtonLabel} aria-label={favButtonLabel}>
          <Fab size="small" className={classes.fab} onClick={handleFavorite}>
            {favAction === 'unfav' ? <RemoveIcon /> : <FavoriteIcon />}
          </Fab>
        </Tooltip>
      </CardActions>
    </Card>
  );
}

ServiceDetails.propTypes = {
  service: PropTypes.objectOf(PropTypes.any).isRequired,
  favAction: PropTypes.string.isRequired,
};
