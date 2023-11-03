import React, { Component } from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";

// import Video from "./meeting";
// import JoinMeeting from "./join";

// // import "./App.css";

// export default function VideoCall()  {
  
    return (
      <>
        <Router>
          <Switch>
            <Route exact path="/" component={JoinMeeting} />
            <Route exact path="/video/:id" component={Video} />
          </Switch  >
        </Router>
      </>
    );
  }

  
