import { useState, useRef } from "react";

// Video Call Hook
function useVideoCall(
  peer,
  partyBId,
  localStream,
  setLocalStream,
  setRemoteStream,
  sendCallRequest,
  yourName,
) {
  // State Management
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [currentCall, setCurrentCall] = useState(null);

  // Tracks whether we ended the call ourselves, so we don't show
  // "the other person ended the call" when we pressed stop.
  const endedByMe = useRef(false);

  // Wire Up A Call Object (shared by start + answer)
  function attachCallHandlers(call, stream) {
    setLocalStream(stream);
    setCurrentCall(call);
    endedByMe.current = false;

    call.on("stream", (remoteStream) => {
      setRemoteStream(remoteStream);
    });

    call.on("close", () => {
      stream.getTracks().forEach((track) => track.stop());
      setRemoteStream(null);
      setLocalStream(null);
      setCurrentCall(null);

      if (!endedByMe.current) {
        alert("The other person ended the call.");
      }
    });
  }

  // Start Video Call
  function startVideoCall() {
    if (!partyBId) {
      alert("Please connect to someone first!");
      return;
    }

    sendCallRequest(yourName);

    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        const call = peer.call(partyBId, stream);
        attachCallHandlers(call, stream);
      })
      .catch((error) => {
        console.error("Could not access camera/microphone:", error);
        alert("Could not access your camera or microphone.");
      });
  }

  // Answer Incoming Call
  function answerCall(call) {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        call.answer(stream);
        attachCallHandlers(call, stream);
      })
      .catch((error) => {
        console.error("Could not access camera/microphone:", error);
        alert("Could not access your camera or microphone.");
      });
  }

  // Stop Video Call
  function stopVideoCall() {
    endedByMe.current = true;

    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
      setLocalStream(null);
    }

    setRemoteStream(null);

    if (currentCall) {
      currentCall.close();
      setCurrentCall(null);
    }
  }

  // Toggle Microphone
  function toggleMute() {
    if (localStream) {
      localStream.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });

      setIsMuted((muted) => !muted);
    }
  }

  // Toggle Camera
  function toggleCamera() {
    if (localStream) {
      localStream.getVideoTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });

      setIsCameraOff((off) => !off);
    }
  }

  // Hook Return Values
  return {
    startVideoCall,
    answerCall,
    stopVideoCall,
    toggleMute,
    isMuted,
    toggleCamera,
    isCameraOff,
  };
}

// Export Hook
export default useVideoCall;
