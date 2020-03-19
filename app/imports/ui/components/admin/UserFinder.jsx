import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Meteor } from 'meteor/meteor';
import TextField from '@material-ui/core/TextField';
import SearchIcon from '@material-ui/icons/Search';
import Autocomplete from '@material-ui/lab/Autocomplete';
import CircularProgress from '@material-ui/core/CircularProgress';
import i18n from 'meteor/universe:i18n';
import { InputAdornment } from '@material-ui/core';
import debounce from '../../utils/debounce';

function UserFinder({
  onSelected, hidden, exclude, opened,
}) {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(false);

  function searchUsers() {
    Meteor.call('users.findUsers', { filter, pageSize: 50, exclude }, (error, res) => {
      if (error) {
        setLoading(false);
        msg.error(error.reason);
      } else {
        setOptions(res.data);
        setLoading(false);
      }
    });
  }

  React.useEffect(() => {
    setOpen(opened);
  }, [opened]);

  const debouncedSearchUsers = debounce(searchUsers, 500);

  React.useEffect(() => {
    if (hidden === false) {
      setLoading(true);
      debouncedSearchUsers();
    }
  }, [filter, hidden]);

  const handleFilter = (_, value, reason) => {
    if (reason !== 'reset') setFilter(value);
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
      clearText={i18n.__('components.UserFinder.clear')}
      loadingText={i18n.__('components.UserFinder.loading')}
      openText={i18n.__('components.UserFinder.open')}
      closeText={i18n.__('components.UserFinder.close')}
      onChange={(_, value) => onSelected(value)}
      options={options}
      loading={loading}
      onInputChange={handleFilter}
      renderInput={(params) => (
        <TextField
          {...params}
          label={i18n.__('components.UserFinder.userLabel')}
          variant="outlined"
          placeholder={i18n.__('components.UserFinder.placeholder')}
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

UserFinder.defaultProps = {
  hidden: false,
  exclude: null,
  opened: false,
};

UserFinder.propTypes = {
  onSelected: PropTypes.func.isRequired,
  hidden: PropTypes.bool,
  exclude: PropTypes.objectOf(PropTypes.string),
  opened: PropTypes.bool,
};

export default UserFinder;
