# WebRTC using PeerJS

A real-time peer-to-peer communication application built using React, WebRTC, and PeerJS.

This project allows two users to connect directly using unique Peer IDs and communicate through:

* Real-time text messaging
* Video calling
* Audio controls
* Camera controls
* Speech-to-text messaging
* Connection request handling
* Incoming call alerts

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
│   ├── App.js
│   ├── CallControls.js
│   ├── ConnectionRequest.js
│   ├── IncomingCallAlert.js
│   ├── MessageInput.js
│   ├── MessageList.js
│   ├── PeerToPeerMessaging.js
│   └── VideoSection.js
│
├── hooks/
│   ├── useConnection.js
│   ├── useMessaging.js
│   ├── usePeer.js
│   ├── useSpeechRecognition.js
│   └── useVideoCall.js
│
├── App.css
├── index.css
├── index.js
└── PeerToPeerMessaging.css
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

* Group video calls
* File sharing
* Screen sharing
* Better mobile responsiveness
* Chat timestamps UI
* Typing indicators
* Authentication system
* End-to-end encryption enhancements
* Dark/Light theme

---

# Author

Made with ❤️ by Brett Cooper

---

# License

This project is currently for learning and development purposes.