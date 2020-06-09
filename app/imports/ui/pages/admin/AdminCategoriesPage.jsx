import React from 'react';
import { Meteor } from 'meteor/meteor';
import PropTypes from 'prop-types';
import i18n from 'meteor/universe:i18n';
import { withTracker } from 'meteor/react-meteor-data';
import MaterialTable from 'material-table';
import { Container, Fade } from '@material-ui/core';
import Spinner from '../../components/system/Spinner';
import { createCategorie, updateCategorie, removeCategorie } from '../../../api/categories/methods';
import setMaterialTableLocalization from '../../components/initMaterialTableLocalization';
import Categories from '../../../api/categories/categories';

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
    createCategorie.call({ name }, handleResult(resolve, reject));
  });
const onRowUpdate = (newData, oldData) =>
  new Promise((resolve, reject) => {
    updateCategorie.call(
      {
        categoryId: oldData._id,
        data: {
          name: newData.name,
        },
      },
      handleResult(resolve, reject),
    );
  });

const onRowDelete = (oldData) =>
  new Promise((resolve, reject) => {
    removeCategorie.call({ categoryId: oldData._id }, handleResult(resolve, reject));
  });

const AdminCategoriesPage = ({ categories, loading }) => {
  const columns = [
    {
      name: i18n.__('pages.AdminCategoriesPage.columnName'),
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
          <Container>
            <MaterialTable
              // other props
              title={i18n.__('pages.AdminCategoriesPage.title')}
              columns={columns}
              data={categories}
              options={options}
              localization={setMaterialTableLocalization('pages.AdminCategoriesPage')}
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

AdminCategoriesPage.propTypes = {
  categories: PropTypes.arrayOf(PropTypes.object).isRequired,
  loading: PropTypes.bool.isRequired,
};

export default withTracker(() => {
  const categoriesHandle = Meteor.subscribe('categories.all');
  const loading = !categoriesHandle.ready();
  const categories = Categories.find({}, { sort: { name: 1 } }).fetch();
  return {
    categories,
    loading,
  };
})(AdminCategoriesPage);
