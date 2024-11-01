import React from 'react';
import '../../Styles/ServerError.css'; // Create a CSS file for styling

export default function ServerError() {
  return (
    <div className="server-error-container">
      <div className="server-error-content">
        <h1>500 - Internal Server Error</h1>
        <p>Sorry, something went wrong on our server.</p>
        <p>Our team has been notified of the issue. Please try again later.</p>
      </div>
    </div>
  );
}
