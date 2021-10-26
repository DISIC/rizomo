import React, { useState } from 'react';
import PropTypes from 'prop-types';
import i18n from 'meteor/universe:i18n';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import Input from '@material-ui/core/Input';
import { makeStyles } from '@material-ui/core/styles';
import Tooltip from '@material-ui/core/Tooltip';
import PublishIcon from '@material-ui/icons/Publish';
import CameraEnhanceIcon from '@material-ui/icons/CameraEnhance';
import FaceIcon from '@material-ui/icons/Face';
import GroupAvatarEdit from './GroupAvatarEdit';
import GroupAvatarCamCapture from './GroupAvatarCamCapture';
import GroupAvatarGallery from './GroupAvatarGallery';
import GroupAvatar from './GroupAvatar';

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(2),
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(5),
  },
  form: {
    marginTop: theme.spacing(2),
    display: 'flex',
    flexDirection: 'column',
  },
  buttonGroup: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: '10px',
  },
  keycloakMessage: {
    padding: theme.spacing(1),
  },
  inputFile: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    opacity: 0,
  },
  fileWrap: {
    position: 'relative',
  },
  buttonWrapper: {
    display: 'flex',
    justifyContent: 'center',
  },
  avatarDefault: {
    width: 250,
    height: 250,
    backgroundColor: theme.palette.primary.main,
  },
}));

const GroupAvatarPicker = ({ avatar, type, onAssignAvatar, profil }) => {
  const classes = useStyles();
  const [imageAvatar, setImageAvatar] = useState('');
  const [openAvatarEdit, setOpenAvatarEdit] = useState(false);
  const [openCamCapture, setOpenCamCapture] = useState(false);
  const [openAvatarGallery, setOpenAvatarGallery] = useState(false);

  const uploadAvatarImg = ({ target: { files = [] } }) => {
    const readerImg = new FileReader();

    readerImg.onload = function onImgLoad() {
      setImageAvatar(readerImg.result);
      setOpenAvatarEdit(true);
    };
    readerImg.readAsDataURL(files[0]);
  };

  const sendCamCaptureToEditor = (camCaptureImg) => {
    setImageAvatar(camCaptureImg.image);
    setOpenAvatarEdit(true);
  };

  return (
    <div>
      <Grid container>
        <Grid item xs={12} className={classes.buttonWrapper}>
          <GroupAvatar type={type} avatar={avatar} profil={profil} />
        </Grid>
        <Grid item xs={12} className={classes.buttonWrapper}>
          <Tooltip title={i18n.__('pages.ProfilePage.uploadImg')} aria-label={i18n.__('pages.ProfilePage.uploadImg')}>
            <IconButton tabIndex={-1}>
              <PublishIcon />
              <Input className={classes.inputFile} type="file" id="avatarUpload" onChange={uploadAvatarImg} />
            </IconButton>
          </Tooltip>
          <Tooltip title={i18n.__('pages.ProfilePage.useGallery')} aria-label={i18n.__('pages.ProfilePage.useGallery')}>
            <IconButton onClick={() => setOpenAvatarGallery(true)}>
              <FaceIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title={i18n.__('pages.ProfilePage.useCam')} aria-label={i18n.__('pages.ProfilePage.useCam')}>
            <IconButton onClick={() => setOpenCamCapture(true)}>
              <CameraEnhanceIcon />
            </IconButton>
          </Tooltip>
        </Grid>
      </Grid>
      {openAvatarEdit ? (
        <GroupAvatarEdit
          profil={profil}
          open={openAvatarEdit}
          avatar={imageAvatar}
          onClose={() => setOpenAvatarEdit(false)}
          onSendImage={onAssignAvatar}
        />
      ) : null}
      {openCamCapture ? (
        <GroupAvatarCamCapture
          open={openCamCapture}
          onClose={() => setOpenCamCapture(false)}
          onSendImage={sendCamCaptureToEditor}
        />
      ) : null}
      {openAvatarGallery ? (
        <GroupAvatarGallery
          open={openAvatarGallery}
          onClose={() => setOpenAvatarGallery(false)}
          onSendImage={onAssignAvatar}
        />
      ) : null}
    </div>
  );
};

GroupAvatarPicker.defaultProps = {
  profil: '',
};

GroupAvatarPicker.propTypes = {
  avatar: PropTypes.string.isRequired,
  type: PropTypes.number.isRequired,
  onAssignAvatar: PropTypes.func.isRequired,
  profil: PropTypes.string,
};

export default GroupAvatarPicker;
