import React, { useContext } from 'react';
import { BrowserRouter, Switch } from 'react-router-dom';
import SignLayout from './SignLayout';
import MainLayout from './MainLayout';
import ProtectedRoute from '../components/ProtectedRoute';
import PublicRoute from '../components/PublicRoute';
import Spinner from '../components/Spinner';
import DynamicStore, { Context } from '../contexts/context';

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
  <BrowserRouter>
    <DynamicStore>
      <App />
    </DynamicStore>
  </BrowserRouter>
);
