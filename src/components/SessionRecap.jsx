import React, { useState } from "react";
import useAI from "../hooks/useAI";
import AISettings from "./AISettings";
import { renderMarkdown } from "../lib/markdown";
import { updateSession } from "../lib/sessions";

// Session Recap Component
// Shown inside a meeting room. Turns the chat transcript (+ the session's topic
// and agenda) into an AI-written record: summary, action items and a follow-up
// message. If this room was opened from a saved session, the recap can be
// stored back into your session history.
function SessionRecap({ session, messages, yourName, recipientName }) {
  const ai = useAI();
  const [showSettings, setShowSettings] = useState(false);
  const [recap, setRecap] = useState(session?.recap || "");
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  const hasChat = messages.length > 0;

  // Plain-text context for the model.
  function buildContext() {
    const transcript = messages
      .map((message) => {
        const who =
          message.type === "incoming"
            ? recipientName || "Guest"
            : yourName || "Host";
        return `${who}: ${message.text}`;
      })
      .join("\n");

    return [
      `Topic: ${session?.topic || "(none set)"}`,
      `Agenda:\n${session?.agenda || "(none set)"}`,
      "",
      "Transcript:",
      transcript || "(no chat messages)",
    ].join("\n");
  }

  async function generate() {
    setSaved(false);
    try {
      setRecap(await ai.sessionRecap(buildContext()));
    } catch {
      /* ai.error is shown below */
    }
  }

  function save() {
    if (!session) return;
    updateSession(session.id, { recap, status: "done" });
    setSaved(true);
  }

  function copy() {
    navigator.clipboard?.writeText(recap).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  return (
    <section className="recap">
      <div className="recap-head">
        <h2>📝 Session recap</h2>
        <button
          className="chip"
          type="button"
          onClick={() => setShowSettings((value) => !value)}
        >
          {showSettings ? "Hide settings" : "⚙ AI settings"}
        </button>
      </div>

      {session ? (
        <p className="muted">
          <strong>{session.topic}</strong>
          {session.agenda ? ` — ${session.agenda}` : ""}
        </p>
      ) : (
        <p className="muted">
          This room wasn&apos;t started from a saved session, so the recap
          won&apos;t be stored — but you can still generate and copy it.
        </p>
      )}

      {showSettings && <AISettings ai={ai} />}

      {!ai.ready ? (
        <p className="ai-hint">Add an Anthropic API key to write a recap.</p>
      ) : (
        <>
          <button type="button" onClick={generate} disabled={ai.busy || !hasChat}>
            {ai.busy
              ? "Writing…"
              : recap
                ? "Regenerate recap"
                : "Generate recap"}
          </button>
          {!hasChat && (
            <p className="ai-hint">
              Send a few chat messages during the call and they become the
              transcript for the recap.
            </p>
          )}
          {ai.error && <p className="ai-error">{ai.error}</p>}
        </>
      )}

      {recap && (
        <div className="ai-result">
          <div
            className="md"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(recap) }}
          />
          <div className="recap-actions">
            <button className="chip" type="button" onClick={copy}>
              {copied ? "Copied!" : "Copy"}
            </button>
            {session && (
              <button className="chip" type="button" onClick={save}>
                {saved ? "Saved to history ✓" : "Save to session history"}
              </button>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

// Export Component
export default SessionRecap;
