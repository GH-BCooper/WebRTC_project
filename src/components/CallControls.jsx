import React from "react";

// Call Controls Component
function CallControls(props) {
  const {
    localStream,
    startVideoCall,
    stopVideoCall,
    toggleMute,
    isMuted,
    toggleCamera,
    isCameraOff,
    toggleScreenShare,
    isSharingScreen,
    captionsSupported,
    captionsEnabled,
    toggleCaptions,
  } = props;

  return (
    <div className="call-controls">
      {/* Start / Stop Call */}
      {!localStream ? (
        <button onClick={startVideoCall} type="button">
          Start Video Call 📹
        </button>
      ) : (
        <button onClick={stopVideoCall} type="button" style={{ background: "var(--danger)" }}>
          Stop Video Call
        </button>
      )}

      {/* Active Call Controls */}
      {localStream && (
        <>
          <button onClick={toggleMute} type="button">
            {isMuted ? "Unmute 🔊" : "Mute 🔇"}
          </button>

          <button onClick={toggleCamera} type="button">
            {isCameraOff ? "Camera On 📷" : "Camera Off 📵"}
          </button>

          <button onClick={toggleScreenShare} type="button">
            {isSharingScreen ? "Stop Sharing 🖥️" : "Share Screen 🖥️"}
          </button>

          {captionsSupported && (
            <button onClick={toggleCaptions} type="button">
              {captionsEnabled ? "Captions Off 💬" : "Captions On 💬"}
            </button>
          )}
        </>
      )}
    </div>
  );
}

// Export Component
export default CallControls;
