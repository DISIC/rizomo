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
import InfoIcon from '@material-ui/icons/Info';
import Tooltip from '@material-ui/core/Tooltip';
import {
  Button, CardHeader, Divider, Chip, Paper,
} from '@material-ui/core';
import i18n from 'meteor/universe:i18n';
import { Link } from 'react-router-dom';
import { favService, unfavService } from '../../api/users/methods';
import Categories from '../../api/categories/categories';

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
    backgroundColor: 'rgba(33,150,243, 0.02)',
  },
  buttonText: { textTransform: 'none' },
  title: { fontWeight: 'bold', lineHeight: '1' },
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
    '&:hover': {
      color: 'red',
    },
  },
}));

function ServiceDetails({
  service, favAction, categories, updateCategories, catList,
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

  const favButtonLabel = favAction === 'unfav'
    ? i18n.__('components.ServiceDetails.favButtonLabelNoFav')
    : i18n.__('components.ServiceDetails.favButtonLabelFav');

  return (
    <Card className={classes.card} elevation={6}>
      <CardHeader
        avatar={<CardMedia className={classes.cardMedia} component="img" alt={service.title} image={service.logo} />}
        action={(
          <Tooltip title={favButtonLabel} aria-label={favButtonLabel}>
            <Button variant="text" color="primary" className={classes.fab} onClick={handleFavorite}>
              {favAction === 'fav' ? <FavoriteBorderIcon /> : <FavoriteIcon />}
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
        <Typography variant="body1">{service.description}</Typography>
        <Paper variant="elevation" elevation={0} className={classes.paperChip}>
          {categories.map((cat) => (
            <Chip
              size="small"
              className={classes.chip}
              key={cat._id}
              label={cat.name}
              variant="outlined"
              color={catList.includes(cat._id) ? 'primary' : 'default'}
              onClick={() => updateCategories(cat._id)}
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
            <Button variant="contained" color="primary">
              <InfoIcon />
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
  categories: PropTypes.arrayOf(PropTypes.object).isRequired,
  updateCategories: PropTypes.func.isRequired,
  catList: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default withTracker(({ service }) => {
  Meteor.subscribe('categories.service', { categories: service.categories });

  const categories = Categories.find({ _id: { $in: service.categories || [] } }, { sort: { name: 1 } }).fetch();
  return {
    categories,
  };
})(ServiceDetails);
