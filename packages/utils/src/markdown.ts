/**
 * Minimal, dependency-free renderer for the small Markdown subset the article
 * editor produces. Input is HTML-escaped first, so raw tags in stored content
 * can never become executable markup (§34, §140.52).
 */

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function inline(text: string): string {
  return escapeHtml(text)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*])\*([^*]+)\*/g, '$1<em>$2</em>')
    .replace(
      /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>',
    );
}

export function renderSafeMarkdown(source: string): string {
  const lines = source.split(/\r?\n/);
  const html: string[] = [];
  let inList = false;
  let inQuote = false;

  const closeBlocks = () => {
    if (inList) {
      html.push('</ul>');
      inList = false;
    }
    if (inQuote) {
      html.push('</blockquote>');
      inQuote = false;
    }
  };

  for (const raw of lines) {
    const line = raw.trimEnd();

    if (!line.trim()) {
      closeBlocks();
      continue;
    }

    const heading = /^(#{1,4})\s+(.*)$/.exec(line);
    if (heading) {
      closeBlocks();
      const level = heading[1]!.length + 1; // h1 is the page title; body starts at h2.
      html.push(`<h${level}>${inline(heading[2] ?? '')}</h${level}>`);
      continue;
    }

    if (/^>\s?/.test(line)) {
      if (!inQuote) {
        if (inList) {
          html.push('</ul>');
          inList = false;
        }
        html.push('<blockquote>');
        inQuote = true;
      }
      html.push(`<p>${inline(line.replace(/^>\s?/, ''))}</p>`);
      continue;
    }

    const bullet = /^[-*]\s+(.*)$/.exec(line);
    if (bullet) {
      if (inQuote) {
        html.push('</blockquote>');
        inQuote = false;
      }
      if (!inList) {
        html.push('<ul>');
        inList = true;
      }
      html.push(`<li>${inline(bullet[1] ?? '')}</li>`);
      continue;
    }

    closeBlocks();
    html.push(`<p>${inline(line)}</p>`);
  }

  closeBlocks();
  return html.join('\n');
}
