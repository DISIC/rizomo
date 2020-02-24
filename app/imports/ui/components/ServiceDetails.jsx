import React from 'react';
import PropTypes from 'prop-types';
import { Meteor } from 'meteor/meteor';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import FavoriteIcon from '@material-ui/icons/Favorite';
import FavoriteBorderIcon from '@material-ui/icons/FavoriteBorder';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';

import Tooltip from '@material-ui/core/Tooltip';
import { Button, CardHeader, IconButton } from '@material-ui/core';
import i18n from 'meteor/universe:i18n';
import { Link } from 'react-router-dom';

const useStyles = makeStyles((theme) => ({
  cardActions: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  cardActionShort: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardHeader: {
    paddingLeft: 32,
    paddingRight: 32,
    paddingBottom: 32,
    paddingTop: 24,
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
    borderRadius: theme.shape.borderRadius,
  },
  cardContent: {
    flexGrow: 1,
    backgroundColor: theme.palette.primary.light,
    paddingLeft: 32,
    paddingRight: 32,
    paddingBottom: 32,
    paddingTop: 24,
  },
  cardContentMobile: {
    flexGrow: 1,
    paddingLeft: 32,
    paddingRight: 32,
    paddingBottom: 32,
    paddingTop: 0,
  },
  buttonText: {
    textTransform: 'none',
    color: theme.palette.primary.main,
    '&:hover': {
      backgroundColor: theme.palette.primary.main,
      color: theme.palette.secondary.main,
    },
  },
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

function ServiceDetails({ service, favAction, isShort }) {
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
    <Card className={classes.card} elevation={3}>
      <CardHeader
        className={classes.cardHeader}
        avatar={<CardMedia className={classes.cardMedia} component="img" alt={service.title} image={service.logo} />}
        action={(
          <Tooltip
            title={i18n.__('components.ServiceDetails.singleServiceButtonLabel')}
            aria-label={i18n.__('components.ServiceDetails.singleServiceButtonLabel')}
          >
            <Link to={`/services/${service.slug}`}>
              <IconButton color="primary">
                <ChevronRightIcon />
              </IconButton>
            </Link>
          </Tooltip>
        )}
        title={service.title}
        titleTypographyProps={{
          variant: 'h6',
          color: 'primary',
          className: classes.title,
        }}
        subheader={service.usage}
        subheaderTypographyProps={{ variant: 'body2', color: 'primary' }}
      />
      <CardContent className={isShort ? classes.cardContentMobile : classes.cardContent}>
        {!isShort && <Typography variant="body1">{service.description}</Typography>}
        {/* <Paper variant="elevation" elevation={0} className={classes.paperChip}>
          {service.categories.map((cat) => {
            const currentCategory = categories.find((categ) => categ._id === cat);
            return (
              <Chip
                size="small"
                className={classes.chip}
                key={currentCategory._id}
                label={currentCategory.name}
                variant="outlined"
                color={catList.includes(currentCategory._id) ? 'primary' : 'default'}
                onClick={() => updateCategories(currentCategory._id)}
              />
            );
          })}
        </Paper> */}
        <div className={isShort ? classes.cardActionShort : classes.cardActions}>
          <Button
            className={classes.buttonText}
            variant={isShort ? 'outlined' : 'contained'}
            color={isShort ? 'primary' : 'secondary'}
            onClick={() => window.open(service.url, '_blank')}
          >
            {i18n.__('components.ServiceDetails.runServiceButtonLabel')}
          </Button>

          <Tooltip title={favButtonLabel} aria-label={favButtonLabel}>
            <IconButton color="primary" className={classes.fab} onClick={handleFavorite}>
              {favAction === 'fav' ? <FavoriteBorderIcon /> : <FavoriteIcon />}
            </IconButton>
          </Tooltip>
        </div>
      </CardContent>
    </Card>
  );
}

ServiceDetails.propTypes = {
  service: PropTypes.objectOf(PropTypes.any).isRequired,
  favAction: PropTypes.string.isRequired,
  isShort: PropTypes.bool.isRequired,
};

export default ServiceDetails;
