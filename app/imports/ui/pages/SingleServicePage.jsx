import React, { useContext, useState } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import PropTypes from 'prop-types';
import i18n from 'meteor/universe:i18n';
import { Link } from 'react-router-dom';
import {
  Container, makeStyles, Button, Typography, Grid, Chip,
} from '@material-ui/core';
import ArrowBack from '@material-ui/icons/ArrowBack';
import Services from '../../api/services/services';
import Spinner from '../components/Spinner';
import { unfavService, favService } from '../../api/users/methods';
import { Context } from '../contexts/context';

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },

  backButton: {
    marginTop: -30,
  },
  cardGrid: {
    paddingTop: theme.spacing(5),
    paddingBottom: theme.spacing(5),
    marginBottom: theme.spacing(3),
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
  logo: {
    height: 100,
    width: 100,
    boxShadow: theme.shadows[2],
    borderRadius: theme.shape.borderRadius,
  },
  title: {
    marginLeft: theme.spacing(3),
  },
  smallTitle: {
    marginBottom: theme.spacing(1),
  },
  content: {
    textAlign: 'justify',
    marginBottom: theme.spacing(3),
  },
  screenshot: {
    width: '100%',
  },
  category: {
    marginLeft: theme.spacing(1),
  },
}));

const SingleServicePage = ({ service, ready, categories }) => {
  const classes = useStyles();
  const [{ user = {} }] = useContext(Context);
  const [loading, setLoading] = useState(false);
  const favorite = user.favServices && user.favServices.find((f) => f === service._id);

  const handleFavorite = () => {
    if (favorite) {
      setLoading(true);
      unfavService.call({ serviceId: service._id }, (err) => {
        setLoading(false);
        if (err) console.log('unable to remove service from favorites');
      });
    } else {
      setLoading(true);
      favService.call({ serviceId: service._id }, (err) => {
        setLoading(false);
        if (err) console.log('unable to set service as favorite');
      });
    }
  };

  if (!ready || !service._id) {
    return <Spinner full />;
  }

  return (
    <Container maxWidth="md" className={classes.root}>
      <Grid container spacing={2}>
        <Grid item md={12}>
          <Link to="/services">
            <Button className={classes.backButton} color="primary" startIcon={<ArrowBack />}>
              {i18n.__('pages.SingleServicePage.backToList')}
            </Button>
          </Link>
        </Grid>
        <Grid item xs={12} sm={12} md={6} className={classes.cardGrid}>
          <div className={classes.titleContainer}>
            <img className={classes.logo} alt={`logo for ${service.title}`} src={service.logo} />
            <div className={classes.title}>
              <Typography variant="h5">{service.title}</Typography>
              <Typography>{service.team}</Typography>
            </div>
          </div>
        </Grid>
        <Grid item xs={12} sm={12} md={6} className={classes.favoriteButton}>
          <Button
            disabled={loading}
            variant={favorite ? 'contained' : 'outlined'}
            color="primary"
            onClick={handleFavorite}
          >
            {favorite
              ? i18n.__('pages.SingleServicePage.inFavorites')
              : i18n.__('pages.SingleServicePage.addToFavorites')}
          </Button>
          <Button variant="outlined" color="primary" onClick={() => window.open(service.url, '_blank')}>
            {i18n.__('pages.SingleServicePage.open')}
          </Button>
        </Grid>
        <Grid item xs={12} sm={12} md={12} className={classes.cardGrid}>
          <Typography className={classes.smallTitle} variant="h5">
            {i18n.__('pages.SingleServicePage.categories')}
          </Typography>
          {categories.map((categ) => (
            <Chip className={classes.category} key={categ._id} label={categ.name} />
          ))}
        </Grid>
        <Grid item xs={12} sm={12} md={12} className={classes.cardGrid}>
          <Typography className={classes.smallTitle} variant="h5">
            Description
          </Typography>
          <Typography className={classes.content}>{service.content}</Typography>
        </Grid>
        {Boolean(service.screenshots.length) && (
          <>
            <Grid item xs={12} sm={12} md={12}>
              <Typography className={classes.smallTitle} variant="h5">
                {i18n.__('pages.SingleServicePage.screenshots')}
                {' '}
(
                {service.screenshots.length}
)
              </Typography>
            </Grid>
            {service.screenshots.map((screen, i) => (
              <Grid key={Math.random()} item xs={12} sm={6} md={6}>
                <img className={classes.screenshot} src={screen} alt={`screenshot ${i} for ${service.title}`} />
              </Grid>
            ))}
          </>
        )}
      </Grid>
    </Container>
  );
};

// TO DELETE AFTER SCHEMA DATA IS FINISHED
let fakeData = {};
const fillData = async () => {
  const result = await fetch('https://baconipsum.com/api/?type=meat-and-filler');
  const json = await result.json();
  fakeData = {
    team: 'Académie de Dijon',
    categories: ['eroifjrejfre', 'poapoedkzdzoe'],
    content: json.join(),
    screenshots: [
      'https://source.unsplash.com/random/1600x900',
      'https://source.unsplash.com/random/1600x900',
      'https://source.unsplash.com/random/1600x900',
    ],
  };
};
fillData();

// TO DELETE AFTER SCHEMA DATA IS FINISHED
const fakeCategories = [
  {
    _id: 'eroifjrejfre',
    name: 'Licorne',
  },
  {
    _id: 'poapoedkzdzoe',
    name: 'Bisounours',
  },
];

export default withTracker(
  ({
    match: {
      params: { serviceId },
    },
  }) => {
    const subService = Meteor.subscribe('services.one', { serviceId });
    const ready = subService.ready();
    const service = Services.findOne({ _id: serviceId });
    // const subCategories = Meteor.subscribe('categories.service', { serviceId });
    const categories = fakeCategories;
    return {
      service: {
        ...service,
        ...fakeData,
      },
      ready,
      categories,
    };
  },
)(SingleServicePage);

SingleServicePage.defaultProps = {
  service: {},
  categories: [],
};

SingleServicePage.propTypes = {
  service: PropTypes.objectOf(PropTypes.any),
  ready: PropTypes.bool.isRequired,
  categories: PropTypes.arrayOf(PropTypes.any),
};
