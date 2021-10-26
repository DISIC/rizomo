import React, { useState } from 'react';
import { IconWrapper, ActionZone } from '../utils/styles';
import { LockIcon, UnlockIcon } from '../utils/icons';

const UnlockButton = ({ handleClick }) => {
  const [hover, toggleHover] = useState(false);
  const handleHover = () => toggleHover(!hover);
  return (
    <ActionZone onClick={handleClick} bottom onMouseEnter={handleHover} onMouseLeave={handleHover}>
      <IconWrapper>{hover ? <UnlockIcon /> : <LockIcon />}</IconWrapper>
    </ActionZone>
  );
};

export default UnlockButton;
