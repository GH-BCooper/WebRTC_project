import React from "react";

// Message Input Component (controlled)
function MessageInput(props) {
  const { value, onChange, onSend, listening, onToggleSpeech, speechSupported } =
    props;

  function handleKeyDown(event) {
    if (event.key === "Enter") {
      onSend();
    }
  }

  return (
    <div className="message-row">
      {/* Message Input Label */}
      <label htmlFor="message">Message:</label>

      {/* Message Text Input */}
      <input
        type="text"
        id="message"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Speak or type your message"
      />

      {/* Speech To Text Toggle */}
      {speechSupported && (
        <button className="speech-btn" onClick={onToggleSpeech} type="button">
          {listening ? "Stop Listening ⏹" : "Speak 🎤"}
        </button>
      )}

      {/* Send Message Button */}
      <button onClick={onSend} type="button">
        Send Message
      </button>
    </div>
  );
}

// Export Component
export default MessageInput;
