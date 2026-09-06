# Version Three — Multi-page app + more AI

v3 turns the single screen into a small **multi-page React app** (React Router),
adds a **standalone AI chat**, and layers in the quality-of-life features that a
real chat app has: invite links, a typing indicator, and notification alerts.

Still no backend. Still 100% browser. See [versionTwo.md](versionTwo.md) for the
v2 AI assistant and bug fixes this builds on.

---

## New: pages & routing

`react-router-dom` (v7, library mode) with a sticky top nav:

| Route | Page | What's there |
| --- | --- | --- |
| `/` | **Home** | Landing page — pitch, feature grid, "Start a meeting" / "Try the AI assistant" buttons. |
| `/meet` | **Meet** | The peer-to-peer chat + video interface (everything from v1/v2). |
| `/assistant` | **AI Assistant** | A direct, streaming chat with Claude — separate from the P2P chat. |
| `/about` | **About** | How a call works, tech list, privacy note. |
| `*` | — | Anything else redirects to `/`. |

- `src/components/App.jsx` is now the router; pages live in `src/pages/`.
- `src/components/NavBar.jsx` holds the nav + the global theme toggle (theme was
  moved out of the meeting screen into `src/hooks/useTheme.js` so it works on
  every page).
- `vercel.json` adds a SPA rewrite so deep links like `/meet` work on refresh.

## New AI feature: streaming Assistant page (`src/pages/Assistant.jsx`)

A normal chat box that talks to Claude with **token streaming** — the reply types
itself out live. Uses `client.messages.stream(...)` + `stream.on("text", …)` in
`useAI.chatStream`. Shares the same API key / model as the Meet page (both use
the `useAI` hook and the shared `src/components/AISettings.jsx`).

## New (no AI): chat quality-of-life

| Feature | How it works |
| --- | --- |
| **Invite links** | On the Meet page, "Copy invite link 🔗" copies `…/meet?peer=<yourID>`. Opening that link pre-fills the recipient's ID (`useSearchParams` → `initialRecipientId`). Plus a "Copy ID" button. |
| **Typing indicator** | Each keystroke sends `{ type: "typing" }` over the data channel; the other side shows "… is typing…" and auto-clears after 3s. |
| **Notification sound** | A short Web Audio beep (`src/lib/sound.js`, no audio file) when a message arrives while the tab is hidden. |
| **Unread tab badge** | The browser tab title shows "💬 New message…" while you're away, and resets on focus. |

---

## Cleanup / removed

Kept the dependency list to what's actually imported:

- **Removed** `@testing-library/*` and `web-vitals` (no tests, never imported),
  `gh-pages` + the `predeploy`/`deploy`/`test`/`eject` scripts (deploys on
  Vercel now), and the `react-app/jest` ESLint preset.
- Inlined the duplicated AI-settings markup into one `AISettings` component
  (used by both the panel and the Assistant page).
- Theme logic pulled out of `PeerToPeerMessaging` into `useTheme`; the meeting
  screen no longer owns global concerns.
- Body layout fixed so the sticky navbar sits above centered page content
  (was a full-page flex-center that fought the navbar).

## Bug fixes

| Fix | Detail |
| --- | --- |
| **Deep-link refresh 404 on Vercel** | Added `vercel.json` rewrite to `index.html`. |
| **Theme only worked on the meeting screen** | Now applied to `<html>` globally from the navbar. |
| **List bullets missing on content pages** | The meeting CSS `ul { list-style: none }` leaked; scoped a `list-style: revert` for `.page`. |
| **Stale tab title** | Title now always resets to the app name on focus and on unmount. |

### Known limitations (unchanged / on purpose)

- Leaving `/meet` unmounts the peer connection — navigating away ends your
  session (fine for a demo; your Peer ID is stable so you can reconnect).
- One `SpeechRecognition` at a time → live captions and mic dictation don't run
  together.
- Speech features: Chrome / Edge / Brave only.
- Anthropic key lives in the browser — demo only, not production.
- Still no TURN server, so calls between two strict NATs can fail.
- Screen sharing and group calls are still future work.

---

## Tech stack (v3)

### Frontend
- **React 18** + **React Router 7** (Create React App / `react-scripts` 5)
- Plain **CSS** with custom properties; dark/light theme on `<html>`

### Real-time
- **WebRTC** + **PeerJS** — one data connection carries chat, typing, captions;
  media streams for video

### AI
- **`@anthropic-ai/sdk`** — non-streaming helpers (summary, replies, rewrite,
  translate) and a **streaming** chat on the Assistant page
- Models: `claude-opus-5` (default) / `claude-sonnet-5` / `claude-haiku-4-5`

### Browser APIs
- MediaDevices (`getUserMedia`), SpeechRecognition, Web Audio (beep),
  Clipboard (`navigator.clipboard`), Page Visibility (`document.hidden`),
  localStorage

### Project layout

```
src/
├── components/
│   ├── App.jsx              ← router
│   ├── NavBar.jsx           ← new: nav + theme toggle
│   ├── AISettings.jsx       ← new: shared API key + model UI
│   ├── AIPanel.jsx
│   ├── CallControls.jsx
│   ├── ConnectionRequest.jsx
│   ├── IncomingCallAlert.jsx
│   ├── MessageInput.jsx
│   ├── MessageList.jsx
│   ├── PeerToPeerMessaging.jsx   ← + invite links, typing, alerts
│   └── VideoSection.jsx
├── pages/                   ← new
│   ├── Home.jsx
│   ├── Meet.jsx
│   ├── Assistant.jsx        ← streaming AI chat
│   └── About.jsx
├── hooks/
│   ├── useAI.js             ← + chatStream (streaming)
│   ├── useTheme.js          ← new
│   ├── useConnection.js
│   ├── useLiveCaptions.js
│   ├── useMessaging.js      ← + typing indicator
│   ├── usePeer.js
│   ├── useSpeechRecognition.js
│   └── useVideoCall.js
├── lib/
│   └── sound.js             ← new: notification beep
├── App.css                  ← + navbar / pages / assistant styles
├── index.css
├── index.js
└── components/PeerToPeerMessaging.css
```

---

## Running it

```bash
npm install
npm start          # http://localhost:3000
npm run build      # production build (Vercel runs this)
```

Open two tabs, go to **Meet**, copy the invite link from one into the other, and
connect. For the AI pages, open **AI Assistant → Settings** and paste an
Anthropic API key from `console.anthropic.com`.
