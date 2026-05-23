import { useState } from "react";

// Speech Recognition Hook
function useSpeechRecognition() {
  // Recognition State
  const [recognition, setRecognition] = useState(null);

  // Start Speech Recognition
  function startSpeechRecognition() {
    if (window.webkitSpeechRecognition) {
      // Speech Recognition Instance Configuration
      const recognitionInstance = new window.webkitSpeechRecognition();

      recognitionInstance.continuous = false;
      recognitionInstance.lang = "en-US";
      recognitionInstance.interimResults = false;
      recognitionInstance.maxAlternatives = 1;

      // Speech Result Handler
      recognitionInstance.onresult = (event) => {
        const speechToText = event.results[0][0].transcript;

        document.getElementById("message").value = speechToText;
      };

      // Recognition End Handler
      recognitionInstance.onend = () => {
        document.getElementById("startSpeechBtn").style.display =
          "inline-block";

        document.getElementById("stopSpeechBtn").style.display = "none";
      };

      // Recognition Start Handler
      recognitionInstance.onstart = () => {
        document.getElementById("startSpeechBtn").style.display = "none";

        document.getElementById("stopSpeechBtn").style.display = "inline-block";
      };

      // Start Recognition
      recognitionInstance.start();

      // Store Recognition Instance
      setRecognition(recognitionInstance);
    } else {
      // Browser Compatibility Error
      console.error("Speech recognition is not supported in this browser.");
    }
  }

  // Stop Speech Recognition
  function stopSpeechRecognition() {
    if (recognition) {
      recognition.stop();
    }
  }

  // Hook Return Values
  return { startSpeechRecognition, stopSpeechRecognition };
}

// Export Hook
export default useSpeechRecognition;
