import React from "react";

// Video Display Component
function VideoSection(props) {
  return (
    <div id="video-container">
      {/* Local Video Stream */}
      {props.localStream && (
        <div className="video-box">
          <h2>{props.yourName || "You"}</h2>

          <video
            id="localVideo"
            autoPlay
            playsInline
            muted
            ref={(video) => {
              if (video) video.srcObject = props.localStream;
            }}
          />
        </div>
      )}

      {/* Remote Video Stream */}
      {props.remoteStream && (
        <div className="video-box">
          <h2>{props.recipientName || "Recipient"}</h2>

          <video
            id="remoteVideo"
            autoPlay
            playsInline
            ref={(video) => {
              if (video) video.srcObject = props.remoteStream;
            }}
          />
        </div>
      )}
    </div>
  );
}

// Export Component
export default VideoSection;
