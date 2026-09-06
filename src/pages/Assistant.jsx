import React, { useEffect, useMemo, useRef, useState } from "react";
import useAI from "../hooks/useAI";
import AISettings from "../components/AISettings";
import { renderMarkdown } from "../lib/markdown";

const HISTORY_KEY = "assistantHistory";

const QUICK_PROMPTS = [
  "Explain how WebRTC works in 3 sentences",
  "Give me 5 project ideas using PeerJS",
  "Write a short poem about peer-to-peer connections",
  "What's the difference between STUN and TURN?",
];

// Standalone AI Assistant Page
// A streaming chat with Claude: personas, saved history, an image attachment
// (vision) and a stop button.
function Assistant() {
  const ai = useAI();

  const [showSettings, setShowSettings] = useState(!ai.ready);
  const [input, setInput] = useState("");
  const [image, setImage] = useState(null); // { dataUrl, media_type, data }
  const [messages, setMessages] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
    } catch {
      return [];
    }
  });
  const listRef = useRef(null);
  const fileRef = useRef(null);

  // Persist the conversation.
  useEffect(() => {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(messages));
  }, [messages]);

  const scrollDown = () => {
    requestAnimationFrame(() => {
      if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
    });
  };

  useEffect(scrollDown, [messages]);

  function pickImage(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result);
      const match = /^data:(image\/[a-zA-Z+]+);base64,(.*)$/.exec(dataUrl);
      if (match) {
        setImage({ dataUrl, media_type: match[1], data: match[2] });
      }
    };
    reader.readAsDataURL(file);
  }

  async function handleSend() {
    const text = input.trim();
    if ((!text && !image) || ai.busy || !ai.ready) return;

    const userMessage = {
      role: "user",
      content: text || "What's in this image?",
      image: image?.dataUrl || null,
    };
    const history = [...messages, userMessage];
    setMessages([...history, { role: "assistant", content: "" }]);
    setInput("");
    const sentImage = image;
    setImage(null);
    if (fileRef.current) fileRef.current.value = "";

    try {
      await ai.chatStream(
        history.map(({ role, content }) => ({ role, content })),
        (delta) => {
          setMessages((prev) => {
            const next = [...prev];
            const last = next[next.length - 1];
            next[next.length - 1] = { role: "assistant", content: last.content + delta };
            return next;
          });
        },
        sentImage
          ? { images: [{ media_type: sentImage.media_type, data: sentImage.data }] }
          : undefined,
      );
    } catch {
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

  function clearChat() {
    ai.abort();
    setMessages([]);
    localStorage.removeItem(HISTORY_KEY);
  }

  const usageLine = useMemo(() => {
    if (!ai.lastUsage) return null;
    const { input_tokens, output_tokens } = ai.lastUsage;
    return `${input_tokens ?? "?"} in / ${output_tokens ?? "?"} out tokens`;
  }, [ai.lastUsage]);

  return (
    <div className="page assistant">
      <header className="page-head">
        <span className="page-kicker">Streaming chat · Vision</span>
        <h1>AI Assistant</h1>
        <p className="muted">
          A direct, streaming chat with Claude. Pick a persona, attach an image,
          stop mid-answer — your history is saved in this browser.
        </p>
      </header>

      <div className="ai-toolbar">
        <button
          className="chip"
          onClick={() => setShowSettings((value) => !value)}
          type="button"
        >
          {showSettings ? "Hide settings" : "⚙ Settings"}
        </button>
        {messages.length > 0 && (
          <button className="chip" onClick={clearChat} type="button">
            🗑 Clear chat
          </button>
        )}
        {usageLine && <span className="usage-line">{usageLine}</span>}
      </div>

      {showSettings && <AISettings ai={ai} showPersona />}

      {!ai.ready ? (
        <p className="ai-hint">
          Add an API key above to start chatting. Get one at console.anthropic.com.
        </p>
      ) : (
        <>
          <div className="assistant-log" ref={listRef}>
            {messages.length === 0 && (
              <div className="assistant-empty">
                <p className="ai-hint">Ask me anything, or try:</p>
                <div className="quick-prompts">
                  {QUICK_PROMPTS.map((prompt) => (
                    <button
                      key={prompt}
                      className="chip"
                      type="button"
                      onClick={() => setInput(prompt)}
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((message, index) => (
              <div key={index} className={`assistant-msg ${message.role}`}>
                <strong>{message.role === "user" ? "You" : "Claude"}</strong>
                {message.image && (
                  <img className="msg-image" src={message.image} alt="attachment" />
                )}
                {message.role === "assistant" ? (
                  <div
                    className="md"
                    dangerouslySetInnerHTML={{
                      __html: renderMarkdown(message.content || "…"),
                    }}
                  />
                ) : (
                  <span>{message.content}</span>
                )}
              </div>
            ))}
          </div>

          {image && (
            <div className="attach-preview">
              <img src={image.dataUrl} alt="to send" />
              <button className="chip" type="button" onClick={() => setImage(null)}>
                Remove
              </button>
            </div>
          )}

          <div className="message-row">
            <input
              type="text"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => event.key === "Enter" && handleSend()}
              placeholder="Type a message"
            />
            <button
              className="btn-ghost"
              type="button"
              onClick={() => fileRef.current?.click()}
              title="Attach an image"
            >
              📎
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              hidden
              onChange={pickImage}
            />
            {ai.busy ? (
              <button onClick={ai.abort} type="button" style={{ background: "var(--danger)" }}>
                Stop ⏹
              </button>
            ) : (
              <button onClick={handleSend} type="button">
                Send
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// Export Component
export default Assistant;
