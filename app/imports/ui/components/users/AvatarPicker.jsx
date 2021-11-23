import React, { useState } from 'react';
import PropTypes from 'prop-types';
import i18n from 'meteor/universe:i18n';
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import Input from '@material-ui/core/Input';
import Tooltip from '@material-ui/core/Tooltip';

import PublishIcon from '@material-ui/icons/Publish';
import CameraEnhanceIcon from '@material-ui/icons/CameraEnhance';
import FaceIcon from '@material-ui/icons/Face';
import { useAppContext } from '../../contexts/context';
import AvatarGallery from './AvatarGallery';
import UserAvatar from './UserAvatar';
import AvatarCamCapture from './AvatarCamCapture';
import AvatarEdit from './AvatarEdit';
import GroupAvatar from '../groups/GroupAvatar';

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
  avatar: {
    width: 250,
    height: 250,
  },
  avatarMobile: {
    width: 100,
    height: 100,
  },
  avatarMobileDefault: {
    width: 100,
    height: 100,
    backgroundColor: theme.palette.primary.main,
  },
  avatarDefault: {
    width: 250,
    height: 250,
    backgroundColor: theme.palette.primary.main,
  },
}));

const AvatarPicker = ({ userAvatar, userFirstName, onAssignAvatar, avatar, type, profil }) => {
  const classes = useStyles();
  const [{ isMobile }] = useAppContext();
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

  const renderAvatar = userFirstName ? (
    isMobile ? (
      <UserAvatar
        customClass={userAvatar ? classes.avatarMobile : classes.avatarMobileDefault}
        userAvatar={userAvatar || ''}
        userFirstName={userFirstName || ''}
      />
    ) : (
      <UserAvatar
        customClass={userAvatar ? classes.avatar : classes.avatarDefault}
        userAvatar={userAvatar || ''}
        userFirstName={userFirstName || ''}
      />
    )
  ) : (
    <GroupAvatar type={type} avatar={avatar} profil={profil} />
  );

  return (
    <div>
      <Grid container>
        <Grid item xs={12} className={classes.buttonWrapper}>
          {renderAvatar}
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
        <AvatarEdit
          profil={profil}
          open={openAvatarEdit}
          avatar={imageAvatar}
          onClose={() => setOpenAvatarEdit(false)}
          onSendImage={onAssignAvatar}
        />
      ) : null}
      {openCamCapture ? (
        <AvatarCamCapture
          open={openCamCapture}
          onClose={() => setOpenCamCapture(false)}
          onSendImage={sendCamCaptureToEditor}
        />
      ) : null}
      {openAvatarGallery ? (
        <AvatarGallery
          open={openAvatarGallery}
          i18nCode={userFirstName ? 'UserAvatarGallery' : 'GroupAvatarGallery'}
          onClose={() => setOpenAvatarGallery(false)}
          onSendImage={onAssignAvatar}
        />
      ) : null}
    </div>
  );
};

AvatarPicker.defaultProps = {
  profil: '',
  userAvatar: '',
  userFirstName: '',
};

AvatarPicker.propTypes = {
  userAvatar: PropTypes.string,
  userFirstName: PropTypes.string,
  onAssignAvatar: PropTypes.func.isRequired,
  avatar: PropTypes.string.isRequired,
  type: PropTypes.number.isRequired,
  profil: PropTypes.string,
};

export default AvatarPicker;
