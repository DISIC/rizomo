import React, { useState } from 'react';
import { Meteor } from 'meteor/meteor';
import PropTypes from 'prop-types';
import i18n from 'meteor/universe:i18n';
import { withTracker } from 'meteor/react-meteor-data';
import MaterialTable from '@material-table/core';
import Container from '@material-ui/core/Container';
import GroupAddIcon from '@material-ui/icons/GroupAdd';
import VisibilityIcon from '@material-ui/icons/Visibility';
import VisibilityOffIcon from '@material-ui/icons/VisibilityOff';
import add from '@material-ui/icons/Add';
import Spinner from '../../components/system/Spinner';
import Nextcloud from '../../../api/nextcloud/nextcloud';
import { removeNextcloudURL } from '../../../api/nextcloud/methods';
import setMaterialTableLocalization from '../../components/initMaterialTableLocalization';
import AdminNextCloudUrlEdit from '../../components/admin/AdminNextcloudUrlEdit';

function AdminNextcloudUrlPage({ loading, nextclouds }) {
  const ncloudData = {};
  const columns = [
    {
      title: i18n.__('pages.AdminNextcloudUrlPage.columnUrl'),
      field: 'url',
    },
    {
      title: i18n.__('pages.AdminNextcloudUrlPage.columnActive'),
      field: 'active',
      render: (rowData) =>
        rowData && rowData.active
          ? i18n.__('pages.AdminNextcloudUrlPage.materialTableLocalization.activated')
          : i18n.__('pages.AdminNextcloudUrlPage.materialTableLocalization.deactivated'),
    },
    {
      title: i18n.__('pages.AdminNextcloudUrlPage.columnCount'),
      field: 'count',
      render: (rowData) => rowData.count,
    },
  ];

  const UpdateAllUsersURL = () => {
    Meteor.call('users.setNCloudAll', {}, function callbackUpdate(error, cpt) {
      if (error) {
        msg.error(error.message);
      } else if (cpt === 0) {
        msg.error(`${i18n.__('pages.AdminNextcloudUrlPage.methodEmpty')}`);
      } else {
        msg.success(`${i18n.__('pages.AdminNextcloudUrlPage.methodSuccess')} ${cpt}`);
      }
    });
  };

  const changeURL = (data) => {
    Meteor.call(
      'nextcloud.updateURL',
      {
        url: data.url,
        active: data.active,
      },
      function callbackQuota(error) {
        if (error) {
          msg.error(error.message);
        } else {
          msg.success(i18n.__('api.methods.operationSuccessMsg'));
        }
      },
    );
  };

  const [editUrl, setEditUrl] = useState(false);

  const OpenURLEditor = () => {
    setEditUrl(true);
  };

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
        <div>
          <Container style={{ overflowX: 'auto' }}>
            <MaterialTable
              // other props
              title={`${i18n.__('pages.AdminNextcloudUrlPage.title')}`}
              columns={columns}
              data={nextclouds.map((row) => ({ ...row, id: row._id }))}
              options={options}
              localization={setMaterialTableLocalization('pages.AdminNextcloudUrlPage')}
              actions={[
                (rowData) => ({
                  icon: () => (rowData.active ? <VisibilityOffIcon /> : <VisibilityIcon />),
                  tooltip: i18n.__('pages.AdminNextcloudUrlPage.materialTableLocalization.body_activeTooltip'),
                  onClick: () => {
                    changeURL({ ...rowData, active: !rowData.active });
                  },
                }),
                {
                  icon: add,
                  tooltip: i18n.__('pages.AdminNextcloudUrlPage.materialTableLocalization.body_addTooltip'),
                  isFreeAction: true,
                  onClick: () => {
                    OpenURLEditor();
                  },
                },
                {
                  icon: GroupAddIcon,
                  tooltip: i18n.__('pages.AdminNextcloudUrlPage.updateAll'),
                  isFreeAction: true,
                  onClick: () => {
                    UpdateAllUsersURL();
                  },
                },
              ]}
              editable={{
                onRowDelete: (oldData) =>
                  new Promise((resolve, reject) => {
                    removeNextcloudURL.call(
                      {
                        url: oldData.url,
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
          {editUrl ? (
            <AdminNextCloudUrlEdit data={ncloudData} open={editUrl} onClose={() => setEditUrl(false)} />
          ) : null}
        </div>
      )}
    </>
  );
}

AdminNextcloudUrlPage.propTypes = {
  loading: PropTypes.bool.isRequired,
  nextclouds: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default withTracker(() => {
  const categoriesHandle = Meteor.subscribe('nextcloud.all');
  const loading = !categoriesHandle.ready();
  const nextclouds = Nextcloud.find({}, { sort: { name: 1 } }).fetch();
  return {
    loading,
    nextclouds,
  };
})(AdminNextcloudUrlPage);
