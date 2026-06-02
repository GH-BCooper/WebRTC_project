import { useState, useEffect } from "react";

// Messaging Hook
function useMessaging(peer, partyBId, setRemoteStream) {
  // Message State Management
  const [messages, setMessages] = useState([]);

  // Send Message Function
  function sendMessage() {
    // Peer Connection Validation
    if (!peer) {
      alert("Connection not ready yet. Please wait!");
      return;
    }

    // Recipient Validation
    if (!partyBId) {
      alert("Please enter the recipient's ID first!");
      return;
    }

    // Message Input Retrieval
    const messageInput = document.getElementById("message");

    const message = messageInput.value.trim();

    // Empty Message Validation
    if (!message) {
      alert("Please enter a message first!");
      return;
    }

    // Peer Message Sending Logic
    if (peer && partyBId) {
      try {
        const conn = peer.connect(partyBId);

        // Connection Validation
        if (!conn) {
          alert(
            "Could not connect to recipient. Please check the ID and try again.",
          );

          return;
        }

        // Connection Open Handler
        conn.on("open", () => {
          conn.send(message);

          // Store Outgoing Message
          setMessages((prev) => [
            ...prev,
            { text: message, type: "outgoing", time: Date.now() },
          ]);
        });

        // Clear Message Input
        messageInput.value = "";
      } catch (error) {
        // Error Handling
        alert("Error sending message: " + error.message);
      }
    }
  }

  // Incoming Connection Listener
  useEffect(() => {
    if (peer) {
      const handleConnection = (conn) => {
        // Incoming Data Listener
        conn.on("data", (data) => {
          // System Message Handling
          if (data && data.type) {
            if (data.type === "call-ended") {
              setRemoteStream(null);
            }

            return;
          }

          // Store Incoming Message
          setMessages((prev) => [
            ...prev,
            { text: data, type: "incoming", time: Date.now() },
          ]);
        });
      };

      peer.on("connection", handleConnection);

      return () => {
        peer.off("connection", handleConnection);
      };
    }
  }, [peer, setRemoteStream]);

  // Hook Return Values
  return { messages, sendMessage };
}

// Export Hook
export default useMessaging;
