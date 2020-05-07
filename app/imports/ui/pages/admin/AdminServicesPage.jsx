import React from 'react';
import { Meteor } from 'meteor/meteor';
import PropTypes from 'prop-types';
import i18n from 'meteor/universe:i18n';
import { withTracker } from 'meteor/react-meteor-data';
import MaterialTable from 'material-table';
import { Container, Fade } from '@material-ui/core';
import { useHistory } from 'react-router-dom';
import Spinner from '../../components/system/Spinner';
import Services from '../../../api/services/services';
import { removeService } from '../../../api/services/methods';
import setMaterialTableLocalization from '../../components/initMaterialTableLocalization';

function AdminServicesPage({ services, loading }) {
  const history = useHistory();
  const columns = [
    {
      title: i18n.__('pages.AdminServicesPage.columnLogo'),
      field: 'logo',
      render: (rowData) => (
        <img style={{ height: 36, borderRadius: '10%' }} src={rowData.logo} alt={`Logo - ${rowData.title}`} />
      ),
    },
    { title: i18n.__('pages.AdminServicesPage.columnTitle'), field: 'title', defaultSort: 'asc' },
    { title: i18n.__('pages.AdminServicesPage.columnUsage'), field: 'usage' },
    {
      title: i18n.__('pages.AdminServicesPage.columnUrl'),
      field: 'url',
      render: (rowData) => (
        <a href={rowData.url} target="_blank" rel="noreferrer noopener">
          {rowData.url}
        </a>
      ),
    },
    {
      title: i18n.__('pages.AdminServicesPage.columnState'),
      field: 'state',
      initialEditValue: Object.keys(Services.stateLabels)[0],
      render: (rowData) => i18n.__(Services.stateLabels[rowData.state]),
    },
  ];

  const options = {
    pageSize: 10,
    pageSizeOptions: [10, 20, 50, 100],
    paginationType: 'stepped',
    actionsColumnIndex: 5,
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
              title={i18n.__('pages.AdminServicesPage.title')}
              columns={columns}
              data={services}
              options={options}
              localization={setMaterialTableLocalization('pages.AdminServicesPage')}
              actions={[
                {
                  icon: 'edit',
                  tooltip: i18n.__('pages.AdminServicesPage.materialTableLocalization.body_editTooltip'),
                  onClick: (event, rowData) => {
                    history.push(`/adminservices/${rowData._id}`);
                  },
                },
                {
                  icon: 'keyboard_arrow_right',
                  tooltip: i18n.__('pages.AdminServicesPage.materialTableLocalization.body_goTooltip'),
                  onClick: (event, rowData) => {
                    history.push(`/services/${rowData.slug}`);
                  },
                },
                {
                  icon: 'add',
                  tooltip: i18n.__('pages.AdminServicesPage.materialTableLocalization.body_addTooltip'),
                  isFreeAction: true,
                  onClick: () => history.push('/adminservices/new'),
                },
              ]}
              editable={{
                onRowDelete: (oldData) => new Promise((resolve, reject) => {
                  removeService.call(
                    {
                      serviceId: oldData._id,
                    },
                    (err, res) => {
                      if (err) {
                        msg.error(err.reason);
                        reject(err);
                      } else {
                        msg.success(i18n.__('api.methods.operationSuccessMsg'));
                        resolve(res);
                      }
                    },
                  );
                }),
              }}
            />
          </Container>
        </Fade>
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
