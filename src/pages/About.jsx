import React from "react";
import { Link } from "react-router-dom";

// About Page
function About() {
  return (
    <div className="page about">
      <h1>About this project</h1>

      <p>
        This is a personal learning project exploring <strong>WebRTC</strong>,{" "}
        <strong>React</strong> and the <strong>Anthropic API</strong>. Two
        browsers connect directly using PeerJS — messages, video and captions all
        travel peer to peer.
      </p>

      <h2>How a call works</h2>
      <ol>
        <li>Each browser gets a short random Peer ID (saved in localStorage).</li>
        <li>You share your ID or an invite link with the other person.</li>
        <li>
          One side sends a connection request; the other accepts. A single data
          connection then carries chat, typing pings and captions.
        </li>
        <li>
          A video call adds a WebRTC media stream on top of that connection.
        </li>
      </ol>

      <h2>Tech</h2>
      <ul>
        <li>React 18 + React Router 7 (Create React App)</li>
        <li>WebRTC + PeerJS for peer-to-peer media and data</li>
        <li>Web Speech API for dictation and live captions</li>
        <li>@anthropic-ai/sdk (Claude) for the AI features</li>
        <li>Plain CSS with custom properties for theming</li>
      </ul>

      <h2>Privacy</h2>
      <p>
        There is no backend. Your Anthropic API key is stored only in this
        browser and is sent directly to Anthropic. That is fine for a demo but
        not for production — a real app would proxy AI calls through a server.
      </p>

      <p>
        Full changelog: <code>versionTwo.md</code> and{" "}
        <code>versionThree.md</code> in the repo.
      </p>

      <Link className="btn" to="/meet">
        Start a meeting
      </Link>
    </div>
  );
}

// Export Component
export default About;
