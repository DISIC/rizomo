import React, { useState } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import i18n from 'meteor/universe:i18n';
import Container from '@material-ui/core/Container';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Fade from '@material-ui/core/Fade';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';
import Grid from '@material-ui/core/Grid';

import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';

import Spinner from '../../components/system/Spinner';
import AppSettings from '../../../api/appsettings/appsettings';
import LegalComponent from '../../components/admin/LegalComponent';
import IntroductionEdition from '../../components/admin/IntroductionEdition';
import { useAppContext } from '../../contexts/context';
import { switchMaintenanceStatus, updateTextMaintenance } from '../../../api/appsettings/methods';

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(2),
    marginBottom: theme.spacing(5),
  },
  wysiwyg: {
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(3),
  },

  buttonGroup: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: theme.spacing(5),
  },
  buttonText: {
    marginLeft: 10,
  },
  container: {
    flexGrow: 1,
    display: 'flex',
  },
  containerForm: {
    padding: 25,
    display: 'block',
    width: '100%',
  },
  tab: {
    '& > span': {
      alignItems: 'end',
    },
  },
  tabs: {
    borderRight: `1px solid ${theme.palette.divider}`,
  },
}));

const tabs = [
  {
    key: 'introduction',
    title: i18n.__('pages.AdminSettingsPage.introduction'),
    Element: IntroductionEdition,
  },
  {
    key: 'legal',
    title: i18n.__('pages.AdminSettingsPage.legal'),
    Element: LegalComponent,
  },
  {
    key: 'personalData',
    title: i18n.__('pages.AdminSettingsPage.personalData'),
    Element: LegalComponent,
  },
  {
    key: 'accessibility',
    title: i18n.__('pages.AdminSettingsPage.accessibility'),
    Element: LegalComponent,
  },
  {
    key: 'gcu',
    title: i18n.__('pages.AdminSettingsPage.gcu'),
    Element: LegalComponent,
  },
];

const AdminSettingsPage = ({ ready, appsettings }) => {
  const [selected, setSelected] = useState(0);
  const [msgMaintenance, setMsgMaintenance] = useState(appsettings.textMaintenance);
  const classes = useStyles();
  const [loading, setLoading] = useState(true);
  const [{ isMobile }] = useAppContext();

  const onChangeTab = (e, newTab) => {
    setSelected(newTab);
  };

  if (loading && !ready && !appsettings) {
    return <Spinner full />;
  }

  const onCheckMaintenance = () => {
    setLoading(true);
    switchMaintenanceStatus.call({}, (error) => {
      setLoading(false);
      if (error) {
        msg.error(error.message);
      }
    });
  };

  const onButtonMaintenanceClick = () => {
    setLoading(true);
    updateTextMaintenance.call({ text: msgMaintenance }, (error) => {
      setLoading(false);
      if (error) {
        msg.error(error.message);
      } else {
        msg.success(i18n.__('api.methods.operationSuccessMsg'));
      }
    });
  };

  const onUpdateField = (event) => {
    const { value } = event.target;
    setMsgMaintenance(value);
  };

  const buttonIsActive = !!(
    msgMaintenance === null ||
    msgMaintenance === undefined ||
    msgMaintenance === '' ||
    msgMaintenance === appsettings.textMaintenance
  );

  return (
    <Fade in>
      <Container>
        <Paper className={classes.root}>
          <Grid container spacing={4}>
            <Grid item md={12}>
              <Typography variant={isMobile ? 'h6' : 'h4'}>{i18n.__('pages.AdminSettingsPage.edition')}</Typography>
            </Grid>
            <Grid item md={12} className={classes.container}>
              <Tabs orientation="vertical" value={selected} onChange={onChangeTab} className={classes.tabs}>
                {tabs.map(({ title, key }, index) => (
                  <Tab className={classes.tab} label={title} id={index} key={key} />
                ))}
              </Tabs>
              {tabs.map(({ key, Element }, i) => {
                if (selected !== i) return null;
                return <Element key={key} tabkey={key} data={appsettings[key]} />;
              })}
            </Grid>
          </Grid>
        </Paper>
        <Paper className={classes.root}>
          <Grid container spacing={4}>
            <Grid item md={12}>
              <Typography variant={isMobile ? 'h6' : 'h4'}>{i18n.__('pages.AdminSettingsPage.maintenance')}</Typography>
            </Grid>
            <Grid item md={12} className={classes.container}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={appsettings.maintenance || false}
                    onChange={onCheckMaintenance}
                    name="external"
                    color="primary"
                  />
                }
                label={i18n.__(`pages.AdminSettingsPage.toggleMaintenance`)}
              />
            </Grid>
            <FormControlLabel
              className={classes.containerForm}
              control={
                <div style={{ marginTop: '-20px' }}>
                  <TextField
                    onChange={onUpdateField}
                    value={msgMaintenance}
                    name="link"
                    label={i18n.__(`pages.AdminSettingsPage.textMaintenance`)}
                    variant="outlined"
                    fullWidth
                    margin="normal"
                  />
                  <Button
                    size="medium"
                    disabled={buttonIsActive}
                    variant="contained"
                    color="primary"
                    onClick={onButtonMaintenanceClick}
                  >
                    {i18n.__(`pages.AdminSettingsPage.buttonTextMaintenance`)}
                  </Button>
                </div>
              }
            />
          </Grid>
        </Paper>
      </Container>
    </Fade>
  );
};

export default withTracker(() => {
  const subSettings = Meteor.subscribe('appsettings.all');
  const appsettings = AppSettings.findOne();
  const ready = subSettings.ready();
  return {
    appsettings,
    ready,
  };
})(AdminSettingsPage);

AdminSettingsPage.defaultProps = {
  appsettings: {},
};

AdminSettingsPage.propTypes = {
  appsettings: PropTypes.objectOf(PropTypes.any),
  ready: PropTypes.bool.isRequired,
};
