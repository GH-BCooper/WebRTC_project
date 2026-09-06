<div align="center">

# 🗂️ Version Five — **OfficeHours**

### 1:1 calls that remember what happened.

`v1` P2P chat + video ·  `v2` AI helpers + captions ·  `v3` multi‑page app + streaming chat
·  `v4` an agent, vision, screen sharing ·  **`v5` wrapped into a real product: OfficeHours + an AI scribe**

</div>

---

## 🧭 TL;DR

v1–v4 built a pile of capabilities: peer‑to‑peer chat & video, live captions, screen
sharing, a streaming assistant, a tool‑using agent, vision. All impressive, all
disconnected — a **demo of parts**, not a thing you'd use.

**v5 gives it a job.** Everything is now **OfficeHours**: a browser‑only platform for
the one‑to‑one conversations that matter most — mentoring, tutoring, client
consults, interviews — that **leaves a written record behind every time.**

| | |
| --- | --- |
| 🕳️ **The problem** | 1:1s are where the value is *and* where knowledge leaks fastest. Big tools need accounts + installs and still hand you nothing when the call ends. |
| 💡 **The wrapper** | Plan a **session** (topic + agenda) → share one link → talk peer‑to‑peer → **Claude writes the recap** (summary, action items, follow‑up message) → it's saved to your session history. |
| ✅ **Every old feature now has a role** | Video/screen share = the session · captions = accessibility in the room · chat = the transcript the recap is built from · Assistant/Agent/Vision = prep & follow‑up toolkit. |

Still **no backend**. Still **100% browser**. Sessions, recaps and your Anthropic key
live only in `localStorage`.

---

## 🗺️ Routes

| Route | Page | What's there |
| --- | --- | --- |
| `/` | **Home** | Rewritten as a product landing — the problem, the six things a room does, a 3‑step "how it works", the AI toolkit. |
| `/sessions` | 🆕 **Sessions** | The OfficeHours dashboard: a "New session" form (topic · agenda · your name) and the list of every past session with its saved recap. |
| `/meet` | **Meet / Room** | The P2P room. `?s=<id>` opens it *for a session* — shows the topic banner, pre‑fills your name, and adds the recap panel. `?peer=<id>` still works for a quick room. |
| `/assistant` | **Assistant** | Streaming chat — unchanged (prep talking points). |
| `/agent` | **Agent** | Tool‑use loop — unchanged. |
| `/vision` | **Vision** | Image understanding — unchanged. |
| `/about` | **About** | Rewritten around OfficeHours: why it exists, how a session works, the tech, the privacy note. |

---

## 📝 The headline: an **AI session recap**

When a room is opened from a session, a **📝 Session recap** panel sits under the
chat. One click sends Claude three things — the **topic**, the **agenda** and the
**chat transcript** — and it returns a short record in Markdown:

```
## Summary            → 3–5 bullets of what was discussed / decided
## Action items       → a - [ ] checklist, with an owner where it's clear
## Follow-up message  → 2–4 sentences the host can send afterward
```

- **Copy** grabs the raw Markdown.
- **Save to session history** writes the recap back onto the session and flips its
  badge to `recap ready`, so you can re‑read it any time from `/sessions`.
- Works **during** the call too (not just after) — the panel is mounted the whole
  time the transcript exists.

Implementation: `useAI.sessionRecap(context)` — one non‑streaming
`client.messages.create` with a scribe system prompt. `src/components/SessionRecap.jsx`
builds the context blob and renders the result with the existing tiny Markdown renderer.

---

## 🗂️ Sessions — the store

`src/lib/sessions.js` is a ~70‑line `localStorage` wrapper. A session is:

```js
{ id, topic, agenda, hostName, createdAt, status, recap, actions }
//  status: "planned" → "done"
```

`listSessions · getSession · createSession · updateSession · deleteSession · sessionLink`.
It fires a `sessions-change` event so the dashboard live‑refreshes. The room link is
`…/meet?s=<id>`; when the host copies the invite it becomes `…/meet?s=<id>&peer=<hostPeerId>`
so the guest lands with both the session **and** the ID to connect to.

