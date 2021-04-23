/* eslint-disable jsx-a11y/media-has-caption */
import React, { useRef, useState } from 'react';
import i18n from 'meteor/universe:i18n';
import AvatarEditor from 'react-avatar-editor';
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardActions from '@material-ui/core/CardActions';
import IconButton from '@material-ui/core/IconButton';
import ClearIcon from '@material-ui/icons/Clear';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Modal from '@material-ui/core/Modal';
import Slider from '@material-ui/core/Slider';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import RotateLeftIcon from '@material-ui/icons/RotateLeft';
import RotateRightIcon from '@material-ui/icons/RotateRight';
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
      justifyContent: 'space-evenly',
      alignItems: 'center',
    },
    alert: {
      margin: 8,
    },
  }));

const GroupAvatarEdit = ({ open, avatar, onClose, onSendImage }) => {
  const [{ isMobile }] = useAppContext();
  const classes = useStyles(isMobile)();
  const [scale, setScale] = useState(1);
  const [rotate, setRotate] = useState(0);

  const editor = useRef(null);

  const onScale = (e, newValue) => {
    setScale(newValue);
  };

  const onRotate = (factor) => {
    setRotate(rotate + factor * 90);
  };

  const onLocalSendImage = () => {
    if (editor) {
      const canvasScaled = editor.current.getImageScaledToCanvas();

      onSendImage({ image: canvasScaled.toDataURL() });
      onClose();
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <div className={classes.paper}>
        <Card className={classes.root}>
          <CardHeader
            title={i18n.__('components.UserAvatarEdit.title')}
            subheader={i18n.__('components.UserAvatarEdit.subtitle')}
            action={
              <IconButton onClick={onClose}>
                <ClearIcon />
              </IconButton>
            }
          />
          <div className={classes.iconWrapper}>
            <AvatarEditor
              ref={editor}
              image={avatar}
              width={250}
              height={250}
              border={50}
              color={[255, 255, 255, 0.6]} // RGBA
              scale={scale}
              rotate={rotate}
            />
          </div>
          <Grid className={classes.iconWrapper} container spacing={4}>
            <Grid item xs={4}>
              <Tooltip
                title={i18n.__('components.UserAvatarEdit.zoom')}
                aria-label={i18n.__('components.UserAvatarEdit.zoom')}
                placement="top"
              >
                <Grid container spacing={1}>
                  <Grid item>
                    <Typography variant="h6" style={{ textAlign: 'center' }}>
                      x1
                    </Typography>
                  </Grid>
                  <Grid item xs>
                    <Slider name="scale" value={scale} onChange={onScale} min={1} max={2} step={0.01} />
                  </Grid>
                  <Grid item>
                    <Typography variant="h6" style={{ textAlign: 'center' }}>
                      x2
                    </Typography>
                  </Grid>
                </Grid>
              </Tooltip>
            </Grid>
            <Grid item />

            <Grid item xs={4}>
              <Tooltip
                title={i18n.__('components.UserAvatarEdit.turnLeft')}
                aria-label={i18n.__('components.UserAvatarEdit.turnLeft')}
                placement="top"
              >
                <IconButton onClick={() => onRotate(-1)}>
                  <RotateLeftIcon />
                </IconButton>
              </Tooltip>
              <Tooltip
                title={i18n.__('components.UserAvatarEdit.turnRight')}
                aria-label={i18n.__('components.UserAvatarEdit.turnRight')}
                placement="top"
              >
                <IconButton onClick={() => onRotate(1)}>
                  <RotateRightIcon />
                </IconButton>
              </Tooltip>
            </Grid>
          </Grid>
          <CardActions className={classes.actions}>
            <Button variant="contained" color="primary" onClick={onLocalSendImage}>
              {i18n.__('components.UserAvatarEdit.sendImage')}
            </Button>
            <Button onClick={onClose}>{i18n.__('components.UserAvatarEdit.cancel')}</Button>
          </CardActions>
        </Card>
      </div>
    </Modal>
  );
};

GroupAvatarEdit.propTypes = {
  open: PropTypes.bool.isRequired,
  avatar: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  onSendImage: PropTypes.func.isRequired,
};

export default GroupAvatarEdit;
