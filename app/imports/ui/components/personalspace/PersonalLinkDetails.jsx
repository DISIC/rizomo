import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import LaunchIcon from '@material-ui/icons/Launch';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import SaveIcon from '@material-ui/icons/Save';
import {
  Avatar,
  Tooltip,
  IconButton,
  TextField,
  CardActionArea,
  CardActions,
  Typography,
  CardHeader,
  Zoom,
} from '@material-ui/core';
import i18n from 'meteor/universe:i18n';
import { useObjectState } from '../../utils/hooks';

const linkColor = 'brown';
const useStyles = makeStyles((theme) => ({
  avatar: {
    backgroundColor: linkColor,
    width: theme.spacing(5),
    height: theme.spacing(5),
    margin: 'auto',
  },
  cardActions: {
    justifyContent: 'space-between',
    paddingTop: 0,
    paddingBottom: 0,
  },
  card: {
    height: '100%',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
  },
  cardContent: {
    padding: 10,
  },
  cardHeaderContent: { display: 'grid' },
  cardContentEdit: {
    padding: 10,
    paddingBottom: 0,
  },
  cardContentForm: {
    padding: 10,
    paddingBottom: 0,
    textAlign: 'center',
    marginTop: 20,
  },
  actionarea: {},
  linkName: {
    color: theme.palette.primary.main,
  },
  linkUrl: {
    color: linkColor,
  },
  zoneButton: {
    color: theme.palette.primary.main,
    opacity: 0.5,
    cursor: 'pointer',
    '&:hover': {
      opacity: 1,
      color: theme.palette.error.main,
    },
  },
  form: {
    marginTop: 10,
    marginBottom: 10,
  },
}));

function PersonalLinkDetails({ link, globalEdit, delLink, updateLink, isMobile }) {
  const { title = '', url = '', element_id: elementId } = link;

  const classes = useStyles();
  const [localEdit, setLocalEdit] = useState(title === '');
  const [state, setState] = useObjectState({ title, url });

  const handleLocalEdit = (event) => {
    setLocalEdit(!localEdit);
    if (!event.target.checked) {
      if (state.title !== title || state.url !== url) {
        updateLink({ element_id: elementId, ...state });
      }
    }
  };

  const handleChangeState = (event) => {
    const { name, value } = event.target;
    setState({ [name]: value });
  };

  const showData = () => {
    if (globalEdit && localEdit) {
      // We can custom the link's fields
      return (
        <CardContent className={classes.cardContentForm}>
          <form onSubmit={handleLocalEdit} className={classes.form}>
            <TextField
              label={i18n.__('components.PersonalLinkDetails.titleLabel')}
              value={state.title}
              name="title"
              onChange={handleChangeState}
              autoFocus
            />
            <TextField
              label={i18n.__('components.PersonalLinkDetails.urlLabel')}
              value={state.url}
              name="url"
              onChange={handleChangeState}
            />
            <button type="submit" aria-label="masked" style={{ display: 'none' }} />
          </form>
        </CardContent>
      );
    }
    return (
      <Tooltip
        TransitionComponent={Zoom}
        enterDelay={2000}
        title={
          <>
            <Typography>{state.title}</Typography>
            {i18n.__('pages.PersonalPage.typeLink')}
          </>
        }
        aria-label={state.title}
      >
        {/* this span is to allow display of tooltip when CardActionArea is disabled 
        (occur when a service is disabled) */}
        <span>
          <CardActionArea
            className={classes.actionarea}
            onClick={() => window.open(url, '_blank', 'noreferrer,noopener')}
            disabled={globalEdit}
          >
            <CardHeader
              classes={{ content: classes.cardHeaderContent }}
              avatar={
                globalEdit && localEdit ? null : (
                  <Avatar className={classes.avatar}>
                    <LaunchIcon />
                  </Avatar>
                )
              }
              title={
                <Typography className={classes.linkName} gutterBottom noWrap={!isMobile} variant="h6" component="h2">
                  {state.title || i18n.__('components.PersonalLinkDetails.titleLabel')}
                </Typography>
              }
              subheader={
                <Typography variant="body2" className={classes.linkUrl} noWrap={!isMobile} component="p">
                  {state.url || i18n.__('components.PersonalLinkDetails.urlLabel')}
                </Typography>
              }
            />
          </CardActionArea>
        </span>
      </Tooltip>
    );
  };

  return (
    <Card className={classes.card} elevation={3}>
      {showData()}
      {globalEdit ? (
        <CardActions className={classes.cardActions}>
          <Tooltip
            title={i18n.__(`components.PersonalLinkDetails.${localEdit ? 'saveLink' : 'modifyLink'}`)}
            aria-label={i18n.__(`components.PersonalLinkDetails.${localEdit ? 'saveLink' : 'modifyLink'}`)}
          >
            <IconButton className={classes.zoneButton} color="primary" onClick={handleLocalEdit}>
              {localEdit ? <SaveIcon /> : <EditIcon />}
            </IconButton>
          </Tooltip>
          <Tooltip
            title={i18n.__('components.PersonalLinkDetails.delLink')}
            aria-label={i18n.__('components.PersonalLinkDetails.delLink')}
          >
            <IconButton className={classes.zoneButton} color="primary" onClick={delLink(elementId)}>
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </CardActions>
      ) : null}
    </Card>
  );
}

PersonalLinkDetails.propTypes = {
  link: PropTypes.objectOf(PropTypes.any).isRequired,
  globalEdit: PropTypes.bool.isRequired,
  updateLink: PropTypes.func.isRequired,
  delLink: PropTypes.func.isRequired,
  isMobile: PropTypes.bool.isRequired,
};

export default PersonalLinkDetails;
