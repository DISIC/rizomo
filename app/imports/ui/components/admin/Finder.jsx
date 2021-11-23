import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Meteor } from 'meteor/meteor';
import TextField from '@material-ui/core/TextField';
import SearchIcon from '@material-ui/icons/Search';
import Autocomplete from '@material-ui/lab/Autocomplete';
import CircularProgress from '@material-ui/core/CircularProgress';
import i18n from 'meteor/universe:i18n';
import InputAdornment from '@material-ui/core/InputAdornment';
import debounce from '../../utils/debounce';

function Finder({ onSelected, hidden, exclude, opened, i18nCode, method }) {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(false);

  function search() {
    const args = { filter, pageSize: 50 };
    if (method === 'users.findUsers') {
      args.exclude = exclude;
    } else if (method === 'groups.findGroups') {
      args.groupId = exclude.groupId;
    }

    Meteor.call(method, args, (error, res) => {
      if (error) {
        setLoading(false);
        msg.error(error.reason);
      } else {
        setOptions(res.data);
        setLoading(false);
      }
    });
  }

  useEffect(() => {
    setOpen(opened);
  }, [opened]);

  const debouncedSearch = debounce(search, 500);

  useEffect(() => {
    if (hidden === false) {
      setLoading(true);
      debouncedSearch();
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
      getOptionSelected={(option, value) => option.username === value.username}
      getOptionLabel={(option) => `${option.username} (${option.firstName || ''} ${option.lastName || ''})`}
      noOptionsText={i18n.__(`components.${i18nCode}.noUser`)}
      clearText={i18n.__(`components.${i18nCode}.clear`)}
      loadingText={i18n.__(`components.${i18nCode}.loading`)}
      openText={i18n.__(`components.${i18nCode}.open`)}
      closeText={i18n.__(`components.${i18nCode}.close`)}
      onChange={(_, value) => onSelected(value)}
      options={options}
      loading={loading}
      onInputChange={handleFilter}
      renderInput={(params) => (
        <TextField
          {...params}
          label={i18n.__(`components.${i18nCode}.userLabel`)}
          variant="outlined"
          placeholder={i18n.__(`components.${i18nCode}.placeholder`)}
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

Finder.defaultProps = {
  hidden: false,
  exclude: null,
  opened: false,
};

Finder.propTypes = {
  onSelected: PropTypes.func.isRequired,
  hidden: PropTypes.bool,
  exclude: PropTypes.objectOf(PropTypes.string),
  opened: PropTypes.bool,
  i18nCode: PropTypes.string.isRequired,
  method: PropTypes.string.isRequired,
};

export default Finder;
