import React from "react";
import { Link } from "react-router-dom";

// Feature Highlights
const FEATURES = [
  ["🔗", "Direct P2P", "Browser-to-browser chat and video with PeerJS — no server in the middle.", "grad-1"],
  ["📹", "Video + screen share", "One-to-one video with mute, camera toggle and live screen sharing.", "grad-2"],
  ["💬", "Live captions", "Real-time speech-to-text shared with the other person during a call.", "grad-3"],
  ["✨", "Streaming assistant", "Personas, saved history, image attachments and a stop button.", "grad-4"],
  ["🔧", "Tool-using agent", "Claude calls real browser tools — clock, calculator, theme, notes.", "grad-5"],
  ["🖼️", "Vision", "Drop in an image and ask Claude to describe or read it.", "grad-6"],
];

const AI_ROUTES = [
  ["/assistant", "Assistant", "Streaming chat with personas & vision"],
  ["/agent", "Agent", "Watch Claude call tools step by step"],
  ["/vision", "Vision", "Ask questions about any image"],
];

// Home / Landing Page
function Home() {
  return (
    <div className="page home">
      <section className="hero">
        <span className="hero-badge">v4 · WebRTC + 3 kinds of AI</span>
        <h1>
          Talk, call and <span className="hero-grad">think together</span> — peer
          to peer.
        </h1>
        <p>
          A small React + WebRTC learning project: real-time chat and video
          between two browsers, plus a streaming assistant, a tool-using agent
          and image understanding — all running in the browser.
        </p>
        <div className="hero-actions">
          <Link className="btn" to="/meet">
            Start a meeting →
          </Link>
          <Link className="btn btn-ghost" to="/agent">
            Meet the AI agent
          </Link>
        </div>
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

      <section className="ai-routes">
        <h2>Three AI playgrounds</h2>
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
