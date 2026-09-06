import { useState, useEffect, useCallback, useRef } from "react";

// Messaging Hook
// Sends and receives chat messages (and typing pings) over the single active
// peer data connection.
function useMessaging(activeConn) {
  // State Management
  const [messages, setMessages] = useState([]);
  const [peerTyping, setPeerTyping] = useState(false);
  const typingClearRef = useRef(null);

  // Incoming Data Listener
  useEffect(() => {
    if (!activeConn) {
      setPeerTyping(false);
      return;
    }

    const handleData = (data) => {
      if (!data || !data.type) return;

      if (data.type === "chat") {
        setMessages((prev) => [
          ...prev,
          { text: data.text, type: "incoming", time: data.time || Date.now() },
        ]);
        setPeerTyping(false);
      } else if (data.type === "typing") {
        setPeerTyping(true);
        clearTimeout(typingClearRef.current);
        typingClearRef.current = setTimeout(() => setPeerTyping(false), 3000);
      }
    };

    activeConn.on("data", handleData);

    return () => {
      activeConn.off("data", handleData);
      clearTimeout(typingClearRef.current);
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

  // Let The Other Side Know We Are Typing
  const notifyTyping = useCallback(() => {
    if (activeConn && activeConn.open !== false) {
      activeConn.send({ type: "typing" });
    }
  }, [activeConn]);

  // Hook Return Values
  return { messages, sendMessage, peerTyping, notifyTyping };
}

// Export Hook
export default useMessaging;
