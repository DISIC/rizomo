import React, { useState, useEffect, useContext } from 'react';
import { Alert, AlertTitle } from '@material-ui/lab';
import PropTypes from 'prop-types';
import { Typography, Slide, CircularProgress } from '@material-ui/core';
import i18n from 'meteor/universe:i18n';
import { Context } from '../../contexts/context';
import { fileUpload, storageToSize } from '../../utils/filesProcess';

const {
  minioFilesTypes,
  minioFileSize,
  minioStorageFilesTypes,
  minioStorageFilesSize,
  maxMinioDiskPerUser,
} = Meteor.settings.public;

const checkFile = (file, storage) => {
  const types = storage ? minioStorageFilesTypes : minioFilesTypes;
  const sizes = storage ? minioStorageFilesSize : minioFileSize;
  let goodFormat = false;
  let goodSize = false;
  types.forEach((type) => {
    if (file.search(type) > -1) {
      goodFormat = true;
    }
  });
  if (file.length < sizes) {
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

const testStorageSize = (size) => new Promise((resolve) => Meteor.call('files.user', {}, (err, files) => {
  const storageSize = files.reduce((sum, file) => sum + file.size, 0) + size;
  if (storageSize >= maxMinioDiskPerUser) {
    resolve(true);
  } else {
    resolve(false);
  }
}));

const SingleNotification = ({ upload }) => {
  const [, dispatch] = useContext(Context);
  const {
    fileName, path, name, file, onFinish, storage,
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

  const uploadFile = async () => {
    const { goodFormat, goodSize } = checkFile(file, storage);
    let isStorageFull = false;
    if (storage) {
      isStorageFull = await testStorageSize(file.length);
    }
    if (isStorageFull) {
      setError({
        title: i18n.__('components.UploaderNotifier.storageFullTitle'),
        message: `${i18n.__('components.UploaderNotifier.storageFull')} ${storageToSize(maxMinioDiskPerUser)}`,
      });
      deleteUploadFromQueue();
    } else if (!goodSize) {
      setError({
        title: i18n.__('components.UploaderNotifier.fileTooLargeTitle'),
        message: `${i18n.__('components.UploaderNotifier.fileTooLarge')} ${storageToSize(minioFileSize)}`,
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
