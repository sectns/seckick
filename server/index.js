require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 4000;
const allowedOrigin = process.env.ALLOWED_ORIGIN || 'http://localhost:4000';

app.use(
  cors({
    origin: allowedOrigin,
    credentials: false,
  }),
);
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', kickBase: process.env.KICK_BASE_URL || 'https://kick.com' });
});

// Simple proxy to bypass CORS for HLS playlists/segments
/*app.get('/api/proxy', async (req, res) => {
  const target = req.query.url;
  if (!target) {
    return res.status(400).send('Missing url');
  }

  try {
    const upstream = await axios.get(target, { responseType: 'arraybuffer' });
    const contentType = upstream.headers['content-type'] || '';
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Content-Type', contentType);

    if (contentType.includes('application/vnd.apple.mpegurl') || target.includes('.m3u8')) {
      const text = upstream.data.toString();
      const base = new URL(target);
      const proxied = text
        .split('\n')
        .map((line) => {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith('#')) return line;
          try {
            const abs = new URL(trimmed, base).href;
            return `${req.protocol}://${req.get('host')}/api/proxy?url=${encodeURIComponent(abs)}`;
          } catch {
            return line;
          }
        })
        .join('\n');
      return res.send(proxied);
    }

    return res.send(upstream.data);
  } catch (err) {
    console.error('Proxy error', err.message);
    return res.status(502).send('Proxy failed');
  }
}); */

// Serve built frontend if it exists
const distPath = path.join(__dirname, '../client/dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  // Express 5 + path-to-regexp: prefer a catch-all middleware instead of "*" patterns.
  app.use((_req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
