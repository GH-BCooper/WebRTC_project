import React from "react";
import { Link } from "react-router-dom";

// Feature Highlights
const FEATURES = [
  ["🔗", "Direct P2P", "Browser-to-browser calls and chat with PeerJS — no server in the middle."],
  ["📹", "Video calls", "One-to-one video with mute, camera toggle and screen-free live captions."],
  ["✨", "AI assistant", "Summaries, smart replies, rewrites and translation, powered by Claude."],
  ["💬", "Live captions", "Real-time speech-to-text shared with the other person during a call."],
  ["⌨️", "Typing + alerts", "Typing indicator, notification sound and unread tab badge."],
  ["🌗", "Dark / light", "Theme toggle that remembers your choice."],
];

// Home / Landing Page
function Home() {
  return (
    <div className="page">
      <section className="hero">
        <h1>Talk, call and think together — peer to peer.</h1>
        <p>
          A small React + WebRTC learning project: real-time chat and video
          between two browsers, with an AI assistant on top.
        </p>
        <div className="hero-actions">
          <Link className="btn" to="/meet">
            Start a meeting
          </Link>
          <Link className="btn btn-ghost" to="/assistant">
            Try the AI assistant
          </Link>
        </div>
      </section>

      <section className="feature-grid">
        {FEATURES.map(([icon, title, text]) => (
          <div className="feature-card" key={title}>
            <span className="feature-icon" aria-hidden="true">
              {icon}
            </span>
            <h3>{title}</h3>
            <p>{text}</p>
          </div>
        ))}
      </section>
    </div>
  );
}

// Export Component
export default Home;
