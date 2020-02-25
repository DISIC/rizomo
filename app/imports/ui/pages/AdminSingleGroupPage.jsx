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

import Spinner from '../components/Spinner';
import { createGroup, updateGroup } from '../../api/groups/methods';
import Groups from '../../api/groups/groups';
import GroupsUsersList from '../components/GroupUsersList';

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
  const {
    userIds, value, index, role, groupId,
  } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`scrollable-auto-tabpanel-${index}`}
      aria-labelledby={`scrollable-auto-tab-${index}`}
    >
      {value === index && <GroupsUsersList userIds={userIds} role={role} groupId={groupId} />}
    </div>
  );
}

TabPanel.propTypes = {
  userIds: PropTypes.arrayOf(PropTypes.any).isRequired,
  role: PropTypes.string.isRequired,
  groupId: PropTypes.string.isRequired,
  index: PropTypes.any.isRequired,
  value: PropTypes.any.isRequired,
};

const defaultState = {
  name: '',
  slug: '',
  info: '',
  note: '',
  type: Number(Object.keys(Groups.typeLabels)[0]),
};

const AdminSingleGroupPage = ({ group, ready, match: { params } }) => {
  const [groupData, setGroupData] = useState(defaultState);
  const [loading, setLoading] = useState(!!params._id);
  const [tabId, setTabId] = React.useState(0);
  const [note, setNote] = useState('');
  const history = useHistory();
  const classes = useStyles();

  useEffect(() => {
    if (params._id && group._id && loading) {
      setLoading(false);
      setGroupData(group);
      setNote(group.note || '');
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
    setNote(html);
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
          note,
        },
      };
    } else {
      args = {
        ...rest,
        note,
      };
    }

    method.call(args, (error) => {
      setLoading(false);
      if (error) {
        msg.error(error.message);
      } else {
        msg.success(i18n.__('api.methods.operationSuccessMsg'));
        history.push('/admingroups');
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
            {i18n.__(`pages.AdminSingleGroupPage.${params._id ? 'edition' : 'creation'}`)}
            {' '}
            <b>{groupData.name}</b>
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
              <Select labelId="type-label" id="type" name="type" value={groupData.type} onChange={onUpdateField}>
                {Object.keys(Groups.typeLabels).map((val) => (
                  <MenuItem key={val} value={val}>
                    {i18n.__(Groups.typeLabels[val])}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              onChange={onUpdateField}
              value={groupData.info}
              name="info"
              label={i18n.__('pages.AdminSingleGroupPage.info')}
              variant="outlined"
              fullWidth
              multiline
              margin="normal"
            />
            <div className={classes.wysiwyg}>
              <InputLabel htmlFor="note">{i18n.__('pages.AdminSingleGroupPage.note')}</InputLabel>
              <ReactQuill id="note" value={note} onChange={onUpdateRichText} />
            </div>
            {params._id ? (
              // user management is not possible when creating a new group
              <>
                <Tabs value={tabId} onChange={handleChangeTab} indicatorColor="primary" textColor="primary" centered>
                  <Tab label={i18n.__('api.groups.users.candidates')} />
                  <Tab label={i18n.__('api.groups.users.members')} />
                  <Tab label={i18n.__('api.groups.users.animators')} />
                  <Tab label={i18n.__('api.groups.users.admins')} />
                </Tabs>
                <TabPanel value={tabId} index={0} userIds={group.candidates} role="candidate" groupId={group._id} />
                <TabPanel value={tabId} index={1} userIds={group.members} role="member" groupId={group._id} />
                <TabPanel value={tabId} index={2} userIds={group.animators} role="animator" groupId={group._id} />
                <TabPanel value={tabId} index={3} userIds={group.admins} role="admin" groupId={group._id} />
              </>
            ) : null}
            <div className={classes.buttonGroup}>
              <Button variant="contained" color="primary" onClick={submitUpdateGroup}>
                {params._id ? i18n.__('pages.AdminSingleGroupPage.update') : i18n.__('pages.AdminSingleGroupPage.save')}
              </Button>

              <Button variant="contained" onClick={() => history.push('/admingroups')}>
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
