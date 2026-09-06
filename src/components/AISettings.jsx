import React from "react";
import { AI_MODELS, PERSONAS } from "../hooks/useAI";

// Shared AI Settings (API key + model, and optionally the persona), used by the
// AI panel, the Assistant, the Agent and the Vision pages. The key stays in
// this browser's localStorage.
function AISettings({ ai, showPersona = false }) {
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

      <div className="ai-settings-row">
        <div>
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

        {showPersona && (
          <div>
            <label htmlFor="ai-persona">Persona</label>
            <select
              id="ai-persona"
              value={ai.personaKey}
              onChange={(event) => ai.setPersona(event.target.value)}
            >
              {Object.entries(PERSONAS).map(([key, value]) => (
                <option key={key} value={key}>
                  {value.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    </div>
  );
}

// Export Component
export default AISettings;
