/**
 * HidroBio Public Website
 *
 * Serves hidrobio.com.py — the company's public-facing website.
 *
 * @author HidroBio S.A.
 */

import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3006;
const VERSION = '1.0.0';
const START_TIME = Date.now();

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff'
};

// Cache static assets for 1 day, HTML for 1 hour
const CACHE_DURATION = {
  '.html': 'public, max-age=3600',
  '.jpg': 'public, max-age=86400',
  '.jpeg': 'public, max-age=86400',
  '.png': 'public, max-age=86400',
  '.webp': 'public, max-age=86400',
  '.svg': 'public, max-age=86400',
  '.ico': 'public, max-age=86400',
  '.woff2': 'public, max-age=604800',
  '.woff': 'public, max-age=604800'
};

function handleRequest(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  let pathname = url.pathname;

  // Health check
  if (pathname === '/health') {
    const uptimeSeconds = Math.floor((Date.now() - START_TIME) / 1000);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'ok',
      service: 'hidrobio-website',
      version: VERSION,
      uptime: `${uptimeSeconds}s`
    }));
    return;
  }

  // Directory index: serve index.html for paths ending in /
  if (pathname.endsWith('/')) {
    pathname += 'index.html';
  }

  const filePath = path.join(__dirname, 'public', pathname);
  const ext = path.extname(filePath);

  try {
    const content = fs.readFileSync(filePath);
    const headers = {
      'Content-Type': MIME_TYPES[ext] || 'application/octet-stream'
    };
    if (CACHE_DURATION[ext]) {
      headers['Cache-Control'] = CACHE_DURATION[ext];
    }
    res.writeHead(200, headers);
    res.end(content);
  } catch {
    // 404 → serve index.html (SPA fallback)
    try {
      const indexContent = fs.readFileSync(path.join(__dirname, 'public', 'index.html'));
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(indexContent);
    } catch {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not found');
    }
  }
}

const server = http.createServer(handleRequest);

server.listen(PORT, () => {
  console.log(`[HidroBio Website] Running on port ${PORT}`);
  console.log(`[HidroBio Website] Open http://localhost:${PORT}`);
});
