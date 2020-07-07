/* eslint-disable react/no-this-in-sfc */
import React, { useState, useEffect } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import i18n from 'meteor/universe:i18n';
import {
  Container,
  Paper,
  makeStyles,
  Button,
  TextField,
  Typography,
  InputLabel,
  Fade,
  Select,
  MenuItem,
  FormControl,
  Tabs,
  Tab,
} from '@material-ui/core';

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
  type: Number(Object.keys(Groups.typeLabels)[0]),
};

const quillOptions = {
  clipboard: {
    matchVisual: false,
  },
  toolbar: {
    container: '#quill-toolbar',
    handlers: {
      video(value) {
        if (value) {
          const href = prompt(i18n.__('components.CustomQuill.enterUrl'));
          this.quill.format('video', href.replace('/videos/watch/', '/videos/embed/'));
        } else {
          this.quill.format('video', false);
        }
      },
    },
  },
};

const AdminSingleGroupPage = ({ group, ready, match: { params } }) => {
  const [groupData, setGroupData] = useState(defaultState);
  const [loading, setLoading] = useState(!!params._id);
  const [tabId, setTabId] = React.useState(0);
  const [content, setContent] = useState('');
  const history = useHistory();
  const classes = useStyles();

  const [{ userId }] = useAppContext();
  const isAdmin = Roles.userIsInRole(userId, 'admin', params._id);

  useEffect(() => {
    if (params._id && group._id && loading) {
      setLoading(false);
      setGroupData(group);
      setContent(group.content || '');
    }
  }, [group]);

  const handleChangeTab = (event, newValue) => {
    setTabId(newValue);
  };

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

  const onUpdateRichText = (html) => {
    setContent(html);
  };

  const submitUpdateGroup = () => {
    const method = params._id ? updateGroup : createGroup;
    setLoading(true);
    const { _id, slug, ...rest } = groupData;
    let args;

    if (params._id) {
      args = {
        groupId: params._id,
        data: {
          ...rest,
          content,
        },
      };
    } else {
      args = {
        ...rest,
        content,
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

  return (
    <Fade in>
      <Container>
        <Paper className={classes.root}>
          <Typography component="h1">
            {i18n.__(`pages.AdminSingleGroupPage.${params._id ? 'edition' : 'creation'}`)} <b>{groupData.name}</b>
          </Typography>
          <form noValidate autoComplete="off">
            <TextField
              onChange={onUpdateField}
              value={groupData.name}
              name="name"
              label={i18n.__('pages.AdminSingleGroupPage.name')}
              variant="outlined"
              fullWidth
              margin="normal"
              disabled={!isAdmin && !!params._id}
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
              fullWidth
              multiline
              margin="normal"
            />
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

              <Button variant="contained" onClick={() => history.goBack()}>
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
    const subGroup = Meteor.subscribe('groups.one.admin', { _id });
    const group = Groups.findOneFromPublication('groups.one.admin', { _id });
    const ready = subGroup.ready();
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
