import React, { useState, useEffect } from 'react';
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import validate from 'validate.js';
import i18n from 'meteor/universe:i18n';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Fade, FormGroup, Checkbox, FormControlLabel } from '@material-ui/core';
import Spinner from '../../components/system/Spinner';
import AppVersion from '../../components/system/AppVersion';
import AppSettings from '../../../api/appsettings/appsettings';

validate.options = {
  fullMessages: false,
};

const schema = {
  email: {
    presence: { allowEmpty: false, message: 'validatejs.isRequired' },
    length: {
      maximum: 64,
    },
  },
  password: {
    presence: { allowEmpty: false, message: 'validatejs.isRequired' },
    length: {
      maximum: 128,
    },
  },
};

const useStyles = makeStyles((theme) => ({
  form: {
    width: '100%', // Fix IE 11 issue.
    marginTop: theme.spacing(1),
    position: 'relative',
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
  error: {
    backgroundColor: theme.palette.error.dark,
  },
}));

if (Meteor.settings.public.enableKeycloak === true) {
  // notify login failure after redirect (useful if another account with same email already exists)
  Accounts.onLoginFailure((details) => {
    let errMsg;
    if (details.error.reason === 'Email already exists.') {
      errMsg = i18n.__('pages.SignIn.EmailAlreadyExists');
    } else {
      errMsg = `${i18n.__('pages.SignIn.keycloakError')} (${details.error.reason})`;
    }
    msg.error(errMsg);
  });
}

function SignIn({ loggingIn, introduction, ready }) {
  const classes = useStyles();

  const [formState, setFormState] = useState({
    isValid: false,
    values: {},
    touched: {},
    errors: {},
  });

  const [rememberMe, setRememberMe] = useState(true);

  useEffect(() => {
    const errors = validate(formState.values, schema);

    setFormState(() => ({
      ...formState,
      isValid: !errors,
      errors: errors || {},
    }));
  }, [formState.values]);

  const handleChange = (event) => {
    event.persist();

    setFormState(() => ({
      ...formState,
      values: {
        ...formState.values,
        [event.target.name]: event.target.type === 'checkbox' ? event.target.checked : event.target.value,
      },
      touched: {
        ...formState.touched,
        [event.target.name]: true,
      },
    }));
  };

  const checkRememberMe = () => {
    window.localStorage.setItem('rememberMe', rememberMe);
    // always reset window.onunload and window.onbeforeunload at login
    window.onunload = null;
    window.onbeforeunload = null;
  };

  const handleSignIn = (event) => {
    event.preventDefault();
    if (formState.isValid === true) {
      checkRememberMe();
      const { email, password } = formState.values;
      Meteor.loginWithPassword(email, password, (err) => {
        if (err) {
          msg.error(i18n.__('pages.SignIn.loginError'));
        }
      });
    }
  };

  const handleKeycloakAuth = () => {
    checkRememberMe();
    Meteor.loginWithKeycloak();
  };

  const hasError = (field) => !!(formState.touched[field] && formState.errors[field]);
  const useKeycloak = Meteor.settings.public.enableKeycloak;

  const RememberButton = () => (
    <FormGroup>
      <FormControlLabel
        control={
          <Checkbox
            checked={rememberMe}
            onChange={() => setRememberMe(!rememberMe)}
            name="rememberMe"
            color="primary"
          />
        }
        label={i18n.__('pages.SignIn.rememberMe')}
      />
    </FormGroup>
  );

  return useKeycloak && loggingIn ? (
    <Spinner />
  ) : (
    <Fade in>
      <>
        <Typography variant="h5" color="inherit" paragraph>
          {i18n.__('pages.SignIn.appDescription')}
        </Typography>
        <Typography variant="h6" color="inherit" paragraph>
          <AppVersion />
        </Typography>
        {!ready && !loggingIn && <Spinner />}
        <div dangerouslySetInnerHTML={{ __html: introduction }} />
        <form onSubmit={handleSignIn} className={classes.form} noValidate>
          {loggingIn && <Spinner full />}
          {useKeycloak ? (
            <>
              <Button
                disabled={loggingIn}
                fullWidth
                variant="contained"
                color="primary"
                className={classes.submit}
                onClick={handleKeycloakAuth}
              >
                {i18n.__('pages.SignIn.loginKeycloak')}
              </Button>
              <RememberButton />
            </>
          ) : (
            <>
              <TextField
                margin="normal"
                required
                id="email"
                label={i18n.__('pages.SignIn.emailLabel')}
                name="email"
                autoComplete="email"
                autoFocus
                error={hasError('email')}
                fullWidth
                helperText={hasError('email') ? i18n.__(formState.errors.email[0]) : null}
                onChange={handleChange}
                type="text"
                value={formState.values.email || ''}
                variant="outlined"
                disabled={loggingIn}
              />
              <TextField
                variant="outlined"
                margin="normal"
                required
                fullWidth
                name="password"
                label={i18n.__('pages.SignIn.pwdLabel')}
                type="password"
                id="password"
                autoComplete="current-password"
                error={hasError('password')}
                helperText={hasError('password') ? i18n.__(formState.errors.password[0]) : null}
                onChange={handleChange}
                value={formState.values.password || ''}
                disabled={loggingIn}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                className={classes.submit}
                disabled={!formState.isValid || loggingIn}
              >
                {i18n.__('pages.SignIn.connect')}
              </Button>
              <RememberButton />
              <Grid container>
                <Grid item xs>
                  <Link to="/" variant="body2">
                    {i18n.__('pages.SignIn.forgotPwd')}
                  </Link>
                </Grid>
                <Grid item>
                  <Link to="/signup" variant="body2">
                    {i18n.__('pages.SignIn.createAccount')}
                  </Link>
                </Grid>
              </Grid>
            </>
          )}
        </form>
      </>
    </Fade>
  );
}

export default withTracker(() => {
  const loggingIn = Meteor.loggingIn();
  const subSettings = Meteor.subscribe('appsettings.introduction');
  const appsettings = AppSettings.findOne() || {};
  const ready = subSettings.ready();
  // locale may be fr-FR, en-EN, etc...
  // laboite only manages fr, en, ...
  const language = i18n.getLocale().split('-')[0];
  const { introduction = [] } = appsettings;
  const currentEntry = introduction.find((entry) => entry.language === language) || {};
  const defaultContent = introduction.find((entry) => !!entry.content.length);

  return {
    loggingIn,
    ready,
    introduction: currentEntry.content || defaultContent,
  };
})(SignIn);

SignIn.defaultProps = {
  introduction: '',
  loggingIn: false,
};

SignIn.propTypes = {
  loggingIn: PropTypes.bool,
  ready: PropTypes.bool.isRequired,
  introduction: PropTypes.string,
};
