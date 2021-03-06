import React from 'react';
import { Meteor } from 'meteor/meteor';
import PropTypes from 'prop-types';
import i18n from 'meteor/universe:i18n';
import { withTracker } from 'meteor/react-meteor-data';
import MaterialTable from '@material-table/core';
import PersonAddIcon from '@material-ui/icons/PersonAdd';
import Fade from '@material-ui/core/Fade';
import Container from '@material-ui/core/Container';
import Spinner from '../../components/system/Spinner';
import '../../../api/users/users';
import setMaterialTableLocalization from '../../components/initMaterialTableLocalization';

function AdminUserValidationPage({ usersrequest, loading }) {
  const columns = [
    {
      title: i18n.__('pages.AdminUserValidationPage.columnUsername'),
      field: 'username',
    },
    {
      title: i18n.__('pages.AdminUserValidationPage.columnLastName'),
      field: 'lastName',
    },
    {
      title: i18n.__('pages.AdminUserValidationPage.columnFirstName'),
      field: 'firstName',
    },
    {
      title: i18n.__('pages.AdminUserValidationPage.columnEmails'),
      field: 'emails',
      render: (rowData) =>
        rowData.emails.map((m) => (
          <a key={m.address} href={m.address} style={{ display: 'block' }}>
            {m.address}
          </a>
        )),
    },
    {
      title: i18n.__('pages.AdminUserValidationPage.columnStructure'),
      field: 'structure',
    },
    {
      title: i18n.__('pages.AdminUserValidationPage.columnCreatedAt'),
      field: 'createdAt',
      type: 'datetime',
    },
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
        <Fade in>
          <Container>
            <MaterialTable
              // other props
              title={i18n.__('pages.AdminUserValidationPage.title')}
              columns={columns}
              data={usersrequest.map((row) => ({ ...row, id: row._id }))}
              options={options}
              localization={setMaterialTableLocalization('pages.AdminUserValidationPage')}
              actions={[
                {
                  icon: PersonAddIcon,
                  tooltip: i18n.__('pages.AdminUserValidationPage.actions_tooltip'),
                  onClick: (event, rowData) => {
                    Meteor.call('users.setActive', { userId: rowData._id }, (err) => {
                      if (err) {
                        msg.error(err.reason);
                      }
                    });
                  },
                },
              ]}
            />
          </Container>
        </Fade>
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
})(AdminUserValidationPage);
