import React, { useState } from "react";

// Connection Request Component
function ConnectionRequest(props) {
  // Name State Management
  const [name, setName] = useState("");

  // Accept Connection Handler
  function handleAccept() {
    // Name Validation
    if (!name.trim()) {
      alert("Please enter your name before accepting!");
      return;
    }

    // Trigger Accept Callback
    props.onAccept(name);
  }

  // UI Rendering
  return (
    <div id="connection-request-overlay">
      {/* Connection Request Popup Box */}
      <div id="connection-request-box">
        {/* Popup Heading */}
        <h2>Incoming Connection Request</h2>

        {/* Sender Information */}
        <p>
          <strong>{props.fromName}</strong> ({props.fromId}) wants to connect
          with you!
        </p>

        {/* Name Input Label */}
        <label>Your Name:</label>

        {/* Name Input Field */}
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name"
        />

        {/* Action Buttons */}
        <div>
          <button className="accept-btn" onClick={handleAccept}>
            Accept ✅
          </button>

          <button className="reject-btn" onClick={props.onReject}>
            Reject ❌
          </button>
        </div>
      </div>
    </div>
  );
}

// Export Component
export default ConnectionRequest;
