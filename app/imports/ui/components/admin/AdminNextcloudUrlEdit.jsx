import React, { useState } from 'react';
import i18n from 'meteor/universe:i18n';
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
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
import COMMON_STYLES from '../../themes/styles';

const useStyles = (isMobile) =>
  makeStyles((theme) => ({
    root: COMMON_STYLES.root,
    media: COMMON_STYLES.media,
    video: COMMON_STYLES.video,
    actions: COMMON_STYLES.actions,
    paper: COMMON_STYLES.paper(isMobile),
    iconWrapper: COMMON_STYLES.iconWrapper,
    groupCountInfo: COMMON_STYLES.groupCountInfo,
    buttonGroup: {
      display: 'flex',
      justifyContent: 'space-between',
      marginTop: theme.spacing(5),
    },
    alert: COMMON_STYLES.alert,
  }));

const AdminNextCloudUrlEdit = ({ data, open, onClose }) => {
  const [{ isMobile }] = useAppContext();
  const [url, setUrl] = useState(data.url);
  const active = true;
  const classes = useStyles(isMobile)();
  const changeURL = () => {
    Meteor.call(
      'nextcloud.updateURL',
      {
        url,
        active,
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

  const updateURL = (e) => {
    setUrl(e.target.value);
  };

  return (
    <Modal open={open} onClose={onClose}>
      <div className={classes.paper}>
        <Card className={classes.root}>
          <CardHeader
            title={i18n.__('components.AdminNextCloudUrlEdit.subtitle')}
            action={
              <IconButton onClick={onClose}>
                <ClearIcon />
              </IconButton>
            }
          />
          <CardContent>
            <Typography>{i18n.__('components.AdminNextCloudUrlEdit.mainText')}</Typography>
            <Grid>
              <TextField
                defaultValue={url}
                fullWidth
                label={i18n.__('components.AdminNextCloudUrlEdit.labelUrl')}
                type="text"
                onChange={updateURL}
              />
            </Grid>
          </CardContent>
          <CardActions className={classes.actions}>
            <div className={classes.buttonGroup}>
              <Button style={{ marginRight: 10 }} onClick={onClose}>
                {i18n.__('components.AdminNextCloudUrlEdit.cancel')}
              </Button>
              <Button onClick={changeURL} variant="contained" color="primary">
                {i18n.__('components.AdminNextCloudUrlEdit.ValidateForm')}
              </Button>
            </div>
          </CardActions>
        </Card>
      </div>
    </Modal>
  );
};

AdminNextCloudUrlEdit.propTypes = {
  data: PropTypes.objectOf(PropTypes.any).isRequired,
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default AdminNextCloudUrlEdit;
