import { MOBILE_UA, getTikTokAccount, sanitizeUsername } from '../../api/_tiktok.ts';

function jsonResponse(body: unknown, status = 200, extraHeaders?: Record<string, string>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...extraHeaders,
    },
  });
}

export default async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const actionParam = url.searchParams.get('action') || '';
  const pathname = url.pathname;

  // Detect action from redirect splat (/.netlify/functions/tiktok/<subpath>) or direct path
  let action = actionParam;
  let pathId = url.searchParams.get('id') || '';

  if (!action) {
    if (pathname.endsWith('/feed') || pathname.includes('/tiktok/feed')) {
      action = 'feed';
    } else if (pathname.endsWith('/avatar') || pathname.includes('/tiktok/avatar')) {
      action = 'avatar';
    } else if (pathname.includes('/cover/')) {
      action = 'cover';
      pathId = pathname.split('/cover/')[1]?.split('/')[0] || '';
    } else if (pathname.includes('/video/')) {
      action = 'video';
      pathId = pathname.split('/video/')[1]?.split('/')[0] || '';
    }
  }

  if (action === 'feed') {
    const username = sanitizeUsername(url.searchParams.get('username'));
    const force = url.searchParams.get('refresh') === '1';
    try {
      const account = await getTikTokAccount(username, force);
      return jsonResponse(account.response, 200, {
        'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=300',
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Gagal mengambil video TikTok.';
      return jsonResponse({ error: message }, 502);
    }
  }

  if (action === 'avatar') {
    const username = sanitizeUsername(url.searchParams.get('u'));
    try {
      let account = await getTikTokAccount(username);
      if (!account.rawAvatarUrl) return new Response(null, { status: 404 });

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
      if (!upstream.ok) return new Response(null, { status: upstream.status });

      const buf = await upstream.arrayBuffer();
      return new Response(buf, {
        status: 200,
        headers: {
          'Content-Type': upstream.headers.get('content-type') || 'image/jpeg',
          'Cache-Control': 'public, max-age=1800',
        },
      });
    } catch {
      return new Response(null, { status: 502 });
    }
  }

  if (action === 'cover') {
    const videoId = pathId.replace(/[^0-9]/g, '');
    const username = sanitizeUsername(url.searchParams.get('u'));
    if (!videoId) return new Response(null, { status: 400 });

    try {
      let account = await getTikTokAccount(username);
      let entry = account.rawVideosById.get(videoId);
      if (!entry) {
        account = await getTikTokAccount(username, true);
        entry = account.rawVideosById.get(videoId);
      }
      const targetUrl = entry?.coverUrl || entry?.originCoverUrl;
      if (!targetUrl) return new Response(null, { status: 404 });

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
      if (!upstream.ok) return new Response(null, { status: upstream.status });

      const buf = await upstream.arrayBuffer();
      return new Response(buf, {
        status: 200,
        headers: {
          'Content-Type': upstream.headers.get('content-type') || 'image/jpeg',
          'Cache-Control': 'public, max-age=1800',
        },
      });
    } catch {
      return new Response(null, { status: 502 });
    }
  }

  if (action === 'video') {
    const videoId = pathId.replace(/[^0-9]/g, '');
    const username = sanitizeUsername(url.searchParams.get('u'));
    if (!videoId) return new Response(null, { status: 400 });

    try {
      let account = await getTikTokAccount(username);
      let entry = account.rawVideosById.get(videoId);
      if (!entry) {
        account = await getTikTokAccount(username, true);
        entry = account.rawVideosById.get(videoId);
      }
      if (!entry?.playAddr) return new Response(null, { status: 404 });

      const rangeHeader = req.headers.get('range');
      const buildHeaders = () => {
        const h: Record<string, string> = {
          'User-Agent': MOBILE_UA,
          Referer: 'https://www.tiktok.com/',
        };
        if (rangeHeader) h.Range = rangeHeader;
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
        return new Response(null, { status: upstream.status || 502 });
      }

      const outHeaders = new Headers();
      for (const name of [
        'content-type',
        'content-length',
        'content-range',
        'accept-ranges',
      ]) {
        const val = upstream.headers.get(name);
        if (val) outHeaders.set(name, val);
      }
      if (!outHeaders.has('accept-ranges')) {
        outHeaders.set('Accept-Ranges', 'bytes');
      }

      return new Response(upstream.body, {
        status: upstream.status,
        headers: outHeaders,
      });
    } catch {
      return new Response(null, { status: 502 });
    }
  }

  return jsonResponse({ error: 'Unknown TikTok action' }, 400);
}
