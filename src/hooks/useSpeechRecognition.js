import { useCallback, useRef, useState } from "react";

// Browser Speech Recognition
const SpeechRecognition =
  typeof window !== "undefined"
    ? window.SpeechRecognition || window.webkitSpeechRecognition
    : null;

// Speech Recognition Hook
// Converts speech to text and reports the running transcript through onResult.
function useSpeechRecognition(onResult) {
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);

  // Start Listening
  const start = useCallback(() => {
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();

    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = true;

    let finalText = "";

    recognition.onresult = (event) => {
      let interimText = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const chunk = event.results[i][0].transcript;

        if (event.results[i].isFinal) {
          finalText += chunk;
        } else {
          interimText += chunk;
        }
      }

      onResult((finalText + interimText).trim());
    };

    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);

    try {
      recognition.start();
      recognitionRef.current = recognition;
      setListening(true);
    } catch (error) {
      console.error("Speech recognition could not start:", error);
    }
  }, [onResult]);

  // Stop Listening
  const stop = useCallback(() => {
    recognitionRef.current?.stop();
    setListening(false);
  }, []);

  // Hook Return Values
  return { listening, start, stop, supported: !!SpeechRecognition };
}

// Export Hook
export default useSpeechRecognition;
