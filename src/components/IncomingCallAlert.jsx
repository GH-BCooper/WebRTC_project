import React from "react";

// Incoming Call Alert Component
function IncomingCallAlert(props) {
  return (
    <div id="connection-request-overlay">
      {/* Incoming Call Popup Box */}
      <div id="connection-request-box">
        {/* Popup Heading */}
        <h2>📞 Incoming Video Call</h2>

        {/* Caller Information */}
        <p>
          <strong>{props.fromName}</strong> is calling you!
        </p>

        {/* Call Action Buttons */}
        <div>
          <button className="accept-btn" onClick={props.onAccept}>
            Accept 📹
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
export default IncomingCallAlert;
