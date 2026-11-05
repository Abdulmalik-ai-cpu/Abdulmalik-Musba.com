/**
 * Thin re-export so the web app keeps a single rendering entry point while the
 * implementation lives in the shared, unit-tested utils package.
 */
export { renderSafeMarkdown as renderMarkdown } from '@portfolio/utils';
