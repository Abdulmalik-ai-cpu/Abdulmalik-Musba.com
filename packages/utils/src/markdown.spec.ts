import { describe, expect, it } from 'vitest';
import { renderSafeMarkdown } from './markdown';

describe('renderSafeMarkdown', () => {
  it('escapes raw HTML so stored content cannot inject markup', () => {
    const html = renderSafeMarkdown('<script>alert("x")</script>');
    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;script&gt;');
  });

  it('renders headings one level below the page title', () => {
    expect(renderSafeMarkdown('# Heading')).toBe('<h2>Heading</h2>');
    expect(renderSafeMarkdown('### Deep')).toBe('<h4>Deep</h4>');
  });

  it('wraps consecutive bullet lines in a single list', () => {
    expect(renderSafeMarkdown('- one\n- two')).toBe('<ul>\n<li>one</li>\n<li>two</li>\n</ul>');
  });

  it('closes a list before the next paragraph', () => {
    const html = renderSafeMarkdown('- item\n\nAfter');
    expect(html).toBe('<ul>\n<li>item</li>\n</ul>\n<p>After</p>');
  });

  it('renders blockquotes', () => {
    expect(renderSafeMarkdown('> quoted')).toBe('<blockquote>\n<p>quoted</p>\n</blockquote>');
  });

  it('renders bold, italic, inline code, and safe links', () => {
    const html = renderSafeMarkdown('**bold** *em* `code` [site](https://example.com)');
    expect(html).toContain('<strong>bold</strong>');
    expect(html).toContain('<em>em</em>');
    expect(html).toContain('<code>code</code>');
    expect(html).toContain('<a href="https://example.com" target="_blank" rel="noopener noreferrer">site</a>');
  });

  it('does not turn javascript: URLs into links', () => {
    const html = renderSafeMarkdown('[x](javascript:alert(1))');
    expect(html).not.toContain('<a');
    expect(html).toContain('javascript:alert(1)');
  });

  it('treats empty input as empty output', () => {
    expect(renderSafeMarkdown('')).toBe('');
  });
});
