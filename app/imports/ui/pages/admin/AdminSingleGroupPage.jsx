/* eslint-disable react/no-this-in-sfc */
import React, { useState, useEffect } from 'react';
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import i18n from 'meteor/universe:i18n';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import InputLabel from '@material-ui/core/InputLabel';
import Fade from '@material-ui/core/Fade';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Grid from '@material-ui/core/Grid';

import PropTypes from 'prop-types';
import slugify from 'slugify';
import ReactQuill from 'react-quill'; // ES6
import 'react-quill/dist/quill.snow.css'; // ES6
import { useHistory } from 'react-router-dom';
import { Roles } from 'meteor/alanning:roles';

import Spinner from '../../components/system/Spinner';
import { createGroup, updateGroup } from '../../../api/groups/methods';
import Groups from '../../../api/groups/groups';
import GroupsUsersList from '../../components/admin/GroupUsersList';
import { useAppContext } from '../../contexts/context';
import { CustomToolbar } from '../../components/system/CustomQuill';
import GroupAvatarPicker from '../../components/groups/GroupAvatarPicker';
import '../../utils/QuillVideo';

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(2),
    marginBottom: theme.spacing(5),
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

function TabPanel(props) {
  const { value, index, userRole, groupId } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`scrollable-auto-tabpanel-${index}`}
      aria-labelledby={`scrollable-auto-tab-${index}`}
    >
      {value === index && <GroupsUsersList userRole={userRole} groupId={groupId} />}
    </div>
  );
}

