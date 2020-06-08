import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Toolbar from '@material-ui/core/Toolbar';
import { Link } from 'react-router-dom';
import { AppBar } from '@material-ui/core';
import i18n from 'meteor/universe:i18n';
import { getAppSettingsLinks } from '../../../api/appsettings/methods';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  link: {
    color: theme.palette.tertiary.main,
    textDecoration: 'none',
    outline: 'none',
    marginRight: 25,
    fontFamily: 'WorkSansBold',
  },
}));

export const LEGAL_ROUTES = {
  legal: 'legalnotice',
  personalData: 'personal-data',
  accessibility: 'accessibility',
  gcu: 'conditions',
};

const Footer = () => {
  const classes = useStyles();
  const [settingsData, setSettingsData] = useState([]);
  useEffect(() => {
    getAppSettingsLinks.call(null, (error, result) => {
      const newData = { ...result };
      delete newData._id;
      const keys = Object.keys(newData);
      const appsettings = keys.map((key) => ({
        key,
        external: newData[key].external,
        link: newData[key].external ? newData[key].link : LEGAL_ROUTES[key],
        text: key,
      }));
      setSettingsData(appsettings);
    });
  }, []);

  return (
    <AppBar position="relative">
      <Toolbar className={classes.root}>
        <div>
          {settingsData.map(({ key, external, link, text }) => {
            if (external) {
              return (
                <a key={key} className={classes.link} href={link} target="_blank" rel="noreferrer noopener">
                  {i18n.__(`components.Footer.${text}`)}
                </a>
              );
            }
            return (
              <Link key={key} className={classes.link} to={`/legal/${link}`}>
                {i18n.__(`components.Footer.${text}`)}
              </Link>
            );
          })}
        </div>
        <Link className={classes.link} to="/public">
          Publications
        </Link>
      </Toolbar>
    </AppBar>
  );
};
export default Footer;
