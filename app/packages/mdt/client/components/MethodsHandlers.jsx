import React, { useState, useEffect } from 'react';
import ReactJson from 'react-json-view';
import {
  IconWrapper, ListerHeader, BigToolContainer, MethodData,
} from '../utils/styles';
import { ServerIcon } from '../utils/icons';

const options = {
  displayObjectSize: true,
  displayDataTypes: true,
  sortKeys: true,
  indentWidth: 4,
  activateEdit: true,
  activateAdd: true,
  activateDelete: true,
  logActions: true,
};
const MethodsHandlers = () => {
  const [listOpened, setListOpened] = useState(false);
  const [loading, setLoading] = useState(false);
  const [args, setArgs] = useState({});
  const [search, setSearch] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('');
  const [methods, setMethods] = useState([]);

  const updateArgs = (e) => {
    const { updated_src } = e;
    console.log(e);
    setArgs(updated_src);
  };
  const openMethodsList = () => setListOpened(!listOpened);
  const hangleChange = (e) => setSearch(e.target.value);
  const selectMethod = (methodKey) => () => {
    setSelectedMethod(methodKey);
    setArgs({});
  };
  const callMethod = () => {
    setLoading(true);
    Meteor.call(selectedMethod, args, (error, result) => {
      console.log(error, result);
      setLoading(false);
    });
  };
  useEffect(() => {
    Meteor.call('MDT.getMethods', { search }, (err, result) => {
      setMethods(result);
    });
  }, [search]);
  if (!listOpened) {
    return (
      <IconWrapper onClick={openMethodsList}>
        <ServerIcon />
      </IconWrapper>
    );
  }

  return (
    <BigToolContainer>
      <ListerHeader>
        Methods to call
        <span onClick={openMethodsList}>X</span>
      </ListerHeader>
      <input onChange={hangleChange} placeholder="Search methods..." />
      <ul>
        {loading ? (
          <li>Calling method</li>
        ) : (
          (methods
            && methods.map((method) => (
              <li
                onClick={selectedMethod === method ? null : selectMethod(method)}
                className={selectedMethod === method ? 'selected' : ''}
                key={method}
              >
                <MethodData>
                  {method}
                  {selectedMethod === method && (
                    <>
                      <ReactJson
                        name="Arguments"
                        onEdit={updateArgs}
                        onAdd={updateArgs}
                        onDelete={updateArgs}
                        theme="codeschool"
                        src={args}
                        {...options}
                      />
                      <button onClick={callMethod}>Submit</button>
                    </>
                  )}
                </MethodData>
                {/*  */}
              </li>
            ))) || <li>No methods found</li>
        )}
      </ul>
    </BigToolContainer>
  );
};

export default MethodsHandlers;
