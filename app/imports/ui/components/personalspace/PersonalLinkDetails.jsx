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
  Button, Avatar, Tooltip, IconButton, CardHeader, TextField,
} from '@material-ui/core';
import i18n from 'meteor/universe:i18n';
import { useObjectState } from '../../utils/hooks';

const linkColor = 'brown';
const useStyles = makeStyles((theme) => ({
  avatar: {
    backgroundColor: linkColor,
    width: theme.spacing(7),
    height: theme.spacing(7),
  },
  cardActions: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  cardActionShort: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignSelf: 'end',
    width: '100%',
  },
  cardHeader: {
    paddingLeft: 32,
    paddingRight: 32,
    paddingBottom: 32,
    paddingTop: 24,
  },
  card: {
    height: '100%',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
  },
  cardMedia: {
    maxWidth: '50px',
    objectFit: 'contain',
    borderRadius: theme.shape.borderRadius,
  },
  cardContent: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    flexGrow: 1,
    backgroundColor: theme.palette.primary.light,
    paddingLeft: 32,
    paddingRight: 32,
    paddingBottom: 32,
    paddingTop: 24,
  },
  cardContentMobile: {
    flexGrow: 1,
    paddingLeft: 32,
    paddingRight: 32,
    paddingBottom: 32,
    paddingTop: 0,
    display: 'flex',
  },
  buttonText: {
    textTransform: 'none',
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.tertiary.main,
    fontWeight: 'bold',
    '&:hover': {
      color: theme.palette.primary.main,
      backgroundColor: theme.palette.tertiary.main,
    },
  },
  paperChip: {
    display: 'flex',
    justifyContent: 'left',
    flexWrap: 'wrap',
    marginTop: theme.spacing(2),
    padding: theme.spacing(1),
    backgroundColor: 'transparent',
  },
  chip: {
    margin: theme.spacing(0.5),
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
    marginTop: 5,
  },
}));

function PersonalLinkDetails({
  link, globalEdit, delLink, updateLink,
}) {
  const { title = '', url = '', element_id: elementId } = link;

  const classes = useStyles();
  const [localEdit, setLocalEdit] = useState(false);
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
      return (
        <div className="MuiCardHeader-root">
          <div className="MuiCardHeader-avatar">
            <Avatar className={classes.avatar}>
              <LaunchIcon />
            </Avatar>
          </div>
          <div className={`MuiCardHeader-content ${classes.form}`}>
            <form onSubmit={handleLocalEdit}>
              <TextField
                label={i18n.__('components.PersonalLinkDetails.titleLabel')}
                value={state.title}
                name="title"
                onChange={handleChangeState}
              />
              <TextField
                label={i18n.__('components.PersonalLinkDetails.urlLabel')}
                value={state.url}
                name="url"
                onChange={handleChangeState}
              />
              <button type="submit" aria-label="masked" style={{ display: 'none' }} />
            </form>
          </div>
        </div>
      );
    }
    return (
      <CardHeader
        className={classes.cardHeader}
        avatar={(
          <Avatar className={classes.avatar}>
            <LaunchIcon />
          </Avatar>
        )}
        title={state.title || i18n.__('components.PersonalLinkDetails.titleLabel')}
        titleTypographyProps={{
          variant: 'h6',
          color: 'primary',
          className: classes.title,
        }}
        subheader={state.url || i18n.__('components.PersonalLinkDetails.urlLabel')}
        subheaderTypographyProps={{
          variant: 'body2',
          style: {
            color: linkColor,
          },
        }}
      />
    );
  };

  return (
    <Card className={classes.card} elevation={3}>
      {showData()}
      <CardContent className={classes.cardContentMobile}>
        <div className={classes.cardActionShort}>
          <Button
            size="large"
            className={classes.buttonText}
            variant="contained"
            onClick={() => window.open(url, '_blank')}
          >
            {i18n.__('components.PersonalLinkDetails.visitLink')}
          </Button>
          {globalEdit && (
            <div className={classes.buttonWrapper}>
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
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

PersonalLinkDetails.propTypes = {
  link: PropTypes.objectOf(PropTypes.any).isRequired,
  globalEdit: PropTypes.bool.isRequired,
  updateLink: PropTypes.func.isRequired,
  delLink: PropTypes.func.isRequired,
};

export default PersonalLinkDetails;
