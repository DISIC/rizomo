import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Meteor } from 'meteor/meteor';
import TextField from '@material-ui/core/TextField';
import SearchIcon from '@material-ui/icons/Search';
import Autocomplete from '@material-ui/lab/Autocomplete';
import CircularProgress from '@material-ui/core/CircularProgress';
import i18n from 'meteor/universe:i18n';
import InputAdornment from '@material-ui/core/InputAdornment';
import debounce from '../../utils/debounce';

function GroupFinder({ onSelected, hidden, opened, exclude }) {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(false);

  function searchGroup() {
    Meteor.call('groups.findGroups', { pageSize: 50, groupId: exclude.groupId }, (error, res) => {
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

  const debouncedSearchUsers = debounce(searchGroup, 500);

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
      getOptionSelected={(option, value) => option.name === value.name}
      getOptionLabel={(option) => `${option.name}`}
      noOptionsText={i18n.__('components.GroupFinder.noTag')}
      clearText={i18n.__('components.GroupFinder.clear')}
      loadingText={i18n.__('components.GroupFinder.loading')}
      openText={i18n.__('components.GroupFinder.open')}
      closeText={i18n.__('components.GroupFinder.close')}
      onChange={(_, value) => onSelected(value)}
      options={options}
      loading={loading}
      onInputChange={handleFilter}
      renderInput={(params) => (
        <TextField
          {...params}
          label={i18n.__('components.GroupFinder.groupLabel')}
          variant="outlined"
          placeholder={i18n.__('components.GroupFinder.placeholder')}
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

GroupFinder.defaultProps = {
  hidden: false,
  exclude: null,
  opened: false,
};

GroupFinder.propTypes = {
  onSelected: PropTypes.func.isRequired,
  hidden: PropTypes.bool,
  exclude: PropTypes.objectOf(PropTypes.string),
  opened: PropTypes.bool,
};

export default GroupFinder;
