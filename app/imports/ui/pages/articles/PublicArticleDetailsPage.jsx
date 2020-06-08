import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import i18n from 'meteor/universe:i18n';
import { withTracker } from 'meteor/react-meteor-data';
import ArrowBack from '@material-ui/icons/ArrowBack';
import { Typography, Container, Grid, makeStyles, Button, Fade } from '@material-ui/core';
import Articles from '../../../api/articles/articles';
import Spinner from '../../components/system/Spinner';
import { useAppContext } from '../../contexts/context';
import TopBar from '../../components/menus/TopBar';
import Footer from '../../components/menus/Footer';

const useStyles = makeStyles((theme) => ({
  root: {
    paddingTop: 60,
    marginBottom: -64,
    display: 'flex',
    minHeight: '100vh',
    flexDirection: 'column',
  },
  flex: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  space: {
    height: 64,
  },
  content: {
    textAlign: 'justify',
    width: '100%',
    marginBottom: theme.spacing(3),
    '& p': {
      marginTop: 0,
      marginBottom: 0,
    },
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
  const [{ isMobile }] = useAppContext();
  const classes = useStyles();
  const [user, setUser] = useState({});

  const isFirstRender = history.action === 'POP';

  useEffect(() => {
    Meteor.call('users.findUser', { userId }, (error, result) => {
      setUser(result);
    });
  }, []);

  const handleGoList = () => {
    if (isFirstRender) {
      history.push(`/public/${userId}`);
    } else {
      history.goBack();
    }
  };
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
              <Button color="primary" startIcon={<ArrowBack />} onClick={handleGoList}>
                {i18n.__(`pages.PublicArticleDetailsPage.${isFirstRender ? 'goToList' : 'backToList'}`)}
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
              <div className={classes.content} dangerouslySetInnerHTML={{ __html: article.content }} />
            </Grid>
          </Grid>
          <div className={classes.space} />
        </Container>
      </Fade>
      <Footer />
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
