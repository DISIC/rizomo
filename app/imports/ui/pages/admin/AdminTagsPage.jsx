import React from 'react';
import { Meteor } from 'meteor/meteor';
import PropTypes from 'prop-types';
import i18n from 'meteor/universe:i18n';
import { withTracker } from 'meteor/react-meteor-data';
import MaterialTable from '@material-table/core';
import Fade from '@material-ui/core/Fade';
import Container from '@material-ui/core/Container';
import Spinner from '../../components/system/Spinner';
import { createTag, updateTag, removeTag } from '../../../api/tags/methods';
import setMaterialTableLocalization from '../../components/initMaterialTableLocalization';
import Tags from '../../../api/tags/tags';

const handleResult = (resolve, reject) => (error, result) => {
  if (error) {
    msg.error(error.reason);
    reject(error);
  } else {
    msg.success(i18n.__('api.methods.operationSuccessMsg'));
    resolve(result);
  }
};

const onRowAdd = ({ name }) =>
  new Promise((resolve, reject) => {
    createTag.call({ name }, handleResult(resolve, reject));
  });
const onRowUpdate = (newData, oldData) =>
  new Promise((resolve, reject) => {
    updateTag.call(
      {
        tagId: oldData._id,
        data: {
          name: newData.name,
        },
      },
      handleResult(resolve, reject),
    );
  });

const onRowDelete = (oldData) =>
  new Promise((resolve, reject) => {
    removeTag.call({ tagId: oldData._id }, handleResult(resolve, reject));
  });

const AdminTagsPage = ({ tags, loading }) => {
  const columns = [
    {
      name: i18n.__('pages.AdminTagsPage.columnName'),
      field: 'name',
      defaultSort: 'asc',
    },
  ];

  const options = {
    pageSize: 10,
    pageSizeOptions: [10, 20, 50, 100],
    paginationType: 'stepped',
    actionsColumnIndex: 4,
    addRowPosition: 'first',
    emptyRowsWhenPaging: false,
  };

  return (
    <>
      {loading ? (
        <Spinner />
      ) : (
        <Fade in>
          <Container style={{ overflowX: 'auto' }}>
            <MaterialTable
              // other props
              title={i18n.__('pages.AdminTagsPage.title')}
              columns={columns}
              data={tags.map((row) => ({ ...row, id: row._id }))}
              options={options}
              localization={setMaterialTableLocalization('pages.AdminTagsPage')}
              editable={{
                onRowAdd,
                onRowDelete,
                onRowUpdate,
              }}
            />
          </Container>
        </Fade>
      )}
    </>
  );
};

AdminTagsPage.propTypes = {
  tags: PropTypes.arrayOf(PropTypes.object).isRequired,
  loading: PropTypes.bool.isRequired,
};

export default withTracker(() => {
  const tagsHandle = Meteor.subscribe('tags.all');
  const loading = !tagsHandle.ready();
  const tags = Tags.find({}, { sort: { name: 1 } }).fetch();
  return {
    tags,
    loading,
  };
})(AdminTagsPage);
