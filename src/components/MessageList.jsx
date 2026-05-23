import React from "react";

// Message List Component
function MessageList(props) {
  return (
    <div>
      {/* Message List Heading */}
      <h2>Sequence of Messages</h2>

      {/* Messages Container */}
      <div id="messages">
        <ul>
          {props.messages.map((message, index) => (
            <li key={index}>
              {/* Message Direction */}
              <strong>
                {message.type === "incoming"
                  ? "From Recipient:"
                  : "To Recipient:"}
              </strong>{" "}
              {/* Message Content */}
              {message.text}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// Export Component
export default MessageList;
