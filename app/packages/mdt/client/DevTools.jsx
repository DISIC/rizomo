import React, { useState } from 'react';
import UnlockButton from './components/UnlockButton';
import ToolsContainer from './components/ToolsContainer';
import CollectionLister from './components/CollectionLister';
import MDTProvider from './utils/context';

const DevTools = () => {
  const [open, toggleOpen] = useState(false);
  const handleToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleOpen(!open);
  };
  return (
    <MDTProvider>
      {!open ? (
        <UnlockButton handleClick={handleToggle} />
      ) : (
        <>
          <ToolsContainer handleClose={handleToggle} />
          <CollectionLister handleClose={handleToggle} />
        </>
      )}
    </MDTProvider>
  );
};

export default DevTools;
