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

const AdminGroupQuota = ({ data, open, onClose }) => {
  const [{ isMobile }] = useAppContext();
  const [quota, setQuota] = useState(data.groupQuota);
  const classes = useStyles(isMobile)();
  const changeQuota = () => {
    const quotaInt = parseInt(quota, 10);
    Meteor.call(
      'users.setQuota',
      {
        quota: quotaInt,
        userId: data._id,
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

  const updateQuota = (e) => {
    setQuota(e.target.value);
  };

  return (
    <Modal open={open} onClose={onClose}>
      <div className={classes.paper}>
        <Card className={classes.root}>
          <CardHeader
            title={i18n.__('components.AdminGroupQuota.subtitle') + data.username}
            action={
              <IconButton onClick={onClose}>
                <ClearIcon />
              </IconButton>
            }
          />
          <CardContent>
            <Typography>{i18n.__('components.AdminGroupQuota.mainText')}</Typography>
            <TextField
              defaultValue={data.groupQuota}
              type="number"
              onChange={updateQuota}
              InputProps={{
                inputProps: {
                  max: 9999,
                  min: data.groupCount || 0,
                },
              }}
            />
            <Typography className={classes.groupCountInfo}>
              {data.groupCount} {i18n.__('components.AdminGroupQuota.createdGroup')}
            </Typography>
          </CardContent>
          <CardActions className={classes.actions}>
            <Button onClick={onClose}>{i18n.__('components.AdminGroupQuota.cancel')}</Button>
            <Button onClick={changeQuota} variant="contained" color="primary">
              {i18n.__('components.AdminGroupQuota.ValidateForm')}
            </Button>
          </CardActions>
        </Card>
      </div>
    </Modal>
  );
};

AdminGroupQuota.propTypes = {
  data: PropTypes.objectOf(PropTypes.any).isRequired,
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default AdminGroupQuota;
