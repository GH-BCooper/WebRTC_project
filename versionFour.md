<div align="center">

# 🎇 Version Four — Three kinds of AI

**Streaming chat · a tool‑using agent · image understanding — on top of the peer‑to‑peer core.**

`v1` P2P chat + video ·  `v2` AI helpers + captions ·  `v3` multi‑page app + streaming chat
·  **`v4` an agent, vision, screen sharing, and a colourful redesign**

</div>

---

## 🧭 TL;DR

| Area | What changed in v4 |
| --- | --- |
| 🤖 **New AI capability** | **`/agent`** — an *agentic tool‑use loop*. Claude calls real browser tools and you watch every step. |
| 🖼️ **New AI modality** | **`/vision`** — drop in an image, ask Claude about it (describe, read text, caption, style). |
| ✨ **Assistant upgraded** | Personas, saved history, **Stop** button, image attachments, quick prompts, token usage, Markdown rendering. |
| 🖥️ **Meet upgraded** | **Screen sharing** during a call (`getDisplayMedia` + `replaceTrack`). |
| 💬 **Chat AI upgraded** | New **Action items** helper (turns a conversation into a checklist). |
| 🎨 **Redesign** | New gradient/aurora theme, colourful feature cards, responsive nav with a mobile menu, tidy page headers. |
| 🧹 **Cleanup + fixes** | Theme now syncs across the app, quieter PeerJS logs, stale‑name bug fixed, dead branches removed. |

Still **no backend**. Still **100% browser**. Your Anthropic key lives only in `localStorage`.

---

## 🗺️ Routes

| Route | Page | What's there |
| --- | --- | --- |
| `/` | **Home** | Redesigned landing page — aurora hero, six gradient feature cards, links to the three AI playgrounds. |
| `/meet` | **Meet** | P2P chat + video. **+ screen sharing**, invite links, typing indicator, captions, notification alerts. |
| `/assistant` | **Assistant** | Streaming chat with Claude — **+ personas, saved history, stop, image attach, quick prompts, usage**. |
| `/agent` | 🆕 **Agent** | Claude with browser tools. Live view of the *think → call tool → read result → answer* loop, plus a notepad. |
| `/vision` | 🆕 **Vision** | Upload / drag‑drop an image and ask questions about it. |
| `/about` | **About** | How a call works, the three kinds of AI, tech list, privacy note. |
| `*` | — | Anything else redirects to `/`. |

---

## 🤖 The headline: a tool‑using AI **Agent** (`/agent`)

The first three versions only ever asked Claude for **text** (one‑shot, then streaming). v4 adds a
genuinely different capability: **tool use**. Claude is given a set of tools, decides which to
call, we run them **in the browser**, feed the results back, and loop until it's done.

```
you ─▶ Claude ─▶ "call calculate({expression:'145*12-890'})"
          │
   browser runs the tool ─▶ { result: 850 }
          │
      Claude ─▶ "call save_note({text:'145*12-890 = 850'})" ─▶ { saved: … }
          │
      Claude ─▶ "Done — 850, and I saved it to your notes."
```

Every step is rendered as a card so you can *see* the loop (great for learning how agents work).

### 🔧 The tools (`src/lib/agentTools.js`)

| Tool | Does |
| --- | --- |
| `get_datetime` | Current local date / time / timezone. |
| `calculate` | Safe arithmetic (`+ - * / % ( )` only). |
| `set_theme` | Flips the app between dark / light (and the nav stays in sync). |
| `make_invite_link` | Builds a `…/meet?peer=<id>` link from your saved Peer ID. |
| `save_note` / `list_notes` | A tiny notepad persisted in `localStorage`; notes show in a side panel. |
| `pick_random` | Picks one option from a list — tie‑breaker. |

All tools are local, reversible and secret‑free. The loop is capped at **6 steps**.

Implementation: `useAI.runAgent()` — a plain `for` loop around `client.messages.create({ tools })`,
appending `tool_result` blocks until `stop_reason !== "tool_use"`.

---

## 🖼️ New modality: **Vision** (`/vision`)

Click or drag‑drop an image → optionally type a question → Claude answers.
Presets: *describe · extract text · mood/style · caption ideas*.

- `useAI.describeImage(dataUrl, question)` sends a base64 `image` content block.
- The image never touches a server — it goes straight from your browser to Anthropic.

The **Assistant** page reuses the same idea: 📎 attaches an image to your next message.

---

## ✨ Assistant upgrades (`/assistant`)

| Feature | Detail |
| --- | --- |
| 🎭 **Personas** | Helpful · Coding tutor · Brainstorm partner · Concise expert · Socratic teacher — each a different system prompt. |
| 💾 **Saved history** | Conversation persists to `localStorage` (`assistantHistory`); **🗑 Clear chat** wipes it. |
| ⏹ **Stop** | An `AbortController` cancels a streaming reply mid‑sentence. |
| 📎 **Image attach** | Ask about a screenshot without leaving the chat. |
| ⚡ **Quick prompts** | Starter chips on the empty state. |
| 🔢 **Token usage** | Shows `in / out` tokens from the last response. |
| 📝 **Markdown** | Replies render bold / lists / headings / code via a tiny safe renderer (`src/lib/markdown.js`). |

