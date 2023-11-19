import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";

export default function JoinRoom() {
  const [room, setRoom] = useState("");
  const [showRules, setShowRules] = useState(false);
  const [randomNumber, setRandomNumber] = useState(null);

  useEffect(() => {
    generateRandomNumber();
  }, []); // This empty dependency array ensures the effect runs only once, similar to componentDidMount

  const generateRandomNumber = () => {
    const randomNumber = Math.floor(Math.random() * 1000000);
    setRandomNumber(randomNumber);
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
      .then(() => toast.success("Meeting ID copied to clipboard"))
      .catch((error) => toast.error("Unable to copy to clipboard", error));
  };

  const onSubmit = () => {
    if (room === randomNumber.toString()) {
      console.log(`Meeting ID ${room} matches the random number`);
      window.location.assign(`/video-call/meeting/${room}`);
    } else {
      // Display an error message using react-hot-toast
      console.log("Meeting ID does not match the random number");
      toast.error("Please enter the correct meeting ID.");
    }
  };

  const Continue = () => {
    setShowRules(true);
  };

  return (
    <div>
      {!showRules && (
        <div>
          {/* Display your rules here */}
          <l>
            <li>
              Joining ID: {randomNumber}{" "}
              <button
                style={{ fontSize: "12px", padding: "5px" }} 
                onClick={() => copyToClipboard(randomNumber)}
              >
                Copy to Clipboard
              </button>
            </li>
            <li>Rule 1</li>
            <li>Rule 2</li>
            <li>Terms and conditions applied</li>
          </l>
        </div>
      )}

      {!showRules && <button onClick={Continue}>Continue</button>}

      {showRules && (
        <div>
          <input
            type="text"
            placeholder="Enter video call ID"
            onChange={(e) => setRoom(e.target.value)}
          />
          <button onClick={onSubmit}>Submit</button>
        </div>
      )}
    </div>
  );
}
