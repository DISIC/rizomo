import React, { useState, useEffect, useContext } from 'react';
import ReactJson from 'react-json-view';
import { CollectionHeader, DocumentWrapper, MenuContainer } from '../utils/styles';
import { RightArrow, LeftArrow } from '../utils/icons';
import useTracker from '../utils/useTracker';
import { MDTContext } from '../utils/context';

const SingleCollection = ({ collection, openCollection, open }) => {
  const [{ options }] = useContext(MDTContext);
  const {
    activateEdit, activateAdd, activateDelete, logActions, ...otherOptions
  } = options;
  const [itemNumber, setItemNumber] = useState(1);
  const [item, setItem] = useState(collection.findOne({}));
  const total = useTracker(() => collection.find({}).count());
  const handleOpen = () => openCollection(collection.name);

  const getItem = () => setItem(collection.findOne({}, { skip: (itemNumber || 1) - 1 }));
  useEffect(() => {
    getItem();
    if (itemNumber === 0 && total !== 0) {
      setItemNumber(1);
    }
  }, [itemNumber, total]);

  const selectNextItem = () => {
    if (total === itemNumber) {
      setItemNumber(1);
    } else {
      setItemNumber(itemNumber + 1);
    }
  };
  const selectPreviousItem = () => {
    if (itemNumber === 1) {
      setItemNumber(total);
    } else {
      setItemNumber(itemNumber - 1);
    }
  };
  useEffect(() => {
    if (!item && itemNumber !== 1 && total !== 0) {
      selectPreviousItem();
      console.log('log2');
    } else if (total === 0) {
      setItemNumber(0);
    }
  }, [item]);

  const deleteItem = () => {
    Meteor.call(
      'MDT.deleteItem',
      {
        itemId: item._id,
        collection: collection.name,
      },
      (error, result) => {
        if (error) {
          throw new Error(error.reason);
        } else {
          console.log('=== MDT Delete ===', item);
        }
        getItem();
      },
    );
  };
  const duplicateItem = () => {
    Meteor.call(
      'MDT.duplicateItem',
      {
        itemId: item._id,
        collection: collection.name,
      },
      (error, result) => {
        if (error) {
          throw new Error(error.reason);
        } else {
          console.log('=== MDT Duplicate ===', item);
        }
        getItem();
      },
    );
  };

  const onChange = (event) => {
    let {
      existing_src, namespace, name, existing_value, new_value, updated_src,
    } = event;
    if (typeof existing_value === 'number' || typeof existing_value === 'boolean') {
      new_value = JSON.parse(new_value);
    }
    Meteor.call(
      'MDT.updateItem',
      {
        key: `${namespace.join('.')}${namespace.length ? '.' : ''}${name}`,
        value: new_value,
        collection: collection.name,
        itemId: existing_src._id,
      },
      (error, result) => {
        if (error) {
          throw new Error(error.reason);
        } else {
          console.log('=== MDT Update ===', updated_src);
        }
        getItem();
      },
    );
  };

  return (
    <>
      <CollectionHeader selected={open} onClick={handleOpen} key={collection.name}>
        <div>{collection.name}</div>
        <div style={{ fontWeight: 'bold' }}>
          {open && `${itemNumber}/`}
          {total}
        </div>
      </CollectionHeader>
      {open && (
        <DocumentWrapper>
          <div className="content">
            <MenuContainer>
              <div onClick={deleteItem}>
                <span>Delete</span>
              </div>
              <div onClick={duplicateItem}>
                <span>Duplicate</span>
              </div>
              <div onClick={selectPreviousItem}>
                <LeftArrow />
              </div>
              <div onClick={selectNextItem}>
                <RightArrow />
              </div>
            </MenuContainer>
            {item ? (
              <ReactJson
                name={false}
                onEdit={activateEdit ? onChange : undefined}
                onAdd={activateAdd ? onChange : undefined}
                onDelete={activateDelete ? onChange : undefined}
                theme="codeschool"
                src={item}
                {...otherOptions}
              />
            ) : (
              <pre>No Items in this collection</pre>
            )}
          </div>
        </DocumentWrapper>
      )}
    </>
  );
};

export default SingleCollection;
