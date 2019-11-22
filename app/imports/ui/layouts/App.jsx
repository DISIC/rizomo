import React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import Landing from '../pages/Landing';
import SignUp from '../pages/SignUp';
import Home from '../pages/Home';
import NotFound from '../pages/NotFound';

export default function App() {
  return (
    <BrowserRouter>
      <div>
        <Switch>
          <Route exact path="/" component={Landing} />
          <Route path="/SignUp" component={SignUp} />
          <Route path="/Home" component={Home} />
          <Route component={NotFound} />
        </Switch>
      </div>
    </BrowserRouter>
  );
}
