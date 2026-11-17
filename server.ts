import express from 'express';
import type { Request, Response } from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { Readable } from 'node:stream';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MOBILE_UA =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes
const DEFAULT_USERNAME = 'suhe_erna';

interface RawTikTokUserInfo {
  id?: string;
  uniqueId?: string;
  nickname?: string;
  signature?: string;
  avatarThumbUrl?: string;
  followerCount?: number;
  followingCount?: number;
  heartCount?: number;
}

interface RawTikTokVideoItem {
  id?: string;
  desc?: string;
  height?: number;
  width?: number;
  ratio?: string;
  coverUrl?: string;
  originCoverUrl?: string;
  dynamicCoverUrl?: string;
  playAddr?: string;
  playCount?: number;
  diggCount?: number;
  commentCount?: number;
  privateItem?: boolean;
  authorUniqueId?: string;
}

export interface TikTokVideoDto {
  id: string;
  desc: string;
  width: number;
  height: number;
  playCount: number;
  likeCount?: number;
  authorUniqueId: string;
  permalink: string;
  coverProxyUrl: string;
  videoProxyUrl: string;
}

export interface TikTokProfileDto {
  uniqueId: string;
  nickname: string;
  signature: string;
  followerCount: number;
  heartCount: number;
  avatarProxyUrl: string;
  profileUrl: string;
}

export interface TikTokFeedResponse {
  profile: TikTokProfileDto;
  videos: TikTokVideoDto[];
  fetchedAt: number;
}

interface CachedTikTokAccount {
  fetchedAt: number;
  rawAvatarUrl: string;
  rawVideosById: Map<string, { coverUrl: string; originCoverUrl: string; playAddr: string }>;
  response: TikTokFeedResponse;
}

const feedCache = new Map<string, CachedTikTokAccount>();
const inFlightRequests = new Map<string, Promise<CachedTikTokAccount>>();

function sanitizeUsername(raw: unknown): string {
  if (typeof raw !== 'string') return DEFAULT_USERNAME;
  const cleaned = raw.trim().replace(/^@+/, '').replace(/[^a-zA-Z0-9._]/g, '');
  return cleaned || DEFAULT_USERNAME;
}

async function fetchTikTokAccountFresh(username: string): Promise<CachedTikTokAccount> {
  const cleanUser = sanitizeUsername(username);
  const embedUrl = `https://www.tiktok.com/embed/@${encodeURIComponent(cleanUser)}`;

  const res = await fetch(embedUrl, {
    headers: {
      'User-Agent': MOBILE_UA,
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
    },
  });

  if (!res.ok) {
    throw new Error(`TikTok embed returned HTTP ${res.status}`);
  }

  const html = await res.text();
  const stateMatch = html.match(
    /<script[^>]*id="__FRONTITY_CONNECT_STATE__"[^>]*>([\s\S]*?)<\/script>/
  );
  if (!stateMatch || !stateMatch[1]) {
    throw new Error('Could not locate TikTok embed state payload');
  }

  const parsed = JSON.parse(stateMatch[1]) as {
    source?: {
      data?: Record<
        string,
        {
          userInfo?: RawTikTokUserInfo;
          videoList?: RawTikTokVideoItem[];
        }
      >;
    };
  };

  const dataMap = parsed.source?.data ?? {};
  const routeKey = `/embed/@${cleanUser}`;
  const entry =
    dataMap[routeKey] ??
    Object.values(dataMap).find((val) => val && Array.isArray(val.videoList));

  if (!entry) {
    throw new Error(`TikTok creator data unavailable for @${cleanUser}`);
  }

  const userInfo = entry.userInfo ?? {};
  const rawVideos = Array.isArray(entry.videoList) ? entry.videoList : [];
  const rawVideosById = new Map<
    string,
    { coverUrl: string; originCoverUrl: string; playAddr: string }
  >();

  const videos: TikTokVideoDto[] = [];
  for (const item of rawVideos) {
    const id = typeof item.id === 'string' ? item.id.trim() : '';
    if (!id || item.privateItem) continue;

    const coverUrl = item.coverUrl || item.originCoverUrl || item.dynamicCoverUrl || '';
    const originCoverUrl = item.originCoverUrl || coverUrl;
    const playAddr = item.playAddr || '';
    const authorUniqueId = item.authorUniqueId || userInfo.uniqueId || cleanUser;

    rawVideosById.set(id, { coverUrl, originCoverUrl, playAddr });

    const dto: TikTokVideoDto = {
      id,
      desc: (item.desc || '').trim() || `Video dari @${authorUniqueId}`,
      width: Number(item.width) || 576,
      height: Number(item.height) || 1024,
      playCount: Number(item.playCount) || 0,
      ...(typeof item.diggCount === 'number' ? { likeCount: item.diggCount } : {}),
      authorUniqueId,
      permalink: `https://www.tiktok.com/@${authorUniqueId}/video/${id}`,
      coverProxyUrl: `/api/tiktok/cover/${encodeURIComponent(id)}?u=${encodeURIComponent(cleanUser)}`,
      videoProxyUrl: `/api/tiktok/video/${encodeURIComponent(id)}?u=${encodeURIComponent(cleanUser)}`,
    };
    videos.push(dto);
  }

  const now = Date.now();
  const profileUniqueId = userInfo.uniqueId || cleanUser;
  const cached: CachedTikTokAccount = {
    fetchedAt: now,
    rawAvatarUrl: userInfo.avatarThumbUrl || '',
    rawVideosById,
    response: {
      profile: {
        uniqueId: profileUniqueId,
        nickname: userInfo.nickname || profileUniqueId,
        signature: userInfo.signature || '',
        followerCount: Number(userInfo.followerCount) || 0,
        heartCount: Number(userInfo.heartCount) || 0,
        avatarProxyUrl: `/api/tiktok/avatar?u=${encodeURIComponent(cleanUser)}`,
        profileUrl: `https://www.tiktok.com/@${profileUniqueId}`,
      },
      videos,
      fetchedAt: now,
    },
  };

  feedCache.set(cleanUser, cached);
  return cached;
}

async function getTikTokAccount(
  username: string,
  forceRefresh = false
): Promise<CachedTikTokAccount> {
  const cleanUser = sanitizeUsername(username);
  const existing = feedCache.get(cleanUser);

  if (!forceRefresh && existing && Date.now() - existing.fetchedAt < CACHE_TTL_MS) {
    return existing;
  }

  const pending = inFlightRequests.get(cleanUser);
  if (pending) {
    return pending;
  }

  const promise = fetchTikTokAccountFresh(cleanUser).finally(() => {
    inFlightRequests.delete(cleanUser);
  });
  inFlightRequests.set(cleanUser, promise);

  try {
    return await promise;
  } catch (err) {
    if (existing) {
      return existing;
    }
    throw err;
  }
}

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
