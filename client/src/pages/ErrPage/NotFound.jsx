import React from 'react';
import '../../Styles/NotFound.css'; // Create a CSS file for styling

export default function NotFound() {
  return (
    <div className="not-found-container">
      <div className="not-found-content">
        <h1>404 - Not Found</h1>
        <p>Sorry, the page you are looking for does not exist.</p>
        <p>Return to the <a href="/">home page</a></p>
      </div>
    </div>
  );
}
