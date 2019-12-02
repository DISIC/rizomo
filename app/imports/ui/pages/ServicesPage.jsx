import React from 'react';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Typography from '@material-ui/core/Typography';
import Card from '@material-ui/core/Card';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import PropTypes from 'prop-types';
import SwipeableViews from 'react-swipeable-views';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Fab from '@material-ui/core/Fab';
import Box from '@material-ui/core/Box';
import FavoriteIcon from '@material-ui/icons/Favorite';
import Tooltip from '@material-ui/core/Tooltip';
// -- Beginning Choice List --\\

function TabPanel(props) {
  const {
    children, value, index, ...other
  } = props;

  return (
    <Typography
      component="div"
      role="tabpanel"
      hidden={value !== index}
      id={`action-tabpanel-${index}`}
      aria-labelledby={`action-tab-${index}`}
      {...other}
    >
      <Box p={3}>{children}</Box>
    </Typography>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.any.isRequired,
  value: PropTypes.any.isRequired,
};

function a11yProps(index) {
  return {
    id: `action-tab-${index}`,
    'aria-controls': `action-tabpanel-${index}`,
  };
}

// Numbers of elements (datas)

// My personnal tools
const Mycards = [1, 2, 3];

// All my tools
const Allcards = [1, 2, 3, 4, 5, 6, 7, 8, 9];

export default function ServicesPage(props) {
  const classes = useStyles();
  const theme = useTheme();

  // -- Beginning function header --\\

  const [value, setValue] = React.useState(0);

  // Transition when choose between choices

  const handleChangeValue = (event, newValue) => {
    setValue(newValue);
  };

  // -- End function switch --\\

  const handleChangeIndex = (index) => {
    setValue(index);
  };

  return (
    <>
      {/* Hero unit */}
      <div className={classes.heroContent}>
        <Container>
          <Typography component="h4" variant="h4" align="left" color="textPrimary" gutterBottom>
            Bonjour Alexis
          </Typography>
        </Container>
      </div>
      <AppBar className={classes.AppChoice} position="static" color="default">
        <Tabs
          value={value}
          onChange={handleChangeValue}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
          aria-label="action tabs example"
        >
          <Tab label="Mes services" {...a11yProps(0)} />
          <Tab label="Tous mes services" {...a11yProps(1)} />
        </Tabs>
      </AppBar>
      <SwipeableViews
        axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
        index={value}
        onChangeIndex={handleChangeIndex}
      >
        <TabPanel value={value} index={0} dir={theme.direction}>
          <Container className={classes.cardGrid} maxWidth="md">
            {/* End hero unit */}
            <Grid container spacing={4}>
              {Mycards.map((card) => (
                <Grid item key={card} xs={12} sm={6} md={4}>
                  <Card className={classes.card}>
                    <CardMedia
                      className={classes.cardMedia}
                      image="https://source.unsplash.com/random"
                      title="Image title"
                    />
                    <CardContent className={classes.cardContent}>
                      <Typography gutterBottom variant="h5" component="h2">
                        Heading
                      </Typography>
                      <Typography>This is a media card. You can use this section to describe the content.</Typography>
                    </CardContent>
                    <CardActions className={classes.cardActions}>
                      <Tooltip title="Ajouter à vos favoris" aria-label="like">
                        <Fab size="small" className={classes.fab}>
                          <FavoriteIcon />
                        </Fab>
                      </Tooltip>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Container>
        </TabPanel>
        <TabPanel value={value} index={1} dir={theme.direction}>
          <Container className={classes.cardGrid} maxWidth="md">
            {/* End hero unit */}
            <Grid container spacing={4}>
              {Allcards.map((card) => (
                <Grid item key={card} xs={12} sm={6} md={4}>
                  <Card className={classes.card}>
                    <CardMedia
                      className={classes.cardMedia}
                      image="https://source.unsplash.com/random"
                      title="Image title"
                    />
                    <CardContent className={classes.cardContent}>
                      <Typography gutterBottom variant="h5" component="h2">
                        Heading
                      </Typography>
                      <Typography>This is a media card. You can use this section to describe the content.</Typography>
                    </CardContent>
                    <CardActions className={classes.cardActions}>
                      <Tooltip title="Ajouter à vos favoris" aria-label="like">
                        <Fab size="small" className={classes.fab}>
                          <FavoriteIcon />
                        </Fab>
                      </Tooltip>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Container>
        </TabPanel>
      </SwipeableViews>
    </>
  );
}

const useStyles = makeStyles((theme) => ({
  AppChoice: {
    display: 'flex',
    alignSelf: 'center',
    justifyContent: 'center',
    width: '100%',
    zIndex: 0,
  },
  cardActions: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  heroContent: {
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(8, 0, 8),
  },
  heroButtons: {
    marginTop: theme.spacing(4),
  },
  cardGrid: {
    paddingTop: theme.spacing(8),
    paddingBottom: theme.spacing(8),
  },
  card: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  cardMedia: {
    paddingTop: '56.25%', // 16:9
  },
  cardContent: {
    flexGrow: 1,
  },
  fab: {
    '&:hover': {
      // backgroundColor: "red",
      color: 'red',
    },
  },
}));
