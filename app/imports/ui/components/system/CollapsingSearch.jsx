import React from 'react';
import PropTypes from 'prop-types';
import Collapse from '@material-ui/core/Collapse';
import Grid from '@material-ui/core/Grid';
import SearchField from './SearchField';

const CollapsingSearch = ({
  classes,
  searchToggle,
  updateSearch,
  checkEscape,
  search,
  inputRef,
  resetSearch,
  label,
}) => (
  <Grid item xs={12} sm={12} md={6} className={classes}>
    <Collapse in={searchToggle} collapsedSize={0}>
      <SearchField
        updateSearch={updateSearch}
        checkEscape={checkEscape}
        search={search}
        inputRef={inputRef}
        resetSearch={resetSearch}
        label={label}
      />
    </Collapse>
  </Grid>
);

export default CollapsingSearch;

CollapsingSearch.defaultProps = {
  checkEscape: () => null,
  classes: '',
};

CollapsingSearch.propTypes = {
  classes: PropTypes.string,
  searchToggle: PropTypes.bool.isRequired,
  updateSearch: PropTypes.func.isRequired,
  checkEscape: PropTypes.func,
  search: PropTypes.string.isRequired,
  inputRef: PropTypes.objectOf(PropTypes.any).isRequired,
  resetSearch: PropTypes.func.isRequired,
  label: PropTypes.string.isRequired,
};
