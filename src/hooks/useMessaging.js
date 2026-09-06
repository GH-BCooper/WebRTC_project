import { useState, useEffect, useCallback } from "react";

// Messaging Hook
// Sends and receives chat messages over the single active peer data connection.
function useMessaging(activeConn) {
  // Message State Management
  const [messages, setMessages] = useState([]);

  // Incoming Message Listener
  useEffect(() => {
    if (!activeConn) return;

    const handleData = (data) => {
      if (data && data.type === "chat") {
        setMessages((prev) => [
          ...prev,
          { text: data.text, type: "incoming", time: data.time || Date.now() },
        ]);
      }
    };

    activeConn.on("data", handleData);

    return () => {
      activeConn.off("data", handleData);
    };
  }, [activeConn]);

  // Send Message
  const sendMessage = useCallback(
    (text) => {
      const message = (text || "").trim();

      if (!message) return false;

      if (!activeConn || activeConn.open === false) {
        alert("You are not connected yet. Please connect first!");
        return false;
      }

      activeConn.send({ type: "chat", text: message, time: Date.now() });

      setMessages((prev) => [
        ...prev,
        { text: message, type: "outgoing", time: Date.now() },
      ]);

      return true;
    },
    [activeConn],
  );

  // Hook Return Values
  return { messages, sendMessage };
}

// Export Hook
export default useMessaging;
