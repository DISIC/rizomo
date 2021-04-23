/* eslint-disable jsx-a11y/media-has-caption */
import React from 'react';
import i18n from 'meteor/universe:i18n';
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardActions from '@material-ui/core/CardActions';
import IconButton from '@material-ui/core/IconButton';
import ClearIcon from '@material-ui/icons/Clear';
import Button from '@material-ui/core/Button';
import Modal from '@material-ui/core/Modal';
import Webcam from 'react-webcam';
import PropTypes from 'prop-types';
import { useAppContext } from '../../contexts/context';

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
      justifyContent: 'center',
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

const UserAvatarCamCapture = ({ open, onClose, onSendImage }) => {
  const [{ isMobile }] = useAppContext();
  const classes = useStyles(isMobile)();
  const webcamRef = React.useRef(null);

  const capture = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    onSendImage({ image: imageSrc });
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose}>
      <div className={classes.paper}>
        <Card className={classes.root}>
          <CardHeader
            title={i18n.__('components.UserAvatarCamCapture.title')}
            subheader={i18n.__('components.UserAvatarCamCapture.subtitle')}
            action={
              <IconButton onClick={onClose}>
                <ClearIcon />
              </IconButton>
            }
          />
          <div className={classes.iconWrapper}>
            <Webcam audio={false} ref={webcamRef} screenshotFormat="image/jpeg" />
          </div>
          <CardActions className={classes.actions}>
            <Button variant="contained" color="primary" onClick={capture}>
              {i18n.__('components.UserAvatarCamCapture.takePicture')}
            </Button>
            <Button onClick={onClose}>{i18n.__('components.UserAvatarCamCapture.cancel')}</Button>
          </CardActions>
        </Card>
      </div>
    </Modal>
  );
};

UserAvatarCamCapture.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSendImage: PropTypes.func.isRequired,
};

export default UserAvatarCamCapture;
