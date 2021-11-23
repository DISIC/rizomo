import React from 'react';
import PropTypes from 'prop-types';
import TextField from '@material-ui/core/TextField';
import InputAdornment from '@material-ui/core/InputAdornment';
import ClearIcon from '@material-ui/icons/Clear';
import SearchIcon from '@material-ui/icons/Search';
import IconButton from '@material-ui/core/IconButton';

const SearchField = ({ updateSearch, checkEscape, search, inputRef, resetSearch, label }) => (
  <TextField
    margin="normal"
    id="search"
    label={label}
    name="search"
    fullWidth
    onChange={updateSearch}
    onKeyDown={checkEscape}
    type="text"
    value={search}
    variant="outlined"
    inputProps={{
      ref: inputRef,
    }}
    // eslint-disable-next-line react/jsx-no-duplicate-props
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
);

export default SearchField;

SearchField.defaultProps = {
  checkEscape: () => null,
  inputRef: null,
};

SearchField.propTypes = {
  updateSearch: PropTypes.func.isRequired,
  checkEscape: PropTypes.func,
  search: PropTypes.string.isRequired,
  inputRef: PropTypes.objectOf(PropTypes.any),
  resetSearch: PropTypes.func.isRequired,
  label: PropTypes.string.isRequired,
};
