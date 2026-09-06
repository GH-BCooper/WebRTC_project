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
  const [isSharingScreen, setIsSharingScreen] = useState(false);
  const [currentCall, setCurrentCall] = useState(null);

  // Tracks whether we ended the call ourselves, so we don't show
  // "the other person ended the call" when we pressed stop.
  const endedByMe = useRef(false);
  const callRef = useRef(null);
  const cameraTrackRef = useRef(null);

  // Wire Up A Call Object (shared by start + answer)
  function attachCallHandlers(call, stream) {
    setLocalStream(stream);
    setCurrentCall(call);
    callRef.current = call;
    cameraTrackRef.current = stream.getVideoTracks()[0] || null;
    endedByMe.current = false;

    call.on("stream", (remoteStream) => {
      setRemoteStream(remoteStream);
    });

    call.on("close", () => {
      stream.getTracks().forEach((track) => track.stop());
      setRemoteStream(null);
      setLocalStream(null);
      setCurrentCall(null);
      setIsSharingScreen(false);
      callRef.current = null;

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

  // Swap the outgoing video track (used by screen sharing).
  function replaceVideoTrack(newTrack) {
    const sender = callRef.current?.peerConnection
      ?.getSenders()
      .find((s) => s.track && s.track.kind === "video");
    if (sender) sender.replaceTrack(newTrack);

    setLocalStream((prev) => {
      if (!prev) return prev;
      const audio = prev.getAudioTracks();
      const next = new MediaStream([newTrack, ...audio]);
      return next;
    });
  }

  // Start / Stop Screen Sharing
  function toggleScreenShare() {
    if (!callRef.current) return;

    if (isSharingScreen) {
      const camTrack = cameraTrackRef.current;
      if (camTrack && camTrack.readyState === "live") {
        replaceVideoTrack(camTrack);
        setIsSharingScreen(false);
      } else {
        navigator.mediaDevices
          .getUserMedia({ video: true })
          .then((stream) => {
            const track = stream.getVideoTracks()[0];
            cameraTrackRef.current = track;
            replaceVideoTrack(track);
            setIsSharingScreen(false);
          })
          .catch(() => setIsSharingScreen(false));
      }
      return;
    }

    navigator.mediaDevices
      .getDisplayMedia({ video: true })
      .then((stream) => {
        const screenTrack = stream.getVideoTracks()[0];
        replaceVideoTrack(screenTrack);
        setIsSharingScreen(true);
        // When the user stops sharing from the browser UI, go back to camera.
        screenTrack.onended = () => toggleScreenShare();
      })
      .catch((error) => {
        console.error("Screen share was cancelled or failed:", error);
      });
  }

  // Stop Video Call
  function stopVideoCall() {
    endedByMe.current = true;

    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
      setLocalStream(null);
    }

    cameraTrackRef.current?.stop();
    setRemoteStream(null);
    setIsSharingScreen(false);

    if (currentCall) {
      currentCall.close();
      setCurrentCall(null);
      callRef.current = null;
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
    toggleScreenShare,
    isSharingScreen,
  };
}

// Export Hook
export default useVideoCall;
