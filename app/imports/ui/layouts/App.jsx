import React from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import Landing from "../pages/Landing";
import TestMaterial from "../pages/TestMaterial";
import TestSemantic from "../pages/TestSemantic";
import TestGrommet from "../pages/TestGrommet";
import Home from "../pages/Home";
import NotFound from "../pages/NotFound";

class App extends React.Component {
  render() {
    return (
      <BrowserRouter>
        <div>
          <Switch>
            <Route exact path="/" component={Landing} />
            <Route path="/testMaterial" component={TestMaterial} />
            <Route path="/testSemantic" component={TestSemantic} />
            <Route path="/testGrommet" component={TestGrommet} />
            <Route path="/Home" component={Home} />
            <Route component={NotFound} />
          </Switch>
        </div>
      </BrowserRouter>
    );
  }
}
export default App;
