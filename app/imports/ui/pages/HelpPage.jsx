import React, { useState } from 'react';
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import i18n from 'meteor/universe:i18n';
import Fade from '@material-ui/core/Fade';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Modal from '@material-ui/core/Modal';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import CancelIcon from '@material-ui/icons/CancelOutlined';
import Groups from '../../api/groups/groups';
import Services from '../../api/services/services';
import PersonalSpaces from '../../api/personalspaces/personalspaces';
import Screencast from '../components/screencast/Screencast';
import ScreencastGroup from '../components/screencast/ScreencastGroup';

function HelpPage() {
  const [openScreencast, setScreencast] = useState(false);
  const [openScreencastGroup, setScreencastGroup] = useState(false);

  const useStyles = makeStyles((theme) => ({
    card: {
      margin: 10,
      height: '100%',
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
    },
    grid: {
      display: 'flex',
      padding: 1,
    },
    buttonText: {
      textTransform: 'none',
      backgroundColor: theme.palette.primary.main,
      color: theme.palette.tertiary.main,
      fontWeight: 'bold',
      '&:hover': {
        color: theme.palette.primary.main,
        backgroundColor: theme.palette.tertiary.main,
      },
    },
    closeButton: {
      margin: '10px',
      marginBottom: '0px',
      width: '30px',
      height: '30px',
      display: 'flex',
      justifyContent: 'right',
    },
    button: {
      display: 'flex',
      justifyContent: 'right',
      marginTop: 75,
    },
    gridModal: {
      backgroundColor: 'white',
      width: 'fit-content',
      margin: 'auto',
    },
    modal: {
      display: 'grid',
    },
  }));

  const classes = useStyles();

  return (
    <Fade in>
      <Container>
        <Typography variant="h4">{i18n.__('pages.HelpPage.title')}</Typography>
        <Grid xs={12} className={classes.grid}>
          <Card xs={12} sm={4} md={4} className={classes.card}>
            <CardHeader title={i18n.__('pages.HelpPage.titleCardStart')} />
            <CardContent>
              <Button
                startIcon={<ExitToAppIcon />}
                className={classes.buttonText}
                size="large"
                onClick={() => setScreencast(true)}
              >
                {i18n.__('pages.HelpPage.tutoLabel')}
              </Button>
            </CardContent>
          </Card>
          <Card xs={12} sm={4} md={4} className={classes.card}>
            <CardHeader title={i18n.__('pages.HelpPage.titleCardGroup')} />
            <CardContent>
              <Button
                startIcon={<ExitToAppIcon />}
                className={classes.buttonText}
                size="large"
                onClick={() => setScreencast(true)}
              >
                {i18n.__('pages.HelpPage.tutoLabel')}
              </Button>
            </CardContent>
          </Card>
        </Grid>
        <Modal open={openScreencast} onClose={() => setScreencast(false)}>
          <Grid className={classes.gridModal}>
            <Grid className={classes.button}>
              <CancelIcon className={classes.closeButton} onClick={() => setScreencast(false)} />
            </Grid>
            <Screencast />
          </Grid>
        </Modal>
        <Modal open={openScreencastGroup} onClose={() => setScreencastGroup(false)}>
          <Grid className={classes.gridModal}>
            <Grid className={classes.button}>
              <CancelIcon className={classes.closeButton} onClick={() => setScreencastGroup(false)} />
            </Grid>
            <ScreencastGroup />
          </Grid>
        </Modal>
      </Container>
    </Fade>
  );
}

export default withTracker(() => {
  const subscription = Meteor.subscribe('personalspaces.self');
  const personalspace = PersonalSpaces.findOne() || { userId: this.userId, unsorted: [], sorted: [] };
  const allServices = Services.find().fetch();
  const allGroups = Groups.find().fetch();
  return {
    personalspace,
    isLoading: !subscription.ready(),
    allServices,
    allGroups,
  };
})(HelpPage);
