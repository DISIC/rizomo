/* eslint-disable jsx-a11y/media-has-caption */
import React from 'react';
import i18n from 'meteor/universe:i18n';
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardMedia from '@material-ui/core/CardMedia';
import CardActions from '@material-ui/core/CardActions';
import IconButton from '@material-ui/core/IconButton';
import Modal from '@material-ui/core/Modal';
import Tooltip from '@material-ui/core/Tooltip';
import DescriptionIcon from '@material-ui/icons/Description';
import DeleteIcon from '@material-ui/icons/Delete';
import ClearIcon from '@material-ui/icons/Clear';
import AssignmentIcon from '@material-ui/icons/Assignment';
import OpenInNewIcon from '@material-ui/icons/OpenInNew';
import PropTypes from 'prop-types';
import Alert from '@material-ui/lab/Alert';
import AlertTitle from '@material-ui/lab/AlertTitle';
import { useAppContext } from '../../contexts/context';
import { storageToSize } from '../../utils/filesProcess';
import ValidationButton from '../system/ValidationButton';
import Spinner from '../system/Spinner';
import { PICTURES_TYPES, VIDEO_TYPES, SOUND_TYPES } from './SingleStoragefile';

const { minioEndPoint, minioPort, minioBucket, minioSSL } = Meteor.settings.public;

const HOST = `http${minioSSL ? 's' : ''}://${minioEndPoint}${minioPort ? `:${minioPort}` : ''}/${minioBucket}/`;

const useStyles = (isMobile) =>
  makeStyles(() => ({
    root: {
      width: '100%',
    },
    media: {
      height: 0,
      paddingTop: '56.25%', // 16:9
    },
    video: {
      width: '100%',
    },
    actions: {
      display: 'flex',
      justifyContent: 'space-between',
    },
    paper: {
      overflow: 'auto',
      position: 'absolute',
      width: isMobile ? '95%' : '50%',
      maxHeight: '100%',
      top: isMobile ? 0 : '50%',
      left: isMobile ? '2.5%' : '50%',
      transform: isMobile ? 'translateY(50%)' : 'translate(-50%, -50%)',
    },
    iconWrapper: {
      display: 'flex',
      justifyContent: 'center',
    },
    alert: {
      margin: 8,
    },
  }));

export default function SelectedMediaModal({ file, onClose, onDelete, loading, objectUsed }) {
  const [{ isMobile }] = useAppContext();
  const classes = useStyles(isMobile)();
  const fileName = file.name.replace(`users/${Meteor.userId()}/`, '');
  const extension = file.name.split('.').pop();

  const isPicture = !!PICTURES_TYPES.find((ext) => ext === extension);
  const isVideo = !!VIDEO_TYPES.find((ext) => ext === extension);
  const isSound = !!SOUND_TYPES.find((ext) => ext === extension);

  if (!file) {
    return null;
  }

  const handleCopyURL = () => {
    navigator.clipboard
      .writeText(`${HOST}${file.name}`)
      .then(msg.success(i18n.__('components.SelectedMediaModal.successCopyURL')));
  };

  return (
    <Modal open onClose={onClose}>
      <div className={classes.paper}>
        {loading && <Spinner full />}
        <Card className={classes.root}>
          <CardHeader
            title={`${fileName} / ${storageToSize(file.size)}`}
            subheader={file.lastModified.toLocaleDateString()}
          />

          {!isVideo && !isSound && !isPicture && (
            <div className={classes.iconWrapper}>
              <DescriptionIcon style={{ fontSize: '8rem' }} color="primary" />
            </div>
          )}

          {isPicture && <CardMedia className={classes.media} image={`${HOST}${file.name}`} title={fileName} />}

          {isVideo && <video controls src={`${HOST}${file.name}`} className={classes.video} />}

          {isSound && (
            <div className={classes.iconWrapper}>
              <audio controls preload="auto">
                <source src={`${HOST}${file.name}`} type="audio/mpeg" />
              </audio>
            </div>
          )}

          {!!objectUsed && (
            <Alert severity="warning" className={classes.alert}>
              <AlertTitle>Publication: {objectUsed.title}</AlertTitle>
              {i18n.__('pages.MediaStoragePage.objectUsedText')}
            </Alert>
          )}

          <CardActions className={classes.actions}>
            <ValidationButton
              color="red"
              disabled={loading}
              icon={<DeleteIcon />}
              text={
                objectUsed ? i18n.__('pages.MediaStoragePage.confirmDelete') : i18n.__('pages.MediaStoragePage.delete')
              }
              onAction={onDelete}
            />
            <div name="accessButtons">
              <Tooltip
                title={i18n.__('components.SelectedMediaModal.OpenInWindow')}
                aria-label={i18n.__('components.SelectedMediaModal.OpenInWindow')}
              >
                <IconButton onClick={() => window.open(`${HOST}${file.name}`, '_blank', 'noreferrer,noopener')}>
                  <OpenInNewIcon />
                </IconButton>
              </Tooltip>
              <Tooltip
                title={i18n.__('components.SelectedMediaModal.copyUrl')}
                aria-label={i18n.__('components.SelectedMediaModal.copyUrl')}
              >
                <IconButton onClick={handleCopyURL}>
                  <AssignmentIcon />
                </IconButton>
              </Tooltip>
            </div>
            <IconButton onClick={onClose}>
              <ClearIcon />
            </IconButton>
          </CardActions>
        </Card>
      </div>
    </Modal>
  );
}

SelectedMediaModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
  file: PropTypes.objectOf(PropTypes.any).isRequired,
  objectUsed: PropTypes.objectOf(PropTypes.any),
};

SelectedMediaModal.defaultProps = {
  objectUsed: null,
};
