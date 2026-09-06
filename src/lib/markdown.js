// Tiny, safe Markdown -> HTML renderer for AI replies.
// It escapes everything first, then re-adds a small set of formats, so the
// output is safe to drop in with dangerouslySetInnerHTML.

function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function renderMarkdown(source = "") {
  const escaped = escapeHtml(source);

  // Fenced code blocks ```...``` — collapse internal newlines to entities so
  // the whole block survives the line-by-line pass below.
  let html = escaped.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => {
    const body = code.replace(/\n$/, "").replace(/\n/g, "&#10;");
    return `<pre class="md-code"><code>${body}</code></pre>`;
  });

  const lines = html.split("\n");
  const out = [];
  let inList = false;

  for (const line of lines) {
    // Pass through lines that are a complete <pre> block.
    if (line.includes("<pre")) {
      if (inList) {
        out.push("</ul>");
        inList = false;
      }
      out.push(line);
      continue;
    }

    const bullet = line.match(/^\s*[-*]\s+(.*)$/);
    const heading = line.match(/^(#{1,3})\s+(.*)$/);

    if (bullet) {
      if (!inList) {
        out.push("<ul>");
        inList = true;
      }
      // GitHub-style task list: "- [ ] todo" / "- [x] done"
      const task = bullet[1].match(/^\[([ xX])\]\s+(.*)$/);
      if (task) {
        const checked = task[1] === " " ? "" : " checked";
        out.push(
          `<li class="md-task"><input type="checkbox" disabled${checked}/>${inline(task[2])}</li>`,
        );
      } else {
        out.push(`<li>${inline(bullet[1])}</li>`);
      }
      continue;
    }

    if (inList) {
      out.push("</ul>");
      inList = false;
    }

    if (heading) {
      const level = heading[1].length + 2; // # -> h3
      out.push(`<h${level}>${inline(heading[2])}</h${level}>`);
    } else if (line.trim() === "") {
      out.push("<br/>");
    } else {
      out.push(`<p>${inline(line)}</p>`);
    }
  }

  if (inList) out.push("</ul>");

  return out.join("\n");
}

function inline(text) {
  return text
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/(^|[^*])\*([^*]+)\*/g, "$1<em>$2</em>")
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(
      /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
      '<a href="$2" target="_blank" rel="noreferrer">$1</a>',
    );
}
