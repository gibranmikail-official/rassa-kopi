import express from 'express';
import type { Request, Response } from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { Readable } from 'node:stream';
import { fileURLToPath } from 'node:url';
import { MOBILE_UA, getTikTokAccount, sanitizeUsername } from './api/_tiktok.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const port = Number(process.env.PORT) || 3000;
  const isProd = process.env.NODE_ENV === 'production';

  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ ok: true });
  });

  app.get('/api/tiktok/feed', async (req: Request, res: Response) => {
    const username = sanitizeUsername(req.query.username);
    const force = req.query.refresh === '1';

    try {
      const account = await getTikTokAccount(username, force);
      res.setHeader('Cache-Control', 'public, max-age=120');
      res.json(account.response);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Gagal mengambil video TikTok.';
      res.status(502).json({ error: message });
    }
  });

  app.get('/api/tiktok/avatar', async (req: Request, res: Response) => {
    const username = sanitizeUsername(req.query.u);
    try {
      let account = await getTikTokAccount(username);
      if (!account.rawAvatarUrl) {
        res.status(404).end();
        return;
      }

      let upstream = await fetch(account.rawAvatarUrl, {
        headers: { 'User-Agent': MOBILE_UA, Referer: 'https://www.tiktok.com/' },
      });

      if (!upstream.ok && (upstream.status === 403 || upstream.status === 410)) {
        account = await getTikTokAccount(username, true);
        if (account.rawAvatarUrl) {
          upstream = await fetch(account.rawAvatarUrl, {
            headers: { 'User-Agent': MOBILE_UA, Referer: 'https://www.tiktok.com/' },
          });
        }
      }

      if (!upstream.ok) {
        res.status(upstream.status).end();
        return;
      }

      const contentType = upstream.headers.get('content-type') || 'image/jpeg';
      const arrayBuf = await upstream.arrayBuffer();
      res.setHeader('Content-Type', contentType);
      res.setHeader('Cache-Control', 'public, max-age=1800');
      res.send(Buffer.from(arrayBuf));
    } catch {
      res.status(502).end();
    }
  });

  app.get('/api/tiktok/cover/:id', async (req: Request, res: Response) => {
    const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const videoId = String(rawId || '').replace(/[^0-9]/g, '');
    const username = sanitizeUsername(req.query.u);
    if (!videoId) {
      res.status(400).end();
      return;
    }

    try {
      let account = await getTikTokAccount(username);
      let entry = account.rawVideosById.get(videoId);
      if (!entry) {
        account = await getTikTokAccount(username, true);
        entry = account.rawVideosById.get(videoId);
      }

      const targetUrl = entry?.coverUrl || entry?.originCoverUrl;
      if (!targetUrl) {
        res.status(404).end();
        return;
      }

      let upstream = await fetch(targetUrl, {
        headers: { 'User-Agent': MOBILE_UA, Referer: 'https://www.tiktok.com/' },
      });

      if (!upstream.ok && (upstream.status === 403 || upstream.status === 410)) {
        account = await getTikTokAccount(username, true);
        entry = account.rawVideosById.get(videoId);
        const refreshedUrl = entry?.coverUrl || entry?.originCoverUrl;
        if (refreshedUrl) {
          upstream = await fetch(refreshedUrl, {
            headers: { 'User-Agent': MOBILE_UA, Referer: 'https://www.tiktok.com/' },
          });
        }
      }

      if (!upstream.ok) {
        res.status(upstream.status).end();
        return;
      }

      const contentType = upstream.headers.get('content-type') || 'image/jpeg';
      const arrayBuf = await upstream.arrayBuffer();
      res.setHeader('Content-Type', contentType);
      res.setHeader('Cache-Control', 'public, max-age=1800');
      res.send(Buffer.from(arrayBuf));
    } catch {
      res.status(502).end();
    }
  });

  app.get('/api/tiktok/video/:id', async (req: Request, res: Response) => {
    const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const videoId = String(rawId || '').replace(/[^0-9]/g, '');
    const username = sanitizeUsername(req.query.u);
    if (!videoId) {
      res.status(400).end();
      return;
    }

    try {
      let account = await getTikTokAccount(username);
      let entry = account.rawVideosById.get(videoId);
      if (!entry) {
        account = await getTikTokAccount(username, true);
        entry = account.rawVideosById.get(videoId);
      }

      if (!entry?.playAddr) {
        res.status(404).end();
        return;
      }

      const rangeHeader = req.headers.range;
      const buildHeaders = () => {
        const h: Record<string, string> = {
          'User-Agent': MOBILE_UA,
          Referer: 'https://www.tiktok.com/',
        };
        if (rangeHeader) {
          h.Range = rangeHeader;
        }
        return h;
      };

      let upstream = await fetch(entry.playAddr, { headers: buildHeaders() });
      if (!upstream.ok && (upstream.status === 403 || upstream.status === 410)) {
        account = await getTikTokAccount(username, true);
        entry = account.rawVideosById.get(videoId);
        if (entry?.playAddr) {
          upstream = await fetch(entry.playAddr, { headers: buildHeaders() });
        }
      }

      if (!upstream.ok || !upstream.body) {
        res.status(upstream.status || 502).end();
        return;
      }

      res.status(upstream.status);
      const passHeaders = [
        'content-type',
        'content-length',
        'content-range',
        'accept-ranges',
      ];
      for (const name of passHeaders) {
        const val = upstream.headers.get(name);
        if (val) res.setHeader(name, val);
      }
      if (!upstream.headers.get('accept-ranges')) {
        res.setHeader('Accept-Ranges', 'bytes');
      }

      const nodeStream = Readable.fromWeb(
        upstream.body as Parameters<typeof Readable.fromWeb>[0]
      );
      nodeStream.on('error', () => {
        if (!res.headersSent) res.status(502);
        res.end();
      });
      nodeStream.pipe(res);
    } catch {
      if (!res.headersSent) {
        res.status(502).end();
      }
    }
  });

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req: Request, res: Response) => {
      const indexHtml = path.join(distDir, 'index.html');
      if (fs.existsSync(indexHtml)) {
        res.sendFile(indexHtml);
      } else {
        res.status(404).send('Build output not found.');
      }
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Rassa Kopi server running on http://0.0.0.0:${port}`);
  });
}

startServer();
