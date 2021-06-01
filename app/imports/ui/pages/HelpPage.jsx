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
import { useAppContext } from '../contexts/context';

function HelpPage() {
  const [openScreencast, setScreencastModal] = useState(false);
  const [{ isMobile }] = useAppContext();

  const useStyles = makeStyles((theme) => ({
    card: {
      // margin: 10,
      // height: '18vh',
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
    },
    grid: {
      display: 'flex',
      padding: 1,
    },
    buttonText: {
      boxShadow:
        '0px 3px 1px -2px rgb(0 0 0 / 20%), 0px 2px 2px 0px rgb(0 0 0 / 14%), 0px 1px 5px 0px rgb(0 0 0 / 12%)',
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
      height: 'fit-content',
      margin: 'auto',
    },
    modal: {
      display: 'grid',
    },
    header: {
      height: '87px',
    },
  }));

  const classes = useStyles();
  const [link, setLink] = useState(
    'https://tube-dijon.beta.education.fr/videos/embed/d72319ee-1f67-41ac-aa4d-ece4f8ad1478',
  );

  return (
    <Fade in>
      <Container>
        <Typography variant={isMobile ? 'h5' : 'h4'}>{i18n.__('pages.HelpPage.title')}</Typography>
        <Grid container spacing={2} direction={isMobile ? 'column' : 'row'} className={classes.grid}>
          <Grid item xs={12} md={6} lg={4}>
            <Card className={classes.card}>
              <CardHeader className={classes.header} title={i18n.__('pages.HelpPage.titleCardStart')} />
              <CardContent>
                <Button
                  startIcon={<ExitToAppIcon />}
                  className={classes.buttonText}
                  size="large"
                  onClick={() => {
                    setLink('https://tube-dijon.beta.education.fr/videos/embed/d72319ee-1f67-41ac-aa4d-ece4f8ad1478');
                    setScreencastModal(true);
                  }}
                >
                  {i18n.__('pages.HelpPage.tutoLabel')}
                </Button>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6} lg={4}>
            <Card className={classes.card}>
              <CardHeader className={classes.header} title={i18n.__('pages.HelpPage.titleCardGroup')} />
              <CardContent>
                <Button
                  startIcon={<ExitToAppIcon />}
                  className={classes.buttonText}
                  size="large"
                  onClick={() => {
                    setLink('https://tube-dijon.beta.education.fr/videos/embed/57752b90-5b36-4b3f-9b83-1b7464e41a5f');
                    setScreencastModal(true);
                  }}
                >
                  {i18n.__('pages.HelpPage.tutoLabel')}
                </Button>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6} lg={4}>
            <Card className={classes.card}>
              <CardHeader className={classes.header} title={i18n.__('pages.HelpPage.titleCardMezig')} />
              <CardContent>
                <Button
                  startIcon={<ExitToAppIcon />}
                  className={classes.buttonText}
                  size="large"
                  onClick={() => {
                    setLink('https://tube-dijon.beta.education.fr/videos/embed/d024f709-8b65-4f69-b058-22569f2b881d');
                    setScreencastModal(true);
                  }}
                >
                  {i18n.__('pages.HelpPage.tutoLabel')}
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        <Modal open={openScreencast} onClose={() => setScreencastModal(false)}>
          <Grid container className={classes.gridModal}>
            <Grid item className={classes.button}>
              <CancelIcon className={classes.closeButton} onClick={() => setScreencastModal(false)} />
            </Grid>
            <Screencast link={link} />
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
