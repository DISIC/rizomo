import React, { useContext } from 'react';
import { BrowserRouter, Switch } from 'react-router-dom';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import { blue } from '@material-ui/core/colors';
import SignLayout from './SignLayout';
import MainLayout from './MainLayout';
import ProtectedRoute from '../components/ProtectedRoute';
import PublicRoute from '../components/PublicRoute';
import Spinner from '../components/Spinner';
import DynamicStore, { Context } from '../contexts/context';

const theme = createMuiTheme({
  palette: {
    primary: blue,
    secondary: {
      main: '#fff',
    },
  },
});

function App() {
  const [state] = useContext(Context);
  const { loading } = state;
  return loading ? (
    <Spinner />
  ) : (
    <Switch>
      <PublicRoute exact path="/signin" component={SignLayout} {...state} />
      <PublicRoute exact path="/signup" component={SignLayout} {...state} />
      <ProtectedRoute path="/" component={MainLayout} {...state} />
    </Switch>
  );
}

export default () => (
  <MuiThemeProvider theme={theme}>
    <BrowserRouter>
      <DynamicStore>
        <App />
      </DynamicStore>
    </BrowserRouter>
  </MuiThemeProvider>
);
