import React from 'react';
import { Meteor } from 'meteor/meteor';
import PropTypes from 'prop-types';
import { withTracker } from 'meteor/react-meteor-data';
import { makeStyles } from '@material-ui/core/styles';
import MaterialTable from 'material-table';
import Spinner from '../components/Spinner';
import withUser from '../contexts/withUser';
import Services from '../../api/services/services';

const useStyles = makeStyles(() => ({
  title: {
    margin: '5px',
  },
}));

function AdminServicesPage({ services, loading }) {
  const classes = useStyles();

  const [state, setState] = React.useState({
    columns: [
      {
        title: 'Logo',
        field: 'logo',
        render: (rowData) => (
          <img style={{ height: 36, backgroundColor: 'palegoldenrod', borderRadius: '10%' }} src={rowData.logo} />
        ),
      },
      { title: 'Nom', field: 'title', defaultSort: 'asc' },
      { title: 'Description', field: 'description' },
      {
        title: 'Lien',
        field: 'url',
        render: (rowData) => (
          <a href={rowData.url} target="_blank">
            {rowData.url}
          </a>
        ),
      },
    ],
    data: services,
  });

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
          columns={state.columns}
          data={state.data}
          options={options}
          localization={localisation}
          editable={{
            onRowAdd: (newData) => new Promise((resolve) => {
              setTimeout(() => {
                resolve();
                setState((prevState) => {
                  const data = [...prevState.data];
                  data.push(newData);
                  return { ...prevState, data };
                });
              }, 600);
            }),
            onRowUpdate: (newData, oldData) => new Promise((resolve) => {
              setTimeout(() => {
                resolve();
                if (oldData) {
                  setState((prevState) => {
                    const data = [...prevState.data];
                    data[data.indexOf(oldData)] = newData;
                    return { ...prevState, data };
                  });
                }
              }, 600);
            }),
            onRowDelete: (oldData) => new Promise((resolve) => {
              setTimeout(() => {
                resolve();
                setState((prevState) => {
                  const data = [...prevState.data];
                  data.splice(data.indexOf(oldData), 1);
                  return { ...prevState, data };
                });
              }, 600);
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
