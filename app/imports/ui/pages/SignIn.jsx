import React, { useState, useEffect } from 'react';
import { Meteor } from 'meteor/meteor';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Link from '@material-ui/core/Link';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Snackbar from '@material-ui/core/Snackbar';
import { makeStyles } from '@material-ui/core/styles';
import { useHistory } from 'react-router-dom';
import validate from 'validate.js';
import i18n from 'meteor/universe:i18n';

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
  root: {
    height: '100vh',
  },
  image: {
    backgroundImage: 'url(https://source.unsplash.com/random)',
    backgroundRepeat: 'no-repeat',
    backgroundColor: theme.palette.grey[50],
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  },
  paper: {
    margin: theme.spacing(8, 4),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  form: {
    width: '100%', // Fix IE 11 issue.
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
  imgLogo: {
    alignSelf: 'center',
    maxWidth: '100%',
    maxHeight: 'auto',
    paddingBottom: '5%',
  },
  mainFeaturedPostContent: {
    position: 'relative',
    padding: theme.spacing(3),
    [theme.breakpoints.up('md')]: {
      padding: theme.spacing(6),
      paddingRight: 0,
    },
  },
  error: {
    backgroundColor: theme.palette.error.dark,
  },
}));

export default function SignIn() {
  const history = useHistory();
  const classes = useStyles();

  const [formState, setFormState] = useState({
    isValid: false,
    values: {},
    touched: {},
    errors: {},
  });

  const [openError, setOpenError] = useState(false);

  useEffect(() => {
    const errors = validate(formState.values, schema);

    setFormState((formState) => ({
      ...formState,
      isValid: !errors,
      errors: errors || {},
    }));
  }, [formState.values]);

  const handleChange = (event) => {
    event.persist();

    setFormState((formState) => ({
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

  const handleSignIn = (event) => {
    event.preventDefault();
    if (formState.isValid === true) {
      const { email, password } = formState.values;
      Meteor.loginWithPassword(email, password, (err) => {
        if (err) {
          setOpenError(true);
        } else {
          history.push('/');
        }
      });
    }
  };

  const handleErrorClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenError(false);
  };

  const hasError = (field) => !!(formState.touched[field] && formState.errors[field]);

  return (
    <div>
      <Typography variant="h5" color="inherit" paragraph>
        {i18n.__('pages.SignIn.appDescription')}
      </Typography>
      <Typography variant="h6" color="inherit" paragraph>
        {i18n.__('pages.SignIn.appVersion')}
      </Typography>
      <form onSubmit={handleSignIn} className={classes.form} noValidate>
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
        />
        <Button
          type="submit"
          fullWidth
          variant="contained"
          color="primary"
          className={classes.submit}
          disabled={!formState.isValid}
        >
          {i18n.__('pages.SignIn.connect')}
        </Button>
        <Grid container>
          <Grid item xs>
            <Link href="/" variant="body2">
              {i18n.__('pages.SignIn.forgotPwd')}
            </Link>
          </Grid>
          <Grid item>
            <Link href="/signup" variant="body2">
              {i18n.__('pages.SignIn.createAccount')}
            </Link>
          </Grid>
        </Grid>
        <Snackbar
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
          open={openError}
          autoHideDuration={4000}
          onClose={handleErrorClose}
          ContentProps={{
            'aria-describedby': 'message-id',
            className: classes.error,
          }}
          message={<span id="message-id">{i18n.__('pages.SignIn.loginError')}</span>}
        />
      </form>
    </div>
  );
}
