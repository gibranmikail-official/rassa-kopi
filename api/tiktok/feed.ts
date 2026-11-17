import type { IncomingMessage, ServerResponse } from 'node:http';
import { getTikTokAccount, sanitizeUsername } from '../_tiktok.ts';

interface ApiReq extends IncomingMessage {
  query?: Record<string, string | string[] | undefined>;
}

interface ApiRes extends ServerResponse {
  status: (code: number) => ApiRes;
  json: (body: unknown) => void;
}

export default async function handler(req: ApiReq, res: ApiRes) {
  const urlObj = new URL(req.url || '/api/tiktok/feed', 'http://localhost');
  const username = sanitizeUsername(
    req.query?.username ?? urlObj.searchParams.get('username')
  );
  const force =
    (req.query?.refresh ?? urlObj.searchParams.get('refresh')) === '1';

  try {
    const account = await getTikTokAccount(username, force);
    res.setHeader('Cache-Control', 'public, s-maxage=120, stale-while-revalidate=300');
    res.status(200).json(account.response);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Gagal mengambil video TikTok.';
    res.status(502).json({ error: message });
  }
}
