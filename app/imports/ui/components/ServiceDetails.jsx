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
import RemoveIcon from '@material-ui/icons/Delete';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import Tooltip from '@material-ui/core/Tooltip';
import { Button } from '@material-ui/core';
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
      unfavService.call({ serviceId: service._id }, (err, res) => {
        if (err) console.log('unable to remove service from favorites');
      });
    } else {
      favService.call({ serviceId: service._id }, (err, res) => {
        if (err) console.log('unable to set service as favorite');
      });
    }
  };

  return (
    <Card className={classes.card}>
      <CardMedia className={classes.cardMedia} image={service.logo} title="Image title" />
      <CardContent className={classes.cardContent}>
        <Typography gutterBottom variant="h5" component="h2">
          {service.title}
        </Typography>
        <Typography>{service.description}</Typography>
      </CardContent>
      <CardActions className={classes.cardActions}>
        <Tooltip title="Lancer le service" aria-label="like">
          <Button variant="contained" color="primary" href={service.url}>
            <PlayArrowIcon />
          </Button>
        </Tooltip>
        <Tooltip title={favAction === 'unfav' ? 'Supprimer de vos favoris' : 'Ajouter à vos favoris'} aria-label="like">
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
