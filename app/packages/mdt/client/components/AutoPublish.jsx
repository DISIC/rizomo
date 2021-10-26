import React, { useContext } from 'react';
import { IconWrapper } from '../utils/styles';
import { AutopubIcon } from '../utils/icons';
import { MDTContext } from '../utils/context';

const AutoPublish = () => {
  const [{ autopublish }, setState] = useContext(MDTContext);
  const toggleAutoPublish = () => {
    if (autopublish) {
      autopublish.stop();
      setState({ autopublish: null });
    } else {
      setState({ autopublish: Meteor.subscribe('MDT.autopublish') });
    }
  };
  return (
    <IconWrapper onClick={toggleAutoPublish}>
      <AutopubIcon selected={!!autopublish} />
    </IconWrapper>
  );
};

export default AutoPublish;
