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
import COMMON_STYLES from '../../themes/styles';

const useStyles = (isMobile) =>
  makeStyles(() => ({
    root: COMMON_STYLES.root,
    media: COMMON_STYLES.media,
    video: COMMON_STYLES.video,
    actions: COMMON_STYLES.actions,
    paper: COMMON_STYLES.paper(isMobile, '50%'),
    iconWrapper: {
      display: 'flex',
      justifyContent: 'space-evenly',
      alignItems: 'center',
    },
    alert: COMMON_STYLES.alert,
  }));

const AvatarEdit = ({ open, avatar, onClose, onSendImage }) => {
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
            title={i18n.__('components.AvatarEdit.title')}
            subheader={i18n.__('components.AvatarEdit.subtitle')}
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
                title={i18n.__('components.AvatarEdit.zoom')}
                aria-label={i18n.__('components.AvatarEdit.zoom')}
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
                title={i18n.__('components.AvatarEdit.turnLeft')}
                aria-label={i18n.__('components.AvatarEdit.turnLeft')}
                placement="top"
              >
                <IconButton onClick={() => onRotate(-1)}>
                  <RotateLeftIcon />
                </IconButton>
              </Tooltip>
              <Tooltip
                title={i18n.__('components.AvatarEdit.turnRight')}
                aria-label={i18n.__('components.AvatarEdit.turnRight')}
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
              {i18n.__('components.AvatarEdit.sendImage')}
            </Button>
            <Button onClick={onClose}>{i18n.__('components.AvatarEdit.cancel')}</Button>
          </CardActions>
        </Card>
      </div>
    </Modal>
  );
};

AvatarEdit.propTypes = {
  open: PropTypes.bool.isRequired,
  avatar: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  onSendImage: PropTypes.func.isRequired,
};

export default AvatarEdit;
