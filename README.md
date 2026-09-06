# OfficeHours — 1:1 calls that remember what happened

> **Version 5 is here.** See [versionFive.md](versionFive.md) — the whole project
> is now wrapped in **OfficeHours**, a browser-only platform for one-to-one
> sessions (mentoring, tutoring, consults, interviews) with an **AI scribe**:
> plan a session, share a link, talk peer-to-peer, and get an AI-written
> **recap + action items** saved to your session history.
> [versionFour.md](versionFour.md) added the tool-using agent, vision and screen
> sharing; [versionThree.md](versionThree.md) multi-page routing + streaming chat;
> [versionTwo.md](versionTwo.md) the earlier AI assistant and bug fixes.

A real-time peer-to-peer communication platform built with React, WebRTC and PeerJS,
with Claude layered on top as a meeting scribe plus three AI playgrounds.

**The problem it solves:** the most valuable conversations are one-to-one, and they
vanish the fastest — no transcript, no decisions captured, no follow-up. OfficeHours
is the smallest tool that fixes that: a room you share with a link, and an AI recap.

Two users connect directly using unique Peer IDs and communicate through:

* A planned **session** (topic + agenda) with a shareable room link
* Real-time text messaging
* Video calling + screen sharing
* Audio + camera controls
* Speech-to-text messaging and shared live captions
* Connection request handling + incoming call alerts
* An **AI session recap** (summary, action items, follow-up message)
* An AI assistant, AI agent and image analysis

The application uses PeerJS on top of WebRTC to simplify peer-to-peer communication between browsers.

---

# Features

## Peer-to-Peer Communication

* Direct browser-to-browser communication
* Unique Peer ID generation
* Connection request system
* Accept/Reject connection handling
* Disconnect handling

## Messaging System

* Real-time messaging
* Incoming and outgoing message tracking
* Unified message history
* Speech-to-text message input

## Video Calling

* One-to-one video calls
* Incoming call alerts
* Accept/Reject video call requests
* Live video streaming
* Call disconnect handling

## Media Controls

* Mute/Unmute microphone
* Camera On/Off toggle
* Stop video call functionality

## User Experience

* Dynamic UI states
* Real-time alerts
* Automatic peer reconnection handling
* Clean component-based architecture

---

# Tech Stack

## Frontend

* React
* JavaScript
* CSS

## Communication Technologies

* WebRTC
* PeerJS

## Browser APIs

* MediaDevices API
* Speech Recognition API
* Local Storage API

---

# Project Structure

```bash
src/
│
├── components/
│   ├── App.jsx              # router
│   ├── NavBar.jsx
│   ├── AISettings.jsx
│   ├── AIPanel.jsx
│   ├── CallControls.jsx
│   ├── ConnectionRequest.jsx
│   ├── IncomingCallAlert.jsx
│   ├── MessageInput.jsx
│   ├── MessageList.jsx
│   ├── PeerToPeerMessaging.jsx
│   ├── PeerToPeerMessaging.css
│   ├── SessionRecap.jsx     # AI recap panel shown inside a room
│   └── VideoSection.jsx
│
├── pages/
│   ├── Home.jsx             # OfficeHours landing (problem → solution)
│   ├── Sessions.jsx         # dashboard: plan a session, session history
│   ├── Meet.jsx             # the room (?s=<id> loads a session)
│   ├── Assistant.jsx        # streaming chat (personas, history, vision)
│   ├── Agent.jsx            # agentic tool-use loop
│   ├── Vision.jsx           # image understanding
│   └── About.jsx
│
├── hooks/
│   ├── useAI.js             # streaming + tool use + vision + sessionRecap + helpers
│   ├── useTheme.js
│   ├── useConnection.js
│   ├── useLiveCaptions.js
│   ├── useMessaging.js
│   ├── usePeer.js
│   ├── useSpeechRecognition.js
│   └── useVideoCall.js      # + screen sharing
│
├── lib/
│   ├── sound.js
│   ├── markdown.js          # tiny safe Markdown renderer
│   ├── agentTools.js        # agent tool schemas + browser runners
│   └── sessions.js          # OfficeHours session store (localStorage)
│
├── App.css
├── index.css
└── index.js
```

---

# Installation

## Clone the Repository

```bash
git clone <your-repository-url>
```

## Navigate to the Project Folder

```bash
cd <project-folder>
```

## Install Dependencies

```bash
npm install
```

---

# Required Dependencies

Install PeerJS:

```bash
npm install peerjs
```

---

# Running the Project

## Start Development Server

```bash
npm start
```

The application will run on:

```bash
http://localhost:3000
```

---

# How It Works

## Step 1: Peer ID Generation

* Every user gets a unique Peer ID
* IDs are stored in localStorage
* Users share IDs to connect with others

## Step 2: Connection Request

* User enters recipient Peer ID
* Connection request is sent
* Recipient can accept or reject the request

## Step 3: Messaging

* Connected users can exchange messages instantly
* Messages appear in sequence with sender information

## Step 4: Video Calling

* Users can initiate video calls
* Incoming call popup appears for recipient
* Calls use WebRTC media streams

---

# Components Overview

## App.js

Main application wrapper component.

## PeerToPeerMessaging.js

Main communication interface handling:

* Peer connections
* Messaging
* Video calls
* Speech recognition
* UI state management

## CallControls.js

Handles:

* Start/stop calls
* Mute/unmute
* Camera toggle

## VideoSection.js

Displays:

* Local video stream
* Remote video stream

## MessageInput.js

Handles:

* Text input
* Speech-to-text controls
* Message sending

## MessageList.js

Displays:

* Incoming messages
* Outgoing messages

## ConnectionRequest.js

Displays incoming connection requests.

## IncomingCallAlert.js

Displays incoming video call requests.

---

# Custom Hooks Overview

## usePeer.js

Handles:

* PeerJS initialization
* Peer ID creation
* Incoming PeerJS calls

## useConnection.js

Handles:

* Connection requests
* Connection acceptance/rejection
* Connection state management
* Disconnect logic

## useMessaging.js

Handles:

* Sending messages
* Receiving messages
* Message history storage

## useVideoCall.js

Handles:

* Starting video calls
* Answering calls
* Ending calls
* Media stream management
* Mute/camera controls

## useSpeechRecognition.js

Handles:

* Browser speech recognition
* Speech-to-text conversion

---

# Browser Permissions Required

The application requires permission for:

* Camera access
* Microphone access
* Speech recognition access

---

# Browser Compatibility

Best supported browsers:

* Google Chrome
* Microsoft Edge
* Brave Browser

Speech recognition may not work properly in some browsers.

---

# Future Improvements

* Shared recap (both participants get it, not just the host)
* Server-side session store + auth (so sessions survive a cleared browser)
* Calendar / scheduling with reminders
* Group video calls
* File sharing over the data channel
* TURN server for calls behind strict NATs
* Server-side proxy for the AI key (so it isn't in the browser)

Done in v2/v3/v4/v5: dark/light theme, chat timestamps, typing indicators,
live captions, AI assistant, multi-page routing, invite links, streaming chat,
a tool-using AI agent, image understanding (vision), screen sharing,
**the OfficeHours session wrapper + AI recap**.

---

# Author

Made with ❤️ by Brett Cooper

---

# License

This project is currently for learning and development purposes.