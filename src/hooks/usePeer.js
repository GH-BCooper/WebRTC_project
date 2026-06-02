import { useState, useEffect } from "react";
import Peer from "peerjs";

// Peer Connection Hook
function usePeer(localStream, setLocalStream, setRemoteStream, onIncomingCall) {
  // State Management
  const [partyAId, setPartyAId] = useState("");
  const [partyBId, setPartyBId] = useState("");
  const [peer, setPeer] = useState(null);

  // Random Peer ID Generator
  function generateRandomId() {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

    let id = "";

    for (let i = 0; i < 5; i++) {
      id += characters.charAt(Math.floor(Math.random() * characters.length));
    }

    return id;
  }

  // Local Storage Peer ID Initialization
  useEffect(() => {
    let storedId = localStorage.getItem("peerId");

    if (!storedId) {
      storedId = generateRandomId();

      localStorage.setItem("peerId", storedId);
    }

    setPartyAId(storedId);
  }, []);

  // PeerJS Connection Setup
  useEffect(() => {
    if (partyAId) {
      const peerInstance = new Peer(partyAId);

      // Peer Connection Open Handler
      peerInstance.on("open", (id) => {
        console.log("Your ID:", id);
      });

      // Incoming Call Handler
      peerInstance.on("call", (call) => {
        onIncomingCall(call);
      });

      // Store Peer Instance
      setPeer(peerInstance);

      return () => {
        peerInstance.destroy();
      };
    }
  }, [partyAId, onIncomingCall]);

  // Hook Return Values
  return { peer, partyAId, partyBId, setPartyBId };
}

// Export Hook
export default usePeer;
