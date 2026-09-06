import React from "react";

// Format A Timestamp As HH:MM
function formatTime(time) {
  return new Date(time || Date.now()).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Message List Component
function MessageList(props) {
  const { messages, yourName, recipientName } = props;

  return (
    <div>
      {/* Message List Heading */}
      <h2>Messages</h2>

      {/* Messages Container */}
      <div id="messages">
        <ul>
          {messages.map((message, index) => {
            const isIncoming = message.type === "incoming";
            const sender = isIncoming
              ? recipientName || "Them"
              : yourName || "You";

            return (
              <li key={index} className={isIncoming ? "msg incoming" : "msg outgoing"}>
                <span className="msg-meta">
                  <strong>{sender}</strong> · {formatTime(message.time)}
                </span>
                <span className="msg-text">{message.text}</span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

// Export Component
export default MessageList;
