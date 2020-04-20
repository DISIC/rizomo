import React, {
  useContext, useEffect, useState, useCallback,
} from 'react';
import { Random } from 'meteor/random';
import PropTypes from 'prop-types';
import {
  makeStyles, Container, Grid, Fade, Typography, IconButton,
} from '@material-ui/core';
import RefreshIcon from '@material-ui/icons/Refresh';
import AddIcon from '@material-ui/icons/Add';
import i18n from 'meteor/universe:i18n';
import { useDropzone } from 'react-dropzone';
import { Context } from '../contexts/context';
import { toBase64, storageToSize } from '../utils/filesProcess';
import SingleStorageFile from '../components/mediaStorage/SingleStoragefile';
import SelectedMediaModal from '../components/mediaStorage/SelectedMediaModal';
import Spinner from '../components/system/Spinner';

const { maxMinioDiskPerUser } = Meteor.settings.public;

const useStyles = makeStyles((theme) => ({
  flex: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fileWrapper: {
    display: 'flex',
    alignItems: 'center',
  },
  dragWrapper: {
    borderWidth: 2,
    borderRadius: theme.shape.borderRadius,
    borderColor: theme.palette.primary.main,
    borderStyle: 'dashed',
    minHeight: '80vh',
  },
  wrapper: {
    minHeight: '80vh',
    outline: 'none',
  },
}));

const calcultedUsedDisk = (total, currentValue) => total + currentValue.size;

const MediaStoragePage = ({ selectFile, modal }) => {
  const [{ isMobile }, dispatch] = useContext(Context);
  const [files, setFiles] = useState([]);
  const [selected, setSelected] = useState();
  const classes = useStyles();
  const [loading, setLoading] = useState(false);

  const updateFilesList = () => {
    // get current user files from minio
    setLoading(true);
    Meteor.call('files.user', {}, (error, results) => {
      if (error) {
        msg.error(error.reason);
      } else {
        setFiles(results);
      }
      setSelected(null);
      setLoading(false);
    });
  };

  useEffect(() => {
    if (modal && selected) {
      selectFile(selected);
    }
  }, [selected]);

  const sendFiles = (selectedFiles) => {
    [...selectedFiles].forEach(async (file) => {
      const image = await toBase64(file);
      const fileName = file.name.split('.');
      fileName.splice(fileName.length - 1, 1);
      dispatch({
        type: 'uploads.add',
        data: {
          name: file.name,
          fileName,
          file: image,
          path: `users/${Meteor.userId()}`,
          storage: true,
          onFinish: updateFilesList,
        },
      });
    });
  };
  const onDrop = useCallback(sendFiles, []);
  const { getRootProps, isDragActive } = useDropzone({ onDrop });

  const onAddClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.onchange = (e) => {
      sendFiles(e.target.files);
    };
    input.click();
  };

  const onClose = () => setSelected(null);

  const onDelete = () => {
    setLoading(true);
    Meteor.call(
      'files.selectedRemove',
      {
        path: `users/${Meteor.userId()}`,
        toRemove: [selected.name],
      },
      (err) => {
        if (err) {
          msg.error(err.reason);
        }
        setTimeout(updateFilesList, 1000);
      },
    );
  };

  useEffect(() => {
    updateFilesList();
  }, []);

  const usedDisk = files.reduceRight(calcultedUsedDisk, 0);

  return (
    <>
      {loading && <Spinner full />}
      <Fade in>
        <Container {...getRootProps()} className={isDragActive ? classes.dragWrapper : classes.wrapper}>
          <Grid container spacing={4}>
            <Grid item xs={12} sm={12} md={12}>
              <Typography variant={isMobile ? 'h6' : 'h4'} className={classes.flex}>
                {i18n.__('pages.MediaStoragePage.title')}
                <div>
                  <IconButton onClick={updateFilesList}>
                    <RefreshIcon fontSize="large" />
                  </IconButton>
                  <IconButton onClick={onAddClick}>
                    <AddIcon fontSize="large" />
                  </IconButton>
                </div>
              </Typography>
              <Typography className={classes.flex}>
                {i18n.__('pages.MediaStoragePage.usage')}
                {' '}
                {storageToSize(usedDisk)}
                /
                {storageToSize(maxMinioDiskPerUser)}
              </Typography>
            </Grid>
            {files.map((file) => (
              <Grid item xs={6} sm={3} md={2} key={Random.id()} className={classes.fileWrapper}>
                <SingleStorageFile file={file} onSelect={setSelected} sendFiles={sendFiles} />
              </Grid>
            ))}
          </Grid>

          {!!selected && !modal && (
            <SelectedMediaModal file={selected} onClose={onClose} onDelete={onDelete} loading={loading} />
          )}
        </Container>
      </Fade>
    </>
  );
};

export default MediaStoragePage;

MediaStoragePage.propTypes = {
  selectFile: PropTypes.func,
  modal: PropTypes.bool,
};

MediaStoragePage.defaultProps = {
  selectFile: null,
  modal: false,
};
