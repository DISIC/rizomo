/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import i18n from 'meteor/universe:i18n';
import ReactQuill, { Quill } from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { withTracker } from 'meteor/react-meteor-data';
import DeleteIcon from '@material-ui/icons/Delete';
import AssignmentIcon from '@material-ui/icons/Assignment';
import { Random } from 'meteor/random';
import ImageResize from 'quill-image-resize-module';
import {
  TextField,
  Typography,
  InputLabel,
  Container,
  Grid,
  makeStyles,
  Button,
  InputAdornment,
  IconButton,
} from '@material-ui/core';
import Articles from '../../../api/articles/articles';
import Spinner from '../../components/system/Spinner';
import { useAppContext } from '../../contexts/context';
import { useObjectState } from '../../utils/hooks';
import { getExtension } from '../../utils/filesProcess';
import slugy from '../../utils/slugy';
import { updateArticle, createArticle, removeArticle } from '../../../api/articles/methods';
import ValidationButton from '../../components/system/ValidationButton';
import ImagePicker from '../../components/articles/ImagePicker';
import WebcamModal from '../../components/system/WebcamModal';

import '../../utils/QuillImage';
import '../../utils/QuillWebcam';
import '../../utils/QuillAudio';
import '../../utils/QuillVideo';
import { CustomToolbarArticle } from '../../components/system/CustomQuill';
import AudioModal from '../../components/system/AudioModal';
import { PICTURES_TYPES, VIDEO_TYPES, SOUND_TYPES } from '../../components/mediaStorage/SingleStoragefile';
import ToastUIEditor from '../../components/system/ToastUIEditor';

Quill.register('modules/ImageResize', ImageResize);

const { minioEndPoint, minioPort, minioBucket, minioSSL } = Meteor.settings.public;

const HOST = `http${minioSSL ? 's' : ''}://${minioEndPoint}${minioPort ? `:${minioPort}` : ''}/${minioBucket}/`;

const useStyles = makeStyles((theme) => ({
  flex: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  gridItem: {
    display: 'flex',
    justifyContent: 'center',
  },
  spaceBetween: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  wysiwyg: {
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(3),
    '& label': {
      marginBottom: theme.spacing(1),
    },
  },
  buttonGroup: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: 60,
  },
  buttonsContainer: {
    display: 'flex',
    margin: 'auto',
    justifyContent: 'center',
    '& button': {
      margin: theme.spacing(2),
    },
  },
}));

const emptyArticle = {
  title: '',
  slug: '',
  content: '',
  description: '',
};

const quillOptionsMaker = ({ imageHandler, webcamHandler, audioHandler }) => ({
  modules: {
    toolbar: {
      container: '#quill-toolbar',
      handlers: {
        image: imageHandler,
        webcam: webcamHandler,
        audio: audioHandler,
      },
    },
    clipboard: {
      matchVisual: false,
      matchers: [],
    },
    imageResize: {
      displayStyles: {
        backgroundColor: 'black',
        border: 'none',
        color: 'white',
      },
      modules: ['Resize', 'DisplaySize', 'Toolbar'],
    },
  },
  formats: [
    'header',
    'bold',
    'italic',
    'underline',
    'strike',
    'blockquote',
    'list',
    'bullet',
    'indent',
    'link',
    'image',
    'video',
    'width',
    'style',
    'webcam',
    'audio',
  ],
});

