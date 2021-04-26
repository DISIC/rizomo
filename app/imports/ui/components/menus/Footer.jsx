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
          return isMobile ? (
            <li key={key} className={classes.li}>
              {external ? (
                <a className={classes.mobileLink} href={link} target="_blank" rel="noreferrer noopener">
                  {i18n.__(`components.Footer.${text}`)}
                </a>
              ) : (
                <Link className={classes.mobileLink} to={`/legal/${link}`}>
                  {i18n.__(`components.Footer.${text}`)}
                </Link>
              )}
            </li>
          ) : external ? (
            <a key={key} className={classes.link} href={link} target="_blank" rel="noreferrer noopener">
              {i18n.__(`components.Footer.${text}`)}
            </a>
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
    return isMobile ? (
      <li key="blogLinkKey" className={classes.li}>
        {externalBlog === '' ? (
          <Link className={classes.link} to="/public">
            Publications
          </Link>
        ) : (
          <a href={externalBlog} className={classes.blog} target="_blank" rel="noreferrer noopener">
            Publications
          </a>
        )}
      </li>
    ) : externalBlog === '' ? (
      <Link key="blogLinkKey" className={classes.link} to="/public">
        Publications
      </Link>
    ) : (
      <a key="blogLinkKey" href={externalBlog} className={classes.blog} target="_blank" rel="noreferrer noopener">
        Publications
      </a>
    );
  };

  useEffect(() => {
    let isCancelled = false;
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
      if (!isCancelled) setSettingsData(appsettings);
    });
    return () => {
      // fix to avoid modifying component after unmounting
      // see : https://stackoverflow.com/questions/56442582/react-hooks-cant-perform-a-react-state-update-on-an-unmounted-component/56443045#56443045
      isCancelled = true;
    };
  }, []);

  return (
    <AppBar position="relative">
      {isMobile ? (
        <Toolbar className={classes.root}>
          <ul>
            {toolbarContent()}
            <li key="contactKey" className={classes.li}>
              <Link className={classes.link} to="/contact">
                {i18n.__(`components.Footer.contact`)}
              </Link>
            </li>
            {blogLink()}
          </ul>
        </Toolbar>
      ) : (
        <Toolbar className={classes.root}>
          <div>{toolbarContent()}</div>
          <div>
            <Link key="contactKey" className={classes.link} to="/contact">
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
