import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
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
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Divider from '@material-ui/core/Divider';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import PollIcon from '@material-ui/icons/Poll';
import InputAdornment from '@material-ui/core/InputAdornment';
import IconButton from '@material-ui/core/IconButton';
import Pagination from '@material-ui/lab/Pagination';
import { useHistory } from 'react-router-dom';
import { usePagination } from '../../utils/hooks';

import { Polls } from '../../../api/polls/polls';

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

const PollPage = ({
  match: {
    params: { slug },
  },
}) => {
  const classes = useStyles();
  const history = useHistory();
  const [search, setSearch] = useState('');

  const { changePage, page, items, total } = usePagination(
    'groups.polls',
    { search, slug },
    Polls,
    {},
    { sorted: { title: -1 } },
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

  return (
    <Fade in>
      <Container className={classes.root}>
        <Grid container spacing={4}>
          <Grid item xs={12} sm={12} md={12}>
            <Button color="primary" startIcon={<ArrowBack />} onClick={goBack}>
              {i18n.__('pages.Polls.back')}
            </Button>
          </Grid>
          <Grid item xs={12} sm={12} md={6}>
            <TextField
              margin="normal"
              id="search"
              label={i18n.__('pages.Polls.searchText')}
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
          {items.length > 0 ? (
            <Grid item xs={12} sm={12} md={12}>
              <List className={classes.list} disablePadding>
                {items.map((poll, i) => [
                  <ListItem alignItems="flex-start" key={`user-${poll.title}`}>
                    <PollIcon className={classes.icon} />
                    <ListItemText
                      primary={`${poll.title}`}
                      secondary={
                        <>
                          <Typography component="span" variant="body2" className={classes.inline} color="textPrimary">
                            {poll.description}
                          </Typography>
                        </>
                      }
                    />

                    <ListItemSecondaryAction>
                      <Tooltip title={`${i18n.__('pages.Polls.seePoll')} ${poll.title}`} aria-label="add">
                        <IconButton
                          edge="end"
                          aria-label="comments"
                          onClick={() =>
                            window.open(
                              `${Meteor.settings.public.services.sondagesUrl}/poll/answer/${poll._id}`,
                              '_blank',
                              'noreferrer,noopener',
                            )
                          }
                        >
                          <ChevronRightIcon />
                        </IconButton>
                      </Tooltip>
                    </ListItemSecondaryAction>
                  </ListItem>,
                  i < ITEM_PER_PAGE - 1 && i < total - 1 && (
                    <Divider variant="inset" component="li" key={`divider-${poll.title}`} />
                  ),
                ])}
              </List>
            </Grid>
          ) : (
            <Grid item xs={12} sm={12} md={12}>
              <p>{i18n.__('pages.Polls.noPoll')}</p>
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

export default PollPage;

PollPage.defaultProps = {
  match: {},
};

PollPage.propTypes = {
  match: PropTypes.objectOf(PropTypes.any),
};
