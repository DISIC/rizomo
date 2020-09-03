import React, { useState, useRef, useEffect } from 'react';
import {
  Dialog,
  makeStyles,
  TextField,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
} from '@material-ui/core';
import { Random } from 'meteor/random';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';
import FiberManualRecordIcon from '@material-ui/icons/FiberManualRecord';
import StopIcon from '@material-ui/icons/Stop';
import CloseIcon from '@material-ui/icons/Close';
import CheckIcon from '@material-ui/icons/Check';
import RefreshIcon from '@material-ui/icons/Refresh';
import PropTypes from 'prop-types';
import Webcam from 'react-webcam';
import i18n from 'meteor/universe:i18n';
import { useAppContext } from '../../contexts/context';
import { toBase64, storageToSize } from '../../utils/filesProcess';
import slugy from '../../utils/slugy';
import Spinner from './Spinner';

const useStyles = makeStyles(() => ({
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
const calcultedUsedDisk = (total, currentValue) => total + currentValue.size;

const fancyTimeFormat = (time) => {
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

let timer;

const WebcamModal = ({ onClose, selectFile, admin }) => {
  const [, dispatch] = useAppContext();
  const classes = useStyles();
  const webcamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const [capturing, setCapturing] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const [size, setSize] = useState(0);
  const [time, setTime] = useState(0);
  const [send, setSend] = useState(false);
  const [tested, setTested] = useState(false);
  const [loading, setLoading] = useState(true);
  const [fileName, setFileName] = useState(`video_${Random.id()}`);
  const [storage, setStorage] = useState(Meteor.settings.public.maxMinioDiskPerUser);
  const [sizePerSecond, setSizePerSecond] = useState(70000);
  const [quality, setQuality] = useState(70000);
  const [videoBlob, setBlob] = useState(null);

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

  const handleDataAvailable = ({ data, test }) => {
    if (data.size > 0 && !test) {
      // set final size to replace estimation
      setSize(data.size);
      setRecordedChunks((prev) => {
        const nextData = prev.concat(data);
        const blob = new Blob(nextData, {
          type: 'video/webm',
          name: `localvideo.webm`,
        });
        const localurl = URL.createObjectURL(blob);
        setBlob(localurl);
        return nextData;
      });
    } else if (test) {
      setTested(true);
      setSizePerSecond(data.size);
      setCapturing(false);
      setRecordedChunks([]);
      setSize(0);
      setTime(0);
      setBlob(null);
      setLoading(false);
    }
  };
  const testBitRate = () => {
    // creating the media recorder with the selected quality
    if (webcamRef.current.stream) {
      setCapturing(true);
      const options = {
        mimeType: 'video/webm;codecs=opus,vp8',
      };
      if (quality !== 'infinity') {
        options.bitsPerSecond = quality;
      }
      mediaRecorderRef.current = new MediaRecorder(webcamRef.current.stream, options);
      // event listener for the data colleciton a the end of the recording
      mediaRecorderRef.current.addEventListener('dataavailable', ({ data }) =>
        handleDataAvailable({ data, test: true }),
      );
      mediaRecorderRef.current.start();
      setTimeout(() => {
        mediaRecorderRef.current.stop();
        // erase timer
        if (timer) {
          clearInterval(timer);
        }
      }, 1000);
    }
  };

  const refreshVideo = () => {
    // reset video and erease data
    setRecordedChunks([]);
    setSize(0);
    setTime(0);
    setBlob(null);
    setLoading(true);
    setTested(false);
    setTimeout(() => {
      testBitRate();
    }, 300);
  };
  useEffect(() => {
    refreshVideo();
  }, [quality]);

  const handleStartCaptureClick = () => {
    // creating the media recorder with the selected quality
    setCapturing(true);
    const options = {
      mimeType: 'video/webm;codecs=opus,vp8',
    };
    if (quality !== 'infinity') {
      options.bitsPerSecond = quality;
    }
    mediaRecorderRef.current = new MediaRecorder(webcamRef.current.stream, options);
    // event listener for the data colleciton a the end of the recording
    mediaRecorderRef.current.addEventListener('dataavailable', handleDataAvailable);
    mediaRecorderRef.current.start();
  };

  const handleStopCaptureClick = () => {
    mediaRecorderRef.current.stop();
    // erase timer
    clearInterval(timer);
    setCapturing(false);
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
    if (mediaRecorderRef.current && capturing) {
      // creating timer to increase displayed size ecery second
      timer = setInterval(() => increaseSize(sizePerSecond), 1000);
    }
  }, [capturing]);

  useEffect(() => {
    // tigger a stop in case of the storage capability is not enough for the video
    if (time === Math.floor(storage / sizePerSecond)) {
      handleStopCaptureClick();
      msg.success(i18n.__('components.WebcamModal.tooLongVideo'));
    }
  }, [time]);

  const sendFiles = async (videoToSend, name) => {
    const blob = new Blob(videoToSend, {
      type: 'video/webm',
      name: `${name}.webm`,
    });
    setLoading(true);
    const video = await toBase64(blob);
    dispatch({
      type: 'uploads.add',
      data: {
        name: `${name}.webm`,
        fileName: name,
        type: 'webm',
        file: video,
        path: admin ? 'services/videos' : `users/${Meteor.userId()}`,
        storage: !admin,
        onFinish: (url) => {
          setRecordedChunks([]);
          setLoading(false);
          selectFile(url);
        },
      },
    });
  };

  const handleUpload = () => {
    if (recordedChunks.length) {
      sendFiles(recordedChunks, fileName);
    }
  };
  const changeQuality = (e) => {
    setQuality(e.target.value);
  };

  const errorMessage = () => {
    msg.error(i18n.__('components.WebcamModal.nowebcam'));
  };

  return (
    <Dialog open keepMounted onClose={onClose}>
      <DialogTitle className={classes.title}>
        <div>{i18n.__('components.WebcamModal.header')}</div>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent className={classes.content}>
        {loading && <Spinner full />}
        {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
        {videoBlob && <video controls src={videoBlob} className={classes.video} />}
        {!videoBlob && (
          <Webcam onUserMediaError={errorMessage} onUserMedia={testBitRate} ref={webcamRef} className={classes.video} />
        )}
      </DialogContent>
      <DialogActions className={classes.actions}>
        {send ? (
          <div>
            <TextField
              onChange={changeFileName}
              value={fileName}
              disabled={loading}
              label={i18n.__('components.WebcamModal.fileName')}
              variant="outlined"
            />
            <Tooltip title={i18n.__('components.WebcamModal.validate')}>
              <span>
                <IconButton
                  disabled={!fileName || loading}
                  aria-label={i18n.__('components.WebcamModal.validate')}
                  onClick={handleUpload}
                >
                  <CheckIcon />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title={i18n.__('components.WebcamModal.cancel')}>
              <span>
                <IconButton
                  aria-label={i18n.__('components.WebcamModal.cancel')}
                  onClick={toggleSend}
                  disabled={loading}
                >
                  <CloseIcon />
                </IconButton>
              </span>
            </Tooltip>
          </div>
        ) : (
          <div>
            <Tooltip title={i18n.__('components.WebcamModal.stop')}>
              <span>
                <IconButton
                  aria-label={i18n.__('components.WebcamModal.stop')}
                  disabled={!tested || !capturing || loading}
                  onClick={handleStopCaptureClick}
                >
                  <StopIcon />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title={i18n.__('components.WebcamModal.start')}>
              <span>
                <IconButton
                  aria-label={i18n.__('components.WebcamModal.start')}
                  disabled={!tested || capturing || (!capturing && size > 0) || loading}
                  onClick={handleStartCaptureClick}
                >
                  <FiberManualRecordIcon style={{ color: capturing ? null : 'red' }} />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title={i18n.__('components.WebcamModal.refresh')}>
              <span>
                <IconButton
                  aria-label={i18n.__('components.WebcamModal.refresh')}
                  disabled={!tested || recordedChunks.length === 0 || loading}
                  onClick={refreshVideo}
                >
                  <RefreshIcon />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title={i18n.__('components.WebcamModal.upload')}>
              <span>
                <IconButton
                  aria-label={i18n.__('components.WebcamModal.upload')}
                  disabled={!tested || recordedChunks.length === 0 || loading}
                  onClick={toggleSend}
                >
                  <CloudUploadIcon />
                </IconButton>
              </span>
            </Tooltip>
            <FormControl>
              <InputLabel>{i18n.__('components.WebcamModal.quality')}</InputLabel>
              <Select value={quality} onChange={changeQuality} disabled={loading}>
                <option value={100000}>{i18n.__('components.WebcamModal.low')}</option>
                <option value={500000}>{i18n.__('components.WebcamModal.medium')}</option>
                <option value="infinity">{i18n.__('components.WebcamModal.high')}</option>
              </Select>
            </FormControl>
          </div>
        )}

        <div className={classes.timeWrapper}>
          <div>
            {fancyTimeFormat(time)} / {!tested ? '??' : fancyTimeFormat(storage / sizePerSecond)}
          </div>
          <div>
            {capturing && '~'}
            {storageToSize(size)} / {storageToSize(storage)}
          </div>
        </div>
      </DialogActions>
    </Dialog>
  );
};

export default WebcamModal;

WebcamModal.defaultProps = {
  admin: false,
};

WebcamModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  selectFile: PropTypes.func.isRequired,
  admin: PropTypes.bool,
};
