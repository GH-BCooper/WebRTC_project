import { useCallback, useMemo, useRef, useState } from "react";
import Anthropic from "@anthropic-ai/sdk";
import { TOOL_SCHEMAS, runTool } from "../lib/agentTools";

// Local Storage Keys
const KEY_STORAGE = "anthropicApiKey";
const MODEL_STORAGE = "aiModel";
const PERSONA_STORAGE = "aiPersona";

// Selectable Models
export const AI_MODELS = ["claude-opus-5", "claude-sonnet-5", "claude-haiku-4-5"];

// Assistant personas (system prompts for the streaming chat)
export const PERSONAS = {
  helpful: {
    label: "Helpful assistant",
    system:
      "You are a friendly, concise assistant inside a small WebRTC learning app. Keep answers short unless asked for detail. Use Markdown when it helps.",
  },
  tutor: {
    label: "Coding tutor",
    system:
      "You are a patient coding tutor. Explain concepts step by step with small runnable examples. Prefer clarity over cleverness.",
  },
  brainstorm: {
    label: "Brainstorm partner",
    system:
      "You are an energetic brainstorming partner. Offer several distinct ideas as a short bulleted list, then ask one focusing question.",
  },
  expert: {
    label: "Concise expert",
    system:
      "You are a senior domain expert. Answer in 2-4 tight sentences. No filler, no hedging, no preamble.",
  },
  socratic: {
    label: "Socratic teacher",
    system:
      "You are a Socratic teacher. Guide the user to the answer by asking pointed questions and giving small hints rather than stating the solution outright.",
  },
};

const AGENT_SYSTEM =
  "You are an in-browser agent for a WebRTC + AI learning app. You have tools that act on the user's own browser (time, calculator, theme, invite links, notes). Use tools when they help, then give a short, friendly summary of what you did. Be concise.";

