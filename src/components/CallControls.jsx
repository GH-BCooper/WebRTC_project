import React from "react";

// Call Controls Component
function CallControls(props) {
  // Mute And Camera Control Buttons
  let muteAndCameraButtons = null;

  // Active Call Controls
  if (props.localStream) {
    muteAndCameraButtons = (
      <>
        {/* Mute Toggle Button */}
        <button onClick={props.toggleMute}>
          {props.isMuted ? "Unmute 🔊" : "Mute 🔇"}
        </button>

        {/* Camera Toggle Button */}
        <button onClick={props.toggleCamera}>
          {props.isCameraOff ? "Camera On 📷" : "Camera Off 📵"}
        </button>
      </>
    );
  }

  // UI Rendering
  return (
    <div>
      {/* Start Video Call Button */}
      {!props.localStream && (
        <button onClick={props.startVideoCall}>Start Video Call</button>
      )}

      {/* Stop Video Call Button */}
      {props.localStream && (
        <button onClick={props.stopVideoCall}>Stop Video Call</button>
      )}

      {/* Active Call Action Buttons */}
      {muteAndCameraButtons}
    </div>
  );
}

// Export Component
export default CallControls;
