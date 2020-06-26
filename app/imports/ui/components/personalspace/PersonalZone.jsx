import React, { useState } from 'react';
import PropTypes from 'prop-types';
import i18n from 'meteor/universe:i18n';
import { Roles } from 'meteor/alanning:roles';
import { useTracker } from 'meteor/react-meteor-data';
import { ReactSortable } from 'react-sortablejs';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import VerticalAlignTopIcon from '@material-ui/icons/VerticalAlignTop';
import VerticalAlignBottomIcon from '@material-ui/icons/VerticalAlignBottom';
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { Grid, makeStyles, Typography, IconButton, Paper as div, Tooltip } from '@material-ui/core';
import { useAppContext } from '../../contexts/context';
import Services from '../../../api/services/services';
import Groups from '../../../api/groups/groups';
import ServiceDetailsPersSpace from '../services/ServiceDetailsPersSpace';
import GroupDetailsPersSpace from '../groups/GroupDetailsPersSpace';
import PersonalLinkDetails from './PersonalLinkDetails';

const useStyles = makeStyles((theme) => ({
  expansionpanel: {
    borderRadius: theme.shape.borderRadius,
    marginTop: 30,
    marginBottom: 10,
    '&::before': {
      content: 'none',
    },
  },
  cursorPointer: {
    cursor: 'pointer',
  },
  cursorDefault: {
    cursor: 'default !important',
  },
  zone: {
    marginTop: 0,
    marginBottom: 0,
    minHeight: 48,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ghost: {
    opacity: '1 !important',
  },
  gridItem: {
    position: 'relative',
    '&.sortable-ghost': { opacity: 0.3 },
  },
  handle: {
    zIndex: 10,
    cursor: 'grab',
    position: 'absolute',
    textAlign: 'center',
    width: 'calc(100% - 32px)',
    backgroundColor: theme.palette.primary.main,
    opacity: 0.2,
    height: 20,
    borderTopLeftRadius: theme.shape.borderRadius,
    borderTopRightRadius: theme.shape.borderRadius,
    '&::after': {
      content: '""',
      width: '80%',
      height: '3px',
      backgroundColor: 'white',
      display: 'inline-block',
      marginBottom: '3px',
      borderRadius: theme.shape.borderRadius,
    },
  },
  emptyZone: {
    minHeight: '200px',
    border: `2px dashed ${theme.palette.primary.main}`,
    borderRadius: theme.shape.borderRadius,
    marginTop: '5px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.2,
    '&::before': {
      content: "''",
      width: '100px',
      height: '100px',
      position: 'absolute',
    },
    '&::after': {
      position: 'absolute',
      content: '"∅"',
      fontSize: '80px',
      marginTop: '6px',
      color: theme.palette.primary.main,
    },
  },
  emptyDragZone: {
    '&::before': {
      // border: `4px solid ${theme.palette.primary.main}`,
      // borderRadius: '50%',
    },
    '&::after': {
      content: `"${i18n.__('components.PersonalZone.emptyDragZone')}"`,
    },
  },
  title: {
    padding: '1px 8px',
    borderBottom: '1px solid black',
    '&:focus': {
      border: 'none',
      borderTopRightRadius: theme.shape.borderRadius,
      borderTopLeftRadius: theme.shape.borderRadius,
      borderBottom: `2px solid ${theme.palette.primary.main}`,
      outlineStyle: 'none',
    },
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
  buttonZone: {},
}));

const PersonalZone = ({
  elements,
  index,
  title,
  setTitle,
  setList,
  updateList,
  delZone,
  lastZone,
  moveDownZone,
  moveUpZone,
  addPersonalLink,
  updatePersonalLink,
  delPersonalLink,
  customDrag,
  isSorted,
  isExpanded,
  setExpanded,
}) => {
  const classes = useStyles();
  const [{ userId }] = useAppContext();
  const [localIsExpanded, setIsExpanded] = useState(isExpanded || true);

  const memberGroups = useTracker(() => Roles.getScopesForUser(userId, 'member'));
  const animatorGroups = useTracker(() => Roles.getScopesForUser(userId, 'animator'));
  const candidateGroups = useTracker(() => Roles.getScopesForUser(userId, ['candidate']));
  const managedGroups = useTracker(() => Roles.getScopesForUser(userId, ['animator', 'admin']));
  const isAdmin = Roles.userIsInRole(userId, 'admin');

  const handleKeyDownTitle = () => (event) => {
    const enterKey = 13;
    if (event.which === enterKey) {
      event.preventDefault();
      event.target.blur();
    }
  };

  const handleBlurTitle = (zoneIndex) => (event) => {
    let newTitle = event.target.innerText;
    if (newTitle === '') {
      newTitle = `${i18n.__('pages.PersonalPage.newZone')}-${zoneIndex}`;
    }
    setTitle(zoneIndex, newTitle);
  };

  const handleSelectTitle = (zoneIndex) => () => {
    const elm = document.getElementById(`title-${zoneIndex}`);
    const range = document.createRange();
    range.selectNodeContents(elm);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  };

  const handleClickExpansion = (zoneIndex) => () => {
    if (isSorted) {
      setExpanded(zoneIndex);
    } else {
      setIsExpanded(!localIsExpanded);
    }
  };

  return (
    <ExpansionPanel className={classes.expansionpanel} expanded={isSorted ? isExpanded : localIsExpanded}>
      <ExpansionPanelSummary
        expandIcon={
          <ExpandMoreIcon
            className={classes.cursorPointer}
            onClick={customDrag && isSorted ? handleClickExpansion(index) : null}
          />
        }
        aria-controls={`zone-${title}-${index}`}
        id={`expand-${index}`}
        onClick={!(customDrag && isSorted) ? handleClickExpansion(index) : null}
        className={customDrag && isSorted ? classes.cursorDefault : null}
      >
        <Typography variant="h6" color="primary" className={classes.zone}>
          <div>
            <span
              id={`title-${index}`}
              className={customDrag && isSorted ? classes.title : null}
              contentEditable={isSorted && customDrag}
              onKeyDown={handleKeyDownTitle(index)}
              onBlur={handleBlurTitle(index)}
              role="presentation"
              dangerouslySetInnerHTML={{ __html: title }}
            />
            {customDrag && isSorted && (
              <IconButton
                onClick={handleSelectTitle(index)}
                className={classes.zoneButton}
                title={i18n.__('components.PersonalZone.modifyTitle')}
              >
                <EditIcon className={classes.zoneButton} fontSize="small" />
              </IconButton>
            )}
            {customDrag && isSorted && (
              <IconButton
                onClick={() => addPersonalLink(index)}
                className={classes.zoneButton}
                title={i18n.__('components.PersonalZone.addPersonalLink')}
              >
                <AddCircleOutlineIcon />
              </IconButton>
            )}
          </div>
          {customDrag && isSorted ? (
            <div className={classes.buttonZone}>
              <IconButton
                onClick={() => moveUpZone(index)}
                className={classes.zoneButton}
                title={i18n.__('components.PersonalZone.upZoneLabel')}
                disabled={index === 0}
              >
                <VerticalAlignTopIcon />
              </IconButton>
              <IconButton
                onClick={() => moveDownZone(index)}
                className={classes.zoneButton}
                title={i18n.__('components.PersonalZone.downZoneLabel')}
                disabled={lastZone}
              >
                <VerticalAlignBottomIcon />
              </IconButton>
              <Tooltip
                title={
                  elements.length === 0
                    ? i18n.__('components.PersonalZone.delZoneLabel')
                    : i18n.__('components.PersonalZone.forbiddenDelZoneLabel')
                }
                aria-label={
                  elements.length === 0
                    ? i18n.__('components.PersonalZone.delZoneLabel')
                    : i18n.__('components.PersonalZone.forbiddenDelZoneLabel')
                }
              >
                <span>
                  <IconButton
                    onClick={() => delZone(index)}
                    className={classes.zoneButton}
                    disabled={elements.length !== 0}
                  >
                    <DeleteIcon />
                  </IconButton>
                </span>
              </Tooltip>
            </div>
          ) : null}
        </Typography>
      </ExpansionPanelSummary>
      <ExpansionPanelDetails>
        <ReactSortable
          className={`MuiGrid-root MuiGrid-container MuiGrid-spacing-xs-4 ${
            elements.length === 0 ? `${classes.emptyZone} ${customDrag ? classes.emptyDragZone : ''}` : ''
          }`}
          list={elements}
          setList={setList(index)}
          onEnd={updateList}
          animation={150}
          forceFallback
          fallbackClass={classes.ghost}
          group={{ name: 'zone', put: isSorted }}
          handle={`.${classes.handle}`}
          sort={isSorted}
        >
          {elements.length === 0
            ? null
            : elements
                .map((elem) => {
                  switch (elem.type) {
                    case 'service': {
                      const myservice = Services.findOne({ _id: elem.element_id });
                      return myservice === undefined ? null : (
                        <Grid
                          className={classes.gridItem}
                          item
                          key={`service_${elem.element_id}`}
                          xs={12}
                          sm={6}
                          md={4}
                          lg={3}
                        >
                          <div className={customDrag ? classes.handle : null} />
                          <ServiceDetailsPersSpace service={myservice} />
                        </Grid>
                      );
                    }
                    case 'group': {
                      const mygroup = Groups.findOne(elem.element_id);
                      return mygroup === undefined ? null : (
                        <Grid
                          className={classes.gridItem}
                          item
                          key={`group_${elem.element_id}`}
                          xs={12}
                          sm={6}
                          md={4}
                          lg={3}
                        >
                          <div className={customDrag ? classes.handle : null} />
                          <GroupDetailsPersSpace
                            group={mygroup}
                            candidate={candidateGroups.includes(elem.element_id)}
                            member={memberGroups.includes(elem.element_id)}
                            animator={animatorGroups.includes(elem.element_id)}
                            admin={isAdmin || managedGroups.includes(elem.element_id)}
                          />
                        </Grid>
                      );
                    }
                    case 'link': {
                      return (
                        <Grid
                          className={classes.gridItem}
                          item
                          key={`link_${elem.element_id}`}
                          xs={12}
                          sm={6}
                          md={4}
                          lg={3}
                        >
                          <div className={customDrag ? classes.handle : null} />
                          <PersonalLinkDetails
                            link={elem}
                            globalEdit={customDrag}
                            updateLink={(linkId) => updatePersonalLink(index, linkId)}
                            delLink={(newLink) => delPersonalLink(index, newLink)}
                          />
                        </Grid>
                      );
                    }
                    default: {
                      return null;
                    }
                  }
                })
                .filter((item) => item !== null)}
        </ReactSortable>
      </ExpansionPanelDetails>
    </ExpansionPanel>
  );
};

PersonalZone.propTypes = {
  elements: PropTypes.arrayOf(PropTypes.object).isRequired,
  index: PropTypes.number,
  title: PropTypes.string.isRequired,
  setTitle: PropTypes.func,
  setList: PropTypes.func.isRequired,
  updateList: PropTypes.func.isRequired,
  delZone: PropTypes.func,
  lastZone: PropTypes.bool,
  moveDownZone: PropTypes.func,
  moveUpZone: PropTypes.func,
  addPersonalLink: PropTypes.func,
  updatePersonalLink: PropTypes.func,
  delPersonalLink: PropTypes.func,
  customDrag: PropTypes.bool.isRequired,
  isSorted: PropTypes.bool,
  isExpanded: PropTypes.bool,
  setExpanded: PropTypes.func,
};

PersonalZone.defaultProps = {
  isSorted: false,
  isExpanded: true,
  setExpanded: null,
  index: null,
  setTitle: null,
  delZone: null,
  lastZone: false,
  moveDownZone: null,
  moveUpZone: null,
  addPersonalLink: null,
  updatePersonalLink: null,
  delPersonalLink: null,
};

export default PersonalZone;
