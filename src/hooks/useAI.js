import { useCallback, useMemo, useState } from "react";
import Anthropic from "@anthropic-ai/sdk";

// Local Storage Keys
const KEY_STORAGE = "anthropicApiKey";
const MODEL_STORAGE = "aiModel";

// Selectable Models
export const AI_MODELS = ["claude-opus-5", "claude-sonnet-5", "claude-haiku-4-5"];

// AI Hook
// Small wrapper around the Anthropic API for chat helpers. The API key is
// supplied by the user and kept only in this browser's localStorage.
function useAI() {
  const [apiKey, setApiKeyState] = useState(
    () => localStorage.getItem(KEY_STORAGE) || "",
  );
  const [model, setModelState] = useState(
    () => localStorage.getItem(MODEL_STORAGE) || AI_MODELS[0],
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

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

  // Anthropic Client (recreated when the key changes)
  const client = useMemo(
    () =>
      apiKey
        ? new Anthropic({ apiKey, dangerouslyAllowBrowser: true })
        : null,
    [apiKey],
  );

  // Core Request
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

  // Streaming Chat (used by the standalone AI Assistant page)
  const chatStream = useCallback(
    async (history, onDelta) => {
      if (!client) throw new Error("Add your Anthropic API key first.");

      setBusy(true);
      setError("");

      try {
        const stream = client.messages.stream({
          model,
          max_tokens: 1024,
          system:
            "You are a friendly, concise assistant inside a small WebRTC demo app. Keep answers short unless asked for detail.",
          messages: history,
        });

        stream.on("text", (delta) => onDelta(delta));

        const final = await stream.finalMessage();

        return final.content
          .filter((block) => block.type === "text")
          .map((block) => block.text)
          .join("");
      } catch (requestError) {
        setError(requestError?.message || "The AI request failed.");
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
      } catch (parseError) {
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

  // Hook Return Values
  return {
    apiKey,
    setApiKey,
    model,
    setModel,
    busy,
    error,
    ready: !!client,
    chatStream,
    summarize,
    smartReplies,
    rewrite,
    translate,
  };
}

// Export Hook
export default useAI;
