import { useState, useEffect } from 'react';
import { useTracker } from 'meteor/react-meteor-data';

export const usePagination = (subName, args = {}, Collection, query = {}, options = {}, itemPerPage) => {
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const subscription = useTracker(() => Meteor.subscribe(subName, { ...args, page, itemPerPage }));
  const loading = useTracker(() => !subscription.ready());

  const items = useTracker(
    () => Collection.findFromPublication(subName, query, { ...options, limit: itemPerPage }).fetch(),
    [page, loading, total],
  );

  useEffect(() => {
    Meteor.call(`get_${subName}_count`, args, (error, result) => setTotal(result));
  }, [page, args]);

  const nextPage = () => setPage(page + 1);
  const previousPage = () => setPage(page - 1);
  const changePage = (newPage) => setPage(newPage);

  return {
    page,
    nextPage,
    previousPage,
    changePage,
    loading,
    items,
    total,
  };
};

// easy to manage complex state like in react Class
export const useObjectState = (initialState) => {
  const [state, setState] = useState(initialState);

  const updateState = (args) => setState({
    ...state,
    ...args,
  });

  return [state, updateState];
};

export const useOnScreen = (ref, rootMargin = '0px') => {
  // State and setter for storing whether element is visible
  const [isIntersecting, setIntersecting] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        // Update our state when observer callback fires
        setIntersecting(entry.isIntersecting);
      },
      {
        rootMargin,
      },
    );
    if (ref.current) {
      observer.observe(ref.current);
    }
    return () => {
      observer.unobserve(ref.current);
    };
  }, []); // Empty array ensures that effect is only run on mount and unmount

  return isIntersecting;
};

function getSize() {
  return {
    width: Meteor.isClient ? window.innerWidth : undefined,
    height: Meteor.isClient ? window.innerHeight : undefined,
  };
}

export const useWindowSize = () => {
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