TabPanel.propTypes = {
  userRole: PropTypes.string.isRequired,
  groupId: PropTypes.string.isRequired,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

const defaultState = {
  name: '',
  slug: '',
  description: '',
  content: '',
  avatar: '',
  type: Number(Object.keys(Groups.typeLabels)[0]),
};

const quillOptions = {
  clipboard: {
    matchVisual: false,
  },
  toolbar: {
    container: '#quill-toolbar',
  },
};

const AdminSingleGroupPage = ({ group, ready, match: { params } }) => {
  const [, dispatch] = useAppContext();
  const [groupData, setGroupData] = useState(defaultState);
  const [loading, setLoading] = useState(!!params._id);
  const [tabId, setTabId] = React.useState(0);
  const [content, setContent] = useState('');

  const [plugins, setPlugins] = useState({}); // { nextcloud: false, rocketChat: true}
  const [{ isMobile }] = useAppContext();
  const { groupPlugins } = Meteor.settings.public;
  const history = useHistory();
  const classes = useStyles();

  const [{ userId }] = useAppContext();
  const isAdmin = Roles.userIsInRole(userId, 'admin', params._id);

  useEffect(() => {
    if (params._id && group._id && loading) {
      setLoading(false);
      setGroupData(group);
      setContent(group.content || '');
      setPlugins(group.plugins || {});
    }
  }, [group]);

  const handleChangeTab = (event, newValue) => {
    setTabId(newValue);
  };
  const [tempImageLoaded, setTempImageLoaded] = useState(false);
  const onUpdateField = (event) => {
    const { name, value } = event.target;
    if (name === 'name') {
      setGroupData({
        ...groupData,
        [name]: value,
        slug: slugify(value, {
          replacement: '-', // replace spaces with replacement
          remove: null, // regex to remove characters
          lower: true, // result in lower case
        }),
      });
    } else if (name === 'type') {
      setGroupData({ ...groupData, [name]: Number(value) });
    } else {
      setGroupData({ ...groupData, [name]: value });
    }
  };

  const SendNewAvatarToMedia = (avImg) => {
    // if group is not yet created, the temp image goes to user minio
    dispatch({
      type: 'uploads.add',
      data: {
        name: params._id ? 'groupAvatar_TEMP' : 'groupAvatar',
        fileName: params._id ? 'groupAvatar_TEMP' : 'groupAvatar',
        file: avImg,
        type: 'png',
        path: params._id ? `groups/${group._id}` : `users/${Meteor.userId()}`,
        storage: true,
        isUser: false,
        onFinish: (url) => {
          setGroupData({ ...groupData, avatar: `${url}?${new Date().getTime()}` });
          setTempImageLoaded(true);
        },
      },
    });
  };
  const onAssignAvatar = (avatarObj, groupName) => {
    // avatarObj = {image: base64... or url: http...}
    if (avatarObj.image) {
      SendNewAvatarToMedia(avatarObj.image, groupName);
    } else if (avatarObj.url !== group.avatar) {
      setGroupData({ ...groupData, avatar: avatarObj.url });
    }
  };

  const onUpdateRichText = (html) => {
    setContent(html);
  };
  const cancelForm = () => {
    if (tempImageLoaded) {
      // A temporary image has been loaded in minio with name "groupAvatar_TEMP"
      // => delete it
      if (params._id) {
        // on update
        Meteor.call('files.selectedRemove', {
          path: `groups/${group._id}`,
          toRemove: [`groups/${group._id}/groupAvatar_TEMP.png`],
          isUser: false,
        });
      } else {
        // on create
        Meteor.call('files.selectedRemove', {
          path: `users/${Meteor.userId()}`,
          toRemove: [`users/${Meteor.userId()}/groupAvatar.png`],
        });
      }
    }
    setTempImageLoaded(false);
    history.goBack();
  };
  const submitUpdateGroup = () => {
    if (groupData.avatar !== group.avatar) {
      if (tempImageLoaded) {
        // A temporary image has been loaded in minio with name "groupAvatar_TEMP"
        if (groupData.avatar.includes('groupAvatar_TEMP')) {
          // This image will be the new group's avatar
          if (params._id) {
            // only on update
            Meteor.call('files.rename', {
              path: `groups/${group._id}`,
              oldName: 'groupAvatar_TEMP.png',
              newName: 'groupAvatar.png',
            });
            setTempImageLoaded(false);
          }
        }
      }
    }
    const method = params._id ? updateGroup : createGroup;
    setLoading(true);
    const { _id, slug, avatar, ...rest } = groupData;
    let args;

    if (params._id) {
      args = {
        groupId: params._id,
        data: {
          ...rest,
          content,
          plugins,
          avatar: avatar.replace('groupAvatar_TEMP.png', 'groupAvatar.png'),
        },
      };
    } else {
      args = {
        ...rest,
        content,
        plugins,
        avatar,
      };
    }
    method.call(args, (error) => {
      setLoading(false);
      if (error) {
        msg.error(error.reason ? error.reason : error.message);
      } else {
        msg.success(i18n.__('api.methods.operationSuccessMsg'));
        history.goBack();
      }
    });
  };

  if (!ready || loading || (!!params._id && !group._id)) {
    return <Spinner />;
  }

  const onChangePlugins = (event, plugin) => {
    setPlugins({ ...plugins, [plugin]: event.target.checked });
  };

  const groupEnableChangeName = Object.keys(group.plugins || {})
    .filter((plug) => group.plugins[plug] === true)
    .map((plug) => groupPlugins[plug].enableChangeName)
    .reduce((acculator, currentValue) => acculator && currentValue, true);

  const groupPluginsShow = (plugin) => {
    if (groupPlugins[plugin].enable) {
      return (
        <FormGroup key={plugin}>
          <FormControlLabel
            control={
              <Checkbox
                checked={plugins[plugin]}
                onChange={(event) => onChangePlugins(event, plugin)}
                name={plugin}
                color="primary"
                disabled={!!params._id}
              />
            }
            label={i18n.__(`api.${plugin}.enablePluginForGroup`)}
          />
        </FormGroup>
      );
    }
    return null;
  };

  return (
    <Fade in>
      <Container>
        <Paper className={classes.root}>
          <Typography component="h1">
            {i18n.__(`pages.AdminSingleGroupPage.${params._id ? 'edition' : 'creation'}`)} <b>{groupData.name}</b>
          </Typography>
          <form noValidate autoComplete="off">
            <Grid container spacing={2} style={{ alignItems: 'center' }}>
              <Grid item xs={isMobile ? 12 : 6} style={{ paddingLeft: '18px' }}>
                <TextField
                  onChange={onUpdateField}
                  value={groupData.name}
                  name="name"
                  label={i18n.__('pages.AdminSingleGroupPage.name')}
                  variant="outlined"
                  fullWidth
                  margin="normal"
                  disabled={(!isAdmin && !!params._id) || !groupEnableChangeName}
                />
                <TextField
                  onChange={onUpdateField}
                  value={groupData.slug}
                  name="slug"
                  label={i18n.__('pages.AdminSingleGroupPage.slug')}
                  variant="outlined"
                  fullWidth
                  margin="normal"
                  disabled
                />
                {Object.keys(groupPlugins).map((p) => groupPluginsShow(p))}
                <FormControl>
                  <InputLabel htmlFor="type" id="type-label">
                    {i18n.__('pages.AdminSingleGroupPage.type')}
                  </InputLabel>
                  <Select
                    labelId="type-label"
                    id="type"
                    name="type"
                    value={groupData.type}
                    onChange={onUpdateField}
                    disabled={!isAdmin && !!params._id}
                  >
                    {Object.keys(Groups.typeLabels).map((val) => (
                      <MenuItem key={val} value={val}>
                        {i18n.__(Groups.typeLabels[val])}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField
                  onChange={onUpdateField}
                  value={groupData.description}
                  name="description"
                  label={i18n.__('pages.AdminSingleGroupPage.description')}
                  variant="outlined"
                  inputProps={{ maxLength: 64 }}
                  fullWidth
                  multiline
                  margin="normal"
                />
              </Grid>
              <Grid item xs={isMobile ? 12 : 6}>
                <GroupAvatarPicker
                  avatar={groupData.avatar || ''}
                  type={groupData.type}
                  group={groupData}
                  onAssignAvatar={onAssignAvatar}
                  profil="true"
                />
              </Grid>
            </Grid>
            <div className={classes.wysiwyg}>
              <InputLabel htmlFor="content">{i18n.__('pages.AdminSingleGroupPage.content')}</InputLabel>
              <CustomToolbar />
              <ReactQuill id="content" value={content} onChange={onUpdateRichText} modules={quillOptions} />
            </div>
            {params._id ? (
              // user management is not possible when creating a new group
              <>
                <Tabs value={tabId} onChange={handleChangeTab} indicatorColor="primary" textColor="primary" centered>
                  {groupData.type === 5 && <Tab label={i18n.__('api.groups.labels.candidates')} />}
                  <Tab label={i18n.__('api.groups.labels.members')} />
                  <Tab label={i18n.__('api.groups.labels.animators')} />
                  <Tab label={i18n.__('api.groups.labels.admins')} />
                </Tabs>
                {groupData.type === 5 && <TabPanel value={tabId} index={0} userRole="candidate" groupId={group._id} />}
                <TabPanel value={tabId} index={groupData.type === 5 ? 1 : 0} userRole="member" groupId={group._id} />
                <TabPanel value={tabId} index={groupData.type === 5 ? 2 : 1} userRole="animator" groupId={group._id} />
                <TabPanel value={tabId} index={groupData.type === 5 ? 3 : 2} userRole="admin" groupId={group._id} />
              </>
            ) : null}
            <div className={classes.buttonGroup}>
              <Button variant="contained" color="primary" onClick={submitUpdateGroup}>
                {params._id ? i18n.__('pages.AdminSingleGroupPage.update') : i18n.__('pages.AdminSingleGroupPage.save')}
              </Button>

              <Button variant="contained" onClick={cancelForm}>
                {i18n.__('pages.AdminSingleGroupPage.cancel')}
              </Button>
            </div>
          </form>
        </Paper>
      </Container>
    </Fade>
  );
};

export default withTracker(
  ({
    match: {
      params: { _id },
    },
  }) => {
    let group = {};
    let ready = false;
    if (_id) {
      const subGroup = Meteor.subscribe('groups.one.admin', { _id });
      group = Groups.findOneFromPublication('groups.one.admin', { _id });
      ready = subGroup.ready();
    } else {
      ready = true;
    }
    return {
      group,
      ready,
    };
  },
)(AdminSingleGroupPage);

AdminSingleGroupPage.defaultProps = {
  group: {},
};

AdminSingleGroupPage.propTypes = {
  match: PropTypes.objectOf(PropTypes.any).isRequired,
  group: PropTypes.objectOf(PropTypes.any),
  ready: PropTypes.bool.isRequired,
};
