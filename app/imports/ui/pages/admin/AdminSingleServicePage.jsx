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
  Select,
  MenuItem,
  FormControl,
  Chip,
  IconButton,
  Fade,
  Grid,
} from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/Delete';
import AddIcon from '@material-ui/icons/Add';
import PropTypes from 'prop-types';
import ReactQuill from 'react-quill'; // ES6
import 'react-quill/dist/quill.snow.css'; // ES6
import { useHistory } from 'react-router-dom';

import Categories from '../../../api/categories/categories';
import Spinner from '../../components/system/Spinner';
import { createService, updateService } from '../../../api/services/methods';
import Services from '../../../api/services/services';
import slugy from '../../utils/slugy';
import ImageAdminUploader from '../../components/uploader/ImageAdminUploader';
import { CustomToolbar } from '../../components/system/CustomQuill';
import '../../utils/QuillVideo';

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(2),
    marginBottom: theme.spacing(5),
  },

  logo: {
    height: 100,
    width: 100,
    boxShadow: theme.shadows[2],
    borderRadius: theme.shape.borderRadius,
    marginRight: theme.spacing(3),
  },
  logoWrapper: {
    display: 'flex',
    flexDirection: 'column',
  },
  wysiwyg: {
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(3),
  },
  activeChip: {
    opacity: 1,
    cursor: 'pointer',
  },
  chip: {
    opacity: 0.4,
    cursor: 'pointer',
    transition: 'opacity 300ms ease-in-out',
    '&:hover': {
      opacity: 1,
    },
  },
  chipWrapper: {
    display: 'flex',
    flexWrap: 'wrap',
    marginBottom: theme.spacing(3),
    '& > *': {
      margin: theme.spacing(0.5),
    },
  },
  buttonGroup: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: theme.spacing(5),
  },
  screenshotWrapper: {
    position: 'relative',
  },
  screenshotDelete: {
    cursor: 'pointer',
    '&:hover': {
      color: theme.palette.error.main,
    },
  },
  screenshot: {
    width: '100%',
    minHeight: 200,
  },
}));

const defaultState = {
  title: '',
  slug: '',
  team: '',
  usage: '',
  description: '',
  content: '',
  url: '',
  logo: '',
  categories: [],
  screenshots: [],
  state: Number(Object.keys(Services.stateLabels)[0]),
};

const PLACEHOLDER = 'https://fakeimg.pl/900x600/';

const quillOptions = {
  clipboard: {
    matchVisual: false,
  },
  toolbar: {
    container: '#quill-toolbar',
  },
};

