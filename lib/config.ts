/**
 * MCP Worker base URL.
 *
 * Server-side API routes use MCP_API_URL (no NEXT_PUBLIC prefix).
 * The browser no longer needs the Worker URL directly – all calls
 * go through Next.js proxy routes (/api/projects, /api/upload/*, etc.).
 *
 * Set in Vercel project settings (Environment Variables):
 *   MCP_API_URL = https://bauordnungsamt-muenster-mcp.<subdomain>.workers.dev
 *
 * For local development, create .env.local with:
 *   MCP_API_URL=http://localhost:8787
 */
export const MCP_API_URL =
  (process.env.MCP_API_URL ?? process.env.NEXT_PUBLIC_MCP_API_URL ?? 'http://localhost:8787')
    .replace(/\/$/, '')
