/* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
import React from 'react';
import { makeStyles, Typography } from '@material-ui/core';
import DescriptionIcon from '@material-ui/icons/Description';
import PropTypes from 'prop-types';

const {
  minioEndPoint, minioPort, minioBucket, minioSSL,
} = Meteor.settings.public;

const HOST = `http${minioSSL ? 's' : ''}://${minioEndPoint}${minioPort ? `:${minioPort}` : ''}/${minioBucket}/`;

const PICTURES_TYPES = ['svg', 'png', 'jpg', 'gif', 'jpeg'];

const useStyles = makeStyles((theme) => ({
  singleFile: {
    boxShadow: '0px 0px 5px 0px rgba(0,0,0,0.75)',
    borderRadius: theme.shape.borderRadius,
    padding: theme.spacing(1),
    backgroundColor: theme.palette.background.paper,
    cursor: 'pointer',
    width: '100%',
    height: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
    wordBreak: 'break-all',
    position: 'relative',
    overflow: 'hidden',
  },
  image: { position: 'absolute', height: '100%' },
}));

const SingleStorageFile = ({ file, onSelect }) => {
  const classes = useStyles();
  const extension = file.name.split('.').pop();
  const isNotPictures = !PICTURES_TYPES.find((ext) => ext === extension);
  const fileName = file.name.replace(`users/${Meteor.userId()}/`, '');

  const selectCurrent = () => onSelect(file);

  return (
    <div className={classes.singleFile} onClick={selectCurrent}>
      {isNotPictures ? (
        <>
          <DescriptionIcon style={{ fontSize: '8rem' }} color="primary" />
          <Typography>{fileName}</Typography>
        </>
      ) : (
        <img alt={file.name} className={classes.image} src={`${HOST}${file.name}`} />
      )}
    </div>
  );
};

export default SingleStorageFile;

SingleStorageFile.propTypes = {
  onSelect: PropTypes.func.isRequired,
  file: PropTypes.objectOf(PropTypes.any).isRequired,
};
