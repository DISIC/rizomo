import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import i18n from 'meteor/universe:i18n';
import ReactQuill, { Quill } from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { withTracker } from 'meteor/react-meteor-data';
import DeleteIcon from '@material-ui/icons/Delete';
import { Random } from 'meteor/random';
import ImageResize from 'quill-image-resize-module';
import {
  TextField, Typography, InputLabel, Container, Grid, makeStyles, Button,
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
import '../../utils/QuillImage';

Quill.register('modules/ImageResize', ImageResize);

const {
  minioEndPoint, minioPort, minioBucket, minioSSL,
} = Meteor.settings.public;

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
  },
  buttonGroup: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: 60,
  },
}));

const emptyArticle = {
  title: '',
  slug: '',
  content: '',
  description: '',
};

const quillOptionsMaker = (handler) => ({
  modules: {
    toolbar: {
      container: [
        [{ header: [1, 2, 3, 4, 5, false] }],
        ['bold', 'italic', 'underline', 'strike', 'blockquote'],
        [{ list: 'ordered' }, { list: 'bullet' }, { indent: '-1' }, { indent: '+1' }],
        ['link', 'image', 'video'],
        ['clean'],
      ],
      handlers: {
        image: handler,
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
  ],
});

let quillOptions;
const IMAGE_TYPES = ['svg', 'png', 'jpg', 'gif', 'jpeg'];

function EditArticlePage({
  article = {},
  ready,
  match: {
    params: { slug },
  },
  history,
}) {
  const [{ isMobile }, dispatch] = useAppContext();
  const classes = useStyles();
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [quill, setQuill] = useState(null);
  const [picker, togglePicker] = useState(false);
  const [data, setData] = useObjectState(emptyArticle);
  const [content, setContent] = useState('');

  function imageHandler() {
    togglePicker(true);
    // eslint-disable-next-line react/no-this-in-sfc
    setQuill(this.quill);
  }

  useEffect(() => {
    quillOptions = quillOptionsMaker(imageHandler);
  }, []);

  const selectFile = (file) => {
    const range = quill.getSelection(true);
    let format = 'attachment';
    IMAGE_TYPES.forEach((extension) => {
      if (file.name.search(extension) > -1) {
        format = 'image';
      }
    });
    const url = `${HOST}${file.name}`;
    if (format === 'image') {
      quill.insertEmbed(range.index, format, url);
    } else {
      quill.pasteHTML(range.index, `<a target="_blank" href="${url}">${url}</a>`);
    }
    togglePicker(false);
    setQuill(null);
  };

  useEffect(() => {
    if (article._id && slug && !mounted) {
      setMounted(true);
      setData(article);
      setContent(article.content);
    }
  }, [article]);

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

  const onUpdateRichText = async (html) => {
    const noScriptHtml = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    const strippedHtml = noScriptHtml.replace(/cursor: nesw-resize;/gi, '');
    const isImageBase64 = strippedHtml.search('<img src="data:');
    if (isImageBase64 > -1) {
      const imgString = strippedHtml.substring(isImageBase64);
      const endImgTag = imgString.search('>');
      const imgTag = imgString.substring(0, endImgTag + 1);
      const imgData = imgTag.split('"')[1];
      const fileName = `File_${Random.id()}`;
      setContent(strippedHtml);
      dispatch({
        type: 'uploads.add',
        data: {
          name: fileName,
          fileName,
          file: imgData,
          path: `users/${Meteor.userId()}`,
          storage: true,
          onFinish: (url) => {
            let newHTML;
            let isImage = false;
            const format = getExtension(imgData);
            IMAGE_TYPES.forEach((extension) => {
              if (format.search(extension) > -1) {
                isImage = true;
              }
            });
            if (isImage) {
              newHTML = strippedHtml.replace(imgData, url);
            } else {
              newHTML = strippedHtml.replace(imgTag, `<a target="_blank" href="${url}">${url}</a>`);
            }
            setContent(newHTML);
          },
        },
      });
    } else {
      setContent(strippedHtml);
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
          value={`${Meteor.absoluteUrl()}public/${Meteor.userId()}/${data.slug}`}
          label={i18n.__('pages.EditArticlePage.slugLabel')}
          variant="outlined"
          fullWidth
          margin="normal"
          disabled
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
          <ReactQuill {...quillOptions} id="content" value={content} onChange={onUpdateRichText} />
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
    const articleHandle = Meteor.subscribe('articles.one', { slug });
    const article = Articles.findOneFromPublication('articles.one', {}) || {};
    const ready = articleHandle.ready();
    return {
      article,
      ready,
    };
  },
)(EditArticlePage);