---

## 🖥️ Meet upgrade: screen sharing

During a call, **Share Screen 🖥️** swaps your outgoing video track for a `getDisplayMedia`
stream using `RTCRtpSender.replaceTrack` — no renegotiation, no reconnect. Stopping the share
(button or the browser's own bar) swaps your camera back in.

> ⚠️ Basic on purpose: it replaces the single video track, so the other side sees your screen
> *instead of* your camera, not alongside it.

---

## 🎨 Redesign

- **Aurora background** — layered radial gradients in `--accent` / `--accent-2` / `--accent-3`
  (violet / cyan / pink), tuned for both themes.
- **Gradient buttons**, glowing brand dot, gradient wordmark.
- **Feature cards** with soft coloured glows; **AI‑route cards** on the home page.
- **Responsive navbar** with a ☰ menu under 720px.
- **Page headers** — small uppercase "kicker" label + title on every inner page.
- New shared bits: `.chip`, `.ai-toolbar`, `.md`, `.tool-call`, `.dropzone`.

---

## 🧹 Cleanup & 🐛 fixes

| Fix / cleanup | Detail |
| --- | --- |
| **Theme was one‑way** | `set_theme` (agent) or a second tab could desync the toggle. `useTheme` now listens for a `theme-change` event. |
| **Stale name in alert** | "X rejected your call" used a stale closure value; now reads the `recipientNameRef`. |
| **Noisy console** | PeerJS `debug` lowered from `2` to `1`. |
| **Removed** | Nothing new added to `package.json` — v4 uses only what was already there (`@anthropic-ai/sdk`, `peerjs`, `react`, `react-router-dom`). No new deps. |
| **Kept simple** | The agent loop, markdown renderer and tools are all short, dependency‑free and readable. |

### Known limitations (unchanged / on purpose)

- Anthropic key lives in the browser (`dangerouslyAllowBrowser`) — demo only.
- Screen share replaces the camera track (see note above).
- One `SpeechRecognition` at a time → captions and mic dictation don't run together.
- Speech features: Chrome / Edge / Brave only.
- No TURN server, so two strict NATs can still fail to connect.
- Leaving `/meet` unmounts the peer connection.
- The redesign uses CSS `color-mix()` (modern Chromium / Firefox / Safari).

---

## 🧱 Tech stack (v4)

**Frontend** — React 18 · React Router 7 · plain CSS with custom properties (CRA / `react-scripts` 5)
**Real‑time** — WebRTC + PeerJS (one data channel: chat, typing, captions; media for video; `getDisplayMedia` for screen)
**AI** — `@anthropic-ai/sdk`: non‑streaming helpers · **streaming** chat · **tool use** loop · **vision**
**Models** — `claude-opus-5` (default) · `claude-sonnet-5` · `claude-haiku-4-5`
**Browser APIs** — MediaDevices, getDisplayMedia, SpeechRecognition, Web Audio, Clipboard, Page Visibility, localStorage, FileReader

### Project layout

```
src/
├── components/
│   ├── App.jsx              ← router (+ /agent, /vision)
│   ├── NavBar.jsx           ← + mobile menu, gradient brand
│   ├── AISettings.jsx       ← + persona picker (optional)
│   ├── AIPanel.jsx          ← + "Action items"
│   ├── CallControls.jsx     ← + Share Screen
│   ├── ConnectionRequest.jsx
│   ├── IncomingCallAlert.jsx
│   ├── MessageInput.jsx
│   ├── MessageList.jsx
│   ├── PeerToPeerMessaging.jsx
│   ├── PeerToPeerMessaging.css  ← new aurora palette + tokens
│   └── VideoSection.jsx
├── pages/
│   ├── Home.jsx             ← redesigned
│   ├── Meet.jsx
│   ├── Assistant.jsx        ← personas, history, stop, vision, usage
│   ├── Agent.jsx            🆕 agentic tool-use loop
│   ├── Vision.jsx           🆕 image understanding
│   └── About.jsx            ← updated
├── hooks/
│   ├── useAI.js             ← + runAgent, describeImage, personas, abort, usage, actionItems
│   ├── useTheme.js          ← + theme-change sync
│   ├── useVideoCall.js      ← + screen sharing
│   ├── useConnection.js     ← stale-name fix
│   ├── useMessaging.js
│   ├── usePeer.js           ← quieter debug
│   ├── useSpeechRecognition.js
│   └── useLiveCaptions.js
├── lib/
│   ├── sound.js
│   ├── markdown.js          🆕 tiny safe Markdown → HTML
│   └── agentTools.js        🆕 tool schemas + browser runners
├── App.css                  ← big colourful refresh
├── index.css
└── index.js
```

---

## ▶️ Running it

```bash
npm install
npm start          # http://localhost:3000
npm run build      # production build (Vercel runs this)
```

1. **Meet** — open two tabs, copy the invite link from one into the other, connect, call, share your screen.
2. **Assistant / Agent / Vision** — open **Settings**, paste an Anthropic key from `console.anthropic.com`, pick a model.
3. On **Agent**, try: *"What time is it, and how many days until New Year? Save the answer as a note."*

<div align="center">

Made with ❤️ by Brett Cooper · a learning project

</div>
