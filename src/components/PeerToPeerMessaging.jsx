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
import { playBeep } from "../lib/sound";

const APP_TITLE = "WebRTC + AI (PeerJS)";

// Peer To Peer Messaging Component
function PeerToPeerMessaging({ initialRecipientId = "" }) {
  // Stream + UI State
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [draft, setDraft] = useState("");
  const [copied, setCopied] = useState("");

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

  // Pre-fill the recipient ID from a shared invite link (once).
  useEffect(() => {
    if (initialRecipientId && connectionStatus === "idle") {
      setPartyBId(initialRecipientId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialRecipientId]);

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
  const { messages, sendMessage, peerTyping, notifyTyping } =
    useMessaging(activeConn);
  const speech = useSpeechRecognition(setDraft);

  const callActive = localStream !== null;
  const captions = useLiveCaptions(activeConn, callActive);

  // Notification sound + tab badge for messages that arrive while away.
  useEffect(() => {
    const last = messages[messages.length - 1];
    if (last && last.type === "incoming" && document.hidden) {
      playBeep();
      document.title = `💬 New message — ${APP_TITLE}`;
    }
  }, [messages]);

  useEffect(() => {
    const clearBadge = () => {
      document.title = APP_TITLE;
    };
    window.addEventListener("focus", clearBadge);
    return () => {
      window.removeEventListener("focus", clearBadge);
      document.title = APP_TITLE;
    };
  }, []);

  // Handlers
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

  function handleDraftChange(value) {
    setDraft(value);
    notifyTyping();
  }

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

  function copy(text, label) {
    navigator.clipboard?.writeText(text).then(() => {
      setCopied(label);
      setTimeout(() => setCopied(""), 1500);
    });
  }

  const inviteLink = `${window.location.origin}/meet?peer=${partyAId}`;
  const isConnected = connectionStatus === "connected";

  // Shared messaging + AI block
  const conversation = (
    <>
      <MessageInput
        value={draft}
        onChange={handleDraftChange}
        onSend={handleSend}
        listening={speech.listening}
        onToggleSpeech={toggleSpeech}
        speechSupported={speech.supported}
      />

      <p className="typing-line">
        {peerTyping ? `${recipientName || "They"} are typing…` : ""}
      </p>

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
    <div id="container">
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
        {isConnected ? "You're connected" : "Start a meeting"}{" "}
        <span className="small-text">(WebRTC + PeerJS)</span>
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
            Your ID: <span id="partyAId">{partyAId}</span>{" "}
            <button
              className="mini-btn"
              type="button"
              onClick={() => copy(partyAId, "id")}
            >
              {copied === "id" ? "Copied!" : "Copy ID"}
            </button>
          </>
        )}
      </p>

      {/* Idle State */}
      {connectionStatus === "idle" && (
        <>
          <button
            className="mini-btn"
            type="button"
            onClick={() => copy(inviteLink, "link")}
          >
            {copied === "link" ? "Invite link copied!" : "Copy invite link 🔗"}
          </button>

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
