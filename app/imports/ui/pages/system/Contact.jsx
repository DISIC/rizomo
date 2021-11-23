import React, { useState } from 'react';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import i18n from 'meteor/universe:i18n';
import { useHistory } from 'react-router-dom';
import validate from 'validate.js';
import FormHelperText from '@material-ui/core/FormHelperText';
import CustomSelect from '../../components/admin/CustomSelect';
import { structureOptions } from '../../../api/users/structures';
import { mainPagesTracker, useFormStateValidator } from './SignIn';

validate.options = {
  fullMessages: false,
};

const schema = {
  firstName: {
    presence: { allowEmpty: false, message: 'validatejs.isRequired' },
    length: {
      maximum: 32,
    },
  },
  lastName: {
    presence: { allowEmpty: false, message: 'validatejs.isRequired' },
    length: {
      maximum: 32,
    },
  },
  email: {
    presence: { allowEmpty: false, message: 'validatejs.isRequired' },
    email: {
      message: 'validatejs.isEmail',
    },
    length: {
      maximum: 64,
    },
  },
  text: {
    presence: { allowEmpty: false, message: 'validatejs.isRequired' },
    length: {
      maximum: 5096,
    },
  },
  structureSelect: {
    presence: { allowEmpty: false, message: 'validatejs.isRequired' },
  },
  captcha: {
    presence: { allowEmpty: false, message: 'validatejs.isRequired' },
  },
};

const useStyles = makeStyles((theme) => ({
  '@global': {
    body: {
      backgroundColor: theme.palette.common.white,
    },
  },
  paper: {
    marginTop: theme.spacing(4),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  emailForm: {
    marginTop: -32,
  },
  form: {
    width: '100%', // Fix IE 11 issue.
    marginTop: theme.spacing(3),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
}));

const rndmNr1 = Math.floor(Math.random() * 100);
const rndmNr2 = Math.floor(Math.random() * 10);
const totalNr = rndmNr1 + rndmNr2;

const Contact = () => {
  const history = useHistory();
  const classes = useStyles();
  const [formState, handleChange] = useFormStateValidator(schema);

  const structureLabel = React.useRef(null);
  const [labelWidth, setLabelWidth] = React.useState(0);
  React.useEffect(() => {
    setLabelWidth(structureLabel.current.offsetWidth);
  }, []);

  const hasError = (field) => !!(formState.touched[field] && formState.errors[field]);

  const [captchaIsValid, setCaptchaIsValid] = useState(true);

  const [formSubmit, setFormSubmit] = useState(false);

  const [counter, setCounter] = React.useState(0);

  React.useEffect(() => {
    const timer = counter > 0 && setInterval(() => setCounter(counter - 1), 1000);
    return () => clearInterval(timer);
  }, [counter]);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (formState.isValid === true) {
      if (parseInt(formState.values.captcha, 10) === totalNr) {
        setCaptchaIsValid(true);
        const { firstName, lastName, email, text, structureSelect } = formState.values;
        Meteor.call('sendContactEmail', firstName, lastName, email, text, structureSelect);
        setFormSubmit(true);
        setCounter(5);
        setTimeout(() => {
          history.push('/');
        }, 5000);
      } else {
        setCaptchaIsValid(false);
      }
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <div className={classes.paper}>
        <Typography component="h1" variant="h5">
          {i18n.__('pages.ContactForm.appDescription')}
        </Typography>

        <form onSubmit={handleSubmit} className={classes.form} id="my-form" noValidate>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                autoComplete="fname"
                required
                id="firstName"
                autoFocus
                fullWidth
                helperText=" "
                label={i18n.__('pages.ContactForm.firstNameLabel')}
                name="firstName"
                type="text"
                value={formState.values.firstName || ''}
                error={hasError('firstName')}
                onChange={handleChange}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                id="lastName"
                autoComplete="lname"
                fullWidth
                label={i18n.__('pages.ContactForm.nameLabel')}
                name="lastName"
                type="text"
                helperText=" "
                value={formState.values.lastName || ''}
                error={hasError('lastName')}
                onChange={handleChange}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} spacing={2} className={classes.emailForm}>
              <TextField
                margin="normal"
                required
                id="email"
                label={i18n.__('pages.ContactForm.emailLabel')}
                name="email"
                autoComplete="email"
                fullWidth
                helperText=""
                type="text"
                value={formState.values.email || ''}
                error={hasError('email')}
                onChange={handleChange}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} spacing={2}>
              <FormControl variant="outlined" className={classes.formControl} fullWidth>
                <InputLabel
                  ref={structureLabel}
                  id="structure-label"
                  className={hasError('structureSelect') ? 'Mui-error' : ''}
                >
                  {i18n.__('pages.ContactForm.structureLabel')}
                </InputLabel>
                <CustomSelect
                  value={formState.values.structureSelect || ''}
                  error={hasError('structureSelect')}
                  onChange={handleChange}
                  labelWidth={labelWidth}
                  options={structureOptions}
                />
                <FormHelperText className={hasError('structureSelect') ? 'Mui-error' : ''}>
                  {hasError('structureSelect')}
                </FormHelperText>
              </FormControl>
            </Grid>
            <Grid item xs={12} spacing={2}>
              <TextField
                name="text"
                multiline
                fullWidth
                rows={10}
                label={i18n.__('pages.ContactForm.textLabel')}
                value={formState.values.text || ''}
                onChange={handleChange}
                required
                variant="outlined"
              />
              <TextField
                margin="normal"
                name="captcha"
                required
                label={`${rndmNr1} + ${rndmNr2}`}
                fullWidth
                helperText={i18n.__('pages.ContactForm.captchaInfo')}
                type="text"
                error={!captchaIsValid}
                value={formState.values.captcha || ''}
                onChange={handleChange}
                variant="outlined"
              />
            </Grid>
            {!formSubmit ? (
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                className={classes.submit}
                disabled={!formState.isValid}
              >
                {i18n.__('pages.ContactForm.submitButtonLabel')}
              </Button>
            ) : (
              <p>
                {i18n.__('pages.ContactForm.redirectMsg')}
                <br />
                {counter} {i18n.__('pages.ContactForm.redirectTime')}
              </p>
            )}
            <Button fullWidth variant="contained" className={classes.submit} onClick={() => history.push('/')}>
              {i18n.__('pages.ContactForm.cancel')}
            </Button>
          </Grid>
        </form>
      </div>
    </Container>
  );
};

export default mainPagesTracker('introduction', Contact);

Contact.defaultProps = {
  introduction: '',
};
