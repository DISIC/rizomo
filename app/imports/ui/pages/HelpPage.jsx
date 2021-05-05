import React from 'react';
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
import Groups from '../../api/groups/groups';
import Services from '../../api/services/services';
import PersonalSpaces from '../../api/personalspaces/personalspaces';
import Screencast from '../components/screencast/Screencast';
import ScreencastGroup from '../components/screencast/ScreencastGroup';

function HelpPage() {
  const useStyles = makeStyles(() => ({
    card: {
      padding: 10,
      height: '100%',
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
    },
    cardContent: {
      padding: 10,
    },
    grid: {
      display: 'flex',
      padding: 1,
    },
  }));

  const classes = useStyles();

  return (
    <Fade in>
      <Container>
        <Typography variant="h4">{i18n.__('pages.HelpPage.title')}</Typography>
        <Grid xs={12} className={classes.grid}>
          <Card xs={6} className={classes.card}>
            <CardHeader />
            <CardContent>
              <Screencast className={classes.cardContent} />
            </CardContent>
          </Card>
          <Card xs={6} className={classes.card}>
            <CardContent>
              <ScreencastGroup className={classes.cardContent} />
            </CardContent>
          </Card>
        </Grid>
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
