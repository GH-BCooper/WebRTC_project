import React from "react";

// Message Input Component
function MessageInput(props) {
  return (
    <div>
      {/* Message Input Label */}
      <label htmlFor="message">Message:</label>

      {/* Message Text Input */}
      <input type="text" id="message" placeholder="Speak/type your message" />

      {/* Start Speech Recognition Button */}
      <button
        id="startSpeechBtn"
        className="speech-btn"
        onClick={props.startSpeechRecognition}
      >
        Start Listening 🎤 (Speech-to-Text)
      </button>

      {/* Stop Speech Recognition Button */}
      <button
        id="stopSpeechBtn"
        className="speech-btn"
        style={{ display: "none" }}
        onClick={props.stopSpeechRecognition}
      >
        Stop Listening
      </button>

      {/* Send Message Button */}
      <button onClick={props.sendMessage}>Send Message</button>
    </div>
  );
}

// Export Component
export default MessageInput;