let quillOptions;
function EditArticlePage({
  article = {},
  ready,
  match: {
    params: { slug },
  },
  history,
}) {
  const [{ isMobile, language }, dispatch] = useAppContext();
  const classes = useStyles();
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [quill, setQuill] = useState(null);
  const [picker, togglePicker] = useState(false);
  const [webcam, toggleWebcam] = useState(false);
  const [audio, toggleAudio] = useState(false);
  const [data, setData] = useObjectState(emptyArticle);
  const [content, setContent] = useState('');
  const [toastInstance, setToast] = useState();
  const [toastRange, setRange] = useState(0);
  const publicURL = `${Meteor.absoluteUrl()}public/${Meteor.userId()}/${data.slug}`;
  const toastRef = useRef();

  useEffect(() => {
    if (toastRef.current) {
      setToast(toastRef.current.getInstance());
    }
  }, [toastRef.current]);

  function imageHandler(instance) {
    if (data.markdown) {
      setRange(instance.getRange());
    }
    togglePicker(true);
    // eslint-disable-next-line react/no-this-in-sfc
    setQuill(this.quill);
  }
  function webcamHandler(instance) {
    if (data.markdown) {
      setRange(instance.getRange());
    }
    toggleWebcam(true);
    // eslint-disable-next-line react/no-this-in-sfc
    setQuill(this.quill);
  }
  function audioHandler(instance) {
    if (data.markdown) {
      setRange(instance.getRange());
    }
    toggleAudio(true);
    // eslint-disable-next-line react/no-this-in-sfc
    setQuill(this.quill);
  }

  useEffect(() => {
    quillOptions = quillOptionsMaker({
      imageHandler,
      webcamHandler,
      audioHandler,
    });
  }, []);

  const onUpdateRichText = (html) => {
    let imgData;
    let fileName;
    let format;
    let imgTag;
    let newContent = html;
    if (!data.markdown) {
      const noScriptHtml = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
      newContent = noScriptHtml.replace(/cursor: nesw-resize;/gi, '');
      const isImageBase64 = newContent.search('<img src="data:');
      if (isImageBase64 > -1) {
        const imgString = newContent.substring(isImageBase64);
        const endImgTag = imgString.search('>');
        imgTag = imgString.substring(0, endImgTag + 1);
        [, imgData] = imgTag.split('"');
        format = getExtension(null, imgData);
        fileName = `File_${Random.id()}`;
      }
      setContent(newContent);
    } else {
      setContent(newContent);
      const isImageBase64 = newContent.indexOf('(data:');
      if (isImageBase64 > -1) {
        const imgString = newContent.substring(isImageBase64 + 1);
        const endImgTag = imgString.indexOf(')');
        imgData = imgString.substring(0, endImgTag);
        format = getExtension(null, imgData);
        fileName = `File_${Random.id()}`;
      }
    }

    if (imgData) {
      dispatch({
        type: 'uploads.add',
        data: {
          name: fileName,
          fileName,
          file: imgData,
          type: format,
          path: `users/${Meteor.userId()}`,
          storage: true,
          onFinish: (url) => {
            let newHTML;
            let isImage = false;
            PICTURES_TYPES.forEach((extension) => {
              if (format.search(extension) > -1) {
                isImage = true;
              }
            });
            if (isImage || data.markdown) {
              newHTML = newContent.replace(imgData, url);
            } else if (!data.markdown) {
              newHTML = newContent.replace(imgTag, `<a target="_blank" href="${url}">${url}</a>`);
            }
            if (data.markdown) {
              toastRef.current.getInstance().setMarkdown(newHTML);
            } else {
              setContent(newHTML);
            }
          },
        },
      });
    }
  };
  const insertVideo = (videoUrl) => {
    const range = quill ? quill.getSelection(true) : toastRange;
    if (quill) {
      quill.insertEmbed(range.index, 'webcam', videoUrl);
    } else {
      const stringToAdd = toastInstance.isMarkdownMode()
        ? `[${videoUrl}](${videoUrl})`
        : `<a target="_blank" href="${videoUrl}">${videoUrl}</a>`;
      toastInstance.insertText(stringToAdd);
    }
    toggleWebcam(false);
  };
  const insertAudio = (audioUrl) => {
    const range = quill ? quill.getSelection(true) : toastRange;
    if (quill) {
      quill.insertEmbed(range.index, 'audio', audioUrl);
    } else {
      const stringToAdd = toastInstance.isMarkdownMode()
        ? `[${audioUrl}](${audioUrl})`
        : `<a target="_blank" href="${audioUrl}">${audioUrl}</a>`;
      toastInstance.insertText(stringToAdd);
    }
    toggleAudio(false);
  };

  const selectFile = (file) => {
    const range = quill ? quill.getSelection(true) : toastRange;
    let format = 'attachment';
    PICTURES_TYPES.forEach((extension) => {
      if (file.name.search(extension) > -1) {
        format = 'image';
      }
    });
    VIDEO_TYPES.forEach((extension) => {
      if (file.name.search(extension) > -1) {
        format = 'video';
      }
    });
    SOUND_TYPES.forEach((extension) => {
      if (file.name.search(extension) > -1) {
        format = 'audio';
      }
    });
    const url = `${HOST}${file.name}`;
    if (quill) {
      if (format === 'image') {
        quill.insertEmbed(range.index, format, url);
      } else if (format === 'video') {
        quill.insertEmbed(range.index, 'webcam', url);
      } else if (format === 'audio') {
        quill.insertEmbed(range.index, 'audio', url);
      } else {
        quill.pasteHTML(range.index, `![${url}](${url})`);
      }
      setQuill(null);
    } else {
      let stringToAdd = '';
      if (format === 'image') {
        stringToAdd = toastInstance.isMarkdownMode() ? `![${url}](${url})` : `<img src="${url}" />`;
      } else {
        stringToAdd = toastInstance.isMarkdownMode()
          ? `[${url}](${url})`
          : `<a target="_blank" href="${url}">${url}</a>`;
      }
      toastInstance.insertText(stringToAdd);
    }
    togglePicker(false);
  };

  useEffect(() => {
    if (article._id && slug && !mounted) {
      setMounted(true);
      setData(article);
      setContent(article.content);
    }
  }, [article]);

  const handleCopyURL = () => {
    navigator.clipboard.writeText(publicURL).then(msg.success(i18n.__('pages.EditArticlePage.successCopyURL')));
  };

  const onUpdateField = (event) => {
    const { name, value } = event.target;
    if (name === 'title') {
      const date = new Date();
      setData({
        [name]: value,
        slug: article._id ? article.slug : slugy(`${value}_${date.toISOString()}`),
      });
    } else if (name === 'description') {
      setData({ [name]: value.substring(0, 400) });
    }
  };

  const deleteArticle = () => {
    setLoading(true);
    removeArticle.call({ articleId: article._id }, (err) => {
      setLoading(false);
      if (err) {
        msg.error(err.reason);
      } else {
        msg.success(i18n.__('pages.EditArticlePage.successDelete'));
        history.push('/publications');
      }
    });
  };

  const submitUpdateArticle = () => {
    setLoading(true);
    const method = slug ? updateArticle : createArticle;
    data.content = content;
    delete data._id;
    const payload = { data };
    if (article._id) {
      payload.articleId = article._id;
    }
    method.call(payload, (err) => {
      setLoading(false);
      if (err) {
        msg.error(err.reason);
      } else {
        msg.success(i18n.__(`pages.EditArticlePage.${slug ? 'successUpdate' : 'successCreate'}`));
        history.push('/publications');
      }
    });
  };

  const toggleMarkdown = (bool) => {
    setData({ markdown: bool });
  };

  if (!ready || (slug && !article._id && !data._id) || loading) {
    return <Spinner />;
  }
  return (
    <Container>
      <Grid container spacing={4}>
        <Grid item xs={12} className={isMobile ? null : classes.flex}>
          <Typography variant={isMobile ? 'h6' : 'h4'} className={classes.flex}>
            {i18n.__(`pages.EditArticlePage.${slug ? 'title' : 'creationTitle'}`)}
          </Typography>
        </Grid>
      </Grid>
      <form noValidate autoComplete="off">
        <TextField
          onChange={onUpdateField}
          value={data.title}
          name="title"
          label={i18n.__('pages.EditArticlePage.titleLabel')}
          variant="outlined"
          fullWidth
          margin="normal"
        />
        <TextField
          value={publicURL}
          label={i18n.__('pages.EditArticlePage.slugLabel')}
          variant="outlined"
          fullWidth
          margin="normal"
          disabled
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <IconButton
                  title={i18n.__('pages.EditArticlePage.copyPublicURL')}
                  aria-label={i18n.__('pages.EditArticlePage.copyPublicURL')}
                  onClick={handleCopyURL}
                >
                  <AssignmentIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        <TextField
          onChange={onUpdateField}
          value={data.description}
          name="description"
          label={i18n.__('pages.EditArticlePage.descriptionLabel')}
          variant="outlined"
          fullWidth
          margin="normal"
          multiline
          helperText={`${data.description.length}/400`}
        />

        <div className={classes.wysiwyg}>
          <InputLabel htmlFor="content">{i18n.__('pages.EditArticlePage.contentLabel')}</InputLabel>

          {typeof data.markdown === 'undefined' && (
            <div className={classes.buttonsContainer}>
              <Button variant="contained" onClick={() => toggleMarkdown(false)}>
                {i18n.__('pages.EditArticlePage.switchToHtml')}
              </Button>

              <Button variant="contained" onClick={() => toggleMarkdown(true)}>
                {i18n.__('pages.EditArticlePage.switchToMarkdown')}
              </Button>
            </div>
          )}

          {typeof data.markdown !== 'undefined' ? (
            data.markdown ? (
              <ToastUIEditor
                id="content"
                language={language}
                toastRef={toastRef}
                value={content}
                onChange={onUpdateRichText}
                handlers={{ imageHandler, webcamHandler, audioHandler }}
              />
            ) : (
              <>
                <CustomToolbarArticle withMedia withWebcam />
                <ReactQuill {...quillOptions} id="content" value={content} onChange={onUpdateRichText} />
              </>
            )
          ) : null}
        </div>

        <div className={classes.buttonGroup}>
          <Button variant="contained" color="primary" onClick={submitUpdateArticle}>
            {slug ? i18n.__('pages.EditArticlePage.update') : i18n.__('pages.EditArticlePage.save')}
          </Button>

          <Button variant="contained" onClick={() => history.push('/publications')}>
            {i18n.__('pages.EditArticlePage.cancel')}
          </Button>
          {!!slug && (
            <ValidationButton
              color="red"
              icon={<DeleteIcon />}
              text={i18n.__('pages.EditArticlePage.delete')}
              onAction={deleteArticle}
            />
          )}
        </div>
      </form>
      {picker && <ImagePicker selectFile={selectFile} onClose={() => togglePicker(false)} isMobile={isMobile} />}
      {webcam && <WebcamModal selectFile={insertVideo} onClose={() => toggleWebcam(false)} />}
      {audio && <AudioModal selectFile={insertAudio} onClose={() => toggleAudio(false)} />}
    </Container>
  );
}

EditArticlePage.propTypes = {
  article: PropTypes.objectOf(PropTypes.any).isRequired,
  ready: PropTypes.bool.isRequired,
  match: PropTypes.objectOf(PropTypes.any).isRequired,
  history: PropTypes.objectOf(PropTypes.any).isRequired,
};

export default withTracker(
  ({
    match: {
      params: { slug },
    },
  }) => {
    let ready = false;
    let article = {};
    if (slug) {
      const articleHandle = Meteor.subscribe('articles.one', { slug });
      article = Articles.findOneFromPublication('articles.one', {}) || {};
      ready = articleHandle.ready();
    } else {
      // create new article
      ready = true;
    }
    return {
      article,
      ready,
    };
  },
)(EditArticlePage);
