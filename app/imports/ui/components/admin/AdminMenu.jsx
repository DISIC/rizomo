import * as React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import i18n from 'meteor/universe:i18n';
import Box from '@material-ui/core/Box';
import List from '@material-ui/core/List';
import PeopleAltIcon from '@material-ui/icons/People';
import GroupWorkIcon from '@material-ui/icons/GroupWork';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import PersonAddIcon from '@material-ui/icons/PersonAdd';
import HttpIcon from '@material-ui/icons/Http';
import LocalOfferIcon from '@material-ui/icons/LocalOffer';
import SettingsInputComponentIcon from '@material-ui/icons/SettingsInputComponent';
import SettingsIcon from '@material-ui/icons/Settings';
import CategoryIcon from '@material-ui/icons/Category';
import HomeIcon from '@material-ui/icons/Home';
import Drawer from '@material-ui/core/Drawer';
import Typography from '@material-ui/core/Typography';
import Toolbar from '@material-ui/core/Toolbar';
import Divider from '@material-ui/core/Divider';
import updateDocumentTitle from '../../utils/updateDocumentTitle';
import { useHistory, useLocation } from 'react-router';

export const adminMenu = [
  {
    path: '/admin/groups',
    content: 'menuAdminGroups',
    icon: <GroupWorkIcon />
  },
  {
    path: '/admin/services',
    content: 'menuAdminServices',
    icon: <SettingsInputComponentIcon/>
  },
  {
    path: '/admin/categories',
    content: 'menuAdminCategories',
    icon: <CategoryIcon/>
  },
  {
    path: '/admin/tags',
    content: 'menuAdminTags',
    icon: <LocalOfferIcon/>
  },
  {
    path: '/admin/users',
    content: 'menuAdminUsers',
    icon: <PeopleAltIcon/>
  },
  {
    path: '/admin/usersvalidation',
    content: 'menuAdminUserValidation',
    icon: <PersonAddIcon/>
  },
  {
    path: '/admin/nextcloudurl',
    content: 'menuAdminNextcloudUrl',
    icon: <HttpIcon/>
  },
  {
    path: '/admin/settings',
    content: 'menuAdminAppSettings',
    icon: <SettingsIcon/>
  },
  {
    path: 'adminDivider',
    content: 'Divider',
  },
  {
    path: '/',
    content: 'menuAdminBackHome',
    icon: <HomeIcon/>
  },
];

// CSS
const useStyles = (isMobile) =>
  makeStyles((theme) => ({
    drawer: {
      width: isMobile ? 65 : 300,
      overflowX: "hidden",
      '& *': {
        overflowX: "hidden" 
      },
      '& .MuiDrawer-paper': {
        marginTop: 48,
        width: isMobile ? 65 : 300,
        zIndex: 0,
      }
    },
  }));

export default function AdminMenu({ isMobile }) {
  const classes = useStyles(isMobile)();
  const { pathname } = useLocation()
  const history = useHistory()

  const handleMenuClick = (item) => {
    updateDocumentTitle(i18n.__(`components.MainMenu.${item.content}`));
    history.push(item.path);
  };

  return (
    <Drawer
    variant="permanent"
    className={classes.drawer}
  >
    {!isMobile && <Toolbar >
      <Typography variant='h6'>{i18n.__('components.AdminMenu.title')}</Typography>
    </Toolbar>}
    <Box sx={{ overflow: 'auto' }}>
      <List>
        {adminMenu.map(({ content, path, icon }) => content === 'Divider' ? (
            <Divider key={path} />
          ) : (
          <ListItem 
            onClick={() => handleMenuClick({ content, path })} 
            button 
            key={content}
            selected={pathname === path}
          >
            <ListItemIcon>
              {icon}
            </ListItemIcon>
            {!isMobile && 
            <ListItemText primary={i18n.__(`components.AdminMenu.${content}`)} />
            }
          </ListItem>
        ))}
      </List>
    </Box>
  </Drawer>
  );
}