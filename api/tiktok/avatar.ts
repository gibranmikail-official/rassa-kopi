import type { IncomingMessage, ServerResponse } from 'node:http';
import { MOBILE_UA, getTikTokAccount, sanitizeUsername } from '../_tiktok.ts';

interface ApiReq extends IncomingMessage {
  query?: Record<string, string | string[] | undefined>;
}

interface ApiRes extends ServerResponse {
  status: (code: number) => ApiRes;
  send: (body: unknown) => void;
}

export default async function handler(req: ApiReq, res: ApiRes) {
  const urlObj = new URL(req.url || '/', 'http://localhost');
  const username = sanitizeUsername(req.query?.u ?? urlObj.searchParams.get('u'));

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
    res.status(200).send(Buffer.from(arrayBuf));
  } catch {
    res.status(502).end();
  }
}
