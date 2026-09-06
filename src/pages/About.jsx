import React from "react";
import { Link } from "react-router-dom";

// About Page
function About() {
  return (
    <div className="page about">
      <header className="page-head">
        <span className="page-kicker">The project</span>
        <h1>About OfficeHours</h1>
      </header>

      <p>
        OfficeHours is a small, browser-only platform for <strong>1:1 calls
        that leave a record behind</strong> — mentoring, tutoring, consults,
        interviews. Two browsers connect directly with{" "}
        <strong>WebRTC / PeerJS</strong>; when the call ends, the{" "}
        <strong>Anthropic API</strong> turns the conversation into a recap. It is
        built with <strong>React</strong> and has no backend.
      </p>

      <h2>Why it exists</h2>
      <p>
        The most valuable conversations people have are one-to-one, and they are
        also the ones that vanish the fastest — no transcript, no decisions
        captured, no follow-up. Big meeting tools need accounts and downloads and
        still don&apos;t help with that last part. OfficeHours is the smallest
        thing that does: a room you can share with a link, and an AI scribe.
      </p>

      <h2>How a session works</h2>
      <ol>
        <li>
          On <strong>Sessions</strong>, you add a topic and a short agenda. It is
          saved in this browser and gets a short id.
        </li>
        <li>
          You share the room link (<code>/meet?s=&lt;id&gt;</code>). The other
          person opens it — no sign-up, no install.
        </li>
        <li>
          One side sends a connection request; the other accepts. A single data
          connection then carries chat, typing pings and captions; a video call
          adds a media stream on top.
        </li>
        <li>
          During or after the call, <strong>Generate recap</strong> sends the
          topic, agenda and chat transcript to Claude, which returns a summary,
          an action-item checklist and a follow-up message. Saving it stores the
          recap back on the session.
        </li>
      </ol>

      <h2>The AI toolkit</h2>
      <ul>
        <li>
          <strong>Assistant</strong> — token-streaming chat with personas, saved
          history and image attachments (prep for a session).
        </li>
        <li>
          <strong>Agent</strong> — a tool-use loop: Claude calls real browser
          tools (clock, calculator, theme, invite links, notes) and you watch
          each step.
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
        <li>@anthropic-ai/sdk (Claude) — streaming, tool use, vision and the recap</li>
        <li>Plain CSS with custom properties for theming</li>
      </ul>

      <h2>Privacy</h2>
      <p>
        There is no backend. Your sessions, recaps and Anthropic API key are
        stored only in this browser; AI requests go straight from your browser to
        Anthropic. That is fine for a learning demo but not for production — a
        real app would proxy AI calls through a server and store sessions for
        both participants.
      </p>

      <p>
        Full changelog: <code>versionFive.md</code> (and <code>versionFour.md</code>{" "}
        … <code>versionTwo.md</code>) in the repo.
      </p>

      <Link className="btn" to="/sessions">
        Plan a session →
      </Link>
    </div>
  );
}

// Export Component
export default About;