// AI Hook
// Wrapper around the Anthropic API: streaming chat, an agentic tool-use loop,
// image understanding and a few text helpers. The API key is supplied by the
// user and kept only in this browser's localStorage.
function useAI() {
  const [apiKey, setApiKeyState] = useState(
    () => localStorage.getItem(KEY_STORAGE) || "",
  );
  const [model, setModelState] = useState(
    () => localStorage.getItem(MODEL_STORAGE) || AI_MODELS[0],
  );
  const [personaKey, setPersonaKeyState] = useState(
    () => localStorage.getItem(PERSONA_STORAGE) || "helpful",
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [lastUsage, setLastUsage] = useState(null);
  const abortRef = useRef(null);

  // Persisted Setters
  const setApiKey = useCallback((value) => {
    const trimmed = value.trim();
    setApiKeyState(trimmed);
    localStorage.setItem(KEY_STORAGE, trimmed);
  }, []);

  const setModel = useCallback((value) => {
    setModelState(value);
    localStorage.setItem(MODEL_STORAGE, value);
  }, []);

  const setPersona = useCallback((value) => {
    setPersonaKeyState(value);
    localStorage.setItem(PERSONA_STORAGE, value);
  }, []);

  // Anthropic Client (recreated when the key changes)
  const client = useMemo(
    () =>
      apiKey ? new Anthropic({ apiKey, dangerouslyAllowBrowser: true }) : null,
    [apiKey],
  );

  // Cancel an in-flight streaming request.
  const abort = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setBusy(false);
  }, []);

  // Core Request (non-streaming)
  const ask = useCallback(
    async (system, userText, maxTokens = 700) => {
      if (!client) throw new Error("Add your Anthropic API key first.");

      setBusy(true);
      setError("");

      try {
        const response = await client.messages.create({
          model,
          max_tokens: maxTokens,
          system,
          messages: [{ role: "user", content: userText }],
        });

        setLastUsage(response.usage || null);

        return response.content
          .filter((block) => block.type === "text")
          .map((block) => block.text)
          .join("")
          .trim();
      } catch (requestError) {
        const message = requestError?.message || "The AI request failed.";
        setError(message);
        throw requestError;
      } finally {
        setBusy(false);
      }
    },
    [client, model],
  );

  // Streaming Chat (Assistant page). Supports a custom system prompt, an
  // AbortController and optional images attached to the latest user turn.
  const chatStream = useCallback(
    async (history, onDelta, options = {}) => {
      if (!client) throw new Error("Add your Anthropic API key first.");

      const { system, images } = options;
      const controller = new AbortController();
      abortRef.current = controller;

      setBusy(true);
      setError("");

      // Attach images (if any) to the final user message.
      let messages = history;
      if (images && images.length && history.length) {
        const last = history[history.length - 1];
        messages = [
          ...history.slice(0, -1),
          {
            role: last.role,
            content: [
              ...images.map((img) => ({
                type: "image",
                source: {
                  type: "base64",
                  media_type: img.media_type,
                  data: img.data,
                },
              })),
              { type: "text", text: last.content },
            ],
          },
        ];
      }

      try {
        const stream = client.messages.stream(
          {
            model,
            max_tokens: 1400,
            system: system || PERSONAS[personaKey].system,
            messages,
          },
          { signal: controller.signal },
        );

        stream.on("text", (delta) => onDelta(delta));

        const final = await stream.finalMessage();
        setLastUsage(final.usage || null);

        return final.content
          .filter((block) => block.type === "text")
          .map((block) => block.text)
          .join("");
      } catch (requestError) {
        const name = requestError?.name || "";
        if (name === "AbortError" || name.includes("Abort")) return "";
        setError(requestError?.message || "The AI request failed.");
        throw requestError;
      } finally {
        abortRef.current = null;
        setBusy(false);
      }
    },
    [client, model, personaKey],
  );

  // Agentic tool-use loop. Emits events so the UI can show each tool call.
  const runAgent = useCallback(
    async (userText, { onEvent, history = [] } = {}) => {
      if (!client) throw new Error("Add your Anthropic API key first.");

      setBusy(true);
      setError("");

      const messages = [...history, { role: "user", content: userText }];

      try {
        for (let step = 0; step < 6; step += 1) {
          const res = await client.messages.create({
            model,
            max_tokens: 1200,
            system: AGENT_SYSTEM,
            tools: TOOL_SCHEMAS,
            messages,
          });

          setLastUsage(res.usage || null);
          messages.push({ role: "assistant", content: res.content });

          const text = res.content
            .filter((b) => b.type === "text")
            .map((b) => b.text)
            .join("")
            .trim();
          if (text) onEvent?.({ type: "text", text });

          const toolUses = res.content.filter((b) => b.type === "tool_use");
          if (res.stop_reason !== "tool_use" || toolUses.length === 0) {
            return { messages, text };
          }

          const results = [];
          for (const use of toolUses) {
            onEvent?.({ type: "tool_call", name: use.name, input: use.input });
            let output;
            try {
              output = await runTool(use.name, use.input);
            } catch (toolError) {
              output = { error: String(toolError?.message || toolError) };
            }
            onEvent?.({ type: "tool_result", name: use.name, output });
            results.push({
              type: "tool_result",
              tool_use_id: use.id,
              content: JSON.stringify(output),
            });
          }

          messages.push({ role: "user", content: results });
        }

        onEvent?.({
          type: "text",
          text: "_(Stopped after 6 steps to keep things simple.)_",
        });
        return { messages, text: "" };
      } catch (requestError) {
        setError(requestError?.message || "The agent request failed.");
        throw requestError;
      } finally {
        setBusy(false);
      }
    },
    [client, model],
  );

  // Image understanding (Vision page).
  const describeImage = useCallback(
    async (dataUrl, question) => {
      if (!client) throw new Error("Add your Anthropic API key first.");

      const match = /^data:(image\/[a-zA-Z+]+);base64,(.*)$/.exec(dataUrl || "");
      if (!match) throw new Error("That doesn't look like a valid image.");

      setBusy(true);
      setError("");

      try {
        const response = await client.messages.create({
          model,
          max_tokens: 1024,
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "image",
                  source: {
                    type: "base64",
                    media_type: match[1],
                    data: match[2],
                  },
                },
                {
                  type: "text",
                  text:
                    question?.trim() ||
                    "Describe this image in detail. Note anything notable.",
                },
              ],
            },
          ],
        });

        setLastUsage(response.usage || null);

        return response.content
          .filter((block) => block.type === "text")
          .map((block) => block.text)
          .join("")
          .trim();
      } catch (requestError) {
        setError(requestError?.message || "The image request failed.");
        throw requestError;
      } finally {
        setBusy(false);
      }
    },
    [client, model],
  );

  // Helper: Summarize The Conversation
  const summarize = useCallback(
    (transcript) =>
      ask(
        "You summarize chat conversations. Reply with 3-5 short bullet points, no preamble.",
        transcript,
        500,
      ),
    [ask],
  );

  // Helper: Suggest Quick Replies
  const smartReplies = useCallback(
    async (transcript) => {
      const raw = await ask(
        'Suggest exactly 3 short, natural replies the user could send next. Respond ONLY with a JSON array of 3 strings, e.g. ["ok", "sounds good", "talk later"].',
        transcript,
        300,
      );

      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed.slice(0, 3).map(String);
      } catch {
        // Fall back to line splitting if the model didn't return clean JSON.
      }

      return raw
        .split("\n")
        .map((line) => line.replace(/^[-*\d.\s"]+|"$/g, "").trim())
        .filter(Boolean)
        .slice(0, 3);
    },
    [ask],
  );

  // Helper: Rewrite The Draft Message
  const rewrite = useCallback(
    (draft, tone) =>
      ask(
        `Rewrite the user's message to sound ${tone}. Keep the meaning. Reply with only the rewritten message.`,
        draft,
        400,
      ),
    [ask],
  );

  // Helper: Translate Text
  const translate = useCallback(
    (text, language) =>
      ask(
        `Translate the user's message into ${language}. Reply with only the translation.`,
        text,
        400,
      ),
    [ask],
  );

  // Helper: Turn a finished session into a shareable record.
  // `context` is a plain-text blob: topic, agenda and the chat transcript.
  const sessionRecap = useCallback(
    (context) =>
      ask(
        [
          "You are a meeting scribe for a 1:1 session (mentoring / consulting / tutoring).",
          "From the topic, agenda and transcript, write a short record in Markdown with exactly these three sections:",
          "## Summary — 3-5 bullet points of what was discussed and decided.",
          "## Action items — a Markdown checklist ('- [ ] ...'), each with an owner if it's clear. Write 'None.' if there are none.",
          "## Follow-up message — 2-4 sentences the host could send the other person afterward.",
          "Be concrete. Do not invent details that aren't supported by the transcript.",
        ].join("\n"),
        context,
        900,
      ),
    [ask],
  );

  // Helper: Pull action items out of a conversation
  const actionItems = useCallback(
    (transcript) =>
      ask(
        "Extract the concrete action items / to-dos from this conversation. Reply as a short Markdown checklist ('- [ ] ...'). If there are none, say 'No action items.'",
        transcript,
        400,
      ),
    [ask],
  );

  // Hook Return Values
  return {
    apiKey,
    setApiKey,
    model,
    setModel,
    personaKey,
    setPersona,
    busy,
    error,
    lastUsage,
    ready: !!client,
    abort,
    chatStream,
    runAgent,
    describeImage,
    summarize,
    smartReplies,
    rewrite,
    translate,
    actionItems,
    sessionRecap,
  };
}

// Export Hook
export default useAI;
