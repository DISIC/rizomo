import { useState } from 'react';

// easy to manage complex state like in react Class
const useObjectState = (initialState) => {
  const [state, setState] = useState(initialState);

  const updateState = (args) => setState({
    ...state,
    ...args,
  });

  return [state, updateState];
};

export default { useObjectState };
