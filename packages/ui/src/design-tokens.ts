/**
 * Design tokens — the single source of visual identity for the platform.
 * Public website renders with these tokens; the admin portal shares the
 * underlying scale but applies its own management styling.
 */

export const designTokens = {
  colors: {
    ink: '#0b0e14',
    paper: '#f4f1ea',
    accent: '#d4a017',
    muted: '#8a8f98',
  },
  fonts: {
    display: '"Fraunces", Georgia, serif',
    body: '"Source Serif 4", Georgia, serif',
    mono: '"JetBrains Mono", monospace',
  },
  radii: {
    sm: '0.3rem',
    md: '0.6rem',
    lg: '1rem',
  },
} as const;

export type DesignTokens = typeof designTokens;