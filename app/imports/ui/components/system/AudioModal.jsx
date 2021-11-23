/* eslint-disable jsx-a11y/media-has-caption */
import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Dialog from '@material-ui/core/Dialog';
import TextField from '@material-ui/core/TextField';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import { Random } from 'meteor/random';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';
import FiberManualRecordIcon from '@material-ui/icons/FiberManualRecord';
import StopIcon from '@material-ui/icons/Stop';
import CloseIcon from '@material-ui/icons/Close';
import CheckIcon from '@material-ui/icons/Check';
import RefreshIcon from '@material-ui/icons/Refresh';
import PropTypes from 'prop-types';
import MicRecorder from 'mic-recorder-to-mp3';
import i18n from 'meteor/universe:i18n';

import { useAppContext } from '../../contexts/context';
import { toBase64, storageToSize } from '../../utils/filesProcess';
import slugy from '../../utils/slugy';

export const useAudioModalStyles = makeStyles(() => ({
  content: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  actions: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  video: {
    width: '100%',
  },
  timeWrapper: {
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    flexDirection: 'column',
    fontWeight: 'bold',
  },
  title: {
    '& h2': {
      display: 'flex',
      justifyContent: 'space-between',
    },
  },
}));
export const calcultedUsedDisk = (total, currentValue) => total + currentValue.size;

export const fancyTimeFormat = (time) => {
  // Hours, minutes and seconds
  const hrs = Math.floor(time / 3600);
  const mins = Math.floor((time % 3600) / 60);
  const secs = Math.round(time % 60);

  // Output like "1:01" or "4:03:59" or "123:03:59"
  let ret = '';

  if (hrs > 0) {
    ret += `${hrs}:${mins < 10 ? '0' : ''}`;
  }

  ret += `${mins}:${secs < 10 ? '0' : ''}`;
  ret += `${secs}`;
  return ret;
};

export const DialogSendActionButtons = ({ changeFileName, fileName, loading, handleUpload, toggleSend, i18nCode }) => (
  <div>
    <TextField
      onChange={changeFileName}
      value={fileName}
      disabled={loading}
      label={i18n.__(`components.${i18nCode}.fileName`)}
      variant="outlined"
    />
    {[
      {
        label: `components.${i18nCode}.validate`,
        disabled: !fileName || loading,
        onClick: handleUpload,
        icon: <CheckIcon />,
      },
      {
        label: `components.${i18nCode}.cancel`,
        disabled: loading,
        onClick: toggleSend,
        icon: <CloseIcon />,
      },
    ].map((item) => (
      <SingleTooltipActionButton {...item} key={item.label} />
    ))}
  </div>
);

export const SingleTooltipActionButton = ({ label, disabled, onClick, icon }) => (
  <Tooltip title={i18n.__(label)}>
    <span>
      <IconButton aria-label={i18n.__(label)} disabled={disabled} onClick={onClick}>
        {icon}
      </IconButton>
    </span>
  </Tooltip>
);

let timer;
const recorder = new MicRecorder({ bitRate: 128 });

