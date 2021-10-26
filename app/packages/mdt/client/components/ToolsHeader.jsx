import React, { useContext } from 'react';
import ReactJson from 'react-json-view';
import { DocumentWrapper, ListerHeader } from '../utils/styles';
import { MDTContext } from '../utils/context';

const ToolsHeader = ({ openCollection, open }) => {
  const [{ options }, setState] = useContext(MDTContext);
  const handleOpen = () => openCollection('tools');
  const onChange = ({ updated_src }) => {
    Object.keys(updated_src).forEach((key) => {
      updated_src[key] = JSON.parse(updated_src[key]);
    });
    setState({ options: updated_src });
  };
  return (
    <>
      <ListerHeader selected={open}>
        <div>MDT - MeteorDevTools</div>
        <div onClick={handleOpen} style={{ fontWeight: 'bold', cursor: 'pointer' }}>
          Options
        </div>
      </ListerHeader>
      {open && (
        <DocumentWrapper tools>
          <div className="content">
            <ReactJson
              displayDataTypes={false}
              sortKeys
              name={false}
              displayObjectSize={false}
              onEdit={onChange}
              enableClipboard={false}
              theme="codeschool"
              src={options}
            />
          </div>
        </DocumentWrapper>
      )}
    </>
  );
};

export default ToolsHeader;
