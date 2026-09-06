import React from "react";

// Video Display Component
function VideoSection(props) {
  const {
    localStream,
    remoteStream,
    yourName,
    recipientName,
    myCaption,
    peerCaption,
  } = props;

  return (
    <div id="video-container">
      {/* Local Video Stream */}
      {localStream && (
        <div className="video-box">
          <h2>{yourName || "You"}</h2>

          <video
            id="localVideo"
            autoPlay
            playsInline
            muted
            ref={(video) => {
              if (video) video.srcObject = localStream;
            }}
          />

          {myCaption && <p className="caption">{myCaption}</p>}
        </div>
      )}

      {/* Remote Video Stream */}
      {remoteStream && (
        <div className="video-box">
          <h2>{recipientName || "Them"}</h2>

          <video
            id="remoteVideo"
            autoPlay
            playsInline
            ref={(video) => {
              if (video) video.srcObject = remoteStream;
            }}
          />

          {peerCaption && <p className="caption">{peerCaption}</p>}
        </div>
      )}
    </div>
  );
}

// Export Component
export default VideoSection;
