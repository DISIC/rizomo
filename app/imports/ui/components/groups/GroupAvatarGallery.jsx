/* eslint-disable jsx-a11y/media-has-caption */
import React from 'react';
import i18n from 'meteor/universe:i18n';
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import IconButton from '@material-ui/core/IconButton';
import ClearIcon from '@material-ui/icons/Clear';
import Button from '@material-ui/core/Button';
import CardContent from '@material-ui/core/CardContent';
import Grid from '@material-ui/core/Grid';
import Modal from '@material-ui/core/Modal';
import Typography from '@material-ui/core/Typography';
import PropTypes from 'prop-types';
import { useAppContext } from '../../contexts/context';

const useStyles = (isMobile) =>
  makeStyles((theme) => ({
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
    image: {
      position: 'relative',
      height: 200,
      [theme.breakpoints.down('xs')]: {
        width: '100% !important', // Overrides inline-style
        height: 100,
      },
      '&:hover, &$focusVisible': {
        zIndex: 1,
        '& $imageBackdrop': {
          opacity: 0.15,
        },
        '& $imageMarked': {
          opacity: 0,
        },
        '& $imageTitle': {
          border: '4px solid currentColor',
        },
      },
    },
    focusVisible: {},
    imageButton: {
      position: 'absolute',
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: theme.palette.common.white,
    },
    imageSrc: {
      position: 'absolute',
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
      backgroundSize: 'cover',
      backgroundPosition: 'center 40%',
    },
    imageBackdrop: {
      position: 'absolute',
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
      backgroundColor: theme.palette.common.black,
      opacity: 0.4,
      transition: theme.transitions.create('opacity'),
    },
    imageTitle: {
      position: 'relative',
      padding: `${theme.spacing(2)}px ${theme.spacing(4)}px ${theme.spacing(1) + 6}px`,
    },
    imageMarked: {
      height: 3,
      width: 18,
      backgroundColor: theme.palette.common.white,
      position: 'absolute',
      bottom: -2,
      left: 'calc(50% - 9px)',
      transition: theme.transitions.create('opacity'),
    },
  }));

const GroupAvatarGallery = ({ open, onClose, onSendImage }) => {
  const [{ isMobile }] = useAppContext();
  const classes = useStyles(isMobile)();

  const avImages = () => {
    const images = [];
    for (let i = 1; i < 330; i += 1) {
      images.push(`/images/groups/group-${i.toString().padStart(3, '0')}.svg`);
    }
    return images;
  };

  const onLocalSendImage = (src) => {
    onSendImage({ url: Meteor.absoluteUrl(src) });
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose}>
      <div className={classes.paper}>
        <Card className={classes.root}>
          <CardHeader
            title={i18n.__('components.GroupAvatarGallery.title')}
            subheader={i18n.__('components.GroupAvatarGallery.subtitle')}
            action={
              <IconButton onClick={onClose}>
                <ClearIcon />
              </IconButton>
            }
          />
          <CardContent>
            <Grid container>
              {avImages().map((src) => (
                <Grid item key={src}>
                  <Button onClick={() => onLocalSendImage(src)} onKeyDown={() => onLocalSendImage(src)}>
                    <img alt="" src={src} style={{ width: 50, height: 50, objectFit: 'cover' }} />
                  </Button>
                </Grid>
              ))}
            </Grid>
          </CardContent>
          <Typography variant="h6" style={{ textAlign: 'center' }}>
            Icons made by
            <a href="https://github.com/icons8/flat-color-icons"> https://github.com/icons8/flat-color-icons </a>
          </Typography>
        </Card>
      </div>
    </Modal>
  );
};

GroupAvatarGallery.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSendImage: PropTypes.func.isRequired,
};

export default GroupAvatarGallery;
