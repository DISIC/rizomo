import React from 'react';
import PropTypes from 'prop-types';
import { withTracker } from 'meteor/react-meteor-data';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import FavoriteIcon from '@material-ui/icons/Favorite';
import FavoriteBorderIcon from '@material-ui/icons/FavoriteBorder';
import HelpIcon from '@material-ui/icons/Help';
import Tooltip from '@material-ui/core/Tooltip';
import {
  Button, CardHeader, Avatar, IconButton, Divider, Chip, Grid, Paper,
} from '@material-ui/core';
import i18n from 'meteor/universe:i18n';
import { Link } from 'react-router-dom';
import { favService, unfavService } from '../../api/users/methods';
import Categories from '../../api/categories/categories';
import Spinner from './Spinner';

const useStyles = makeStyles((theme) => ({
  cardActions: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  card: {
    height: '100%',
    width: '300px',
    display: 'flex',
    flexDirection: 'column',
  },
  cardMedia: {
    maxWidth: '50px',
    objectFit: 'contain',
  },
  cardContent: {
    flexGrow: 1,
  },
  buttonText: { textTransform: 'none' },
  title: { fontWeight: 'bold', lineHeight: '1' },
  paperChip: {
    display: 'flex',
    justifyContent: 'left',
    flexWrap: 'wrap',
    marginTop: theme.spacing(2),
    padding: theme.spacing(1),
  },
  chip: {
    margin: theme.spacing(0.5),
  },
  fab: {
    '&:hover': {
      color: 'red',
    },
  },
}));

function ServiceDetails({
  service, favAction, categories, loadingCat,
}) {
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

  const handleCatFilter = () => '';

  const favButtonLabel = favAction === 'unfav'
    ? i18n.__('components.ServiceDetails.favButtonLabelNoFav')
    : i18n.__('components.ServiceDetails.favButtonLabelFav');

  return (
    <Card className={classes.card}>
      <CardHeader
        avatar={<CardMedia className={classes.cardMedia} component="img" alt={service.title} image={service.logo} />}
        action={(
          <Tooltip title={favButtonLabel} aria-label={favButtonLabel}>
            <Button variant="text" color="primary" className={classes.fab} onClick={handleFavorite}>
              {favAction === 'unfav' ? <FavoriteBorderIcon /> : <FavoriteIcon />}
            </Button>
          </Tooltip>
        )}
        title={service.title}
        titleTypographyProps={{ variant: 'h6', color: 'primary', className: classes.title }}
        subheader={service.team}
        subheaderTypographyProps={{ variant: 'body2', color: 'primary' }}
      />
      <Divider variant="middle" />
      <CardContent className={classes.cardContent}>
        <Typography variant="body2" component="p">
          {service.description}
        </Typography>
        <Paper variant="elevation" elevation={0} className={classes.paperChip}>
          {categories.map((cat) => (
            <Chip
              className={classes.chip}
              key={cat._id}
              label={cat.name}
              variant="outlined"
              onClick={handleCatFilter}
            />
          ))}
        </Paper>
      </CardContent>
      <Divider variant="middle" />
      <CardActions className={classes.cardActions}>
        <Tooltip
          title={i18n.__('components.ServiceDetails.singleServiceButtonLabel')}
          aria-label={i18n.__('components.ServiceDetails.singleServiceButtonLabel')}
        >
          <Link to={`/services/${service.slug}`}>
            <Button color="primary" className={classes.fab}>
              <HelpIcon />
            </Button>
          </Link>
        </Tooltip>
        <Button
          className={classes.buttonText}
          variant="contained"
          color="primary"
          onClick={() => window.open(service.url, '_blank')}
        >
          {i18n.__('components.ServiceDetails.runServiceButtonLabel')}
        </Button>
      </CardActions>
    </Card>
  );
}

ServiceDetails.propTypes = {
  service: PropTypes.objectOf(PropTypes.any).isRequired,
  favAction: PropTypes.string.isRequired,
};

export default withTracker(({ service }) => {
  const categoriesHandle = Meteor.subscribe('categories.service', { categories: service.categories });
  const loadingCat = !categoriesHandle.ready();
  const categories = Categories.find({ _id: { $in: service.categories || [] } }, { sort: { name: 1 } }).fetch();
  return {
    categories,
    loadingCat,
  };
})(ServiceDetails);