const AudioModal = ({ onClose, selectFile, admin }) => {
  const [, dispatch] = useAppContext();
  const classes = useAudioModalStyles();
  const [audioBlob, setBlob] = useState(null);
  const [audioPlayer, setAudioPlayer] = useState(null);
  const [capturing, setCapturing] = useState(false);
  const [size, setSize] = useState(0);
  const [time, setTime] = useState(0);
  const [send, setSend] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState(`audio_${Random.id()}`);
  const [storage, setStorage] = useState(Meteor.settings.public.maxMinioDiskPerUser);

  useEffect(() => {
    // get current user files from minio to test the storage left
    if (Meteor.userId()) {
      Meteor.call('files.user', {}, (error, files) => {
        if (error) {
          msg.error(error.reason);
        } else {
          setStorage(Meteor.settings.public.maxMinioDiskPerUser - files.reduceRight(calcultedUsedDisk, 0));
        }
      });
    }
  }, []);

  const refreshAudio = () => {
    // reset video and erease data
    setSize(0);
    setTime(0);
    setBlob(null);
    setAudioPlayer(null);
  };
  const handleStartCaptureClick = () => {
    // Start recording. Browser will request permission to use your microphone.
    recorder
      .start()
      .then(() => {
        setCapturing(true);
      })
      .catch((e) => {
        console.error(e);
      });
  };

  const handleStopCaptureClick = () => {
    // Once you are done singing your best song, stop and get the mp3.
    recorder
      .stop()
      .getMp3()
      .then(([buffer, blob]) => {
        // do what ever you want with buffer and blob
        // Example: Create a mp3 file and play
        const file = new File(buffer, fileName, {
          type: blob.type,
          lastModified: Date.now(),
        });
        setAudioPlayer(URL.createObjectURL(file));
        setBlob(blob);
        // erase timer
        clearInterval(timer);
        setCapturing(false);
      })
      .catch((e) => {
        alert('We could not retrieve your message');
        console.log(e);
      });
  };

  const changeFileName = (e) => {
    const name = slugy(e.target.value);
    setFileName(name);
  };

  const toggleSend = () => setSend((state) => !state);

  const increaseSize = (rate) => {
    setTime((prev) => prev + 1);
    setSize((prev) => prev + rate);
  };

  useEffect(() => {
    if (capturing) {
      // creating timer to increase displayed size ecery second
      timer = setInterval(() => increaseSize(128), 1000);
    }
  }, [capturing]);

  useEffect(() => {
    // tigger a stop in case of the storage capability is not enough for the video
    if (time === Math.floor(storage / 128)) {
      handleStopCaptureClick();
      msg.success(i18n.__('components.AudioModal.tooLongVideo'));
    }
  }, [time]);

  const handleUpload = async () => {
    setLoading(true);
    const audio = await toBase64(audioBlob);
    dispatch({
      type: 'uploads.add',
      data: {
        name: `${fileName}.mp3`,
        type: 'mp3',
        fileName,
        file: audio,
        path: admin ? 'services/sound' : `users/${Meteor.userId()}`,
        storage: !admin,
        onFinish: (url) => {
          setLoading(false);
          selectFile(url);
        },
      },
    });
  };

  return (
    <Dialog open keepMounted onClose={onClose}>
      <DialogTitle className={classes.title}>
        <div>{i18n.__('components.AudioModal.header')}</div>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent className={classes.content}>
        {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
        {!capturing && !!audioBlob && !!audioPlayer && (
          <audio controls>
            <source src={audioPlayer} type="audio/mpeg" />
          </audio>
        )}
      </DialogContent>
      <DialogActions className={classes.actions}>
        {send ? (
          <DialogSendActionButtons
            changeFileName={changeFileName}
            fileName={fileName}
            loading={loading}
            handleUpload={handleUpload}
            toggleSend={toggleSend}
            i18nCode="AudioModal"
          />
        ) : (
          <div>
            {[
              {
                label: 'components.AudioModal.stop',
                disabled: !capturing || loading || !!audioPlayer,
                onClick: audioPlayer ? null : handleStopCaptureClick,
                icon: <StopIcon />,
              },
              {
                label: 'components.AudioModal.start',
                disabled: !capturing || loading || !!audioPlayer,
                onClick: audioPlayer ? null : handleStartCaptureClick,
                icon: <FiberManualRecordIcon style={{ color: capturing ? null : 'red' }} />,
              },
              {
                label: 'components.AudioModal.refresh',
                disabled: !audioBlob || loading || !audioPlayer,
                onClick: audioPlayer ? null : refreshAudio,
                icon: <RefreshIcon />,
              },
              {
                label: 'components.AudioModal.upload',
                disabled: !audioBlob || loading || !audioPlayer,
                onClick: audioPlayer ? null : toggleSend,
                icon: <CloudUploadIcon />,
              },
            ].map((item) => (
              <SingleTooltipActionButton {...item} key={item.label} />
            ))}
          </div>
        )}

        <div className={classes.timeWrapper}>
          <div>
            {fancyTimeFormat(time)} / {fancyTimeFormat(storage / 128)}
          </div>
          <div>
            {storageToSize(size)} / {storageToSize(storage)}
          </div>
        </div>
      </DialogActions>
    </Dialog>
  );
};

export default AudioModal;

AudioModal.defaultProps = {
  admin: false,
};

AudioModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  selectFile: PropTypes.func.isRequired,
  admin: PropTypes.bool,
};

DialogSendActionButtons.propTypes = {
  changeFileName: PropTypes.func.isRequired,
  fileName: PropTypes.string.isRequired,
  handleUpload: PropTypes.string.isRequired,
  toggleSend: PropTypes.string.isRequired,
  loading: PropTypes.bool.isRequired,
  i18nCode: PropTypes.string.isRequired,
};

SingleTooltipActionButton.propTypes = {
  onClick: PropTypes.func.isRequired,
  label: PropTypes.string.isRequired,
  icon: PropTypes.objectOf(PropTypes.any).isRequired,
  disabled: PropTypes.bool.isRequired,
};
