import React from 'react';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import OutlinedInput from '@material-ui/core/OutlinedInput';
import InputAdornment from '@material-ui/core/InputAdornment';
import IconButton from '@material-ui/core/IconButton';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import InputLabel from '@material-ui/core/InputLabel';
import { useHistory } from 'react-router-dom';

const useStyles = makeStyles((theme) => ({
  '@global': {
    body: {
      backgroundColor: theme.palette.common.white,
    },
  },
  paper: {
    marginTop: theme.spacing(8),
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
    marginTop: theme.spacing(3),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
}));

export default function SignUp() {
  const history = useHistory();
  const classes = useStyles();
  const [values, setValues] = React.useState({
    amount: '',
    password: '',
    weight: '',
    weightRange: '',
    showPassword: false,
  });
  const [structure, setStructure] = React.useState('');

  const inputLabel = React.useRef(null);
  const [labelWidth, setLabelWidth] = React.useState(0);
  React.useEffect(() => {
    setLabelWidth(inputLabel.current.offsetWidth);
  }, []);

  const handleChangeStruct = (event) => {
    setStructure(event.target.value);
  };

  const handleChange = (prop) => (event) => {
    setValues({ ...values, [prop]: event.target.value });
  };

  const handleClickShowPassword = () => {
    setValues({ ...values, showPassword: !values.showPassword });
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const submit = (event) => {
    event.preventDefault();
    history.push('/Home');
  };

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <div className={classes.paper}>
        <Avatar className={classes.avatar}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Création de votre compte
        </Typography>
        <form onSubmit={submit} className={classes.form} noValidate>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                autoComplete="fname"
                name="firstName"
                variant="outlined"
                required
                fullWidth
                id="firstName"
                label="Prénom"
                autoFocus
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                variant="outlined"
                required
                fullWidth
                id="lastName"
                label="Nom"
                name="lastName"
                autoComplete="lname"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                variant="outlined"
                required
                fullWidth
                id="email"
                label="Courriel"
                name="email"
                autoComplete="email"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                variant="outlined"
                required
                fullWidth
                id="username"
                label="Identifiant"
                name="username"
                autoComplete="username"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl variant="outlined" fullWidth required>
                <InputLabel htmlFor="outlined-adornment-password">Mot de passe</InputLabel>
                <OutlinedInput
                  id="outlined-adornment-password"
                  type={values.showPassword ? 'text' : 'password'}
                  value={values.password}
                  labelWidth={100}
                  onChange={handleChange('password')}
                  endAdornment={(
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="afficher ou masquer le mot de passe"
                        onClick={handleClickShowPassword}
                        onMouseDown={handleMouseDownPassword}
                      >
                        {values.showPassword ? <Visibility /> : <VisibilityOff />}
                      </IconButton>
                    </InputAdornment>
                  )}
                />
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl variant="outlined" className={classes.formControl} fullWidth>
                <InputLabel ref={inputLabel} id="demo-simple-select-outlined-label">
                  Structure de rattachement
                </InputLabel>
                <Select
                  labelId="demo-simple-select-outlined-label"
                  id="demo-simple-select-outlined"
                  value={structure}
                  onChange={handleChangeStruct}
                  labelWidth={labelWidth}
                >
                  <MenuItem value="">
                    <em>Aucune</em>
                  </MenuItem>
                  <MenuItem value="Ministère Education">Ministére Education</MenuItem>
                  <MenuItem value="Education">Education</MenuItem>
                  <MenuItem value="Auvergne-Rhône-Alpes">Région académique Auvergne-Rhône-Alpes</MenuItem>
                  <MenuItem value="Bourgogne-Franche-Comté">Région académique Bourgogne-Franche-Comté</MenuItem>
                  <MenuItem value="Bretagne">Région académique Bretagne</MenuItem>
                  <MenuItem value="Centre-Val de Loire">Région académique Centre-Val de Loire</MenuItem>
                  <MenuItem value="Corse">Région académique de Corse</MenuItem>
                  <MenuItem value="Grand Est">Région académique Grand Est</MenuItem>
                  <MenuItem value="Guadeloupe">Région académique de la Guadeloupe</MenuItem>
                  <MenuItem value="Guyane">Région académique de la Guyane</MenuItem>
                  <MenuItem value="Hauts-de-France">Région académique Hauts-de-France</MenuItem>
                  <MenuItem value="Île-de-France">Région académique Île-de-France</MenuItem>
                  <MenuItem value="Martinique">Région académique de Martinique</MenuItem>
                  <MenuItem value="Normandie">Région académique Normandie</MenuItem>
                  <MenuItem value="Nouvelle-Aquitaine">Région académique Nouvelle-Aquitaine</MenuItem>
                  <MenuItem value="Occitanie">Région académique Occitanie</MenuItem>
                  <MenuItem value="Pays de la Loire">Région académique Pays de la Loire</MenuItem>
                  <MenuItem value="Provence-Alpes-Côte d'Azur">
                    Région académique Provence-Alpes-Côte d&apos;Azur
                  </MenuItem>
                  <MenuItem value="La Réunion">Région académique de La Réunion</MenuItem>
                  <MenuItem value="Collectivité">Collectivité</MenuItem>
                  <MenuItem value="Autre">Autre</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Button type="submit" fullWidth variant="contained" color="primary" className={classes.submit}>
              Inscription
            </Button>
          </Grid>
        </form>
      </div>
    </Container>
  );
}
