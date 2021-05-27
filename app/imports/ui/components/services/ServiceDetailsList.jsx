import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import { useHistory } from 'react-router-dom';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardMedia from '@material-ui/core/CardMedia';
import CardActionArea from '@material-ui/core/CardActionArea';
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
  const history = useHistory();

  const isExternal = isUrlExternal(service.url);
  const launchService = () => {
    if (isExternal) {
      window.open(service.url, '_blank', 'noreferrer,noopener');
    } else {
      history.push(service.url.replace(Meteor.absoluteUrl(), '/'));
    }
  };

  return (
    <Card className={classes.card} elevation={3}>
      <CardActionArea onClick={launchService} disabled={service.state === 5}>
        <CardHeader
          classes={{ action: classes.action }}
          avatar={<CardMedia className={classes.cardMedia} component="img" alt={service.title} image={service.logo} />}
          title={service.title}
          titleTypographyProps={{
            variant: 'h6',
            color: service.state === 5 ? 'textSecondary' : 'primary',
          }}
          subheader={service.usage}
          subheaderTypographyProps={{ variant: 'body2', color: service.state === 5 ? 'textSecondary' : 'primary' }}
        />
      </CardActionArea>
    </Card>
  );
}

ServiceDetails.propTypes = {
  service: PropTypes.objectOf(PropTypes.any).isRequired,
};
