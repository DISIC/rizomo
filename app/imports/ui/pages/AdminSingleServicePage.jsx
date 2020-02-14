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
  Chip,
  InputAdornment,
  IconButton,
} from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/Delete';
import AddIcon from '@material-ui/icons/Add';
import PropTypes from 'prop-types';
import slugify from 'slugify';
import ReactQuill from 'react-quill'; // ES6
import 'react-quill/dist/quill.snow.css'; // ES6
import { useHistory } from 'react-router-dom';

import Categories from '../../api/categories/categories';
import Spinner from '../components/Spinner';
import { createService, updateService } from '../../api/services/methods';
import Services from '../../api/services/services';

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
    alignItems: 'center',
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
  actionIcon: {
    cursor: 'pointer',
  },
  buttonGroup: {
    display: 'flex',
    justifyContent: 'space-between',
  },
}));

const defaultState = {
  title: '',
  slug: '',
  team: '',
  description: '',
  content: '',
  url: '',
  logo: '',
  categories: [],
  screenshots: [],
};

const AdminSingleServicePage = ({
  categories, service, ready, match: { params },
}) => {
  const [serviceData, setServiceData] = useState(defaultState);
  const [loading, setLoading] = useState(!!params._id);
  const [content, setContent] = useState('');
  const history = useHistory();
  const classes = useStyles();

  useEffect(() => {
    if (params._id && service._id && loading) {
      setLoading(false);
      setServiceData(service);
      setContent(service.content);
    }
  }, [service]);

  const onUpdateField = (event) => {
    const { name, value } = event.target;
    if (name === 'title') {
      setServiceData({
        ...serviceData,
        [name]: value,
        slug: slugify(value, {
          replacement: '-', // replace spaces with replacement
          remove: null, // regex to remove characters
          lower: true, // result in lower case
        }),
      });
    } else {
      setServiceData({ ...serviceData, [name]: value });
    }
  };

  const onUpdateRichText = (html) => {
    setContent(html);
  };

  const updateCategories = (categId) => {
    const newCategories = [...serviceData.categories];
    const index = newCategories.findIndex((c) => c === categId);
    if (index > -1) {
      newCategories.splice(index, 1);
    } else {
      newCategories.push(categId);
    }
    setServiceData({ ...serviceData, categories: newCategories });
  };

  const updateScreenshots = (value, index) => {
    const { screenshots = [] } = serviceData;
    screenshots[index] = value;
    setServiceData({ ...serviceData, screenshots });
  };
  const removeScreenshots = (index) => {
    const { screenshots = [] } = serviceData;
    screenshots.splice(index, 1);
    setServiceData({ ...serviceData, screenshots });
  };
  const addScreenshots = () => {
    const { screenshots = [] } = serviceData;
    screenshots.push('');
    setServiceData({ ...serviceData, screenshots });
  };

  const submitUpdateService = () => {
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
      setLoading(false);
      if (error) {
        // TO DO: display message
        console.log(error.message);
      } else {
        // TO DO: display message
        console.log(`service now available on /services/${slug}`);
        history.push('/adminservices');
      }
    });
  };

  if (!ready || loading || (!!params._id && !service._id)) {
    return <Spinner full />;
  }

  return (
    <Container>
      <Paper className={classes.root}>
        <Typography component="h1">
          {i18n.__(`pages.AdminSingleServicePage.${params._id ? 'edition' : 'creation'}`)}
          {' '}
          <b>{serviceData.title}</b>
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
          <TextField
            onChange={onUpdateField}
            value={serviceData.team}
            name="team"
            label={i18n.__('pages.AdminSingleServicePage.team')}
            variant="outlined"
            fullWidth
            margin="normal"
          />
          <div className={classes.logoWrapper}>
            {Boolean(serviceData.logo) && (
              <img className={classes.logo} alt={`logo for ${serviceData.title}`} src={serviceData.logo} />
            )}
            <TextField
              onChange={onUpdateField}
              value={serviceData.logo}
              name="logo"
              label={i18n.__('pages.AdminSingleServicePage.logo')}
              variant="outlined"
              fullWidth
              margin="normal"
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
            <ReactQuill id="content" value={content} onChange={onUpdateRichText} />
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
                  onClick={() => updateCategories(categ._id)}
                />
              );
            })}
          </div>

          <InputLabel>
            {i18n.__('pages.AdminSingleServicePage.screenshots')}
            {' '}
(
            {(serviceData.screenshots && serviceData.screenshots.length) || 0}
)
            <IconButton
              color="primary"
              aria-label={i18n.__('pages.AdminSingleServicePage.addScreenshots')}
              onClick={addScreenshots}
            >
              <AddIcon />
            </IconButton>
          </InputLabel>
          {serviceData.screenshots
            && serviceData.screenshots.map((screen, i) => (
              <TextField
                key={Math.random()}
                variant="outlined"
                fullWidth
                margin="normal"
                onChange={(e) => updateScreenshots(e.target.value, i)}
                value={screen}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <DeleteIcon className={classes.actionIcon} onClick={() => removeScreenshots(i)} />
                    </InputAdornment>
                  ),
                }}
              />
            ))}

          <div className={classes.buttonGroup}>
            <Button variant="contained" color="primary" onClick={submitUpdateService}>
              {
                params._id
                  ? i18n.__('pages.AdminSingleServicePage.update')
                  : i18n.__('pages.AdminSingleServicePage.save')
              }
            </Button>

            <Button variant="contained" onClick={() => history.push('/adminservices')}>
              {i18n.__('pages.AdminSingleServicePage.cancel')}
            </Button>

          </div>

        </form>
      </Paper>
    </Container>
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
