import React from 'react';
import i18n from 'meteor/universe:i18n';
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardMedia from '@material-ui/core/CardMedia';
import CardActions from '@material-ui/core/CardActions';
import IconButton from '@material-ui/core/IconButton';
import DescriptionIcon from '@material-ui/icons/Description';
import DeleteIcon from '@material-ui/icons/Delete';
import ClearIcon from '@material-ui/icons/Clear';
import { Modal } from '@material-ui/core';
import OpenInNewIcon from '@material-ui/icons/OpenInNew';
import PropTypes from 'prop-types';
import { useAppContext } from '../../contexts/context';
import { storageToSize } from '../../utils/filesProcess';
import ValidationButton from '../system/ValidationButton';
import Spinner from '../system/Spinner';

const { minioEndPoint, minioPort, minioBucket, minioSSL } = Meteor.settings.public;

const HOST = `http${minioSSL ? 's' : ''}://${minioEndPoint}${minioPort ? `:${minioPort}` : ''}/${minioBucket}/`;
const PICTURES_TYPES = ['svg', 'png', 'jpg', 'gif', 'jpeg'];

const useStyles = (isMobile) =>
  makeStyles(() => ({
    root: {
      width: '100%',
    },
    media: {
      height: 0,
      paddingTop: '56.25%', // 16:9
    },
    actions: {
      display: 'flex',
      justifyContent: 'space-between',
    },
    paper: {
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
  }));

export default function SelectedMediaModal({ file, onClose, onDelete, loading }) {
  const [{ isMobile }] = useAppContext();
  const classes = useStyles(isMobile)();
  const fileName = file.name.replace(`users/${Meteor.userId()}/`, '');
  const extension = file.name.split('.').pop();
  const isNotPictures = !PICTURES_TYPES.find((ext) => ext === extension);

  if (!file) {
    return null;
  }

  return (
    <Modal open onClose={onClose}>
      <div className={classes.paper}>
        {loading && <Spinner full />}
        <Card className={classes.root}>
          <CardHeader
            title={`${fileName} / ${storageToSize(file.size)}`}
            subheader={file.lastModified.toLocaleDateString()}
          />
          {isNotPictures ? (
            <div className={classes.iconWrapper}>
              <DescriptionIcon style={{ fontSize: '8rem' }} color="primary" />
            </div>
          ) : (
            <CardMedia className={classes.media} image={`${HOST}${file.name}`} title={fileName} />
          )}

          <CardActions className={classes.actions}>
            <ValidationButton
              color="red"
              disabled={loading}
              icon={<DeleteIcon />}
              text={i18n.__('pages.MediaStoragePage.delete')}
              onAction={onDelete}
            />
            <IconButton onClick={() => window.open(`${HOST}${file.name}`, '_blank', 'noreferrer,noopener')}>
              <OpenInNewIcon />
            </IconButton>
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
};
