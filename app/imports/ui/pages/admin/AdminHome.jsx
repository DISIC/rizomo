import React from 'react';
import i18n from 'meteor/universe:i18n';
import Container from '@material-ui/core/Container';
import Fade from '@material-ui/core/Fade';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import { makeStyles } from '@material-ui/core/styles';
import { useAppContext } from '../../contexts/context';

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(2),
    marginBottom: theme.spacing(5),
  },
}));

export default function AdminHome() {
  const [{ isMobile }] = useAppContext();
  const classes = useStyles();

  return (
    <Fade in>
      <Container style={{ overflowX: 'auto' }}>
        <Paper className={classes.root}>
          <Typography variant={isMobile ? 'h4' : 'h3'}>{i18n.__('pages.AdminHome.title')}</Typography>
          <Typography variant="h6">{i18n.__('pages.AdminHome.subtitle')}</Typography>
        </Paper>
      </Container>
    </Fade>
  );
}
