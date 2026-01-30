// Cloudflare Worker - Main Entry Point
import { handleApiRequest } from './api-handler.js';
import { getDashboardHTML } from './dashboard-html.js';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    // Handle API routes
    if (path.startsWith('/api/')) {
      return handleApiRequest(path, request, env);
    }

    // Serve the dashboard HTML for all other routes
    return getDashboardHTML(path);
  }
};
