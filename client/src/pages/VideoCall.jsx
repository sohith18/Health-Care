import React, { Component } from "react";
import { BrowserRouter as Router, Route} from "react-router-dom";

import Video from "./meeting";
import JoinMeeting from "./join";

// import "./App.css";

export default function VideoCall()  {
  
    return (
      // <>
      //   <Router>
      //       <Route exact path="/video" component={JoinMeeting} />
      //       <Route exact path="/video/:id" component={Video} />
      //   </Router>
      // </>
      <>
        <button onClick={JoinMeeting}>Join Meeting</button>
      </>
    )
  }

  
