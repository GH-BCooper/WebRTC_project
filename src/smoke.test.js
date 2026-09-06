// End-to-end smoke test: mount every route and core component in jsdom and
// assert nothing throws during render + effects. Not a substitute for a real
// two-browser call, but it exercises routing, all hooks, the AI wrapper's
// wiring and the Markdown renderer.
import React from "react";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";

import App from "./components/App";
import Home from "./pages/Home";
import Sessions from "./pages/Sessions";
import Meet from "./pages/Meet";
import Assistant from "./pages/Assistant";
import Agent from "./pages/Agent";
import Vision from "./pages/Vision";
import About from "./pages/About";
import { renderMarkdown } from "./lib/markdown";
import { createSession, listSessions, updateSession, deleteSession } from "./lib/sessions";
import { runTool, TOOL_SCHEMAS } from "./lib/agentTools";

jest.setTimeout(15000);

async function mount(ui) {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);
  await act(async () => {
    root.render(<MemoryRouter>{ui}</MemoryRouter>);
  });
  const html = container.innerHTML;
  await act(async () => root.unmount());
  container.remove();
  return html;
}

test("the whole app (router + navbar + theme toggle) mounts", async () => {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);
  await act(async () => root.render(<App />));
  expect(container.querySelector(".navbar")).toBeTruthy();
  expect(container.querySelector(".navbar-theme")).toBeTruthy();
  await act(async () => root.unmount());
  container.remove();
});

test("every route renders without throwing", async () => {
  for (const [name, ui] of [
    ["Home", <Home />],
    ["Sessions", <Sessions />],
    ["Meet", <Meet />],
    ["Assistant", <Assistant />],
    ["Agent", <Agent />],
    ["Vision", <Vision />],
    ["About", <About />],
  ]) {
    const html = await mount(ui);
    expect(html.length).toBeGreaterThan(0);
  }
});

test("session store round-trips through localStorage", () => {
  const s = createSession({ topic: "Portfolio review with Sam", agenda: "wrap-up", hostName: "Brett" });
  expect(listSessions().some((x) => x.id === s.id)).toBe(true);
  updateSession(s.id, { recap: "## Summary\n- did stuff", status: "done" });
  expect(listSessions().find((x) => x.id === s.id).status).toBe("done");
  deleteSession(s.id);
  expect(listSessions().some((x) => x.id === s.id)).toBe(false);
});

test("agent tools all execute locally", async () => {
  for (const schema of TOOL_SCHEMAS) {
    const input =
      schema.name === "calculate"
        ? { expression: "(2 + 3) * 4" }
        : schema.name === "save_note"
          ? { text: "hi" }
          : schema.name === "set_theme"
            ? { mode: "light" }
            : schema.name === "pick_random"
              ? { options: ["a", "b"] }
              : {};
    const out = await runTool(schema.name, input);
    expect(out).toBeTruthy();
  }
  expect((await runTool("calculate", { expression: "10 / 2" })).result).toBe(5);
  expect((await runTool("calculate", { expression: "alert(1)" })).error).toBeTruthy();
});

test("markdown renderer: headings, task lists, code, links are safe", () => {
  const html = renderMarkdown(
    "## Summary\n- [ ] open todo\n- [x] done todo\n- plain bullet\n\n`code` and **bold**\n\n[x](https://e.com)\n\n```js\nconst a = 1;\n```",
  );
  expect(html).toContain("<h4>Summary</h4>");
  expect(html).toContain('type="checkbox"');
  expect(html).toContain("checked");
  expect(html).toContain('<pre class="md-code">');
  expect(html).toContain('href="https://e.com"');
  expect(renderMarkdown("<script>alert(1)</script>")).not.toContain("<script>");
});
