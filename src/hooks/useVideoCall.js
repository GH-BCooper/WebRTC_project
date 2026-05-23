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

  // Pending Incoming Call Reference
  const pendingCall = useRef(null);

  // Start Video Call
  function startVideoCall() {
    if (!partyBId) {
      alert("Please enter the recipient's ID first!");
      return;
    }

    // Send Call Request
    sendCallRequest(yourName);

    // Access Media Devices And Start Call
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        setLocalStream(stream);

        const call = peer.call(partyBId, stream);

        setCurrentCall(call);

        // Remote Stream Listener
        call.on("stream", (remoteStream) => {
          setRemoteStream(remoteStream);
        });

        // Call Close Listener
        call.on("close", () => {
          setRemoteStream(null);
          setLocalStream(null);
          setCurrentCall(null);

          alert("The other person ended the call!");
        });
      })
      .catch((error) => {
        console.error("Error accessing media devices.", error);
      });
  }

  // Answer Incoming Call
  function answerCall(call) {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        setLocalStream(stream);

        call.answer(stream);

        // Remote Stream Listener
        call.on("stream", (remoteStream) => {
          setRemoteStream(remoteStream);
        });

        // Call Close Listener
        call.on("close", () => {
          setRemoteStream(null);
          setLocalStream(null);

          alert("The other person ended the call!");
        });
      })
      .catch((error) => {
        console.error("Error accessing media devices.", error);
      });
  }

  // Stop Video Call
  function stopVideoCall() {
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

      setIsMuted(!isMuted);
    }
  }

  // Toggle Camera
  function toggleCamera() {
    if (localStream) {
      localStream.getVideoTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });

      setIsCameraOff(!isCameraOff);
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
    pendingCall,
  };
}

// Export Hook
export default useVideoCall;
