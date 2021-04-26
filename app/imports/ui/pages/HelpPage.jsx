import React from 'react';
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import Grid from '@material-ui/core/Grid';
import i18n from 'meteor/universe:i18n';
import Fade from '@material-ui/core/Fade';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import Groups from '../../api/groups/groups';
import Services from '../../api/services/services';
import PersonalSpaces from '../../api/personalspaces/personalspaces';
import Screencast from '../components/personalspace/Screencast';

function HelpPage() {
  return (
    <Fade in>
      <Container>
        <Grid container spacing={4}>
          <Grid item xs={12} sm={12} md={12}>
            <Grid container spacing={2}>
              <Grid item>
                <Typography variant="h4">{i18n.__('pages.HelpPage.title')}</Typography>
              </Grid>
              <Screencast />
            </Grid>
          </Grid>
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
