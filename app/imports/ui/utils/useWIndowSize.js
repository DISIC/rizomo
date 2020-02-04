import { useEffect, useState } from 'react';

function getSize() {
  return {
    width: Meteor.isClient ? window.innerWidth : undefined,
    height: Meteor.isClient ? window.innerHeight : undefined,
  };
}

const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState(getSize);

  useEffect(() => {
    if (!Meteor.isClient) {
      return false;
    }

    const handleResize = () => {
      setWindowSize(getSize());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []); // Empty array ensures that effect is only run on mount and unmount

  return windowSize;
};

export default useWindowSize;
