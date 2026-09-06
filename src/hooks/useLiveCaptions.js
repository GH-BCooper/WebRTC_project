import { useCallback, useEffect, useRef, useState } from "react";

// Browser Speech Recognition
const SpeechRecognition =
  typeof window !== "undefined"
    ? window.SpeechRecognition || window.webkitSpeechRecognition
    : null;

// Live Captions Hook
// Continuously transcribes your speech during a call and shares the text with
// the other person over the data connection, so both sides see live captions.
function useLiveCaptions(activeConn, callActive) {
  const [enabled, setEnabled] = useState(false);
  const [myCaption, setMyCaption] = useState("");
  const [peerCaption, setPeerCaption] = useState("");
  const recognitionRef = useRef(null);

  const toggle = useCallback(() => setEnabled((on) => !on), []);

  // Receive The Other Person's Captions
  useEffect(() => {
    if (!activeConn) return;

    const handleData = (data) => {
      if (data && data.type === "caption") {
        setPeerCaption(data.text);
      }
    };

    activeConn.on("data", handleData);

    return () => {
      activeConn.off("data", handleData);
    };
  }, [activeConn]);

  // Run Recognition While Enabled And In A Call
  useEffect(() => {
    if (!SpeechRecognition || !enabled || !callActive) {
      recognitionRef.current?.stop();
      setMyCaption("");
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      let text = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        text += event.results[i][0].transcript;
      }

      text = text.trim();
      setMyCaption(text);

      if (activeConn && activeConn.open !== false) {
        activeConn.send({ type: "caption", text });
      }
    };

    // Chrome stops recognition periodically; restart it while still enabled.
    recognition.onend = () => {
      if (recognitionRef.current === recognition) {
        try {
          recognition.start();
        } catch (error) {
          // Ignore "already started" races.
        }
      }
    };

    try {
      recognition.start();
      recognitionRef.current = recognition;
    } catch (error) {
      console.error("Live captions could not start:", error);
    }

    return () => {
      recognitionRef.current = null;
      recognition.onend = null;
      recognition.stop();
    };
  }, [enabled, callActive, activeConn]);

  // Hook Return Values
  return {
    supported: !!SpeechRecognition,
    enabled,
    toggle,
    myCaption,
    peerCaption,
  };
}

// Export Hook
export default useLiveCaptions;
