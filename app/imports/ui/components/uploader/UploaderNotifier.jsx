import React, { useState, useEffect } from 'react';
import Alert from '@material-ui/lab/Alert';
import AlertTitle from '@material-ui/lab/AlertTitle';
import PropTypes from 'prop-types';
import { Meteor } from 'meteor/meteor';
import Typography from '@material-ui/core/Typography';
import Slide from '@material-ui/core/Slide';
import CircularProgress from '@material-ui/core/CircularProgress';

import i18n from 'meteor/universe:i18n';
import { useAppContext } from '../../contexts/context';
import { fileUpload, storageToSize } from '../../utils/filesProcess';

const { minioFileSize, minioStorageFilesSize, maxMinioDiskPerUser } = Meteor.settings.public;
// minionFileSize : maximum file size when uploading services images in admin space
// minioStorageFilesSize : maximum file size when uploading media in user space

const fileTypes = [
  ...Meteor.settings.public.imageFilesTypes,
  ...Meteor.settings.public.audioFilesTypes,
  ...Meteor.settings.public.videoFilesTypes,
  ...Meteor.settings.public.textFilesTypes,
  ...Meteor.settings.public.otherFilesTypes,
];

const checkFile = (file, storage, extension) => {
  // if not storage: admin upload for services images
  // if storage: user media upload
  const types = storage ? fileTypes : Meteor.settings.public.imageFilesTypes;
  const sizes = storage ? minioStorageFilesSize : minioFileSize;
  const goodFormat = types.includes(extension);
  const goodSize = file.length < sizes;
  return {
    goodFormat,
    goodSize,
  };
};

const UploaderNotifier = () => {
  const [{ uploads }] = useAppContext();

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

const testStorageSize = (size) =>
  new Promise((resolve) =>
    Meteor.call('files.user', {}, (err, files) => {
      const storageSize = files.reduce((sum, file) => sum + file.size, 0) + size;
      if (storageSize >= maxMinioDiskPerUser) {
        resolve(true);
      } else {
        resolve(false);
      }
    }),
  );

const SingleNotification = ({ upload }) => {
  const [, dispatch] = useAppContext();
  const { fileName, path, name, file, onFinish, storage, type } = upload;
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
    const { goodFormat, goodSize } = checkFile(file, storage, type);
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
        message: `${i18n.__('components.UploaderNotifier.fileTooLarge')} ${storageToSize(
          storage ? minioStorageFilesSize : minioFileSize,
        )}`,
      });
      deleteUploadFromQueue();
    } else if (!goodFormat) {
      setError({
        title: i18n.__('components.UploaderNotifier.formatNotAcceptedTitle'),
        message: `
        ${i18n.__('components.UploaderNotifier.formatNotAccepted')} 
        ${JSON.stringify(storage ? fileTypes : Meteor.settings.public.imageFilesTypes)
          .replace(/"/g, '')
          .replace(/,/g, ', ')}`,
      });
      deleteUploadFromQueue();
    } else {
      fileUpload({ name: fileName, path, file, type }, (url, err) => {
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
