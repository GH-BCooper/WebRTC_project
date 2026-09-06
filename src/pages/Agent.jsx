import React, { useEffect, useRef, useState } from "react";
import useAI from "../hooks/useAI";
import AISettings from "../components/AISettings";
import { renderMarkdown } from "../lib/markdown";
import { getNotes, clearNotes } from "../lib/agentTools";

const EXAMPLES = [
  "What time is it, and how many days until New Year?",
  "Work out (145 * 12) - 890 and save the answer as a note",
  "Switch the app to light mode, then back to dark",
  "Make me an invite link so a friend can join my meeting",
  "Pick between pizza, sushi and tacos for dinner",
];

// AI Agent Page
// Claude with browser tools it can actually call. Every tool call is shown so
// you can see the agent loop: think -> call tool -> read result -> answer.
function Agent() {
  const ai = useAI();
  const [showSettings, setShowSettings] = useState(!ai.ready);
  const [input, setInput] = useState("");
  const [log, setLog] = useState([]); // { kind, ... }
  const [notes, setNotes] = useState(() => getNotes());
  const logRef = useRef(null);

  useEffect(() => {
    const refresh = () => setNotes(getNotes());
    window.addEventListener("notes-change", refresh);
    return () => window.removeEventListener("notes-change", refresh);
  }, []);

  useEffect(() => {
    requestAnimationFrame(() => {
      if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
    });
  }, [log]);

  async function run() {
    const text = input.trim();
    if (!text || ai.busy || !ai.ready) return;

    setInput("");
    setLog((prev) => [...prev, { kind: "user", text }]);

    try {
      await ai.runAgent(text, {
        onEvent: (event) => {
          if (event.type === "text") {
            setLog((prev) => [...prev, { kind: "answer", text: event.text }]);
          } else if (event.type === "tool_call") {
            setLog((prev) => [
              ...prev,
              { kind: "tool", name: event.name, input: event.input, output: null },
            ]);
          } else if (event.type === "tool_result") {
            setLog((prev) => {
              const next = [...prev];
              for (let i = next.length - 1; i >= 0; i -= 1) {
                if (next[i].kind === "tool" && next[i].name === event.name && next[i].output === null) {
                  next[i] = { ...next[i], output: event.output };
                  break;
                }
              }
              return next;
            });
          }
        },
      });
    } catch {
      setLog((prev) => [
        ...prev,
        { kind: "answer", text: "⚠️ " + (ai.error || "The agent failed.") },
      ]);
    }
  }

  return (
    <div className="page agent">
      <header className="page-head">
        <span className="page-kicker">Tool use · Agentic loop</span>
        <h1>AI Agent</h1>
        <p className="muted">
          Claude can call real tools in your browser — the clock, a calculator,
          the theme switch, invite links and a notepad. Watch each step of the
          loop happen live.
        </p>
      </header>

      <div className="ai-toolbar">
        <button className="chip" onClick={() => setShowSettings((v) => !v)} type="button">
          {showSettings ? "Hide settings" : "⚙ Settings"}
        </button>
        {log.length > 0 && (
          <button className="chip" onClick={() => setLog([])} type="button">
            🗑 Clear log
          </button>
        )}
      </div>

      {showSettings && <AISettings ai={ai} />}

      {!ai.ready ? (
        <p className="ai-hint">Add an API key above to run the agent.</p>
      ) : (
        <div className="agent-grid">
          <div>
            <div className="agent-log" ref={logRef}>
              {log.length === 0 && (
                <div className="assistant-empty">
                  <p className="ai-hint">Ask the agent to do something:</p>
                  <div className="quick-prompts">
                    {EXAMPLES.map((ex) => (
                      <button key={ex} className="chip" type="button" onClick={() => setInput(ex)}>
                        {ex}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {log.map((entry, index) => {
                if (entry.kind === "user") {
                  return (
                    <div key={index} className="assistant-msg user">
                      <strong>You</strong>
                      <span>{entry.text}</span>
                    </div>
                  );
                }
                if (entry.kind === "answer") {
                  return (
                    <div key={index} className="assistant-msg assistant">
                      <strong>Claude</strong>
                      <div
                        className="md"
                        dangerouslySetInnerHTML={{ __html: renderMarkdown(entry.text) }}
                      />
                    </div>
                  );
                }
                return (
                  <div key={index} className="tool-call">
                    <div className="tool-call-head">
                      <span className="tool-badge">🔧 {entry.name}</span>
                      {entry.output === null && <span className="tool-pending">running…</span>}
                    </div>
                    <pre className="tool-io">
                      <span className="tool-io-label">input</span>
                      {JSON.stringify(entry.input, null, 2)}
                    </pre>
                    {entry.output !== null && (
                      <pre className="tool-io">
                        <span className="tool-io-label">result</span>
                        {JSON.stringify(entry.output, null, 2)}
                      </pre>
                    )}
                  </div>
                );
              })}

              {ai.busy && <p className="ai-hint">Thinking…</p>}
            </div>

            <div className="message-row">
              <input
                type="text"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => event.key === "Enter" && run()}
                placeholder="Ask the agent to do something"
              />
              <button onClick={run} disabled={ai.busy} type="button">
                {ai.busy ? "…" : "Run"}
              </button>
            </div>
          </div>

          <aside className="agent-notes">
            <div className="agent-notes-head">
              <h3>📝 Notes</h3>
              {notes.length > 0 && (
                <button
                  className="chip"
                  type="button"
                  onClick={() => {
                    clearNotes();
                    setNotes([]);
                  }}
                >
                  Clear
                </button>
              )}
            </div>
            {notes.length === 0 ? (
              <p className="ai-hint">The agent's saved notes show up here.</p>
            ) : (
              <ul className="note-list">
                {notes.map((note, index) => (
                  <li key={index}>
                    <span>{note.text}</span>
                    <time>{new Date(note.at).toLocaleString()}</time>
                  </li>
                ))}
              </ul>
            )}
          </aside>
        </div>
      )}
    </div>
  );
}

// Export Component
export default Agent;
