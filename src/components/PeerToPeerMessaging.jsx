import React, { useCallback, useEffect, useRef, useState } from "react";
import "./PeerToPeerMessaging.css";
import CallControls from "./CallControls";
import VideoSection from "./VideoSection";
import MessageInput from "./MessageInput";
import MessageList from "./MessageList";
import ConnectionRequest from "./ConnectionRequest";
import IncomingCallAlert from "./IncomingCallAlert";
import AIPanel from "./AIPanel";
import useSpeechRecognition from "../hooks/useSpeechRecognition";
import useMessaging from "../hooks/useMessaging";
import useVideoCall from "../hooks/useVideoCall";
import usePeer from "../hooks/usePeer";
import useConnection from "../hooks/useConnection";
import useLiveCaptions from "../hooks/useLiveCaptions";

// Peer To Peer Messaging Component
function PeerToPeerMessaging() {
  // Stream + UI State
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [draft, setDraft] = useState("");
  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") || "dark",
  );

  // Incoming Call Reference
  const pendingCall = useRef(null);

  const handleIncomingCall = useCallback((call) => {
    pendingCall.current = call;
  }, []);

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
    activeConn,
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

  // Messaging + Speech + Captions Hooks
  const { messages, sendMessage } = useMessaging(activeConn);
  const speech = useSpeechRecognition(setDraft);

  const callActive = localStream !== null;
  const captions = useLiveCaptions(activeConn, callActive);

  // Call Handlers
  function handleAcceptCall() {
    acceptCallRequest();

    if (pendingCall.current) {
      answerCall(pendingCall.current);
      pendingCall.current = null;
    }
  }

  function handleRejectCall() {
    rejectCallRequest();
    pendingCall.current = null;
  }

  // Message Handlers
  function handleSend() {
    if (sendMessage(draft)) {
      setDraft("");
    }
  }

  function toggleSpeech() {
    if (speech.listening) {
      speech.stop();
    } else {
      speech.start();
    }
  }

  // Theme
  function toggleTheme() {
    setTheme((current) => {
      const next = current === "dark" ? "light" : "dark";
      localStorage.setItem("theme", next);
      return next;
    });
  }

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  const isConnected = connectionStatus === "connected";

  // Shared messaging + AI block (same in and out of a call)
  const conversation = (
    <>
      <MessageInput
        value={draft}
        onChange={setDraft}
        onSend={handleSend}
        listening={speech.listening}
        onToggleSpeech={toggleSpeech}
        speechSupported={speech.supported}
      />

      <AIPanel
        messages={messages}
        yourName={yourName}
        recipientName={recipientName}
        draft={draft}
        onInsert={setDraft}
      />

      {messages.length > 0 && (
        <MessageList
          messages={messages}
          yourName={yourName}
          recipientName={recipientName}
        />
      )}
    </>
  );

  return (
    <div id="container" data-theme={theme}>
      <button className="theme-toggle" onClick={toggleTheme} type="button">
        <span aria-hidden="true">{theme === "dark" ? "☀" : "☾"}</span>
        <span className="theme-toggle-text">
          {theme === "dark" ? "Light" : "Dark"}
        </span>
      </button>

      {/* Popups */}
      {incomingRequest && (
        <ConnectionRequest
          fromId={incomingRequest.fromId}
          fromName={incomingRequest.fromName}
          onAccept={(name) => acceptConnection(name)}
          onReject={rejectConnection}
        />
      )}

      {incomingCallRequest && (
        <IncomingCallAlert
          fromName={incomingCallRequest.fromName}
          onAccept={handleAcceptCall}
          onReject={handleRejectCall}
        />
      )}

      {/* Heading */}
      <h1>
        {isConnected ? "WebRTC" : "Welcome to WebRTC"}{" "}
        <span className="small-text">(using PeerJS!)</span>
      </h1>

      {/* Connection Info */}
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

      {/* Idle State */}
      {connectionStatus === "idle" && (
        <>
          <label htmlFor="yourName">Your Name:</label>
          <input
            type="text"
            id="yourName"
            value={yourName}
            onChange={(event) => setYourName(event.target.value)}
            placeholder="Enter your name *"
          />

          <label htmlFor="partyBId">Recipient's ID:</label>
          <input
            type="text"
            id="partyBId"
            value={partyBId}
            onChange={(event) => setPartyBId(event.target.value)}
            placeholder="Enter the recipient's ID *"
          />

          <button onClick={sendConnectionRequest} type="button">
            Connect
          </button>
        </>
      )}

      {/* Pending State */}
      {connectionStatus === "pending" && (
        <p style={{ color: "var(--title)" }}>
          ⏳ Waiting for {partyBId} to accept...
        </p>
      )}

      {/* Connected State */}
      {isConnected && (
        <>
          {!callActive && (
            <button
              onClick={() => disconnect(yourName)}
              style={{ backgroundColor: "var(--danger)" }}
              type="button"
            >
              Disconnect
            </button>
          )}

          {callActive && (
            <VideoSection
              localStream={localStream}
              remoteStream={remoteStream}
              yourName={yourName}
              recipientName={recipientName}
              myCaption={captions.myCaption}
              peerCaption={captions.peerCaption}
            />
          )}

          <CallControls
            localStream={localStream}
            startVideoCall={startVideoCall}
            stopVideoCall={stopVideoCall}
            toggleMute={toggleMute}
            isMuted={isMuted}
            toggleCamera={toggleCamera}
            isCameraOff={isCameraOff}
            captionsSupported={captions.supported}
            captionsEnabled={captions.enabled}
            toggleCaptions={captions.toggle}
          />

          {conversation}
        </>
      )}

      <footer id="footer">© 2026 Made with ❤️ by Brett Cooper</footer>
    </div>
  );
}

// Export Component
export default PeerToPeerMessaging;
