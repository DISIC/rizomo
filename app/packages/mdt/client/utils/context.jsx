import React, { createContext, useState, useEffect } from 'react';
import useLocalStorage from './useLocalstorage';

const options = {
  enableClipboard: false,
  displayObjectSize: false,
  displayDataTypes: false,
  sortKeys: false,
  indentWidth: 4,
  activateEdit: true,
  activateAdd: false,
  activateDelete: false,
  logActions: false,
};

const initialState = {
  autopublish: null,
  loading: false,
  options: null,
};
export const MDTContext = createContext(initialState);

const useLoggerState = (init) => {
  const [state, setState] = useState(init);

  const handleChanges = (args) => {
    const { logActions } = state;
    const newState = {
      ...state,
      ...args,
    };
    if (logActions) {
      console.groupCollapsed(`=== MDT Action: ${Object.keys(args).join(',')} ===`);
      console.log('Prev state: ', state);
      Object.keys(args).forEach((key) => {
        if (key === 'options') {
        }
        console.groupCollapsed('Key Changed:', key);
        console.log('New value:', args[key]);
        console.groupEnd();
      });
      console.log('Next state: ', newState);
      console.groupEnd();
    }
    setState(newState);
  };
  return [state, handleChanges];
};

const MDTProvider = ({ children }) => {
  const [globalState, setGlobalState] = useLoggerState(initialState);
  const [storage, setLocalStorage] = useLocalStorage('MDT-options', options);

  useEffect(() => {
    if (!globalState.options && !storage) {
      setLocalStorage(options);
      setGlobalState({ options: storage });
    } else if (storage && !globalState.options) {
      setGlobalState({ options: storage });
    } else {
      setLocalStorage(globalState.options);
    }
  }, [globalState.options]);

  return <MDTContext.Provider value={[globalState, setGlobalState]}>{children}</MDTContext.Provider>;
};

export default MDTProvider;
