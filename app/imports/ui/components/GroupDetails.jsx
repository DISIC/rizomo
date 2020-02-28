import PropTypes from 'prop-types';

export default function GroupDetails({ group }) {
  console.log(group);
  return null;
}

GroupDetails.propTypes = {
  group: PropTypes.objectOf(PropTypes.any).isRequired,
};