---

## 🎨 Design

Reuses the v4 aurora palette and tokens — no visual reset, just new pieces:

- **Problem band** on the home page — a gradient callout in `--accent-3` / `--accent`.
- **Numbered steps** with gradient number bubbles.
- **Session cards** with a `planned` / `recap ready` status badge (green when done).
- **`.session-form`** — first real `<textarea>` in the app, themed to match inputs.
- **Room topic banner** — accent‑tinted, shows the session topic + agenda at the top of the room.
- **Recap panel** — cyan‑edged card under the chat.

---

## 🧹 Cleanup & 🐛 fixes

| Fix / cleanup | Detail |
| --- | --- |
| **Nav had a "Home" link** | Dropped — the brand wordmark is the home link. Brand is now **OfficeHours**. |
| **Typing line grammar** | `"Sam are typing…"` → `"Sam is typing…"` (falls back to "They are typing…" with no name). |
| **Landing had no purpose** | The old home page listed features with nothing tying them together; it's now a problem → solution pitch. |
| **`README` + `About`** | Both rewritten around what the project *is* now, not just what APIs it touches. |
| **No new dependencies** | v5 uses only `@anthropic-ai/sdk`, `peerjs`, `react`, `react-router-dom` — same as v4. |
| **Build** | `CI=1 npm run build` passes with zero ESLint warnings. |

### Known limitations (on purpose, for a learning demo)

- **The recap is the host's.** The guest's browser has its own transcript; there's no shared store, so only the person who clicks *Generate* gets a recap. A real version would sync it.
- Sessions live in one browser — clear site data and they're gone.
- Anthropic key still runs in the browser (`dangerouslyAllowBrowser`).
- Everything from v4 still applies: one `SpeechRecognition` at a time, screen share replaces the camera track, no TURN server, leaving `/meet` drops the peer connection.

---

## 🧱 Tech stack (v5)

**Frontend** — React 18 · React Router 7 · plain CSS custom properties (CRA / `react-scripts` 5)
**Real‑time** — WebRTC + PeerJS (one data channel: chat, typing, captions; media for video; `getDisplayMedia` for screen)
**AI** — `@anthropic-ai/sdk`: streaming chat · tool‑use loop · vision · **session recap**
**State** — `localStorage` only: Peer ID, theme, API key, agent notes, **sessions + recaps**
**Models** — `claude-opus-5` (default) · `claude-sonnet-5` · `claude-haiku-4-5`

### What changed on disk

```
src/
├── components/
│   ├── App.jsx              ← + /sessions route
│   ├── NavBar.jsx           ← brand → OfficeHours, + Sessions, − Home
│   ├── PeerToPeerMessaging.jsx  ← + session prop, topic banner, recap panel, typing fix
│   └── SessionRecap.jsx     🆕 AI recap panel (summary · action items · follow-up)
├── pages/
│   ├── Home.jsx             ← rewritten: problem → solution → how it works
│   ├── Sessions.jsx         🆕 plan a session + session history dashboard
│   ├── Meet.jsx             ← reads ?s=<id>, loads the session
│   └── About.jsx            ← rewritten around OfficeHours
├── hooks/
│   └── useAI.js             ← + sessionRecap()
├── lib/
│   └── sessions.js          🆕 localStorage session store
└── App.css                  ← + problem band, steps, session dashboard, recap, room topic
```

---

## ▶️ Try it

```bash
npm install
npm start          # http://localhost:3000
npm run build      # production build (Vercel runs this)
```

1. **Plan** — go to **Sessions**, add a topic like *"Portfolio review with Sam"* and a one‑line agenda. Create it.
2. **Share** — hit **Copy invite link** and open it in a second tab (that's your "guest").
3. **Connect** — accept the request, start a video call, share your screen, chat a few lines.
4. **Recap** — open **Settings** in the 📝 panel, paste an Anthropic key, click **Generate recap**, then **Save to session history**.
5. Back on **Sessions**, the card now says `recap ready` — click **Show recap**.

<div align="center">

Made with ❤️ by Brett Cooper · a learning project

</div>
