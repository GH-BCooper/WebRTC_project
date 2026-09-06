// OfficeHours session store.
//
// A "session" is one planned 1:1 meeting: a topic, an agenda, and — once the
// call is done — an AI-written recap + action items. Everything lives in this
// browser's localStorage (no backend), same as the Peer ID and the API key.

const STORAGE_KEY = "officeHoursSessions";

// Read / Write helpers
function readAll() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAll(sessions) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  window.dispatchEvent(new CustomEvent("sessions-change"));
}

// Short id for a session (used in the invite link as ?s=<id>).
function makeId() {
  return Math.random().toString(36).slice(2, 8);
}

// List every session, newest first.
export function listSessions() {
  return readAll().sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
}

export function getSession(id) {
  return readAll().find((session) => session.id === id) || null;
}

// Create a new session from the "New session" form.
export function createSession({ topic, agenda, hostName }) {
  const session = {
    id: makeId(),
    topic: (topic || "").trim() || "Untitled session",
    agenda: (agenda || "").trim(),
    hostName: (hostName || "").trim(),
    createdAt: Date.now(),
    status: "planned", // planned -> done
    recap: "",
    actions: "",
  };
  writeAll([session, ...readAll()]);
  return session;
}

// Merge fields into an existing session (recap, status, …).
export function updateSession(id, patch) {
  const next = readAll().map((session) =>
    session.id === id ? { ...session, ...patch } : session,
  );
  writeAll(next);
  return next.find((session) => session.id === id) || null;
}

export function deleteSession(id) {
  writeAll(readAll().filter((session) => session.id !== id));
}

// Build the shareable room link for a session.
export function sessionLink(session) {
  return `${window.location.origin}/meet?s=${session.id}`;
}
