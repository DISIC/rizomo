import React from 'react';
import PropTypes from 'prop-types';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';

export default function GroupDetails({ group }) {
  return (
    <TableRow>
      <TableCell component="th" scope="row">
        {group.name}
      </TableCell>
      <TableCell>{group.info}</TableCell>
      <TableCell align="right">&nbsp;</TableCell>
    </TableRow>
  );
}

GroupDetails.propTypes = {
  group: PropTypes.objectOf(PropTypes.any).isRequired,
};
