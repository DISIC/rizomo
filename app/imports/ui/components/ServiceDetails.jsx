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
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import Tooltip from '@material-ui/core/Tooltip';
import { Button } from '@material-ui/core';

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

export default function ServiceDetails({ service }) {
  const classes = useStyles();

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
        <Tooltip title="Ajouter à vos favoris" aria-label="like">
          <Fab size="small" className={classes.fab}>
            <FavoriteIcon />
          </Fab>
        </Tooltip>
      </CardActions>
    </Card>
  );
}

ServiceDetails.propTypes = {
  service: PropTypes.objectOf(PropTypes.object).isRequired,
};
