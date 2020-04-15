import React, { useContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import i18n from 'meteor/universe:i18n';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { withTracker } from 'meteor/react-meteor-data';
import DeleteIcon from '@material-ui/icons/Delete';
import {
  TextField, Typography, InputLabel, Container, Grid, makeStyles, Button,
} from '@material-ui/core';
import Articles from '../../../api/articles/articles';
import Spinner from '../../components/system/Spinner';
import { Context } from '../../contexts/context';
import { useObjectState } from '../../utils/hooks';
import slugy from '../../utils/slugy';
import { updateArticle, createArticle, removeArticle } from '../../../api/articles/methods';
import ValidationButton from '../../components/system/ValidationButton';

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
    marginTop: '10px',
  },
}));

const emptyArticle = {
  title: '',
  slug: '',
  content: '',
  description: '',
};

function imageHandler() {
  const range = this.quill.getSelection();
  const value = prompt('What is the image URL');
  console.log(value, range);
  if (value) {
    this.quill.insertEmbed(range.index, 'image', value);
  }
}

const toolbarOptions = [
  [{ header: [1, 2, 3, 4, 5, false] }],
  ['bold', 'italic', 'underline', 'strike', 'blockquote'],
  [{ list: 'ordered' }, { list: 'bullet' }, { indent: '-1' }, { indent: '+1' }],
  ['link', 'image'],
  ['clean'],
];
const quillOptions = {
  modules: {
    toolbar: {
      container: toolbarOptions,
      handlers: {
        image: imageHandler,
      },
    },
    clipboard: {
      matchVisual: false,
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
  ],
};

function EditArticlePage({
  article = {},
  ready,
  match: {
    params: { slug },
  },
  history,
}) {
  const [{ isMobile }] = useContext(Context);
  const classes = useStyles();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useObjectState(emptyArticle);
  const [content, setContent] = useState('');

  useEffect(() => {
    if (article._id && slug) {
      setData(article);
      setContent(article.content);
    }
  }, [article]);

  const onUpdateField = (event) => {
    const { name, value } = event.target;
    if (name === 'title') {
      setData({
        [name]: value,
        slug: slugy(value),
      });
    } else if (name === 'description') {
      setData({ [name]: value.substring(0, 400) });
    }
  };

  const onUpdateRichText = (html) => {
    setContent(html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ''));
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
