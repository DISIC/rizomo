import React from 'react';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import List from '@material-ui/core/List';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import GroupIcon from '@material-ui/icons/Group';
import ExtensionIcon from '@material-ui/icons/Extension';
import PropTypes from 'prop-types';
import { Link as RouterLink } from 'react-router-dom';

function ListItemLink(props) {
  const { icon, primary, to } = props;

  const renderLink = React.useMemo(
    () => React.forwardRef((itemProps, ref) => <RouterLink to={to} ref={ref} {...itemProps} />),
    [to],
  );

  return (
    <li>
      <ListItem button component={renderLink}>
        {icon ? <ListItemIcon>{icon}</ListItemIcon> : null}
        <ListItemText primary={primary} />
      </ListItem>
    </li>
  );
}

ListItemLink.propTypes = {
  icon: PropTypes.element.isRequired,
  primary: PropTypes.string.isRequired,
  to: PropTypes.string.isRequired,
};

const drawerWidth = 240;
const useStyles = makeStyles((theme) => ({
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
  },
  drawerPaper: {
    width: drawerWidth,
  },
  drawerHeader: {
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(0, 1),
    ...theme.mixins.toolbar,
    justifyContent: 'flex-end',
  },
}));

export default function LeftDrawer({ drawerOpen, setDrawerOpen }) {
  const classes = useStyles();
  const theme = useTheme();

  const handleDrawerClose = () => {
    setDrawerOpen(false);
  };

  return (
    <Drawer
      className={classes.drawer}
      variant="persistent"
      anchor="left"
      open={drawerOpen}
      classes={{
        paper: classes.drawerPaper,
      }}
    >
      <div className={classes.drawerHeader}>
        <IconButton onClick={handleDrawerClose}>
          {theme.direction === 'ltr' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
        </IconButton>
      </div>
      <Divider />
      <List>
        <ListItemLink to="/services" primary="Mes Services" icon={<ExtensionIcon />} />
        <ListItemLink to="/groups" primary="Mes Groupes" icon={<GroupIcon />} />
      </List>
    </Drawer>
  );
}

LeftDrawer.propTypes = {
  setDrawerOpen: PropTypes.func.isRequired,
  drawerOpen: PropTypes.bool.isRequired,
};
