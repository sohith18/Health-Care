import React, { useState } from "react";

export default function JoinRoom() {
  const [room, setRoom] = useState(null);
  const [showRules, setShowRules] = useState(false);

  const onSubmit = () => {
    console.log(room);
    window.location.assign(`/video-call/meeting/${room}`);
  };

  const Continue = () => {
    setShowRules(true);
  };

  return (
    <div>

      {!showRules&&(
        <div>
          {/* Display your rules here */}
          <p>Rule 1</p>
          <p>Rule 2</p>
          {/* Add more rules as needed */}
          
        </div>
      )}
      {!showRules && <button onClick={Continue}>Continue</button>}
      {(showRules && (
        <div>
        <input type="text" onChange={(e) => setRoom(e.target.value)} />
        <button onClick={onSubmit}>Submit</button>
        </div>
      ))}
    </div>
  );
}
