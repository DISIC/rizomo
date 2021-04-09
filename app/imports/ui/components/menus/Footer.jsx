import { Meteor } from 'meteor/meteor';
import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Toolbar from '@material-ui/core/Toolbar';
import { Link } from 'react-router-dom';
import AppBar from '@material-ui/core/AppBar';
import i18n from 'meteor/universe:i18n';
import { useAppContext } from '../../contexts/context';
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
  mobileLink: {
    flexDirection: 'column',
    color: theme.palette.tertiary.main,
    textDecoration: 'none',
    outline: 'none',
    marginRight: 25,
    fontFamily: 'WorkSansBold',
  },
  blog: {
    color: theme.palette.tertiary.main,
    fontFamily: 'WorkSansBold',
  },
  li: {
    listStyle: 'none',
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
  const [{ isMobile }] = useAppContext();
  const externalBlog = Meteor.settings.public.laboiteBlogURL;

  const toolbarContent = () => {
    return (
      <>
        {settingsData.map(({ key, external, link, text }) => {
          if (external) {
            return (
              <a key={key} href={link} target="_blank" rel="noreferrer noopener">
                {i18n.__(`components.Footer.${text}`)}
              </a>
            );
          }
          return isMobile ? (
            <li className={classes.li}>
              <Link key={key} className={classes.mobileLink} to={`/legal/${link}`}>
                {i18n.__(`components.Footer.${text}`)}
              </Link>
            </li>
          ) : (
            <Link key={key} className={classes.link} to={`/legal/${link}`}>
              {i18n.__(`components.Footer.${text}`)}
            </Link>
          );
        })}
      </>
    );
  };

  const blogLink = () => {
    return externalBlog === '' ? (
      <Link className={classes.link} to="/public">
        Publications
      </Link>
    ) : (
      <a href={externalBlog} className={classes.blog} target="_blank" rel="noreferrer noopener">
        Publications
      </a>
    );
  };

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
      {isMobile ? (
        <Toolbar className={classes.root}>
          <ul>
            {toolbarContent()}
            <Link className={classes.link} to="/contact">
              {i18n.__(`components.Footer.contact`)}
            </Link>
            <li className={classes.li}>{blogLink()}</li>
          </ul>
        </Toolbar>
      ) : (
        <Toolbar className={classes.root}>
          <div>{toolbarContent()}</div>
          <div>
            <Link className={classes.link} to="/contact">
              {i18n.__(`components.Footer.contact`)}
            </Link>
            {blogLink()}
          </div>
        </Toolbar>
      )}
    </AppBar>
  );
};
export default Footer;
