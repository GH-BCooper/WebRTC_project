# 📹 Peer-to-Peer Video Meeting

A real-time peer-to-peer video calling and messaging web app built with **React** and **WebRTC** (via PeerJS). No backend server required for the actual call — just a direct browser-to-browser connection.

🔗 **Live Demo:** [horusknox.github.io/peertopeervideomeeting](https://horusknox.github.io/peertopeervideomeeting/)

---

## ✨ Features

- 🎥 **Real-time video calling** — peer-to-peer, no server in the middle
- 💬 **Text messaging** — send messages directly to the other peer
- 🎤 **Speech-to-text** — speak your message instead of typing (Chrome only)
- 🔒 **Persistent ID** — your unique ID is saved in localStorage across sessions

---

## 🛠️ Tech Stack

| Technology : Purpose |
| React 18 : UI framework |
| PeerJS : Simplifies WebRTC peer-to-peer connections |
| WebRTC : Browser-to-browser video/audio/data streaming |
| Web Speech API : Voice-to-text input |
| GitHub Pages : Deployment |

---

## 📁 Project Structure

```
src/
├── components/
│   ├── PeerToPeerMessaging.jsx   # Parent component — holds all state
│   ├── CallControls.jsx          # Start/Stop video call buttons
│   ├── VideoSection.jsx          # Local + remote video display
│   ├── MessageInput.jsx          # Text input + speech recognition
│   └── MessageList.jsx           # Incoming + outgoing messages
│
└── hooks/
    ├── usePeer.js                # PeerJS setup and connection logic
    ├── useVideoCall.js           # Video call start/stop logic
    ├── useMessaging.js           # Send/receive messages logic
    └── useSpeechRecognition.js   # Voice-to-text logic
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v14 or higher)
- npm

### Installation

```bash
# Clone the repository
git clone https://github.com/horusknox/peertopeervideomeeting.git

# Navigate into the project
cd peertopeervideomeeting

# Install dependencies
npm install

# Start the development server
npm start
```

The app will open at `http://localhost:3000`

---

## 🧪 Testing Locally (Two Users)

Since this is a peer-to-peer app, you need to simulate two users:

1. Open `http://localhost:3000` in **Chrome**
2. Open `http://localhost:3000` in a **Chrome Incognito window** (`Ctrl+Shift+N`)
3. Copy the **Your ID** shown in Window 1
4. Paste it into the **Other Party's ID** field in Window 2
5. Click **Start Video Call** or send a message!

---

## 📦 Deployment

This app is deployed to GitHub Pages.

```bash
# Build and deploy
npm run deploy
```

---

## ⚠️ Known Limitations

- Speech recognition only works in **Chrome** (uses `webkitSpeechRecognition`)
- Both users need to be online at the same time
- PeerJS uses a public signaling server by default — not recommended for production

---

## 📖 How It Works

WebRTC normally requires a **signaling server** to help two peers find each other. PeerJS handles this with its own cloud signaling server. Once the connection is established, all video, audio, and data flows **directly between browsers** — no server in the middle.

```
Step 1: Both users get a unique ID (via PeerJS signaling server)
Step 2: User A shares their ID with User B
Step 3: User B enters User A's ID and calls them
Step 4: Direct peer-to-peer connection established 🎉
Step 5: Video, audio, and messages flow directly between browsers
```

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).