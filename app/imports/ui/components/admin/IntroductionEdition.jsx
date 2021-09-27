import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import ReactQuill from 'react-quill'; // ES6
import { makeStyles } from '@material-ui/core/styles';
import InputLabel from '@material-ui/core/InputLabel';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import FormControl from '@material-ui/core/FormControl';
import MenuItem from '@material-ui/core/MenuItem';
import 'react-quill/dist/quill.snow.css';
import Select from '@material-ui/core/Select';

import i18n from 'meteor/universe:i18n';
import { updateIntroductionLanguage } from '../../../api/appsettings/methods';
import Spinner from '../system/Spinner';
import { CustomToolbarArticle } from '../system/CustomQuill';
import '../../utils/QuillVideo';

const useStyles = makeStyles((theme) => ({
  root: {
    padding: `0 ${theme.spacing(2)}px 0 ${theme.spacing(2)}px`,
    flex: 1,
  },
  wysiwyg: {
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(3),
  },
  buttonGroup: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: theme.spacing(5),
  },
  formControl: {
    minWidth: '50%',
  },
}));

const quillOptions = {
  modules: {
    toolbar: {
      container: '#quill-toolbar',
    },
    clipboard: {
      matchVisual: false,
      matchers: [],
    },
  },
  formats: ['header', 'bold', 'italic', 'underline', 'strike', 'blockquote', 'list', 'bullet', 'indent', 'link'],
};

const IntroductionEdition = ({ data = [] }) => {
  const classes = useStyles();
  const [content, setContent] = useState('');
  const [language, setLanguage] = useState(i18n._locale);
  const [loading, setLoading] = useState(true);
  const [changes, setChanges] = useState(false);

  const translations = Object.keys(i18n._translations);

  useEffect(() => {
    if (data) {
      const currentData = data.find((entry) => entry.language === language) || {};
      setContent(currentData.content || '');
      setLoading(false);
    }
  }, [data, language]);

  useEffect(() => {
    if (data) {
      const currentData = data.find((entry) => entry.language === language) || {};
      if (content !== currentData.content) {
        setChanges(true);
      } else {
        setChanges(false);
      }
    }
  }, [content]);

  const onUpdateRichText = (html) => {
    const strippedHTML = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    setContent(strippedHTML);
  };

  const onSubmitUpdateData = () => {
    setLoading(true);

    updateIntroductionLanguage.call({ language, content }, (error) => {
      setLoading(false);
      if (error) {
        msg.error(error.message);
      } else {
        msg.success(i18n.__('api.methods.operationSuccessMsg'));
      }
    });
  };

  const onCancel = () => {
    const currentData = data.find((entry) => entry.language === language) || {};
    setContent(currentData.content || '');
  };

  const handleChange = (event) => {
    setLanguage(event.target.value);
  };

  if (loading) {
    return <Spinner full />;
  }

  return (
    <form className={classes.root}>
      <Typography variant="h4">{i18n.__('components.IntroductionEdition.title')}</Typography>

      <FormControl className={classes.formControl}>
        <InputLabel id="language-selector-label">{i18n.__('components.IntroductionEdition.language')}</InputLabel>
        <Select labelId="language-selector-label" id="language-selector" value={language} onChange={handleChange}>
          {translations.map((tra) => (
            <MenuItem value={tra} key={`components.IntroductionEdition.language_${tra}`}>
              {i18n.__(`components.IntroductionEdition.language_${tra}`)}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <div className={classes.wysiwyg}>
        <InputLabel htmlFor="content">{i18n.__('components.IntroductionEdition.content')}</InputLabel>
        <CustomToolbarArticle />
        <ReactQuill id="content" value={content || ''} onChange={onUpdateRichText} {...quillOptions} />
      </div>
      {changes && (
        <div className={classes.buttonGroup}>
          <Button variant="contained" onClick={onCancel} disabled={loading}>
            {i18n.__('components.IntroductionEdition.cancel')}
          </Button>

          <Button variant="contained" color="primary" onClick={onSubmitUpdateData} disabled={loading}>
            {i18n.__('components.IntroductionEdition.update')}
          </Button>
        </div>
      )}
    </form>
  );
};

IntroductionEdition.propTypes = {
  data: PropTypes.arrayOf(PropTypes.any),
};

IntroductionEdition.defaultProps = {
  data: [],
};

export default IntroductionEdition;
