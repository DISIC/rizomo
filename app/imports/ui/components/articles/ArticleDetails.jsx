import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import Tooltip from '@material-ui/core/Tooltip';
import {
  Button, CardHeader, IconButton, CardContent, Typography,
} from '@material-ui/core';
import i18n from 'meteor/universe:i18n';
import { Link } from 'react-router-dom';
import OpenInNewIcon from '@material-ui/icons/OpenInNew';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import EditIcon from '@material-ui/icons/Edit';

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
  buttonText: {
    color: theme.palette.tertiary.main,
    marginRight: theme.spacing(3),
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

export default function ArticleDetails({ article, publicPage }) {
  const classes = useStyles();
  const actionButtons = (
    <div style={{ display: 'flex' }}>
      <Tooltip
        title={i18n.__('components.ArticleDetails.editArticleButtonLabel')}
        aria-label={i18n.__('components.ArticleDetails.editArticleButtonLabel')}
      >
        <Link to={`/publications/${article.slug}`}>
          <Button className={classes.buttonText} variant="contained" color="secondary">
            <EditIcon fontSize="large" />
          </Button>
        </Link>
      </Tooltip>
      <Tooltip
        title={i18n.__('components.ArticleDetails.publicButton')}
        aria-label={i18n.__('components.ArticleDetails.publicButton')}
      >
        <Button
          color="primary"
          variant="contained"
          onClick={() => window.open(`${Meteor.absoluteUrl()}public/${Meteor.userId()}/${article.slug}`, '_blank')}
        >
          <OpenInNewIcon fontSize="large" />
        </Button>
      </Tooltip>
    </div>
  );

  const publicButton = (
    <Tooltip title={i18n.__('components.ArticleDetails.open')} aria-label={i18n.__('components.ArticleDetails.open')}>
      <Link to={`/public/${article.userId}/${article.slug}`}>
        <IconButton color="primary">
          <ChevronRightIcon fontSize="large" />
        </IconButton>
      </Link>
    </Tooltip>
  );
  return (
    <Card className={classes.card} elevation={3}>
      <CardHeader
        classes={{ action: classes.action }}
        action={publicPage ? publicButton : actionButtons}
        title={article.title}
        titleTypographyProps={{
          variant: 'h6',
          color: 'primary',
        }}
        subheader={`${i18n.__('components.ArticleDetails.publishedOn')} ${article.createdAt.toLocaleString()} `}
        subheaderTypographyProps={{ variant: 'body2', color: 'primary' }}
      />
      <CardContent>
        <Typography paragraph>{article.description || i18n.__('components.ArticleDetails.noDescription')}</Typography>
      </CardContent>
    </Card>
  );
}

ArticleDetails.propTypes = {
  article: PropTypes.objectOf(PropTypes.any).isRequired,
  publicPage: PropTypes.bool,
};
ArticleDetails.defaultProps = {
  publicPage: false,
};
