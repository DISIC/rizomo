import React from 'react';
import ReactJson from 'react-json-view';
import { DocumentWrapper, CollectionHeader, LedSignal } from '../utils/styles';
import useTracker from '../utils/useTracker';

const AccountContainer = ({ openCollection, open }) => {
  const account = useTracker(() => Meteor.user());
  const handleOpen = () => openCollection('account');

  return (
    <>
      <CollectionHeader selected={open} onClick={handleOpen}>
        <div>Account</div>
        <LedSignal light={!!account} />
      </CollectionHeader>
      {open && (
        <DocumentWrapper tools>
          <div className="content">
            <ReactJson
              displayDataTypes={false}
              sortKeys
              name={false}
              displayObjectSize={false}
              enableClipboard={false}
              theme="codeschool"
              src={account}
            />
          </div>
        </DocumentWrapper>
      )}
    </>
  );
};

export default AccountContainer;
