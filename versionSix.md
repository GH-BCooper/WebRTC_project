<div align="center">

# 📱 Version Six — **Mobile, and a pipeline you can trust**

### The whole app, end to end, now looks and works right on a phone.

`v1` P2P chat + video · `v2` AI helpers + captions · `v3` multi‑page app + streaming chat
· `v4` an agent, vision, screen sharing · `v5` the OfficeHours product wrapper + AI scribe
· **`v6` a real mobile view + an automated smoke test of every route**

</div>

---

## 🧭 TL;DR

v5 shipped the product. It looked great on a laptop and **fell apart on a phone** —
oversized headings running off-screen, the settings panel stretching to 200px‑tall
empty boxes, the floating theme button sitting on top of the Send button, the API‑key
field showing raw browser chrome.

**v6 fixes all of it** and adds the first automated test:

| | |
| --- | --- |
| 📱 **Mobile view** | Every page, every state, every AI response — no horizontal scroll anywhere, real 44px tap targets, headings that wrap, controls that stack cleanly. Verified at 320 – 860px in **both themes**. |
| 🧪 **Smoke test** | `npm test` mounts all 7 routes + the navbar, round‑trips the session store, runs every agent tool, and checks the Markdown renderer escapes HTML. 5 tests, ~2s. |
| 🐛 **Fixes found on the way** | password/search inputs were unthemed; `.ai-settings-row` collapsed wrong on mobile; the floating theme toggle overlapped inputs; `- [ ]` recap checklists rendered as literal `[ ]` text. |

Still **no backend**, still **no new dependencies**.

---

## 📱 What "mobile view" actually means here

### Breakpoints

| Width | What changes |
| --- | --- |
| **≤ 860px** | Nav collapses to a ☰ burger; the theme toggle moves *into* the menu as a "☀ Light mode" row (no more floating button covering content). |
| **≤ 768px** | Tighter page padding, smaller headings, the room card gets side margins, chat logs switch to `dvh` heights so the keyboard doesn't bury them. |
| **≤ 640px** | Single column everywhere. Primary buttons go full‑width; chips, links and the burger stay inline. Call controls become an auto‑fit grid. Input rows put the text field on its own line with the action buttons sharing the next. Modals lose their fat padding and stack their buttons. |
| **≤ 380px** | A couple more size nudges for small phones; the call‑control grid drops to one column on its own. |

### The rules the layout follows now

- **Nothing is wider than the screen.** Every grid uses `minmax(min(100%, Npx), 1fr)`;
  every bubble, message and code block has `overflow-wrap: anywhere` and `min-width: 0`;
  AI code blocks scroll *inside their own box*, never the page.
- **Tap targets are real.** Menu rows, buttons and inputs are ≥ 44px tall; inputs stay
  at 16px font so iOS doesn't zoom on focus.
- **The AI output is first‑class on mobile** — the streaming chat, the agent's tool‑call
  cards, the recap Markdown and the Vision answer all wrap and read cleanly in a 360px column.

### 🎨 Design touches

- **Nav menu** is now a proper stacked sheet — each link a full‑width rounded row, the
  active one gradient‑filled, the theme switch as the last row.
- **Task lists render as real checkboxes.** The tiny Markdown renderer now turns
  `- [ ] follow up with Sam` into an actual (disabled) checkbox, so the recap's
  **Action items** section looks like a checklist instead of `[ ] follow up with Sam`.
- **All text‑like inputs are themed** — `password`, `email` and `search` join `text`,
  so the Anthropic API‑key field matches the rest of the app instead of showing a grey
  system box.

---

## 🧪 The smoke test

`src/smoke.test.js` — runs with `npm test` (which is now wired to
`react-scripts test --watchAll=false`).

```
✓ the whole app (router + navbar + theme toggle) mounts
✓ every route renders without throwing          (Home, Sessions, Meet,
                                                 Assistant, Agent, Vision, About)
✓ session store round-trips through localStorage (create → update → delete)
✓ agent tools all execute locally                (all 7 tools, + a rejected
                                                  "alert(1)" calculator input)
✓ markdown renderer: headings, task lists, code, links are safe
```

It's not a substitute for a real two‑browser call — it can't open a WebRTC connection
or hit the Anthropic API — but it exercises **routing, all nine hooks, the AI wrapper's
wiring, the session store and the Markdown renderer** on every commit, in ~2 seconds.

### Plumbing it needed (all standard CRA, no new deps)

- `src/setupTests.js` — `TextEncoder`/`TextDecoder` polyfill (CRA's bundled jsdom
  predates them; React Router 7 needs them) + `IS_REACT_ACT_ENVIRONMENT`.
- `package.json` → `jest.moduleNameMapper` — points `react-router/dom` at its real
  file (CRA's jest resolver doesn't read the package's `exports` map).

---

## ✅ End‑to‑end check that *was* run

| Layer | Result |
| --- | --- |
| **Production build** | `CI=1 npm run build` — compiles clean, **zero ESLint warnings**. |
| **Every route** | All 7 render without throwing (smoke test) and serve a 200 from the static build. |
| **Session pipeline** | `createSession → updateSession(recap) → listSessions → deleteSession` round‑trips through `localStorage`. |
| **Agent tool loop** | Each of the 7 browser tools executes; the calculator rejects non‑arithmetic input. |
| **Markdown / recap rendering** | Headings, task lists, fenced code and links render; `<script>` is escaped. |
| **Mobile layout** | 7 routes × {idle, ready} states × {dark, light}, 320–860px — `scrollWidth === innerWidth`, zero overflow, screenshotted via headless Chrome + CDP. |

### What still needs a human + two browsers + a funded key

The live WebRTC handshake, camera/mic capture, screen share, live captions and real
streaming Claude responses — same manual test as always:

1. **Sessions** → new session → **Copy invite link** → open in a second tab.
2. Accept the request, start the video call, share a screen, send a few chat lines.
3. **📝 Session recap** → paste an Anthropic key → **Generate recap** → **Save to session history**.

---

## 🧱 What changed on disk

```
src/
├── components/
│   ├── NavBar.jsx                  ← theme toggle also rendered as a menu row (mobile)
│   └── PeerToPeerMessaging.css     ← password/email/search inputs themed; overflow
│                                     guards; room + shared mobile rules (loads last,
│                                     so cross-file cascade fixes live here)
├── lib/
│   └── markdown.js                 ← "- [ ] " / "- [x] " → real checkboxes
├── App.css                         ← full mobile section: nav sheet, single-column
│                                     grids, full-width CTAs, dvh chat logs, dashboard
│                                     + recap tuning
├── setupTests.js                   🆕 jsdom polyfills for the test run
└── smoke.test.js                   🆕 the end-to-end smoke test

package.json                        ← "test" script + jest.moduleNameMapper
```

---

## ▶️ Try it

```bash
npm install
npm start                    # http://localhost:3000 — resize to a phone width
npm test                     # the smoke test (~2s)
npm run build                # production build (Vercel runs this)
```

<div align="center">

Made with ❤️ by Brett Cooper · a learning project

</div>
