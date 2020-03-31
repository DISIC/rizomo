import React, { useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import i18n from 'meteor/universe:i18n';
import { withTracker } from 'meteor/react-meteor-data';
import ArrowBack from '@material-ui/icons/ArrowBack';
import {
  Typography, Container, Grid, makeStyles, Button, Fade,
} from '@material-ui/core';
import Articles from '../../../api/articles/articles';
import Spinner from '../../components/system/Spinner';
import { Context } from '../../contexts/context';
import TopBar from '../../components/menus/TopBar';

const useStyles = makeStyles((theme) => ({
  root: {
    marginTop: 50,
    marginBottom: theme.spacing(4),
  },
  flex: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  gridItem: {
    display: 'flex',
    justifyContent: 'center',
  },
  spaceBetween: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  wysiwyg: {
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(3),
  },
  buttonGroup: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '10px',
  },
}));

function PublicArticleDetailsPage({
  article = {},
  ready,
  history,
  match: {
    params: { userId },
  },
}) {
  const [{ isMobile }] = useContext(Context);
  const classes = useStyles();
  const [user, setUser] = useState({});

  useEffect(() => {
    Meteor.call('users.findUser', { userId }, (error, result) => {
      setUser(result);
    });
  }, []);
  if (!ready) {
    return <Spinner />;
  }
  return (
    <>
      <TopBar publicMenu />
      <Fade in>
        <Container className={classes.root}>
          <Grid container spacing={4}>
            <Grid item xs={12} sm={12} md={12} className={classes.flex}>
              <Button color="primary" startIcon={<ArrowBack />} onClick={history.goBack}>
                {i18n.__('pages.PublicArticleDetailsPage.backToList')}
              </Button>
            </Grid>
            <Grid item xs={12} className={isMobile ? null : classes.flex}>
              <Typography variant={isMobile ? 'h6' : 'h4'} className={classes.flex}>
                {article.title}
              </Typography>
              <Typography variant="subtitle2" align="right">
                {`${user.firstName} ${user.lastName}`}
                <br />
                {article.createdAt.toLocaleString()}
              </Typography>
            </Grid>
            <Grid item xs={12} className={isMobile ? null : classes.flex}>
              <div dangerouslySetInnerHTML={{ __html: article.content }} />
            </Grid>
          </Grid>
        </Container>
      </Fade>
    </>
  );
}

PublicArticleDetailsPage.propTypes = {
  article: PropTypes.objectOf(PropTypes.any).isRequired,
  ready: PropTypes.bool.isRequired,
  match: PropTypes.objectOf(PropTypes.any).isRequired,
  history: PropTypes.objectOf(PropTypes.any).isRequired,
};

export default withTracker(
  ({
    match: {
      params: { slug },
    },
  }) => {
    const articleHandle = Meteor.subscribe('articles.one', { slug });
    const article = Articles.findOneFromPublication('articles.one', {}) || {};
    const ready = articleHandle.ready();
    return {
      article,
      ready,
    };
  },
)(PublicArticleDetailsPage);
