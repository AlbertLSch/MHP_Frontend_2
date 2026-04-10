/**
 * MCP Worker base URL.
 *
 * Set NEXT_PUBLIC_MCP_API_URL in .env.local to point at your
 * Cloudflare Worker (local: http://localhost:8787, prod: https://…workers.dev).
 *
 * Falls back to localhost:8787 so `npm run dev` works out of the box
 * when `wrangler dev` is also running.
 */
export const MCP_API_URL =
  process.env.NEXT_PUBLIC_MCP_API_URL?.replace(/\/$/, '') ??
  'http://localhost:8787'
