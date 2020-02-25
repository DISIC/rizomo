import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Meteor } from 'meteor/meteor';
import TextField from '@material-ui/core/TextField';
import SearchIcon from '@material-ui/icons/Search';
import Autocomplete from '@material-ui/lab/Autocomplete';
import CircularProgress from '@material-ui/core/CircularProgress';
import i18n from 'meteor/universe:i18n';
import { InputAdornment } from '@material-ui/core';

function UserFinder({ onSelected }) {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(false);

  function searchUsers() {
    setLoading(true);
    Meteor.call('users.findUsers', { filter, pageSize: 50 }, (error, res) => {
      if (error) {
        setLoading(false);
        msg.error(error.reason);
      } else {
        setOptions(res.data);
        setLoading(false);
      }
    });
  }

  debounce = function (func, wait, immediate) {
    let timeout;
    return function () {
      const context = this;
      const args = arguments;
      const later = function () {
        timeout = null;
        if (!immediate) func.apply(context, args);
      };
      const callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func.apply(context, args);
    };
  };

  const debouncedSearchUsers = debounce(searchUsers, 1000);

  React.useEffect(() => {
    debouncedSearchUsers();
  }, [filter]);

  const handleFilter = (_, value) => {
    setFilter(value);
  };

  return (
    <Autocomplete
      id="user-select"
      style={{ width: 500 }}
      open={open}
      onOpen={() => {
        setOpen(true);
      }}
      onClose={() => {
        setOpen(false);
      }}
      getOptionSelected={(option, value) => option.username === value.name}
      getOptionLabel={(option) => `${option.username} (${option.firstName || ''} ${option.lastName || ''})`}
      noOptionsText={i18n.__('components.UserFinder.noUser')}
      onChange={(_, value) => onSelected(value)}
      onInputChange={handleFilter}
      options={options}
      loading={loading}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Utilisateur"
          variant="outlined"
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading ? <CircularProgress color="inherit" size={20} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      )}
    />
  );
}

UserFinder.propTypes = {
  onSelected: PropTypes.func.isRequired,
};

export default UserFinder;
