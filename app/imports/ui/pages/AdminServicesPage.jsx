import React from 'react';
import { Meteor } from 'meteor/meteor';
import PropTypes from 'prop-types';
import { withTracker } from 'meteor/react-meteor-data';
import MaterialTable from 'material-table';
import Spinner from '../components/Spinner';
import withUser from '../contexts/withUser';
import Services from '../../api/services/services';
import { createService, updateService, removeService } from '../../api/services/methods';

function AdminServicesPage({ services, loading }) {
  const columns = [
    {
      title: 'Logo',
      field: 'logo',
      render: (rowData) => (
        <img
          style={{ height: 36, backgroundColor: 'palegoldenrod', borderRadius: '10%' }}
          src={rowData.logo}
          alt={`Logo - ${rowData.title}`}
        />
      ),
    },
    { title: 'Nom', field: 'title', defaultSort: 'asc' },
    { title: 'Description', field: 'description' },
    {
      title: 'Lien',
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

  const localisation = {
    toolbar: {
      searchPlaceholder: 'Rechercher un service',
      searchTooltip: 'Chercher ',
    },
    pagination: {
      labelRowsSelect: 'Services',
      labelRowsPerPage: 'Services par page',
      firstAriaLabel: 'Première page',
      firstTooltip: 'Première page',
      previousAriaLabel: 'Page précédente',
      previousTooltip: 'Page précédente',
      nextAriaLabel: 'Page suivante',
      nextTooltip: 'Page suivante',
      lastAriaLabel: 'Dernière page',
      lastTooltip: 'Dernière page',
    },
    body: {
      emptyDataSourceMessage: 'Aucun service enregistré',
      addTooltip: 'Ajouter un service',
      editTooltip: 'Modifier ce service',
      deleteTooltip: 'Supprimer ce service',
      editRow: {
        deleteText: 'Supprimer vraiment ce service ?',
        cancelTooltip: 'Annuler',
        saveTooltip: 'Enregistrer les changements',
      },
    },
  };

  return (
    <>
      {loading ? (
        <Spinner />
      ) : (
        <MaterialTable
          // other props
          title="Gestion des Services"
          columns={columns}
          data={services}
          options={options}
          localization={localisation}
          editable={{
            onRowAdd: (newData) => new Promise((resolve, reject) => {
              createService.call(
                {
                  title: newData.title,
                  description: newData.description,
                  url: newData.url,
                  logo: newData.logo,
                  target: '_blank',
                  glyphicon: 'glyphicon',
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
                    target: '_blank',
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
})(withUser(AdminServicesPage));
