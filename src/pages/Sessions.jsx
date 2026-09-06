import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { renderMarkdown } from "../lib/markdown";
import {
  listSessions,
  createSession,
  deleteSession,
  sessionLink,
} from "../lib/sessions";

// Sessions Page ( /sessions )
// The OfficeHours dashboard: plan a 1:1 session, share its link, and keep the
// AI-written recap of every session you've run. All local to this browser.
function Sessions() {
  const [sessions, setSessions] = useState(() => listSessions());
  const [topic, setTopic] = useState("");
  const [agenda, setAgenda] = useState("");
  const [hostName, setHostName] = useState(
    () => localStorage.getItem("officeHoursHost") || "",
  );
  const [copiedId, setCopiedId] = useState("");
  const [openId, setOpenId] = useState("");

  useEffect(() => {
    const refresh = () => setSessions(listSessions());
    window.addEventListener("sessions-change", refresh);
    return () => window.removeEventListener("sessions-change", refresh);
  }, []);

  function handleCreate(event) {
    event.preventDefault();
    if (!topic.trim()) return;
    localStorage.setItem("officeHoursHost", hostName.trim());
    const created = createSession({ topic, agenda, hostName });
    setTopic("");
    setAgenda("");
    setOpenId(created.id);
  }

  function copyLink(session) {
    navigator.clipboard?.writeText(sessionLink(session)).then(() => {
      setCopiedId(session.id);
      setTimeout(() => setCopiedId(""), 1500);
    });
  }

  return (
    <div className="page sessions">
      <header className="page-head">
        <span className="page-kicker">OfficeHours</span>
        <h1>Your sessions</h1>
        <p className="muted">
          Plan a 1:1, send the link, talk. When you&apos;re done, the AI writes
          the recap — so the call actually leaves something behind.
        </p>
      </header>

      <form className="session-form" onSubmit={handleCreate}>
        <label htmlFor="s-topic">Topic</label>
        <input
          id="s-topic"
          type="text"
          value={topic}
          onChange={(event) => setTopic(event.target.value)}
          placeholder="e.g. Portfolio review with Sam"
        />

        <label htmlFor="s-agenda">Agenda / notes (optional)</label>
        <textarea
          id="s-agenda"
          rows={3}
          value={agenda}
          onChange={(event) => setAgenda(event.target.value)}
          placeholder="What do you want to cover? The AI uses this when writing the recap."
        />

        <label htmlFor="s-host">Your name</label>
        <input
          id="s-host"
          type="text"
          value={hostName}
          onChange={(event) => setHostName(event.target.value)}
          placeholder="Shown to your guest"
        />

        <button type="submit">Create session</button>
      </form>

      {sessions.length === 0 ? (
        <p className="ai-hint">No sessions yet — create one above to start.</p>
      ) : (
        <ul className="session-list">
          {sessions.map((session) => (
            <li key={session.id} className="session-card">
              <div className="session-card-head">
                <div>
                  <strong>{session.topic}</strong>
                  <span className={`status-badge ${session.status}`}>
                    {session.status === "done" ? "recap ready" : "planned"}
                  </span>
                </div>
                <time>{new Date(session.createdAt).toLocaleDateString()}</time>
              </div>

              {session.agenda && <p className="muted">{session.agenda}</p>}

              <div className="session-card-actions">
                <Link className="btn" to={`/meet?s=${session.id}`}>
                  Open room →
                </Link>
                <button
                  className="chip"
                  type="button"
                  onClick={() => copyLink(session)}
                >
                  {copiedId === session.id ? "Link copied!" : "Copy invite link 🔗"}
                </button>
                {session.recap && (
                  <button
                    className="chip"
                    type="button"
                    onClick={() =>
                      setOpenId((current) =>
                        current === session.id ? "" : session.id,
                      )
                    }
                  >
                    {openId === session.id ? "Hide recap" : "Show recap"}
                  </button>
                )}
                <button
                  className="chip danger"
                  type="button"
                  onClick={() => deleteSession(session.id)}
                >
                  Delete
                </button>
              </div>

              {session.recap && openId === session.id && (
                <div className="ai-result">
                  <div
                    className="md"
                    dangerouslySetInnerHTML={{
                      __html: renderMarkdown(session.recap),
                    }}
                  />
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// Export Component
export default Sessions;
