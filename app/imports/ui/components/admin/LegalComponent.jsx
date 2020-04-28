import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import ReactQuill from 'react-quill'; // ES6
import {
  makeStyles, TextField, FormControlLabel, Checkbox, InputLabel, Button, Typography,
} from '@material-ui/core';
import i18n from 'meteor/universe:i18n';
import { useObjectState } from '../../utils/hooks';
import { updateAppsettings } from '../../../api/appsettings/methods';
import Spinner from '../system/Spinner';

const useStyles = makeStyles((theme) => ({
  root: {
    padding: `0 ${theme.spacing(2)}px 0 ${theme.spacing(2)}px`,
    flex: 1,
  },
  wysiwyg: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(3),
  },
  buttonGroup: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: theme.spacing(5),
  },
}));

const quillOptions = {
  modules: {
    toolbar: {
      container: [
        [{ header: [1, 2, 3, 4, 5, false] }],
        ['bold', 'italic', 'underline', 'strike', 'blockquote'],
        [{ list: 'ordered' }, { list: 'bullet' }, { indent: '-1' }, { indent: '+1' }],
        ['link'],
        ['clean'],
      ],
    },
    clipboard: {
      matchVisual: false,
      matchers: [],
    },
  },
  formats: ['header', 'bold', 'italic', 'underline', 'strike', 'blockquote', 'list', 'bullet', 'indent', 'link'],
};

const LegalComponent = ({ tabkey, data = {} }) => {
  const classes = useStyles();
  const [state, setState] = useObjectState(data);
  const [loading, setLoading] = useState(true);
  const [changes, setChanges] = useState(false);

  useEffect(() => {
    setState({ ...data });
    setLoading(false);
  }, [data]);

  useEffect(() => {
    if (JSON.stringify(state) !== JSON.stringify(data)) {
      setChanges(true);
    } else {
      setChanges(false);
    }
  }, [state]);

  const onCheckExternal = (event) => {
    const { name, checked } = event.target;
    setState({ [name]: checked });
  };

  const onUpdateField = (event) => {
    const { name, value } = event.target;
    setState({ [name]: value });
  };

  const onUpdateRichText = (html) => {
    const content = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    if (state.external) {
      setState({ content: state.content });
    } else {
      setState({ content });
    }
  };

  const onSubmitUpdateData = () => {
    setLoading(true);

    updateAppsettings.call({ ...state, key: tabkey }, (error) => {
      setLoading(false);
      if (error) {
        msg.error(error.message);
      } else {
        msg.success(i18n.__('api.methods.operationSuccessMsg'));
      }
    });
  };

  const onCancel = () => {
    setState({ ...data });
  };

  if (loading && !!state) {
    return <Spinner full />;
  }

  return (
    <form className={classes.root}>
      <Typography variant="h4">{i18n.__(`components.LegalComponent.title_${tabkey}`)}</Typography>
      <FormControlLabel
        control={
          <Checkbox checked={state.external || false} onChange={onCheckExternal} name="external" color="primary" />
        }
        label={i18n.__(`components.LegalComponent.external_${tabkey}`)}
      />
      {state.external ? (
        <TextField
          onChange={onUpdateField}
          value={state.link}
          name="link"
          label={i18n.__(`components.LegalComponent.link_${tabkey}`)}
          variant="outlined"
          fullWidth
          margin="normal"
        />
      ) : (
        <div className={classes.wysiwyg}>
          <InputLabel htmlFor="content">{i18n.__(`components.LegalComponent.content_${tabkey}`)}</InputLabel>
          <ReactQuill id="content" value={state.content || ''} onChange={onUpdateRichText} {...quillOptions} />
        </div>
      )}
      {changes && (
        <div className={classes.buttonGroup}>
          <Button variant="contained" color="primary" onClick={onSubmitUpdateData} disabled={loading}>
            {i18n.__('components.LegalComponent.update')}
          </Button>

          <Button variant="contained" onClick={onCancel} disabled={loading}>
            {i18n.__('components.LegalComponent.cancel')}
          </Button>
        </div>
      )}
    </form>
  );
};

LegalComponent.propTypes = {
  tabkey: PropTypes.string.isRequired,
  data: PropTypes.objectOf(PropTypes.any),
};

LegalComponent.defaultProps = {
  data: {},
};

export default LegalComponent;
