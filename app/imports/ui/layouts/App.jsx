import React, { useContext, Suspense, lazy } from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import { Meteor } from 'meteor/meteor';
import { MuiThemeProvider } from '@material-ui/core/styles';
import SignLayout from './SignLayout';
import ProtectedRoute from '../components/system/ProtectedRoute';
import PublicRoute from '../components/system/PublicRoute';
import Spinner from '../components/system/Spinner';
import MsgHandler from '../components/system/MsgHandler';
import DynamicStore, { Context } from '../contexts/context';
import lightTheme from '../themes/light';
import PublicArticlePage from '../pages/articles/PublicArticlePage';
import PublicArticleDetailsPage from '../pages/articles/PublicArticleDetailsPage';

// dynamic imports
const MainLayout = lazy(() => import('./MainLayout'));

function App() {
  const [state] = useContext(Context);
  const { loading } = state;
  const useKeycloak = Meteor.settings.public.enableKeycloak;
  return loading ? (
    <Spinner />
  ) : (
    <Suspense fallback={<Spinner full />}>
      <Switch>
        <PublicRoute exact path="/signin" component={SignLayout} {...state} />
        {useKeycloak ? null : <PublicRoute exact path="/signup" component={SignLayout} {...state} />}
        <Route exact path="/public/:userId" component={PublicArticlePage} />
        <Route exact path="/public/:userId/:slug" component={PublicArticleDetailsPage} />
        <ProtectedRoute path="/" component={MainLayout} {...state} />
      </Switch>
    </Suspense>
  );
}

export default () => (
  <MuiThemeProvider theme={lightTheme}>
    <BrowserRouter>
      <DynamicStore>
        <App />
      </DynamicStore>
    </BrowserRouter>
    <MsgHandler />
  </MuiThemeProvider>
);
