import React, { useRef, useState } from "react";
import useAI from "../hooks/useAI";
import AISettings from "../components/AISettings";

// Standalone AI Assistant Page
// A simple streaming chat with Claude, separate from the peer-to-peer chat.
function Assistant() {
  const ai = useAI();

  const [showSettings, setShowSettings] = useState(!ai.ready);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const listRef = useRef(null);

  function scrollDown() {
    requestAnimationFrame(() => {
      if (listRef.current) {
        listRef.current.scrollTop = listRef.current.scrollHeight;
      }
    });
  }

  async function handleSend() {
    const text = input.trim();
    if (!text || ai.busy || !ai.ready) return;

    const history = [...messages, { role: "user", content: text }];
    setMessages([...history, { role: "assistant", content: "" }]);
    setInput("");
    scrollDown();

    try {
      await ai.chatStream(history, (delta) => {
        setMessages((prev) => {
          const next = [...prev];
          next[next.length - 1] = {
            role: "assistant",
            content: next[next.length - 1].content + delta,
          };
          return next;
        });
        scrollDown();
      });
    } catch (error) {
      setMessages((prev) => {
        const next = [...prev];
        next[next.length - 1] = {
          role: "assistant",
          content: "⚠️ " + (ai.error || "Something went wrong."),
        };
        return next;
      });
    }
  }

  return (
    <div className="page assistant">
      <h1>AI Assistant</h1>
      <p className="muted">
        A direct chat with Claude. Uses the same API key as the Meet page.
      </p>

      <button
        className="ai-link"
        onClick={() => setShowSettings((value) => !value)}
        type="button"
      >
        {showSettings ? "Hide settings" : "Settings"}
      </button>

      {showSettings && <AISettings ai={ai} />}

      {!ai.ready ? (
        <p className="ai-hint">
          Add an API key above to start chatting. Get one at
          console.anthropic.com.
        </p>
      ) : (
        <>
          <div className="assistant-log" ref={listRef}>
            {messages.length === 0 && (
              <p className="ai-hint">Ask me anything…</p>
            )}
            {messages.map((message, index) => (
              <div key={index} className={`assistant-msg ${message.role}`}>
                <strong>{message.role === "user" ? "You" : "Claude"}</strong>
                <span>{message.content || "…"}</span>
              </div>
            ))}
          </div>

          <div className="message-row">
            <input
              type="text"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => event.key === "Enter" && handleSend()}
              placeholder="Type a message"
            />
            <button onClick={handleSend} disabled={ai.busy} type="button">
              {ai.busy ? "…" : "Send"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// Export Component
export default Assistant;
