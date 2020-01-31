import React from 'react';
import { Meteor } from 'meteor/meteor';
import PropTypes from 'prop-types';
import i18n from 'meteor/universe:i18n';
import { withTracker } from 'meteor/react-meteor-data';
import MaterialTable from 'material-table';
import PersonAddIcon from '@material-ui/icons/PersonAdd';
import Spinner from '../components/Spinner';
import withUser from '../contexts/withUser';
import '../../api/users/users';
import { setActive } from '../../api/users/methods';
import setMaterialTableLocalization from '../components/initMaterialTableLocalization';

function AdminUserValidationPage({ usersrequest, loading }) {
  const columns = [
    { title: i18n.__('pages.AdminUserValidationPage.columnUsername'), field: 'username' },
    { title: i18n.__('pages.AdminUserValidationPage.columnLastName'), field: 'lastName' },
    { title: i18n.__('pages.AdminUserValidationPage.columnFirstName'), field: 'firstName' },
    {
      title: i18n.__('pages.AdminUserValidationPage.columnEmails'),
      field: 'emails',
      render: (rowData) => rowData.emails.map((m) => (
        <a key={m.address} href={m.address} style={{ display: 'block' }}>
          {m.address}
        </a>
      )),
    },
    { title: i18n.__('pages.AdminUserValidationPage.columnStructure'), field: 'structure' },
    { title: i18n.__('pages.AdminUserValidationPage.columnCreatedAt'), field: 'createdAt', type: 'datetime' },
  ];

  const options = {
    pageSize: 10,
    pageSizeOptions: [10, 20, 50, 100],
    paginationType: 'stepped',
    actionsColumnIndex: 6,
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
          title={i18n.__('pages.AdminUserValidationPage.title')}
          columns={columns}
          data={usersrequest}
          options={options}
          localization={setMaterialTableLocalization('pages.AdminUserValidationPage')}
          actions={[
            {
              icon: PersonAddIcon,
              tooltip: i18n.__('pages.AdminUserValidationPage.actions_tooltip'),
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
