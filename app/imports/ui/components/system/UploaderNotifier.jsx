import React, { useState, useEffect, useContext } from 'react';
import { Alert, AlertTitle } from '@material-ui/lab';
import PropTypes from 'prop-types';
import { Typography, Slide, CircularProgress } from '@material-ui/core';
import i18n from 'meteor/universe:i18n';
import { Context } from '../../contexts/context';
import { fileUpload } from '../../utils/filesProcess';

const { minioFilesTypes, minioFileSize } = Meteor.settings.public;

const checkFile = (file) => {
  let goodFormat = false;
  let goodSize = false;
  minioFilesTypes.forEach((type) => {
    if (file.search(type) > -1) {
      goodFormat = true;
    }
  });
  if (file.length < minioFileSize) {
    goodSize = true;
  }
  return {
    goodFormat,
    goodSize,
  };
};

const UploaderNotifier = () => {
  const [{ uploads }] = useContext(Context);

  if (!uploads.length) {
    return null;
  }
  return (
    <div
      style={{
        position: 'fixed',
        bottom: 5,
        right: 5,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {uploads.map((upload) => (
        <SingleNotification key={upload.fileName} upload={upload} />
      ))}
    </div>
  );
};

const SingleNotification = ({ upload }) => {
  const [, dispatch] = useContext(Context);
  const {
    fileName, path, name, file, onFinish,
  } = upload;
  const [loading, setLoading] = useState(true);
  const [show, setShow] = useState(true);
  const [error, setError] = useState(null);

  const deleteUploadFromQueue = () => {
    setTimeout(() => {
      setShow(false);
      dispatch({
        type: 'uploads.remove',
        data: { fileName },
      });
    }, 5000);
  };

  const uploadFile = () => {
    const { goodFormat, goodSize } = checkFile(file);
    if (!goodSize) {
      setError('size');
      setError({
        title: i18n.__('components.UploaderNotifier.fileTooLargeTitle'),
        message: `${i18n.__('components.UploaderNotifier.fileTooLarge')} ${minioFileSize / 1000000}Mo`,
      });
      deleteUploadFromQueue();
    } else if (!goodFormat) {
      setError({
        title: i18n.__('components.UploaderNotifier.formatNotAcceptedTitle'),
        message: `
        ${i18n.__('components.UploaderNotifier.formatNotAccepted')} 
        ${JSON.stringify(minioFilesTypes)
    .replace(/"/g, '')
    .replace(/,/g, ', ')}`,
      });
      deleteUploadFromQueue();
    } else {
      fileUpload({ name: fileName, path, file }, (url, err) => {
        if (url) {
          setLoading(false);
          onFinish(url);
        } else if (err) {
          setError({
            title: i18n.__('components.UploaderNotifier.errorTitle'),
            message: err.reason,
          });
          onFinish(url, err);
        }
        deleteUploadFromQueue();
      });
    }
  };

  useEffect(() => {
    uploadFile();
  }, []);

  let severity = 'info';
  let title = i18n.__('components.UploaderNotifier.uploadInProgress');
  let message = name;

  if (!loading) {
    severity = 'success';
    title = i18n.__('components.UploaderNotifier.uploadFinished');
    message = name;
  } else if (error) {
    severity = 'error';
    title = error.title;
    message = error.message;
  }

  return (
    <Slide direction="left" key={fileName} in={show}>
      <Alert
        elevation={5}
        severity={severity}
        style={{ marginTop: 5 }}
        action={!loading || error ? null : <CircularProgress />}
      >
        <AlertTitle>
          <Typography variant="h6">{title}</Typography>
        </AlertTitle>
        {message}
      </Alert>
    </Slide>
  );
};

SingleNotification.propTypes = {
  upload: PropTypes.objectOf(PropTypes.any).isRequired,
};

export default UploaderNotifier;
