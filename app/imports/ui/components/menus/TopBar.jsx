import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import MenuBar from './MenuBar';
import MainMenu from './MainMenu';
import { Context } from '../../contexts/context';

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
const LONG_LOGO = 'Logo-appseducation.png';

function TopBar({ publicMenu }) {
  const [{ isMobile, user }] = useContext(Context);
  const classes = useStyles();
  const LOGO = `/images/${isMobile ? SMALL_LOGO : LONG_LOGO}`;

  return (
    <AppBar position="fixed" className={classes.root}>
      <Link to={publicMenu ? '/public' : '/'} className={classes.imgLogo}>
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
};

TopBar.defaultProps = {
  publicMenu: false,
};
