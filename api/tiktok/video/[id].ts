import type { IncomingMessage, ServerResponse } from 'node:http';
import { Readable } from 'node:stream';
import { MOBILE_UA, getTikTokAccount, sanitizeUsername } from '../../_tiktok.ts';

interface ApiReq extends IncomingMessage {
  query?: Record<string, string | string[] | undefined>;
}

interface ApiRes extends ServerResponse {
  status: (code: number) => ApiRes;
}

export default async function handler(req: ApiReq, res: ApiRes) {
  const urlObj = new URL(req.url || '/', 'http://localhost');
  const rawIdParam = req.query?.id ?? urlObj.pathname.split('/').pop();
  const rawId = Array.isArray(rawIdParam) ? rawIdParam[0] : rawIdParam;
  const videoId = String(rawId || '').replace(/[^0-9]/g, '');
  const username = sanitizeUsername(req.query?.u ?? urlObj.searchParams.get('u'));

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
        h.Range = Array.isArray(rangeHeader) ? rangeHeader[0] : rangeHeader;
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

    res.statusCode = upstream.status;
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
      if (!res.headersSent) res.statusCode = 502;
      res.end();
    });
    nodeStream.pipe(res);
  } catch {
    if (!res.headersSent) {
      res.statusCode = 502;
    }
    res.end();
  }
}
