export const MOBILE_UA =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
const CACHE_TTL_MS = 10 * 60 * 1000;
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

export interface CachedTikTokAccount {
  fetchedAt: number;
  rawAvatarUrl: string;
  rawVideosById: Map<string, { coverUrl: string; originCoverUrl: string; playAddr: string }>;
  response: TikTokFeedResponse;
}

const feedCache = new Map<string, CachedTikTokAccount>();
const inFlightRequests = new Map<string, Promise<CachedTikTokAccount>>();

export function sanitizeUsername(raw: unknown): string {
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

export async function getTikTokAccount(
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
