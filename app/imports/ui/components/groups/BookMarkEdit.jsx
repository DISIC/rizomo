import React, { useState } from 'react';
import i18n from 'meteor/universe:i18n';
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardActions from '@material-ui/core/CardActions';
import IconButton from '@material-ui/core/IconButton';
import Button from '@material-ui/core/Button';
import Modal from '@material-ui/core/Modal';
import ClearIcon from '@material-ui/icons/Clear';
import PropTypes from 'prop-types';
import CardContent from '@material-ui/core/CardContent';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
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
      justifyContent: 'center',
    },
    groupCountInfo: {
      marginTop: 30,
    },
    alert: {
      margin: 8,
    },
  }));

const BookMarkEdit = ({ data, group, onEdit, open, onClose }) => {
  const [{ isMobile }] = useAppContext();
  const [url, setUrl] = useState(data.url);
  const [tag, setTag] = useState(data.tag);
  const [name, setName] = useState(data.name);
  const classes = useStyles(isMobile)();

  const changeBookmark = () => {
    Meteor.call(
      'bookmark.updateURL',
      {
        url,
        name,
        tag,
        groupId: group._id,
      },
      function callbackQuota(error) {
        if (error) {
          msg.error(error.message);
        } else {
          msg.success(i18n.__('api.methods.operationSuccessMsg'));
        }
      },
    );
    onClose();
  };

  const createBookmark = () => {
    Meteor.call(
      'bookmark.create',
      {
        url,
        name,
        tag,
        groupId: group._id,
      },
      function callbackQuota(error, urlFinal) {
        if (error) {
          msg.error(error.message);
        } else {
          msg.success(i18n.__('api.methods.operationSuccessMsg'));
          Meteor.call('bookmark.getFavicon', { url: urlFinal });
        }
      },
    );
    onClose();
  };

  const updateURL = (e) => {
    setUrl(e.target.value);
  };

  const updateName = (e) => {
    setName(e.target.value);
  };

  const updateTag = (e) => {
    setTag(e.target.value);
  };
  return (
    <Modal open={open} onClose={onClose}>
      <div className={classes.paper}>
        <Card className={classes.root}>
          <CardHeader
            title={
              onEdit ? i18n.__('components.BookMarkEdit.title-edit') : i18n.__('components.BookMarkEdit.title-create')
            }
            action={
              <IconButton onClick={onClose}>
                <ClearIcon />
              </IconButton>
            }
          />
          <CardContent>
            <Typography>{i18n.__('components.BookMarkEdit.mainText')}</Typography>
            <TextField
              defaultValue={name}
              label={i18n.__('components.BookMarkEdit.labelName')}
              type="text"
              onChange={updateName}
            />
          </CardContent>
          <CardContent>
            {onEdit ? (
              <TextField
                defaultValue={url}
                disabled
                label={i18n.__('components.BookMarkEdit.labelUrl')}
                type="text"
                onChange={updateURL}
              />
            ) : (
              <TextField
                defaultValue={url}
                label={i18n.__('components.BookMarkEdit.labelUrl')}
                type="text"
                onChange={updateURL}
              />
            )}
          </CardContent>
          <CardContent>
            <TextField
              defaultValue={tag}
              label={i18n.__('components.BookMarkEdit.labelTag')}
              type="text"
              onChange={updateTag}
            />
          </CardContent>
          <CardActions className={classes.actions}>
            {onEdit ? (
              <Button onClick={changeBookmark} variant="contained" color="primary">
                {i18n.__('components.BookMarkEdit.ValidateFormUpdate')}
              </Button>
            ) : (
              <Button onClick={createBookmark} variant="contained" color="primary">
                {i18n.__('components.BookMarkEdit.ValidateFormCreate')}
              </Button>
            )}
            <Button onClick={onClose}>{i18n.__('components.BookMarkEdit.cancel')}</Button>
          </CardActions>
        </Card>
      </div>
    </Modal>
  );
};

BookMarkEdit.propTypes = {
  data: PropTypes.objectOf(PropTypes.any).isRequired,
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  group: PropTypes.objectOf(PropTypes.any).isRequired,
  onEdit: PropTypes.bool.isRequired,
};

export default BookMarkEdit;
