import React, { useState } from 'react';
import PropTypes from 'prop-types';
import TextField from '@material-ui/core/TextField';
import SearchIcon from '@material-ui/icons/Search';
import Autocomplete, { createFilterOptions } from '@material-ui/lab/Autocomplete';
import i18n from 'meteor/universe:i18n';
import { makeStyles } from '@material-ui/core/styles';
import InputAdornment from '@material-ui/core/InputAdornment';

const useStyles = makeStyles(() => ({
  noRightBorderRadius: {
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
  },
}));

function TagFinder({ tags, onSelected, exclude, opened, resetKey, inputWidth }) {
  const classes = useStyles();
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState(tags.filter((tag) => !exclude.includes(tag.name)));
  let existingTags = tags.map((tag) => tag.name.toLowerCase());

  React.useEffect(() => {
    setOpen(opened);
  }, [opened]);

  React.useEffect(() => {
    setOptions(tags.filter((tag) => !exclude.includes(tag.name)));
  }, [tags, exclude]);

  React.useEffect(() => {
    existingTags = tags.map((tag) => tag.name.toLowerCase());
  }, [tags]);

  const filter = createFilterOptions();

  return (
    <Autocomplete
      key={resetKey}
      id="tag-select"
      open={open}
      onOpen={() => {
        setOpen(true);
      }}
      onClose={() => {
        setOpen(false);
      }}
      selectOnFocus
      clearOnBlur
      handleHomeEndKeys
      autoHighlight
      freeSolo
      filterOptions={(opts, params) => {
        const filtered = filter(opts, params);
        // Suggest the creation of a new value if it does not already exist
        if (params.inputValue !== '') {
          if (!existingTags.includes(params.inputValue.toLowerCase())) {
            filtered.push({
              inputValue: params.inputValue,
              name: `${i18n.__('components.TagFinder.addTag')} "${params.inputValue.toLowerCase()}"`,
            });
          }
        }
        return filtered;
      }}
      getOptionSelected={(option, value) => {
        return option.name.toLowerCase === value.toLowerCase;
      }}
      getOptionLabel={(option) => {
        // Value selected with enter, right from the input
        if (typeof option === 'string') {
          return option;
        }
        // Add "xxx" option created dynamically
        if (option.inputValue) {
          return option.inputValue;
        }
        // Regular option
        return option.name;
      }}
      renderOption={(option) => option.name}
      noOptionsText={i18n.__('components.TagFinder.noTag')}
      clearText={i18n.__('components.TagFinder.clear')}
      loadingText={i18n.__('components.TagFinder.loading')}
      openText={i18n.__('components.TagFinder.open')}
      closeText={i18n.__('components.TagFinder.close')}
      onChange={onSelected}
      options={options}
      renderInput={(params) => {
        return (
          <TextField
            {...params}
            style={{ width: inputWidth }}
            label={i18n.__('components.TagFinder.tagLabel')}
            variant="outlined"
            placeholder={i18n.__('components.TagFinder.placeholder')}
            InputProps={{
              ...params.InputProps,
              classes: {
                root: classes.noRightBorderRadius,
              },
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        );
      }}
    />
  );
}

TagFinder.defaultProps = {
  tags: [],
  resetKey: new Date().toISOString(),
  exclude: null,
  opened: false,
  inputWidth: 285,
};

TagFinder.propTypes = {
  tags: PropTypes.arrayOf(PropTypes.any),
  resetKey: PropTypes.string,
  onSelected: PropTypes.func.isRequired,
  exclude: PropTypes.arrayOf(PropTypes.string),
  opened: PropTypes.bool,
  inputWidth: PropTypes.number,
};

export default TagFinder;
