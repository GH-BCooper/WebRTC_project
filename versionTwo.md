# Version Two — WebRTC + AI

This is the changelog and tech overview for **v2** of the peer‑to‑peer WebRTC app.
v1 was React + PeerJS: peer IDs, connection requests, text chat, 1‑to‑1 video
calls, mute/camera controls and speech‑to‑text dictation. v2 keeps all of that,
adds an **AI layer**, and cleans up several bugs.

Everything still runs **100% in the browser** — no backend. The only new
external call is directly from your browser to the Anthropic API, using a key
*you* paste in (stored only in `localStorage`).

---

## New AI features

### 1. AI Assistant (`src/components/AIPanel.jsx`, `src/hooks/useAI.js`)

A collapsible panel under the message box. Powered by the **Anthropic Messages
API** through the official `@anthropic-ai/sdk`. Four helpers:

| Action | What it does |
| --- | --- |
| **Summarize chat** | Turns the whole conversation into 3–5 bullet points. |
| **Suggest replies** | Proposes 3 short replies; click one to drop it into the input box. |
| **Rewrite draft** | Rewrites whatever you've typed in a chosen tone (friendly / professional / concise / funny). |
| **Translate** | Translates your draft (or the last message you received) into Spanish / French / German / Hindi / Japanese. |

Details:

- **Model picker** in Settings: `claude-opus-5` (default), `claude-sonnet-5`,
  `claude-haiku-4-5`.
- The API key lives in `localStorage` under `anthropicApiKey` and never leaves
  your machine except in the direct call to Anthropic. The SDK runs with
  `dangerouslyAllowBrowser: true` — fine for a personal learning project, **not**
  for production (a real app would proxy this through a small backend so the key
  stays secret).
- All calls are a single stateless `messages.create` request — no streaming, no
  tools — to keep the code readable.

### 2. Live call captions (`src/hooks/useLiveCaptions.js`)

During a video call, hit **Captions On**. Your speech is transcribed with the
browser's `SpeechRecognition` API and the text is sent to the other person over
the **same PeerJS data connection** as a `{ type: "caption" }` message, so both
people see live captions under the video tiles. Recognition auto‑restarts when
Chrome pauses it. No API key needed.

---

## Bug fixes & cleanup

| Fix | Before | After |
| --- | --- | --- |
| **False "call ended" alert** | Pressing *Stop Video Call* still popped up "The other person ended the call!" | An `endedByMe` ref suppresses the alert when *you* hang up. |
| **Hang‑up after answering a call** | `answerCall` never stored the call object, so stopping the call didn't always close the peer connection. | Both `startVideoCall` and `answerCall` now share one `attachCallHandlers` path and track `currentCall`. |
| **Camera light staying on** | Tracks weren't always stopped when the remote side closed the call. | `call.on("close")` now stops every track. |
| **A new data connection per message** | `useMessaging` called `peer.connect()` on *every* send, opening a fresh connection each time. | Messages now reuse the one `activeConn` from `useConnection` (`{ type: "chat" }` payloads). Fewer connections, cleaner receive path. |
| **Uncontrolled inputs / `document.getElementById`** | Message input, speech buttons and transcript were wired through raw DOM lookups. | `MessageInput` is a controlled component; `useSpeechRecognition` returns `{ listening, start, stop, supported }` and reports interim results via a callback. |
| **Dead code** | `useVideoCall` returned an unused `pendingCall`; `useMessaging` handled a `call-ended` type that was never sent. | Removed. |
| **CRA boilerplate** | `App.css` still had the spinning‑logo styles. | Trimmed to just `.App`. |
| **Page title** | `<title>React App</title>` | `<title>WebRTC + AI (PeerJS)</title>` |
| **Enter to send** | Had to click the button. | `Enter` sends the message. |
| **Chat UI** | Plain `From/To Recipient:` list. | Chat bubbles with sender name + `HH:MM` timestamp. |

### Known limitations (kept simple on purpose)

- The browser allows only **one** `SpeechRecognition` at a time, so live captions
  and the "Speak 🎤" dictation button don't run simultaneously (the second one
  to start is ignored).
- Speech features are Chrome / Edge / Brave only.
- PeerJS uses its free public broker + Google's public STUN server; calls between
  two strict/symmetric NATs may fail (a TURN server would fix this).
- The Anthropic key is visible in the browser — see the note above.

---

## Tech stack

### Frontend
- **React 18** (function components + hooks, Create React App / `react-scripts` 5)
- Plain **CSS** with CSS custom properties for the dark/light theme

### Real‑time communication
- **WebRTC** — media streams + peer connections
- **PeerJS** (`peerjs` ^1.5) — signaling wrapper; data channel used for chat,
  connection handshake, call requests **and** captions

### AI
- **`@anthropic-ai/sdk`** (^0.124) — Anthropic Messages API from the browser
- Models: `claude-opus-5` / `claude-sonnet-5` / `claude-haiku-4-5`

### Browser APIs
- **MediaDevices** (`getUserMedia`) — camera & mic
- **SpeechRecognition** (`webkitSpeechRecognition`) — dictation + live captions
- **localStorage** — peer ID, theme, AI key & model choice

### Project layout

```
src/
├── components/
│   ├── App.jsx
│   ├── AIPanel.jsx            ← new: AI assistant UI
│   ├── CallControls.jsx       ← + captions toggle
│   ├── ConnectionRequest.jsx
│   ├── IncomingCallAlert.jsx
│   ├── MessageInput.jsx       ← now controlled
│   ├── MessageList.jsx        ← bubbles + timestamps
│   ├── PeerToPeerMessaging.jsx  (wires everything together)
│   └── VideoSection.jsx       ← + caption overlay
├── hooks/
│   ├── useAI.js               ← new: Anthropic API helpers
│   ├── useConnection.js       ← now exposes activeConn
│   ├── useLiveCaptions.js     ← new: shared speech-to-text
│   ├── useMessaging.js        ← reuses one connection
│   ├── usePeer.js
│   ├── useSpeechRecognition.js ← rewritten, returns state
│   └── useVideoCall.js        ← fixed call lifecycle
└── PeerToPeerMessaging.css    ← + AI panel / bubble / caption styles
```

---

## Running it

```bash
npm install
npm start          # http://localhost:3000
```

To try the AI panel, open **✨ AI Assistant → Settings**, paste an Anthropic API
key from `console.anthropic.com`, and pick a model.

Open the app in two browser tabs / devices, share the IDs, connect, and you can
chat, call, caption and use the AI helpers.
