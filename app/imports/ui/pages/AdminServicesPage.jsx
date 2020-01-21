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

function AdminServicesPage({ services, loading, searchString }) {
  const classes = useStyles();

  const filteredServices = () => {
    setState({ data: services.filter((service) => filterServices(service)) });
  };

  const filterServices = (service) => {
    console.log('searchString', searchString);
    let searchText = service.title + service.description;
    searchText = searchText.toLowerCase();
    if (!searchString) return true;
    return searchText.indexOf(searchString.toLowerCase()) > -1;
  };

  const [state, setState] = React.useState({
    columns: [
      { title: 'Nom', field: 'title' },
      { title: 'Description', field: 'description' },
      { title: 'Lien', field: 'url' },
      {
        title: 'Logo',
        field: 'logo',
        render: (rowData) => (
          <img style={{ height: 36, backgroundColor: 'palegoldenrod', borderRadius: '10%' }} src={rowData.logo} />
        ),
      },
    ],
    data: services,
  });

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
  searchString: PropTypes.string.isRequired,
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
