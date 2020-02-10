import React from 'react';
import { Meteor } from 'meteor/meteor';
import PropTypes from 'prop-types';
import i18n from 'meteor/universe:i18n';
import { withTracker } from 'meteor/react-meteor-data';
import MaterialTable from 'material-table';
import Spinner from '../components/Spinner';
import Services from '../../api/services/services';
import { createService, updateService, removeService } from '../../api/services/methods';
import setMaterialTableLocalization from '../components/initMaterialTableLocalization';

function AdminServicesPage({ services, loading }) {
  const columns = [
    {
      title: i18n.__('pages.AdminServicesPage.columnLogo'),
      field: 'logo',
      render: (rowData) => (
        <img
          style={{ height: 36, backgroundColor: 'palegoldenrod', borderRadius: '10%' }}
          src={rowData.logo}
          alt={`Logo - ${rowData.title}`}
        />
      ),
    },
    { title: i18n.__('pages.AdminServicesPage.columnTitle'), field: 'title', defaultSort: 'asc' },
    { title: i18n.__('pages.AdminServicesPage.columnDescription'), field: 'description' },
    {
      title: i18n.__('pages.AdminServicesPage.columnUrl'),
      field: 'url',
      render: (rowData) => (
        <a href={rowData.url} target="_blank" rel="noreferrer noopener">
          {rowData.url}
        </a>
      ),
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
        <MaterialTable
          // other props
          title={i18n.__('pages.AdminServicesPage.title')}
          columns={columns}
          data={services}
          options={options}
          localization={setMaterialTableLocalization('pages.AdminServicesPage')}
          editable={{
            onRowAdd: (newData) => new Promise((resolve, reject) => {
              createService.call(
                {
                  title: newData.title,
                  description: newData.description,
                  url: newData.url,
                  logo: newData.logo,
                },
                (err, res) => {
                  if (err) {
                    console.log(err);
                    reject(err);
                  } else {
                    resolve(res);
                  }
                },
              );
            }),
            onRowUpdate: (newData, oldData) => new Promise((resolve, reject) => {
              updateService.call(
                {
                  serviceId: oldData._id,
                  data: {
                    title: newData.title,
                    description: newData.description,
                    url: newData.url,
                    logo: newData.logo,
                  },
                },
                (err, res) => {
                  if (err) {
                    console.log(err);
                    reject(err);
                  } else {
                    resolve(res);
                  }
                },
              );
            }),
            onRowDelete: (oldData) => new Promise((resolve, reject) => {
              removeService.call(
                {
                  serviceId: oldData._id,
                },
                (err, res) => {
                  if (err) {
                    console.log(err);
                    reject(err);
                  } else {
                    resolve(res);
                  }
                },
              );
            }),
          }}
        />
      )}
    </>
  );
}

AdminServicesPage.propTypes = {
  services: PropTypes.arrayOf(PropTypes.object).isRequired,
  loading: PropTypes.bool.isRequired,
};

export default withTracker(() => {
  const servicesHandle = Meteor.subscribe('services.all');
  const loading = !servicesHandle.ready();
  const services = Services.find({}, { sort: { title: 1 } }).fetch();
  return {
    services,
    loading,
  };
})(AdminServicesPage);
