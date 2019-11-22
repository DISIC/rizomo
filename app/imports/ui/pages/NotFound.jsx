import React from 'react';
import { Link } from 'react-router-dom';

/** Render a Not Found page if the user enters a URL that doesn't match any route. */
export default function NotFound() {
  return (
    <div>
      <h2>404 Page not found</h2>
      <p>
        <Link to="/">Retour</Link>
      </p>
    </div>
  );
}
