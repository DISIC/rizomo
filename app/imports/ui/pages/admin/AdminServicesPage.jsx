import React from 'react';
import { Meteor } from 'meteor/meteor';
import PropTypes from 'prop-types';
import i18n from 'meteor/universe:i18n';
import { withTracker } from 'meteor/react-meteor-data';
import MaterialTable from '@material-table/core';
import Container from '@material-ui/core/Container';
import Fade from '@material-ui/core/Fade';
import { useHistory } from 'react-router-dom';
import keyboardArrowRight from '@material-ui/icons/KeyboardArrowRight';
import Spinner from '../../components/system/Spinner';
import Services from '../../../api/services/services';
import { removeService } from '../../../api/services/methods';
import setMaterialTableLocalization from '../../components/initMaterialTableLocalization';
import { useAppContext } from '../../contexts/context';

function AdminServicesPage({ services, loading, structureMode }) {
  const history = useHistory();
  // used to help generate url in structure mode
  const urlStruct = structureMode ? 'structure' : '';
  const [{ user }] = useAppContext();
  const columns = [
    {
      title: i18n.__('pages.AdminServicesPage.columnLogo'),
      field: 'logo',
      render: (rowData) => {
        const { logo, title } = rowData;
        return <img style={{ height: 36, borderRadius: '10%' }} src={logo} alt={`Logo - ${title}`} />;
      },
    },
    { title: i18n.__('pages.AdminServicesPage.columnTitle'), field: 'title', defaultSort: 'asc' },
    { title: i18n.__('pages.AdminServicesPage.columnUsage'), field: 'usage' },
    {
      title: i18n.__('pages.AdminServicesPage.columnUrl'),
      field: 'url',
      render: (rowData) => {
        const { url } = rowData;
        return (
          <a href={url} target="_blank" rel="noreferrer noopener">
            {url}
          </a>
        );
      },
    },
    {
      title: i18n.__('pages.AdminServicesPage.columnState'),
      field: 'state',
      initialEditValue: Object.keys(Services.stateLabels)[0],
      render: (rowData) => {
        const { state } = rowData;
        return i18n.__(Services.stateLabels[state]);
      },
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
          <Container style={{ overflowX: 'auto' }}>
            <MaterialTable
              // other props
              title={`${i18n.__('pages.AdminServicesPage.title')} ${structureMode ? `(${user.structure})` : ''}`}
              columns={columns}
              data={services.map((row) => ({ ...row, id: row._id }))}
              options={options}
              localization={setMaterialTableLocalization('pages.AdminServicesPage')}
              actions={[
                {
                  icon: 'edit',
                  tooltip: i18n.__('pages.AdminServicesPage.materialTableLocalization.body_editTooltip'),
                  onClick: (event, rowData) => {
                    history.push(`/admin${urlStruct}services/${rowData._id}`);
                  },
                },
                {
                  icon: keyboardArrowRight,
                  tooltip: i18n.__('pages.AdminServicesPage.materialTableLocalization.body_goTooltip'),
                  onClick: (event, rowData) => {
                    history.push(`/${structureMode ? urlStruct : 'services'}/${rowData.slug}`);
                  },
                },
                {
                  icon: 'add',
                  tooltip: i18n.__('pages.AdminServicesPage.materialTableLocalization.body_addTooltip'),
                  isFreeAction: true,
                  onClick: () => history.push(`/admin${urlStruct}services/new`),
                },
              ]}
              editable={{
                onRowDelete: (oldData) =>
                  new Promise((resolve, reject) => {
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
  structureMode: PropTypes.bool.isRequired,
};

export default withTracker(({ match: { path } }) => {
  const structureMode = path === '/adminstructureservices';
  const servicesHandle = Meteor.subscribe(structureMode ? 'services.structure' : 'services.all');
  const loading = !servicesHandle.ready();
  let services;
  if (structureMode) {
    services = Services.findFromPublication('services.structure', {}, { sort: { title: 1 } }).fetch();
  } else {
    services = Services.find({}, { sort: { title: 1 } }).fetch();
  }
  return {
    services,
    loading,
    structureMode,
  };
})(AdminServicesPage);
