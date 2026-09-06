import React from "react";
import { Link } from "react-router-dom";

// About Page
function About() {
  return (
    <div className="page about">
      <header className="page-head">
        <span className="page-kicker">The project</span>
        <h1>About this project</h1>
      </header>

      <p>
        A personal learning project exploring <strong>WebRTC</strong>,{" "}
        <strong>React</strong> and the <strong>Anthropic API</strong>. Two
        browsers connect directly using PeerJS — messages, video, screen shares
        and captions all travel peer to peer. There is no backend.
      </p>

      <h2>How a call works</h2>
      <ol>
        <li>Each browser gets a short random Peer ID (saved in localStorage).</li>
        <li>You share your ID or an invite link with the other person.</li>
        <li>
          One side sends a connection request; the other accepts. A single data
          connection then carries chat, typing pings and captions.
        </li>
        <li>A video call adds a WebRTC media stream on top of that connection.</li>
      </ol>

      <h2>Three kinds of AI</h2>
      <ul>
        <li>
          <strong>Assistant</strong> — token-streaming chat with selectable
          personas, saved history and image attachments.
        </li>
        <li>
          <strong>Agent</strong> — an agentic tool-use loop: Claude calls real
          browser tools (clock, calculator, theme, invite links, notes) and you
          watch each step.
        </li>
        <li>
          <strong>Vision</strong> — upload an image and ask Claude about it.
        </li>
      </ul>

      <h2>Tech</h2>
      <ul>
        <li>React 18 + React Router 7 (Create React App)</li>
        <li>WebRTC + PeerJS for peer-to-peer media and data</li>
        <li>Web Speech API for dictation and live captions</li>
        <li>getDisplayMedia for screen sharing</li>
        <li>@anthropic-ai/sdk (Claude) — streaming, tool use and vision</li>
        <li>Plain CSS with custom properties for theming</li>
      </ul>

      <h2>Privacy</h2>
      <p>
        There is no backend. Your Anthropic API key is stored only in this
        browser and is sent directly to Anthropic. That is fine for a demo but
        not for production — a real app would proxy AI calls through a server.
      </p>

      <p>
        Full changelog: <code>versionFour.md</code>, <code>versionThree.md</code>{" "}
        and <code>versionTwo.md</code> in the repo.
      </p>

      <Link className="btn" to="/meet">
        Start a meeting →
      </Link>
    </div>
  );
}

// Export Component
export default About;
