import React, { useState } from "react";
import useAI, { AI_MODELS } from "../hooks/useAI";

// Tone / language options
const TONES = ["friendly", "professional", "concise", "funny"];
const LANGUAGES = ["Spanish", "French", "German", "Hindi", "Japanese"];

// AI Panel Component
// Chat helpers powered by the Anthropic API: summary, quick replies,
// draft rewriting and translation.
function AIPanel(props) {
  const { messages, yourName, recipientName, draft, onInsert } = props;

  const ai = useAI();

  const [open, setOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(!ai.ready);
  const [summary, setSummary] = useState("");
  const [replies, setReplies] = useState([]);
  const [tone, setTone] = useState(TONES[0]);
  const [language, setLanguage] = useState(LANGUAGES[0]);
  const [result, setResult] = useState("");

  // Build a plain-text transcript for the model.
  function transcript() {
    return messages
      .map((message) => {
        const who =
          message.type === "incoming"
            ? recipientName || "Them"
            : yourName || "You";
        return `${who}: ${message.text}`;
      })
      .join("\n");
  }

  const noHistory = messages.length === 0;

  // Actions
  async function handleSummarize() {
    setSummary("");
    try {
      setSummary(await ai.summarize(transcript()));
    } catch (error) {
      /* error is shown from ai.error */
    }
  }

  async function handleSmartReplies() {
    setReplies([]);
    try {
      setReplies(await ai.smartReplies(transcript()));
    } catch (error) {
      /* handled */
    }
  }

  async function handleRewrite() {
    if (!draft.trim()) return;
    setResult("");
    try {
      const rewritten = await ai.rewrite(draft, tone);
      setResult(rewritten);
      onInsert(rewritten);
    } catch (error) {
      /* handled */
    }
  }

  async function handleTranslate() {
    const lastIncoming = [...messages]
      .reverse()
      .find((message) => message.type === "incoming");
    const text = draft.trim() || lastIncoming?.text;

    if (!text) return;
    setResult("");
    try {
      setResult(await ai.translate(text, language));
    } catch (error) {
      /* handled */
    }
  }

  return (
    <div className="ai-panel">
      <button
        className="ai-toggle"
        onClick={() => setOpen((value) => !value)}
        type="button"
      >
        ✨ AI Assistant {open ? "▲" : "▼"}
      </button>

      {open && (
        <div className="ai-body">
          {/* Settings */}
          <button
            className="ai-link"
            onClick={() => setShowSettings((value) => !value)}
            type="button"
          >
            {showSettings ? "Hide settings" : "Settings"}
          </button>

          {showSettings && (
            <div className="ai-settings">
              <label htmlFor="ai-key">Anthropic API key (stored in this browser only)</label>
              <input
                id="ai-key"
                type="password"
                value={ai.apiKey}
                onChange={(event) => ai.setApiKey(event.target.value)}
                placeholder="sk-ant-..."
              />

              <label htmlFor="ai-model">Model</label>
              <select
                id="ai-model"
                value={ai.model}
                onChange={(event) => ai.setModel(event.target.value)}
              >
                {AI_MODELS.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {!ai.ready && (
            <p className="ai-hint">
              Add an API key above to use these features. Get one at
              console.anthropic.com.
            </p>
          )}

          {ai.ready && (
            <>
              {/* Buttons */}
              <div className="ai-actions">
                <button
                  onClick={handleSummarize}
                  disabled={ai.busy || noHistory}
                  type="button"
                >
                  Summarize chat
                </button>

                <button
                  onClick={handleSmartReplies}
                  disabled={ai.busy || noHistory}
                  type="button"
                >
                  Suggest replies
                </button>
              </div>

              <div className="ai-actions">
                <select value={tone} onChange={(e) => setTone(e.target.value)}>
                  {TONES.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleRewrite}
                  disabled={ai.busy || !draft.trim()}
                  type="button"
                >
                  Rewrite draft
                </button>
              </div>

              <div className="ai-actions">
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                >
                  {LANGUAGES.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleTranslate}
                  disabled={ai.busy}
                  type="button"
                >
                  Translate
                </button>
              </div>

              {ai.busy && <p className="ai-hint">Thinking…</p>}
              {ai.error && <p className="ai-error">{ai.error}</p>}

              {/* Results */}
              {summary && (
                <div className="ai-result">
                  <strong>Summary</strong>
                  <pre>{summary}</pre>
                </div>
              )}

              {replies.length > 0 && (
                <div className="ai-result">
                  <strong>Quick replies</strong>
                  <div className="ai-replies">
                    {replies.map((reply, index) => (
                      <button
                        key={index}
                        onClick={() => onInsert(reply)}
                        type="button"
                      >
                        {reply}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {result && (
                <div className="ai-result">
                  <strong>Result</strong>
                  <pre>{result}</pre>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

// Export Component
export default AIPanel;
