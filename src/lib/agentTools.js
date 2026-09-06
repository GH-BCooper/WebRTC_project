// Browser-side tools the AI agent (/agent page) is allowed to call.
//
// Each tool has a JSON schema (sent to Claude) and a runner (executed here in
// the browser when Claude asks for it). Everything is local and reversible —
// no network, no secrets.

const NOTES_KEY = "agentNotes";

function readNotes() {
  try {
    return JSON.parse(localStorage.getItem(NOTES_KEY) || "[]");
  } catch {
    return [];
  }
}

function writeNotes(notes) {
  localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
}

export function getNotes() {
  return readNotes();
}

export function clearNotes() {
  writeNotes([]);
}

// Tool schemas (Anthropic tool-use format)
export const TOOL_SCHEMAS = [
  {
    name: "get_datetime",
    description: "Get the user's current local date and time.",
    input_schema: { type: "object", properties: {}, required: [] },
  },
  {
    name: "calculate",
    description:
      "Evaluate a basic arithmetic expression. Supports + - * / % ( ) and decimals only.",
    input_schema: {
      type: "object",
      properties: {
        expression: { type: "string", description: "e.g. (12 + 5) * 3" },
      },
      required: ["expression"],
    },
  },
  {
    name: "set_theme",
    description: "Switch the app's colour theme.",
    input_schema: {
      type: "object",
      properties: { mode: { type: "string", enum: ["dark", "light"] } },
      required: ["mode"],
    },
  },
  {
    name: "make_invite_link",
    description:
      "Create a shareable WebRTC invite link for the user's saved Peer ID so someone can join their meeting.",
    input_schema: { type: "object", properties: {}, required: [] },
  },
  {
    name: "save_note",
    description: "Save a short note for the user. Notes persist in this browser.",
    input_schema: {
      type: "object",
      properties: { text: { type: "string" } },
      required: ["text"],
    },
  },
  {
    name: "list_notes",
    description: "List every note the user has saved.",
    input_schema: { type: "object", properties: {}, required: [] },
  },
  {
    name: "pick_random",
    description: "Pick one option at random from a list (e.g. to break a tie).",
    input_schema: {
      type: "object",
      properties: {
        options: { type: "array", items: { type: "string" } },
      },
      required: ["options"],
    },
  },
];

// Runners
export async function runTool(name, input = {}) {
  switch (name) {
    case "get_datetime": {
      const now = new Date();
      return {
        iso: now.toISOString(),
        local: now.toLocaleString(),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      };
    }

    case "calculate": {
      const expr = String(input.expression || "");
      if (!/^[0-9+\-*/%.()\s]+$/.test(expr)) {
        return { error: "Expression contains characters that are not allowed." };
      }
      try {
        // eslint-disable-next-line no-new-func
        const value = Function(`"use strict"; return (${expr});`)();
        return { expression: expr, result: value };
      } catch {
        return { error: "Could not evaluate that expression." };
      }
    }

    case "set_theme": {
      const mode = input.mode === "light" ? "light" : "dark";
      document.documentElement.dataset.theme = mode;
      localStorage.setItem("theme", mode);
      window.dispatchEvent(new CustomEvent("theme-change", { detail: mode }));
      return { theme: mode };
    }

    case "make_invite_link": {
      let id = localStorage.getItem("peerId");
      if (!id) {
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
        id = Array.from({ length: 5 }, () =>
          chars.charAt(Math.floor(Math.random() * chars.length)),
        ).join("");
        localStorage.setItem("peerId", id);
      }
      return { peerId: id, link: `${window.location.origin}/meet?peer=${id}` };
    }

    case "save_note": {
      const text = String(input.text || "").trim();
      if (!text) return { error: "Note text was empty." };
      const notes = readNotes();
      const note = { text, at: new Date().toISOString() };
      notes.push(note);
      writeNotes(notes);
      window.dispatchEvent(new CustomEvent("notes-change"));
      return { saved: note, total: notes.length };
    }

    case "list_notes":
      return { notes: readNotes() };

    case "pick_random": {
      const options = Array.isArray(input.options) ? input.options : [];
      if (options.length === 0) return { error: "No options were provided." };
      return { chosen: options[Math.floor(Math.random() * options.length)] };
    }

    default:
      return { error: `Unknown tool: ${name}` };
  }
}
