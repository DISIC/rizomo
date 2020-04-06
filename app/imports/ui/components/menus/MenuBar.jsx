import React from 'react';
import i18n from 'meteor/universe:i18n';
import { useLocation, useHistory } from 'react-router-dom';
import { Tabs, Tab, makeStyles } from '@material-ui/core';
import { PropTypes } from 'prop-types';
import GroupIcon from '@material-ui/icons/Group';
import HomeIcon from '@material-ui/icons/Home';
import SearchIcon from '@material-ui/icons/Search';
import DescriptionIcon from '@material-ui/icons/Description';

export const links = [
  {
    path: '/',
    content: 'menuMyspace',
    contentMobile: 'menuMyspaceMobile',
    icon: <HomeIcon />,
    admin: false,
  },
  {
    path: '/groups',
    content: 'menuGroupes',
    contentMobile: 'menuGroupesMobile',
    icon: <GroupIcon />,
    admin: false,
  },
  {
    path: '/services',
    content: 'menuServices',
    icon: <SearchIcon />,
    admin: false,
  },
  {
    path: '/publications',
    content: 'menuPublications',
    icon: <DescriptionIcon />,
    admin: false,
  },
];

const useStyles = (mobile) => makeStyles((theme) => ({
  tabs: {
    color: theme.palette.text.primary,
  },
  mobileTabs: {
    textTransform: 'none',
  },
  flexContainer: {
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  indicator: {
    top: mobile ? 0 : null,
    height: 3,
    borderTopLeftRadius: mobile ? 0 : theme.shape.borderRadius,
    borderTopRightRadius: mobile ? 0 : theme.shape.borderRadius,
    borderBottomLeftRadius: !mobile ? 0 : theme.shape.borderRadius,
    borderBottomRightRadius: !mobile ? 0 : theme.shape.borderRadius,
  },
}));

const MenuBar = ({ mobile }) => {
  const { pathname } = useLocation();
  const history = useHistory();
  const classes = useStyles(mobile)();
  const T = i18n.createComponent('components.MenuBar');
  const currentLink = links.find((link) => {
    if (link.path === pathname || (pathname.search(link.path) > -1 && link.path !== '/')) {
      return true;
    }
    return false;
  });

  return (
    <Tabs
      className={classes.tabs}
      classes={{
        flexContainer: classes.flexContainer,
        indicator: classes.indicator,
      }}
      value={currentLink ? currentLink.path : false}
      indicatorColor="secondary"
      textColor="primary"
      aria-label="menu links"
      centered
    >
      {links.map((link) => (
        <Tab
          key={link.path}
          value={link.path}
          disableFocusRipple={mobile}
          disableRipple={mobile}
          className={mobile ? classes.mobileTabs : null}
          icon={mobile ? link.icon : undefined}
          label={<T>{link.contentMobile || link.content}</T>}
          onClick={() => history.push(link.path)}
        />
      ))}
    </Tabs>
  );
};

export default MenuBar;

MenuBar.propTypes = {
  mobile: PropTypes.bool,
};

MenuBar.defaultProps = {
  mobile: false,
};
