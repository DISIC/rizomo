import React, { useState, useContext, useEffect } from 'react';
import { Meteor } from 'meteor/meteor';
import i18n from 'meteor/universe:i18n';
import {
  Container,
  Paper,
  makeStyles,
  Button,
  IconButton,
  InputAdornment,
  OutlinedInput,
  TextField,
  Typography,
  InputLabel,
  Fade,
  FormControl,
  FormHelperText,
  Grid,
  Tooltip,
} from '@material-ui/core';
import MailIcon from '@material-ui/icons/Mail';

import Spinner from '../../components/system/Spinner';
import CustomSelect from '../../components/admin/CustomSelect';
import { structureOptions } from '../../../api/users/structures';
import { Context } from '../../contexts/context';
import LanguageSwitcher from '../../components/system/LanguageSwitcher';
import debounce from '../../utils/debounce';
import { useObjectState } from '../../utils/hooks';

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(2),
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(5),
  },
  form: {
    marginTop: theme.spacing(2),
    display: 'flex',
    flexDirection: 'column',
  },
  buttonGroup: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '10px',
  },
  keycloakMessage: {
    padding: theme.spacing(1),
  },
}));

const defaultState = {
  firstName: '',
  lastName: '',
  email: '',
  username: '',
  structureSelect: '',
};

