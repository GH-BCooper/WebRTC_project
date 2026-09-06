import React from "react";
import { AI_MODELS } from "../hooks/useAI";

// Shared AI Settings (API key + model), used by the AI panel and the
// standalone Assistant page. The key stays in this browser's localStorage.
function AISettings({ ai }) {
  return (
    <div className="ai-settings">
      <label htmlFor="ai-key">
        Anthropic API key (stored in this browser only)
      </label>
      <input
        id="ai-key"
        type="password"
        value={ai.apiKey}
        onChange={(event) => ai.setApiKey(event.target.value)}
        placeholder="sk-ant-..."
      />

      <label htmlFor="ai-model">Model</label>
      <select
        id="ai-model"
        value={ai.model}
        onChange={(event) => ai.setModel(event.target.value)}
      >
        {AI_MODELS.map((name) => (
          <option key={name} value={name}>
            {name}
          </option>
        ))}
      </select>
    </div>
  );
}

// Export Component
export default AISettings;
