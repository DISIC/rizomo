import React from "react";
import { Link } from "react-router-dom";

/** A simple static component to render some text for the landing page. */
class Landing extends React.Component {
  render() {
    return (
      <div>
        <h1>Welcome to this template</h1>
        <p>Now get to work and modify this app!</p>
        <ul>
          <li>
            <Link to="/testMaterial">test MaterialUI</Link>
          </li>
          <li>
            <Link to="/testSemantic">test SemanticUI</Link>
          </li>
          <li>
            <Link to="/testGrommet">test Grommet</Link>
          </li>
        </ul>
      </div>
    );
  }
}

export default Landing;
