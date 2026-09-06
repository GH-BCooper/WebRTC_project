import React, { useRef, useState } from "react";
import useAI from "../hooks/useAI";
import AISettings from "../components/AISettings";
import { renderMarkdown } from "../lib/markdown";

const PRESETS = [
  "Describe this image in detail",
  "Extract every piece of text you can read",
  "What's the mood or style of this picture?",
  "Suggest 3 captions for this",
];

// Vision Page
// Upload an image and ask Claude about it — a different AI modality from text.
function Vision() {
  const ai = useAI();
  const [showSettings, setShowSettings] = useState(!ai.ready);
  const [image, setImage] = useState(null);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const fileRef = useRef(null);
  const dropRef = useRef(null);

  function loadFile(file) {
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => {
      setImage(String(reader.result));
      setAnswer("");
    };
    reader.readAsDataURL(file);
  }

  function onDrop(event) {
    event.preventDefault();
    dropRef.current?.classList.remove("drag");
    loadFile(event.dataTransfer.files?.[0]);
  }

  async function ask() {
    if (!image || ai.busy || !ai.ready) return;
    setAnswer("");
    try {
      setAnswer(await ai.describeImage(image, question));
    } catch {
      setAnswer("⚠️ " + (ai.error || "Something went wrong."));
    }
  }

  return (
    <div className="page vision">
      <header className="page-head">
        <span className="page-kicker">Image understanding</span>
        <h1>Vision</h1>
        <p className="muted">
          Drop in an image and ask Claude about it — descriptions, text
          extraction, captions, style. Nothing is uploaded anywhere except
          directly to Anthropic.
        </p>
      </header>

      <div className="ai-toolbar">
        <button className="chip" onClick={() => setShowSettings((v) => !v)} type="button">
          {showSettings ? "Hide settings" : "⚙ Settings"}
        </button>
      </div>

      {showSettings && <AISettings ai={ai} />}

      {!ai.ready ? (
        <p className="ai-hint">Add an API key above to analyse images.</p>
      ) : (
        <>
          <div
            ref={dropRef}
            className="dropzone"
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              dropRef.current?.classList.add("drag");
            }}
            onDragLeave={() => dropRef.current?.classList.remove("drag")}
            onDrop={onDrop}
          >
            {image ? (
              <img src={image} alt="uploaded" />
            ) : (
              <p>🖼️ Click or drop an image here</p>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => loadFile(e.target.files?.[0])}
            />
          </div>

          {image && (
            <>
              <div className="quick-prompts">
                {PRESETS.map((preset) => (
                  <button
                    key={preset}
                    className="chip"
                    type="button"
                    onClick={() => setQuestion(preset)}
                  >
                    {preset}
                  </button>
                ))}
              </div>

              <div className="message-row">
                <input
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && ask()}
                  placeholder="Ask something about the image (optional)"
                />
                <button onClick={ask} disabled={ai.busy} type="button">
                  {ai.busy ? "…" : "Ask"}
                </button>
              </div>
            </>
          )}

          {answer && (
            <div className="ai-result">
              <strong>Claude</strong>
              <div
                className="md"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(answer) }}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}

// Export Component
export default Vision;
