import React, { useState, useRef } from "react";
import "./PeerToPeerMessaging.css";
import CallControls from "./CallControls";
import VideoSection from "./VideoSection";
import MessageInput from "./MessageInput";
import useSpeechRecognition from "../hooks/useSpeechRecognition";
import useMessaging from "../hooks/useMessaging";
import useVideoCall from "../hooks/useVideoCall";
import usePeer from "../hooks/usePeer";
import useConnection from "../hooks/useConnection";
import MessageList from "./MessageList";
import ConnectionRequest from "./ConnectionRequest";
import IncomingCallAlert from "./IncomingCallAlert";

// Peer To Peer Messaging Component
function PeerToPeerMessaging() {
  // Stream State Management
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);

  // Incoming Call Reference
  const pendingCall = useRef(null);

  // Incoming Call Handler
  function handleIncomingCall(call) {
    pendingCall.current = call;
  }

  // Peer Connection Hook
  const { peer, partyAId, partyBId, setPartyBId } = usePeer(
    localStream,
    setLocalStream,
    setRemoteStream,
    handleIncomingCall,
  );

  // Connection Management Hook
  const {
    connectionStatus,
    incomingRequest,
    incomingCallRequest,
    yourName,
    setYourName,
    recipientName,
    sendConnectionRequest,
    acceptConnection,
    rejectConnection,
    disconnect,
    sendCallRequest,
    acceptCallRequest,
    rejectCallRequest,
  } = useConnection(peer, partyBId, setPartyBId);

  // Video Call Hook
  const {
    startVideoCall,
    answerCall,
    stopVideoCall,
    toggleMute,
    isMuted,
    toggleCamera,
    isCameraOff,
  } = useVideoCall(
    peer,
    partyBId,
    localStream,
    setLocalStream,
    setRemoteStream,
    sendCallRequest,
    yourName,
  );

  // Stop Call Handler
  function handleStopCall() {
    stopVideoCall();
  }

  // Accept Incoming Call Handler
  function handleAcceptCall() {
    acceptCallRequest();

    if (pendingCall.current) {
      answerCall(pendingCall.current);

      pendingCall.current = null;
    }
  }

  // Reject Incoming Call Handler
  function handleRejectCall() {
    rejectCallRequest();

    pendingCall.current = null;
  }

  // Messaging Hook
  const { messages, sendMessage } = useMessaging(
    peer,
    partyBId,
    setRemoteStream,
  );

  // Speech Recognition Hook
  const { startSpeechRecognition, stopSpeechRecognition } =
    useSpeechRecognition();

  // Connection Status Helpers
  const callActive = localStream !== null;

  const isConnected = connectionStatus === "connected";

  // UI Rendering
  return (
    <div id="container">
      {/* Incoming Connection Request Popup */}
      {incomingRequest && (
        <ConnectionRequest
          fromId={incomingRequest.fromId}
          fromName={incomingRequest.fromName}
          onAccept={(name) => acceptConnection(name)}
          onReject={rejectConnection}
        />
      )}

      {/* Incoming Call Alert Popup */}
      {incomingCallRequest && (
        <IncomingCallAlert
          fromName={incomingCallRequest.fromName}
          onAccept={handleAcceptCall}
          onReject={handleRejectCall}
        />
      )}

      {/* Application Heading */}
      {isConnected ? (
        <h1>
          WebRTC <span className="small-text">(using PeerJS!)</span>
        </h1>
      ) : (
        <h1>
          Welcome to WebRTC <span className="small-text">(using PeerJS!)</span>
        </h1>
      )}

      {/* User Connection Information */}
      <p>
        {isConnected ? (
          <>
            Hi <strong>{yourName}</strong>! Your ID:{" "}
            <span id="partyAId">{partyAId}</span> | Connected to:{" "}
            <strong>{recipientName}</strong> ({partyBId})
          </>
        ) : (
          <>
            Your ID: <span id="partyAId">{partyAId}</span>
          </>
        )}
      </p>

      {/* Idle Connection State */}
      {connectionStatus === "idle" && (
        <>
          <label>Your Name:</label>

          <input
            type="text"
            value={yourName}
            onChange={(e) => setYourName(e.target.value)}
            placeholder="Enter your name *"
          />

          <label htmlFor="partyBId">Recipient's ID:</label>

          <input
            type="text"
            id="partyBId"
            value={partyBId}
            onChange={(e) => setPartyBId(e.target.value)}
            placeholder="Enter the recipient's ID *"
          />

          <button onClick={sendConnectionRequest}>Connect</button>
        </>
      )}

      {/* Pending Connection State */}
      {connectionStatus === "pending" && (
        <p style={{ color: "#007bff" }}>
          ⏳ Waiting for {partyBId} to accept...
        </p>
      )}

      {/* Connected State */}
      {isConnected && (
        <>
          {/* Disconnect Button */}
          {!callActive && (
            <button
              onClick={() => disconnect(yourName)}
              style={{ backgroundColor: "#dc3545" }}
            >
              Disconnect
            </button>
          )}

          {/* Active Call Layout */}
          {callActive ? (
            <>
              <VideoSection
                localStream={localStream}
                remoteStream={remoteStream}
                yourName={yourName}
                recipientName={recipientName}
              />

              <CallControls
                startVideoCall={startVideoCall}
                stopVideoCall={handleStopCall}
                toggleMute={toggleMute}
                isMuted={isMuted}
                toggleCamera={toggleCamera}
                isCameraOff={isCameraOff}
                localStream={localStream}
              />

              <MessageInput
                sendMessage={sendMessage}
                startSpeechRecognition={startSpeechRecognition}
                stopSpeechRecognition={stopSpeechRecognition}
              />

              {messages.length > 0 && <MessageList messages={messages} />}
            </>
          ) : (
            <>
              {/* Messaging Section */}
              <MessageInput
                sendMessage={sendMessage}
                startSpeechRecognition={startSpeechRecognition}
                stopSpeechRecognition={stopSpeechRecognition}
              />

              {/* Call Controls */}
              <CallControls
                startVideoCall={startVideoCall}
                stopVideoCall={handleStopCall}
                toggleMute={toggleMute}
                isMuted={isMuted}
                toggleCamera={toggleCamera}
                isCameraOff={isCameraOff}
                localStream={localStream}
              />

              {/* Message History */}
              {messages.length > 0 && <MessageList messages={messages} />}
            </>
          )}
        </>
      )}

      {/* Footer Section */}
      <footer id="footer">© 2026 Made with ❤️ by Brett Cooper</footer>
    </div>
  );
}

// Export Component
export default PeerToPeerMessaging;
