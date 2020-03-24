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
}));

const defaultState = {
  username: '',
  structureSelect: '',
};

const ProfilePage = () => {
  const [userData, setUserData] = useState(defaultState);
  const [nameChecked, setNameChecked] = useState(true);
  const [nameError, setNameError] = useState(false);
  const classes = useStyles();

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

  const setData = (data) => {
    setUserData({ username: data.username, structureSelect: data.structure });
  };

  useEffect(() => {
    if (user._id) {
      setData(user);
    }
  }, [user]);

  useEffect(() => {
    if (userData.username === user.username && userData.structureSelect === user.structure) setNameChecked(false);
  }, [userData]);

  function validateName(name) {
    if (name.trim() !== '') {
      Meteor.call('users.checkUsername', { username: name.trim() }, (err, res) => {
        if (err) {
          msg.error(err.message);
        } else if (res === true) {
          setNameChecked(true);
        } else {
          setNameError(true);
        }
      });
    }
  }
  const debouncedValidateName = debounce(validateName, 500);

  const resetForm = () => {
    setData(user);
  };

  const onUpdateField = (event) => {
    const { name, value } = event.target;
    if (name === 'username') {
      setNameChecked(false);
      setNameError(false);
      setUserData({ ...userData, [name]: value });
      // check for username validity
      debouncedValidateName(value);
    } else {
      if (nameError === false) setNameChecked(true);
      setUserData({ ...userData, [name]: value });
    }
  };

  const submitUpdateUser = () => {
    let errors = false;
    if (userData.username !== user.username) {
      Meteor.call('users.setUsername', { username: userData.username.trim() }, (error) => {
        if (error) {
          msg.error(error.message);
          errors = true;
        }
      });
    }
    if (userData.structureSelect !== user.structure) {
      Meteor.call('users.setStructure', { structure: userData.structureSelect }, (error) => {
        if (error) {
          msg.error(error.message);
          errors = true;
        }
      });
    }
    if (!errors) msg.success(i18n.__('api.methods.operationSuccessMsg'));
  };

  const useEmail = () => {
    const email = user.primaryEmail || user.emails[0].address;
    setUserData({ ...userData, username: email });
    setNameError(false);
    setNameChecked(true);
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
                <FormControl variant="outlined" fullWidth>
                  <InputLabel error={nameError} htmlFor="username" id="username-label" ref={usernameLabel}>
                    {i18n.__('api.users.labels.username')}
                  </InputLabel>
                  <OutlinedInput
                    id="username"
                    name="username"
                    value={userData.username}
                    error={nameError}
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
                  <FormHelperText id="username-helper-text" error={nameError}>
                    {nameError ? i18n.__('pages.ProfilePage.nameError') : null}
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
              <Button variant="contained" disabled={!nameChecked} color="primary" onClick={submitUpdateUser}>
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
