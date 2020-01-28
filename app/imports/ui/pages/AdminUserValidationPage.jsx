import React from 'react';
import { Meteor } from 'meteor/meteor';
import PropTypes from 'prop-types';
import { withTracker } from 'meteor/react-meteor-data';
import MaterialTable from 'material-table';
import PersonAddIcon from '@material-ui/icons/PersonAdd';
import Spinner from '../components/Spinner';
import withUser from '../contexts/withUser';
import '../../api/users/users';
import { setActive } from '../../api/users/methods';

function AdminUserValidationPage({ usersrequest, loading }) {
  const columns = [
    { title: 'Pseudo', field: 'username' },
    { title: 'Nom', field: 'lastName' },
    { title: 'Prénom', field: 'firstName' },
    {
      title: 'Emails',
      field: 'emails',
      render: (rowData) => rowData.emails.map((m) => (
        <a key={m.address} href={m.address} style={{ display: 'block' }}>
          {m.address}
        </a>
      )),
    },
    { title: 'Structure', field: 'structure' },
    { title: "Date d'inscription", field: 'createdAt', type: 'datetime' },
  ];

  const options = {
    pageSize: 10,
    pageSizeOptions: [10, 20, 50, 100],
    paginationType: 'stepped',
    actionsColumnIndex: 6,
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
          title="Utilisateurs en attente de validation"
          columns={columns}
          data={usersrequest}
          options={options}
          localization={localisation}
          actions={[
            {
              icon: PersonAddIcon,
              tooltip: 'Valider cet utilisateur',
              onClick: (event, rowData) => {
                setActive.call({ userId: rowData._id }, (err) => {
                  if (err) console.log('unable to validate user');
                });
              },
            },
          ]}
        />
      )}
    </>
  );
}

AdminUserValidationPage.propTypes = {
  usersrequest: PropTypes.arrayOf(PropTypes.object).isRequired,
  loading: PropTypes.bool.isRequired,
};

export default withTracker(() => {
  const usersrequestHandle = Meteor.subscribe('users.request');
  const loading = !usersrequestHandle.ready();
  const usersrequest = Meteor.users.find({ isRequest: true }).fetch();
  return {
    usersrequest,
    loading,
  };
})(withUser(AdminUserValidationPage));
