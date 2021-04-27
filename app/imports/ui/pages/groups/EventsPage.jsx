import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Fade from '@material-ui/core/Fade';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import i18n from 'meteor/universe:i18n';
import ListItemText from '@material-ui/core/ListItemText';
import ArrowBack from '@material-ui/icons/ArrowBack';
import SearchIcon from '@material-ui/icons/Search';
import ClearIcon from '@material-ui/icons/Clear';
import EventAvailableIcon from '@material-ui/icons/EventAvailable';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Divider from '@material-ui/core/Divider';
import SendIcon from '@material-ui/icons/Send';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import InputAdornment from '@material-ui/core/InputAdornment';
import IconButton from '@material-ui/core/IconButton';
import Pagination from '@material-ui/lab/Pagination';
import { useHistory } from 'react-router-dom';
import { usePagination } from '../../utils/hooks';

import { EventsAgenda } from '../../../api/eventsAgenda/eventsAgenda';

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    marginTop: theme.spacing(3),
  },
  list: {
    width: '100%',
    backgroundColor: theme.palette.background.paper,
  },
  inline: {
    display: 'inline',
  },
  pagination: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  icon: {
    marginTop: 10,
    marginRight: 10,
    display: 'inline-block',
    alignItems: 'center',
  },
}));

const ITEM_PER_PAGE = 10;

const EventsPage = ({
  match: {
    params: { slug },
  },
}) => {
  const classes = useStyles();
  const history = useHistory();
  const [search, setSearch] = useState('');

  const { changePage, page, items, total } = usePagination(
    'groups.events',
    { search, slug },
    EventsAgenda,
    {},
    { sorted: { _id: -1 } },
    ITEM_PER_PAGE,
  );

  const handleChangePage = (event, value) => {
    changePage(value);
  };
  const updateSearch = (e) => setSearch(e.target.value);
  const resetSearch = () => setSearch('');

  const goBack = () => {
    history.goBack();
  };

  useEffect(() => {
    if (page !== 1) {
      changePage(1);
    }
  }, [search]);

  const checkDate = (e) => {
    const dateEvent = Date.parse(e.end);
    const dateNow = Date.now();

    return dateEvent >= dateNow;
  };

  const formatDate = (event) => {
    const newDateStart = moment(event.start).format('DD/MM/YYYY hh:mm');
    const newDateEnd = moment(event.end).format('DD/MM/YYYY hh:mm');

    const newDateOnly = newDateStart.split(' ');
    const dateFinal = event.allDay
      ? `${i18n.__('pages.Events.dayOf')} ${newDateOnly[0]}`
      : `${newDateStart} -> ${newDateEnd}`;

    return dateFinal;
  };

  const getEventLocation = (event) => {
    return event.location === undefined ? ' ' : `- (${event.location})`;
  };

  const items2 = items.filter((item) => checkDate(item));

  return (
    <Fade in>
      <Container className={classes.root}>
        <Grid container spacing={4}>
          <Grid item xs={12} sm={12} md={12}>
            <Button color="primary" startIcon={<ArrowBack />} onClick={goBack}>
              {i18n.__('pages.Events.back')}
            </Button>
          </Grid>
          <Grid item xs={12} sm={12} md={6}>
            <TextField
              margin="normal"
              id="search"
              label={i18n.__('pages.Events.searchText')}
              name="search"
              fullWidth
              onChange={updateSearch}
              type="text"
              value={search}
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: search ? (
                  <InputAdornment position="end">
                    <IconButton onClick={resetSearch}>
                      <ClearIcon />
                    </IconButton>
                  </InputAdornment>
                ) : null,
              }}
            />
          </Grid>
          {total > ITEM_PER_PAGE && (
            <Grid item xs={12} sm={12} md={6} lg={6} className={classes.pagination}>
              <Pagination count={Math.ceil(total / ITEM_PER_PAGE)} page={page} onChange={handleChangePage} />
            </Grid>
          )}
          {items2.length > 0 ? (
            <Grid item xs={12} sm={12} md={12}>
              <List className={classes.list} disablePadding>
                {items2.map((event, i) => [
                  <ListItem alignItems="flex-start" key={`event-${event.title}`}>
                    <EventAvailableIcon className={classes.icon} />
                    <ListItemText
                      primary={`${event.title} ${getEventLocation(event)}`}
                      secondary={
                        <>
                          <Typography component="span" variant="body2" className={classes.inline} color="textPrimary">
                            {`${formatDate(event)}`}
                          </Typography>
                        </>
                      }
                    />

                    <ListItemSecondaryAction>
                      <Tooltip title={`${i18n.__('pages.Events.seeEvent')} ${event.title}`} aria-label="add">
                        <IconButton
                          edge="end"
                          aria-label="comments"
                          onClick={() =>
                            window.open(`${Meteor.settings.public.services.agendaUrl}`, '_blank', 'noreferrer,noopener')
                          }
                        >
                          <SendIcon />
                        </IconButton>
                      </Tooltip>
                    </ListItemSecondaryAction>
                  </ListItem>,
                  i < ITEM_PER_PAGE - 1 && i < total - 1 && (
                    <Divider variant="inset" component="li" key={`divider-${event.title}`} />
                  ),
                ])}
              </List>
            </Grid>
          ) : (
            <Grid item xs={12} sm={12} md={12}>
              <p>{i18n.__('pages.Events.noEvents')}</p>
            </Grid>
          )}
          {total > ITEM_PER_PAGE && (
            <Grid item xs={12} sm={12} md={12} lg={12} className={classes.pagination}>
              <Pagination count={Math.ceil(total / ITEM_PER_PAGE)} page={page} onChange={handleChangePage} />
            </Grid>
          )}
        </Grid>
      </Container>
    </Fade>
  );
};

export default EventsPage;

EventsPage.defaultProps = {
  match: {},
};

EventsPage.propTypes = {
  match: PropTypes.objectOf(PropTypes.any),
};