const AdminSingleServicePage = ({ categories, service, ready, match: { params } }) => {
  const [serviceData, setServiceData] = useState({ ...defaultState });
  const [loading, setLoading] = useState(!!params._id);
  const [content, setContent] = useState('');
  const history = useHistory();
  const classes = useStyles();

  const removeUndefined = () => {
    let args;
    if (!params._id) {
      args = {
        toRemove: [...serviceData.screenshots, serviceData.logo],
        path: 'services/undefined',
      };
    } else {
      args = {
        toKeep: [...service.screenshots, service.logo],
        path: `services/${params._id}`,
      };
    }
    Meteor.call('files.selectedRemove', args);
  };

  const onCancel = () => {
    removeUndefined();
    history.push('/adminservices');
  };

  // useEffect(() => removeUndefined, []); // TO UNDERSTAND :)

  useEffect(() => {
    if (params._id && service._id && loading) {
      setLoading(false);
      setServiceData({ ...service });
      setContent(service.content);
    }
  }, [service]);

  const onUpdateField = (event) => {
    const { name, value } = event.target;
    if (name === 'title') {
      setServiceData({
        ...serviceData,
        [name]: value,
        slug: slugy(value),
      });
    } else if (name === 'state') {
      setServiceData({ ...serviceData, [name]: Number(value) });
    } else {
      setServiceData({ ...serviceData, [name]: value });
    }
  };

  const onUpdateLogo = (logo) => setServiceData({ ...serviceData, logo });

  const onUpdateRichText = (html) => setContent(html);

  const onUpdateCategories = (categId) => {
    const newCategories = [...serviceData.categories];
    const index = newCategories.findIndex((c) => c === categId);
    if (index > -1) {
      newCategories.splice(index, 1);
    } else {
      newCategories.push(categId);
    }
    setServiceData({ ...serviceData, categories: newCategories });
  };

  const onUpdateScreenshots = (screenshot, index) => {
    const newData = JSON.parse(JSON.stringify(serviceData));
    newData.screenshots[index] = screenshot;
    setServiceData(newData);
  };

  const onRemoveScreenshots = (screen) => {
    const newData = JSON.parse(JSON.stringify(serviceData));
    newData.screenshots = newData.screenshots.filter((img) => img !== screen);

    if (!params._id) {
      const args = {
        toRemove: [screen],
        path: 'services/undefined',
      };
      Meteor.call('files.selectedRemove', args);
    }

    setServiceData(newData);
  };
  const onAddScreenshots = () => {
    const newData = JSON.parse(JSON.stringify(serviceData));
    newData.screenshots.push(PLACEHOLDER);
    setServiceData(newData);
  };

  const onSubmitUpdateService = () => {
    const method = params._id ? updateService : createService;
    setLoading(true);
    const { _id, slug, ...rest } = serviceData;
    let args;

    if (params._id) {
      args = {
        serviceId: params._id,
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
      if (error) {
        msg.error(error.message);
        setLoading(false);
      } else {
        msg.success(i18n.__('api.methods.operationSuccessMsg'));
        history.push('/adminservices');
      }
    });
  };

  if (!ready || loading || (!!params._id && !service._id)) {
    return <Spinner full />;
  }

  return (
    <Fade in>
      <Container>
        <Paper className={classes.root}>
          <Typography component="h1">
            {i18n.__(`pages.AdminSingleServicePage.${params._id ? 'edition' : 'creation'}`)} <b>{serviceData.title}</b>
          </Typography>
          <form noValidate autoComplete="off">
            <TextField
              onChange={onUpdateField}
              value={serviceData.title}
              name="title"
              label={i18n.__('pages.AdminSingleServicePage.title')}
              variant="outlined"
              fullWidth
              margin="normal"
            />
            <TextField
              onChange={onUpdateField}
              value={serviceData.slug}
              name="slug"
              label={i18n.__('pages.AdminSingleServicePage.slug')}
              variant="outlined"
              fullWidth
              margin="normal"
              disabled
            />
            <FormControl>
              <InputLabel htmlFor="state" id="state-label">
                {i18n.__('pages.AdminSingleServicePage.state')}
              </InputLabel>
              <Select labelId="state-label" id="state" name="state" value={serviceData.state} onChange={onUpdateField}>
                {Object.keys(Services.stateLabels).map((val) => (
                  <MenuItem key={val} value={val}>
                    {i18n.__(Services.stateLabels[val])}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              onChange={onUpdateField}
              value={serviceData.team}
              name="team"
              label={i18n.__('pages.AdminSingleServicePage.team')}
              variant="outlined"
              fullWidth
              margin="normal"
            />
            <TextField
              onChange={onUpdateField}
              value={serviceData.usage}
              name="usage"
              label={i18n.__('pages.AdminSingleServicePage.usage')}
              variant="outlined"
              fullWidth
              margin="normal"
            />
            <div className={classes.logoWrapper}>
              <div>{i18n.__('pages.AdminSingleServicePage.logo')}</div>
              <ImageAdminUploader
                onImageChange={onUpdateLogo}
                name="logo"
                className={classes.logo}
                alt={`logo for ${serviceData.title}`}
                src={serviceData.logo}
                path={`services/${params._id}`}
                width={100}
                height={100}
              />
            </div>
            <TextField
              onChange={onUpdateField}
              value={serviceData.description}
              name="description"
              label={i18n.__('pages.AdminSingleServicePage.description')}
              variant="outlined"
              fullWidth
              multiline
              margin="normal"
            />
            <TextField
              onChange={onUpdateField}
              value={serviceData.url}
              name="url"
              label={i18n.__('pages.AdminSingleServicePage.url')}
              variant="outlined"
              fullWidth
              margin="normal"
            />
            <div className={classes.wysiwyg}>
              <InputLabel htmlFor="content">{i18n.__('pages.AdminSingleServicePage.content')}</InputLabel>
              <CustomToolbar />
              <ReactQuill id="content" value={content} onChange={onUpdateRichText} modules={quillOptions} />
            </div>

            <InputLabel id="categories-label">{i18n.__('pages.AdminSingleServicePage.categories')}</InputLabel>
            <div className={classes.chipWrapper}>
              {categories.map((categ) => {
                const isActive = serviceData.categories && Boolean(serviceData.categories.find((c) => c === categ._id));
                return (
                  <Chip
                    key={categ._id}
                    label={categ.name}
                    color={isActive ? 'primary' : 'default'}
                    variant={isActive ? 'outlined' : 'default'}
                    className={isActive ? classes.activeChip : classes.chip}
                    style={{ backgroudColor: categ.color }}
                    onClick={() => onUpdateCategories(categ._id)}
                  />
                );
              })}
            </div>

            <InputLabel>
              {i18n.__('pages.AdminSingleServicePage.screenshots')} (
              {(serviceData.screenshots && serviceData.screenshots.length) || 0})
              <IconButton
                color="primary"
                aria-label={i18n.__('pages.AdminSingleServicePage.onAddScreenshots')}
                onClick={onAddScreenshots}
              >
                <AddIcon />
              </IconButton>
            </InputLabel>
            <Grid container spacing={4}>
              {serviceData.screenshots &&
                serviceData.screenshots.map((screen, i) => (
                  <Grid lg={4} md={6} xs={12} item key={Math.random()} className={classes.screenshotWrapper}>
                    <ImageAdminUploader
                      onImageChange={(image) => onUpdateScreenshots(image, i)}
                      name={`screenshot_${i}`}
                      className={classes.screenshot}
                      alt={`screenshot for ${serviceData.title}`}
                      src={screen}
                      path={`services/${params._id}`}
                      width={900}
                      height={600}
                    />
                    <IconButton onClick={() => onRemoveScreenshots(screen)} className={classes.screenshotDelete}>
                      <DeleteIcon />
                    </IconButton>
                  </Grid>
                ))}
            </Grid>

            <div className={classes.buttonGroup}>
              <Button variant="contained" color="primary" onClick={onSubmitUpdateService}>
                {params._id
                  ? i18n.__('pages.AdminSingleServicePage.update')
                  : i18n.__('pages.AdminSingleServicePage.save')}
              </Button>

              <Button variant="contained" onClick={onCancel}>
                {i18n.__('pages.AdminSingleServicePage.cancel')}
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
    const subCategories = Meteor.subscribe('categories.all');
    const subService = Meteor.subscribe('services.one.admin', { _id });
    const categories = Categories.find({}).fetch();
    const service = Services.findOneFromPublication('services.one.admin', { _id });
    const ready = subCategories.ready() && subService.ready();
    return {
      service,
      categories,
      ready,
    };
  },
)(AdminSingleServicePage);

AdminSingleServicePage.defaultProps = {
  service: {},
};

AdminSingleServicePage.propTypes = {
  match: PropTypes.objectOf(PropTypes.any).isRequired,
  categories: PropTypes.arrayOf(PropTypes.any).isRequired,
  service: PropTypes.objectOf(PropTypes.any),
  ready: PropTypes.bool.isRequired,
};
