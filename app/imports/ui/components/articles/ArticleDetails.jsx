import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import Tooltip from '@material-ui/core/Tooltip';
import { Button, CardHeader, IconButton, CardContent, Typography, CardActionArea } from '@material-ui/core';
import i18n from 'meteor/universe:i18n';
import { Link, useHistory } from 'react-router-dom';
import OpenInNewIcon from '@material-ui/icons/OpenInNew';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import EditIcon from '@material-ui/icons/Edit';
import VisibilityIcon from '@material-ui/icons/Visibility';

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
    marginRight: theme.spacing(2),
  },
  visitCounter: {
    cursor: 'default !important',
    backgroundColor: '#F9F9FD',
    '&:hover': { backgroundColor: '#F9F9FD' },
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
  const history = useHistory();

  const handlePublic = () => {
    history.push(`/public/${article.userId}/${article.slug}`);
  };

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
          className={classes.buttonText}
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
    <IconButton color="primary" onClick={handlePublic}>
      <ChevronRightIcon fontSize="large" />
    </IconButton>
  );

  const cardHeader = (
    <CardHeader
      classes={{ action: classes.action }}
      action={publicPage ? publicButton : actionButtons}
      title={article.title}
      titleTypographyProps={{
        variant: 'h6',
        color: 'primary',
      }}
      subheader={
        <>
          {i18n.__('components.ArticleDetails.publishedOn')} {article.createdAt.toLocaleString()}{' '}
          <Button
            color="primary"
            className={classes.visitCounter}
            startIcon={<VisibilityIcon />}
            disableElevation
            disableRipple
            disableFocusRipple
            title={i18n.__('pages.PublicArticleDetailsPage.views')}
          >
            {article.visits}
          </Button>
        </>
      }
      subheaderTypographyProps={{ variant: 'body2', color: 'primary' }}
    />
  );

  const cardContent = (
    <CardContent>
      <Typography paragraph>{article.description || i18n.__('components.ArticleDetails.noDescription')}</Typography>
    </CardContent>
  );

  return (
    <Card className={classes.card} elevation={3}>
      {publicPage ? (
        <CardActionArea
          title={i18n.__('components.ArticleDetails.open')}
          aria-label={i18n.__('components.ArticleDetails.open')}
          onClick={handlePublic}
        >
          {cardHeader}
          {cardContent}
        </CardActionArea>
      ) : (
        <>
          {cardHeader}
          {cardContent}
        </>
      )}
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
