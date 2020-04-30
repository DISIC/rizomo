import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import MenuBar from './MenuBar';
import MainMenu from './MainMenu';
import { useAppContext } from '../../contexts/context';

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.tertiary.main,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    minHeight: 48,
  },
  imgLogo: {
    maxHeight: '30px',
    height: 30,
    outline: 'none',
  },
  grow: {
    flexGrow: 1,
  },
  toolbar: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  rightContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItem: 'center',
  },
}));

const SMALL_LOGO = 'Logo-A.svg';
const LONG_LOGO = 'apps-logo-sansfond.svg';

function TopBar({ publicMenu, root }) {
  const [{ isMobile, user }] = useAppContext();
  const classes = useStyles();
  const LOGO = `/images/${isMobile ? SMALL_LOGO : LONG_LOGO}`;

  return (
    <AppBar position="fixed" className={classes.root}>
      <Link to={root || (publicMenu ? '/public' : '/')} className={classes.imgLogo}>
        <img src={LOGO} className={classes.imgLogo} alt="Logo" />
      </Link>

      {!isMobile && !publicMenu && <MenuBar />}
      <div className={classes.rightContainer}>{!publicMenu && <MainMenu user={user} />}</div>
    </AppBar>
  );
}

export default TopBar;

TopBar.propTypes = {
  publicMenu: PropTypes.bool,
  root: PropTypes.string,
};

TopBar.defaultProps = {
  publicMenu: false,
  root: null,
};
