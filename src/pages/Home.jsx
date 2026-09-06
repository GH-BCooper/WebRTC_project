import React from "react";
import { Link } from "react-router-dom";

// What makes a room
const FEATURES = [
  ["🔗", "Join by link", "Your guest clicks one link — no account, no download. The call is browser-to-browser over WebRTC.", "grad-1"],
  ["📹", "Video + screen share", "One-to-one video with mute, camera toggle and live screen sharing for walkthroughs.", "grad-2"],
  ["💬", "Live captions", "Real-time speech-to-text shared both ways — so the room works for everyone.", "grad-3"],
  ["📝", "AI recap", "When the call ends, Claude turns the chat into a summary, action items and a follow-up note.", "grad-4"],
  ["🗂️", "Session history", "Every recap is saved to this browser. Nothing important disappears when you hang up.", "grad-5"],
  ["🔒", "No backend", "Peer-to-peer media, local storage, your own AI key. Nothing runs on a server in the middle.", "grad-6"],
];

// How it works
const STEPS = [
  ["1", "Plan it", "Add a topic and a short agenda on the Sessions page. Takes ten seconds."],
  ["2", "Share the link", "Send the room link to the other person. They join instantly in their browser."],
  ["3", "Talk & capture", "Video, screen share and captions during. One click after → an AI recap in your history."],
];

// The AI toolkit that comes with it
const AI_ROUTES = [
  ["/assistant", "Assistant", "Streaming chat — prep talking points before a session"],
  ["/agent", "Agent", "Claude calls real browser tools: clock, calculator, invite links, notes"],
  ["/vision", "Vision", "Ask questions about a screenshot or document image"],
];

// Home / Landing Page
function Home() {
  return (
    <div className="page home">
      <section className="hero">
        <span className="hero-badge">OfficeHours · v5 · peer-to-peer + AI</span>
        <h1>
          1:1 calls that <span className="hero-grad">remember</span> what
          happened.
        </h1>
        <p>
          Mentoring, tutoring, client consults, interviews — they happen all the
          time, and then the notes, the decisions and the follow-ups just
          evaporate. OfficeHours is a tiny browser-only meeting room with an AI
          scribe: talk peer-to-peer, and leave with a written recap every time.
        </p>
        <div className="hero-actions">
          <Link className="btn" to="/sessions">
            Plan a session →
          </Link>
          <Link className="btn btn-ghost" to="/meet">
            Open a quick room
          </Link>
        </div>
      </section>

      <section className="problem-band">
        <p>
          <strong>The problem:</strong> heavyweight tools need accounts and
          installs, and <em>still</em> hand you nothing when the call ends. So
          knowledge from your most valuable conversations — the 1:1s — is lost by
          the next morning.
        </p>
      </section>

      <section className="feature-grid">
        {FEATURES.map(([icon, title, text, grad]) => (
          <div className={`feature-card ${grad}`} key={title}>
            <span className="feature-icon" aria-hidden="true">
              {icon}
            </span>
            <h3>{title}</h3>
            <p>{text}</p>
          </div>
        ))}
      </section>

      <section className="steps">
        <h2>How it works</h2>
        <div className="step-list">
          {STEPS.map(([num, title, text]) => (
            <div className="step" key={num}>
              <span className="step-num">{num}</span>
              <div>
                <strong>{title}</strong>
                <p>{text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="ai-routes">
        <h2>Plus a built-in AI toolkit</h2>
        <p className="muted">
          The same Anthropic key powers three playgrounds for preparing and
          following up on your sessions.
        </p>
        <div className="ai-route-list">
          {AI_ROUTES.map(([to, title, text]) => (
            <Link className="ai-route" to={to} key={to}>
              <strong>{title}</strong>
              <span>{text}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

// Export Component
export default Home;