const ProfilePage = () => {
  const [userData, setUserData] = useState(defaultState);
  const [submitOk, setSubmitOk] = useState(false);
  const [errors, setErrors] = useObjectState(defaultState);
  const [submitted, setSubmitted] = useState(false);
  const classes = useStyles();
  const keycloakMode = Meteor.settings.public.enableKeycloak === true;
  const [{ user, loadingUser, isMobile }] = useContext(Context);

  const structureLabel = React.useRef(null);
  const [labelStructureWidth, setLabelStructureWidth] = React.useState(0);
  useEffect(() => {
    setLabelStructureWidth(structureLabel.current.offsetWidth);
  }, []);
  const usernameLabel = React.useRef(null);
  const [labelUsernameWidth, setLabelUsernameWidth] = React.useState(0);
  useEffect(() => {
    setLabelUsernameWidth(usernameLabel.current.offsetWidth);
  }, []);

  const checkSubmitOk = () => {
    const errSum = Object.keys(errors).reduce((sum, name) => sum + errors[name], '');
    if (errSum !== '') {
      return false;
    }
    return true;
  };

  const setData = (data, reset = false) => {
    setUserData({
      username: errors.username === '' || reset ? data.username : userData.username,
      structureSelect: data.structure,
      firstName: errors.firstName === '' || reset ? data.firstName || '' : userData.firstName,
      lastName: errors.lastName === '' || reset ? data.lastName || '' : userData.lastName,
      email: errors.email === '' || reset ? data.emails[0].address : userData.email,
    });
    if (reset === true) {
      setErrors(defaultState);
      setSubmitted(false);
    }
  };

  useEffect(() => {
    if (
      submitted
      && userData.firstName === user.firstName
      && userData.lastName === user.lastName
      && userData.email === user.emails[0].address
      && userData.username === user.username
      && userData.structureSelect === user.structure
    ) {
      msg.success(i18n.__('pages.ProfilePage.updateSuccess'));
      setSubmitted(false);
    }
    if (user._id) {
      setData(user);
    }
  }, [user]);

  useEffect(() => {
    setSubmitOk(checkSubmitOk());
  }, [errors]);

  function validateName(name) {
    if (name.trim() !== '') {
      Meteor.call('users.checkUsername', { username: name.trim() }, (err, res) => {
        if (err) {
          msg.error(err.message);
        } else if (res === true) {
          setErrors({ username: '' });
        } else {
          setErrors({ username: i18n.__('pages.ProfilePage.usernameError') });
        }
      });
    }
  }
  const debouncedValidateName = debounce(validateName, 500);

  const resetForm = () => {
    setData(user, true);
  };

  const onUpdateField = (event) => {
    const { name, value } = event.target;
    setUserData({ ...userData, [name]: value });
    if (value.trim() === '') {
      setErrors({ [name]: i18n.__('pages.ProfilePage.valueRequired') });
    } else if (name === 'username') {
      setSubmitOk(false);
      // check for username validity
      debouncedValidateName(value);
    } else {
      setErrors({ [name]: '' });
    }
  };

  const submitUpdateUser = () => {
    setSubmitted(true);
    let modifications = false;
    if (userData.username !== user.username) {
      modifications = true;
      Meteor.call('users.setUsername', { username: userData.username.trim() }, (error) => {
        if (error) {
          msg.error(error.message);
        }
      });
    }
    if (userData.structureSelect !== user.structure) {
      modifications = true;
      Meteor.call('users.setStructure', { structure: userData.structureSelect }, (error) => {
        if (error) {
          msg.error(error.message);
        }
      });
    }
    if (userData.email !== user.emails[0].address) {
      modifications = true;
      Meteor.call('users.setEmail', { email: userData.email.trim() }, (error) => {
        if (error) {
          if (error.error === 'validation-error') {
            setErrors({ email: error.details[0].message });
          } else if (error.message === 'Email already exists. [403]') {
            setErrors({ email: i18n.__('pages.ProfilePage.emailAlreadyExists') });
          } else setErrors({ email: error.message });
        }
      });
    }
    if (userData.firstName !== user.firstName || userData.lastName !== user.lastName) {
      modifications = true;
      Meteor.call(
        'users.setName',
        { firstName: userData.firstName.trim(), lastName: userData.lastName.trim() },
        (error) => {
          if (error) {
            if (error.error === 'validation-error') {
              error.details.forEach((detail) => {
                if (detail.name === 'firstName') {
                  setErrors({ firstName: detail.message });
                } else setErrors({ lastName: detail.message });
              });
            } else {
              msg.error(error.message);
            }
          }
        },
      );
    }
    if (modifications === false) msg.info(i18n.__('pages.ProfilePage.noModifications'));
  };

  const useEmail = () => {
    setUserData({ ...userData, username: userData.email });
    setErrors({ username: '' });
  };
  if (loadingUser) {
    return <Spinner />;
  }

  return (
    <Fade in>
      <Container>
        <Paper className={classes.root}>
          <Typography variant={isMobile ? 'h6' : 'h4'}>{i18n.__('pages.ProfilePage.title')}</Typography>
          <form noValidate autoComplete="off">
            <Grid container className={classes.form} spacing={2}>
              <Grid item>
                <TextField
                  disabled={keycloakMode}
                  autoComplete="fname"
                  id="firstName"
                  label={i18n.__('pages.SignUp.firstNameLabel')}
                  name="firstName"
                  error={errors.firstName !== ''}
                  helperText={errors.firstName}
                  onChange={onUpdateField}
                  fullWidth
                  type="text"
                  value={userData.firstName || ''}
                  variant="outlined"
                />
              </Grid>
              <Grid item>
                <TextField
                  disabled={keycloakMode}
                  id="lastName"
                  autoComplete="lname"
                  label={i18n.__('pages.SignUp.lastNameLabel')}
                  name="lastName"
                  error={errors.lastName !== ''}
                  helperText={errors.lastName}
                  onChange={onUpdateField}
                  fullWidth
                  type="text"
                  value={userData.lastName || ''}
                  variant="outlined"
                />
              </Grid>
              <Grid item>
                <TextField
                  disabled={keycloakMode}
                  margin="normal"
                  id="email"
                  label={i18n.__('pages.SignUp.emailLabel')}
                  name="email"
                  autoComplete="email"
                  error={errors.email !== ''}
                  helperText={errors.email}
                  fullWidth
                  onChange={onUpdateField}
                  type="text"
                  value={userData.email || ''}
                  variant="outlined"
                />
              </Grid>
              {keycloakMode ? (
                <Grid item>
                  <Paper className={classes.keycloakMessage}>
                    <Typography>{i18n.__('pages.ProfilePage.keycloakProcedure')}</Typography>
                  </Paper>
                </Grid>
              ) : null}
              <Grid item>
                <FormControl variant="outlined" fullWidth>
                  <InputLabel error={errors.username !== ''} htmlFor="username" id="username-label" ref={usernameLabel}>
                    {i18n.__('api.users.labels.username')}
                  </InputLabel>
                  <OutlinedInput
                    id="username"
                    name="username"
                    value={userData.username}
                    error={errors.username !== ''}
                    onChange={onUpdateField}
                    labelWidth={labelUsernameWidth}
                    endAdornment={(
                      <InputAdornment position="end">
                        <Tooltip
                          title={i18n.__('pages.ProfilePage.useEmail')}
                          aria-label={i18n.__('pages.ProfilePage.useEmail')}
                        >
                          <IconButton onClick={useEmail}>
                            <MailIcon />
                          </IconButton>
                        </Tooltip>
                      </InputAdornment>
                    )}
                  />
                  <FormHelperText id="username-helper-text" error={errors.username !== ''}>
                    {errors.username}
                  </FormHelperText>
                </FormControl>
              </Grid>
              <Grid item>
                <FormControl variant="outlined" className={classes.formControl} fullWidth>
                  <InputLabel htmlFor="structure" id="structure-label" ref={structureLabel}>
                    {i18n.__('api.users.labels.structure')}
                  </InputLabel>
                  <CustomSelect
                    value={userData.structureSelect || ''}
                    error={false}
                    onChange={onUpdateField}
                    labelWidth={labelStructureWidth}
                    options={structureOptions}
                  />
                </FormControl>
              </Grid>
              <Grid item>
                <LanguageSwitcher relative />
              </Grid>
            </Grid>
            <div className={classes.buttonGroup}>
              <Button variant="contained" disabled={!submitOk} color="primary" onClick={submitUpdateUser}>
                {i18n.__('pages.ProfilePage.update')}
              </Button>
              <Button variant="contained" onClick={resetForm}>
                {i18n.__('pages.ProfilePage.reset')}
              </Button>
            </div>
          </form>
        </Paper>
      </Container>
    </Fade>
  );
};

export default ProfilePage;
