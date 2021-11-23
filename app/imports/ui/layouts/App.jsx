import React, { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import { Meteor } from 'meteor/meteor';
import { MuiThemeProvider } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import ProtectedRoute from '../components/system/ProtectedRoute';
import PublicRoute from '../components/system/PublicRoute';
import Spinner from '../components/system/Spinner';
import MsgHandler from '../components/system/MsgHandler';
import DynamicStore, { useAppContext } from '../contexts/context';
import lightTheme from '../themes/light';
import UploaderNotifier from '../components/uploader/UploaderNotifier';
import AdminRoute from '../components/system/AdminRoute';

// dynamic imports
const MainLayout = lazy(() => import('./MainLayout'));
const AdminLayout = lazy(() => import('./AdminLayout'));
const SignLayout = lazy(() => import('./SignLayout'));
const LegalPage = lazy(() => import('../pages/legal/LegalPage'));
const ArticlesPage = lazy(() => import('../pages/articles/ArticlesPage'));
const PublicArticleDetailsPage = lazy(() => import('../pages/articles/PublicArticleDetailsPage'));
const PublishersPage = lazy(() => import('../pages/articles/PublishersPage'));

function Logout() {
  useEffect(() => {
    Meteor.logout();
  });
  return null;
}

function App() {
  const [state] = useAppContext();
  const { userId, loadingUser = false, loading } = state;
  const useKeycloak = Meteor.settings.public.enableKeycloak;
  const externalBlog = typeof Meteor.settings.public.laboiteBlogURL !== 'undefined';
  const { enableBlog } = Meteor.settings.public;

  return loading ? (
    <Spinner />
  ) : (
    <>
      <CssBaseline />
      <Suspense fallback={<Spinner full />}>
        <Switch>
          <PublicRoute exact path="/signin" component={SignLayout} {...state} />
          {useKeycloak ? null : <PublicRoute exact path="/signup" component={SignLayout} {...state} />}
          {externalBlog || !enableBlog ? null : <Route exact path="/public/" component={PublishersPage} />}
          {externalBlog || !enableBlog ? null : <Route exact path="/public/:userId" component={ArticlesPage} />}
          {externalBlog || !enableBlog ? null : (
            <Route exact path="/public/:userId/:slug" component={PublicArticleDetailsPage} />
          )}
          <ProtectedRoute exact path="/logout" component={Logout} {...state} />
          <Route exact path="/legal/:legalKey" component={LegalPage} />
          <Route exact path="/contact" component={SignLayout} {...state} />
          {!!userId && (
            <AdminRoute path="/admin" component={AdminLayout} userId={userId} loadingUser={loadingUser} {...state} />
          )}
          <ProtectedRoute path="/" component={MainLayout} {...state} />
        </Switch>
      </Suspense>
      <MsgHandler />
      <UploaderNotifier />
    </>
  );
}

export default () => (
  <MuiThemeProvider theme={lightTheme}>
    <BrowserRouter>
      <DynamicStore>
        <App />
      </DynamicStore>
    </BrowserRouter>
  </MuiThemeProvider>
);
