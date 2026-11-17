import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/src/lib/supabase';
import { fetchAllCmsData, fetchMyAdminProfile } from '@/src/lib/cmsService';
import { DEFAULT_CMS_STATE } from '@/src/data/cmsDefaults';
import type { AdminRole, CmsAdminAccount, CmsSiteState } from '@/src/types/cms';

export type CmsTabId =
  | 'hero'
  | 'about'
  | 'menu'
  | 'why-rassa'
  | 'gallery'
  | 'visit'
  | 'cta-footer'
  | 'accounts';

interface CmsContextValue {
  content: CmsSiteState;
  schemaReady: boolean;
  hasCloudMenuItems: boolean;
  hasCloudGalleryItems: boolean;
  hasCloudWhyRassa: boolean;
  hasCloudAboutTiles: boolean;
  hasCloudStoryPillars: boolean;
  user: User | null;
  adminProfile: CmsAdminAccount | null;
  adminRole: AdminRole | null;
  authLoading: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isCmsOpen: boolean;
  activeCmsTab: CmsTabId;
  setActiveCmsTab: (tab: CmsTabId) => void;
  openCms: (tab?: CmsTabId) => void;
  closeCms: () => void;
  refreshCms: () => Promise<void>;
  signInAdmin: (email: string, password: string) => Promise<void>;
  signOutAdmin: () => Promise<void>;
  sessionRemainingMs: number | null;
  sessionExpiredMessage: string | null;
  clearSessionExpiredMessage: () => void;
}

const ADMIN_SESSION_DURATION_MS = 60 * 60 * 1000; // 60 minutes (1 hour)
const SESSION_EXPIRY_STORAGE_KEY = 'rassakopi_admin_session_expiry';

function readStoredSessionExpiry(userId: string): number | null {
  try {
    const raw = window.localStorage.getItem(SESSION_EXPIRY_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { userId?: string; expiresAt?: number };
    if (
      parsed.userId === userId &&
      typeof parsed.expiresAt === 'number' &&
      Number.isFinite(parsed.expiresAt)
    ) {
      return parsed.expiresAt;
    }
    return null;
  } catch {
    return null;
  }
}

function writeStoredSessionExpiry(userId: string, expiresAt: number): void {
  try {
    window.localStorage.setItem(
      SESSION_EXPIRY_STORAGE_KEY,
      JSON.stringify({ userId, expiresAt })
    );
  } catch {
    // Ignore storage quota / private mode restrictions
  }
}

function clearStoredSessionExpiry(): void {
  try {
    window.localStorage.removeItem(SESSION_EXPIRY_STORAGE_KEY);
  } catch {
    // Ignore
  }
}

const CmsContext = createContext<CmsContextValue | null>(null);

export function CmsProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<CmsSiteState>(DEFAULT_CMS_STATE);
  const [schemaReady, setSchemaReady] = useState(true);
  const [hasCloudMenuItems, setHasCloudMenuItems] = useState(false);
  const [hasCloudGalleryItems, setHasCloudGalleryItems] = useState(false);
  const [hasCloudWhyRassa, setHasCloudWhyRassa] = useState(false);
  const [hasCloudAboutTiles, setHasCloudAboutTiles] = useState(false);
  const [hasCloudStoryPillars, setHasCloudStoryPillars] = useState(false);

  const [user, setUser] = useState<User | null>(null);
  const [adminProfile, setAdminProfile] = useState<CmsAdminAccount | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [sessionExpiresAt, setSessionExpiresAt] = useState<number | null>(null);
  const [sessionRemainingMs, setSessionRemainingMs] = useState<number | null>(null);
  const [sessionExpiredMessage, setSessionExpiredMessage] = useState<string | null>(
    null
  );

  const normalizePathname = (pathname: string) =>
    pathname.replace(/\/+$/, '') || '/';

  const isAdminPath = (pathname: string) => {
    const normalized = normalizePathname(pathname);
    return normalized === '/admin' || normalized.endsWith('/admin');
  };

  const isLegacyAdminHash = (hash: string) =>
    hash === '#admin' || hash === '#/admin' || hash === '#cms';

  const getPublicPathFromCurrent = (pathname: string) => {
    const normalized = normalizePathname(pathname);
    if (normalized === '/admin') return '/';
    if (normalized.endsWith('/admin')) {
      return normalized.slice(0, -'/admin'.length) || '/';
    }
    return normalized;
  };

  const getAdminPathFromCurrent = (pathname: string) => {
    const normalized = normalizePathname(pathname);
    if (isAdminPath(normalized)) return normalized;
    return normalized === '/' ? '/admin' : `${normalized}/admin`;
  };

  const [isCmsOpen, setIsCmsOpen] = useState(() => {
    if (typeof window === 'undefined') return false;
    return (
      isAdminPath(window.location.pathname) ||
      isLegacyAdminHash(window.location.hash)
    );
  });
  const [activeCmsTab, setActiveCmsTab] = useState<CmsTabId>('hero');

  const refreshCms = useCallback(async () => {
    try {
      const result = await fetchAllCmsData();
      setContent(result.state);
      setSchemaReady(result.schemaReady);
      setHasCloudMenuItems(result.hasCloudMenuItems);
      setHasCloudGalleryItems(result.hasCloudGalleryItems);
      setHasCloudWhyRassa(result.hasCloudWhyRassa);
      setHasCloudAboutTiles(result.hasCloudAboutTiles);
      setHasCloudStoryPillars(result.hasCloudStoryPillars);
    } catch {
      // Keep current/default state if network is temporarily unavailable
    }
  }, []);

  const syncUserProfile = useCallback(async (nextUser: User | null) => {
    if (!nextUser) {
      clearStoredSessionExpiry();
      setUser(null);
      setAdminProfile(null);
      setSessionExpiresAt(null);
      setSessionRemainingMs(null);
      setAuthLoading(false);
      return;
    }

    const storedExpiry = readStoredSessionExpiry(nextUser.id);
    const now = Date.now();
    if (storedExpiry !== null && storedExpiry <= now) {
      clearStoredSessionExpiry();
      await supabase.auth.signOut();
      setUser(null);
      setAdminProfile(null);
      setSessionExpiresAt(null);
      setSessionRemainingMs(null);
      setSessionExpiredMessage(
        'Sesi login 60 menit Anda telah berakhir. Silakan masuk kembali.'
      );
      setAuthLoading(false);
      return;
    }

    const activeExpiry = storedExpiry ?? now + ADMIN_SESSION_DURATION_MS;
    if (storedExpiry === null) {
      writeStoredSessionExpiry(nextUser.id, activeExpiry);
    }
    setUser(nextUser);
    setSessionExpiresAt(activeExpiry);
    setSessionRemainingMs(Math.max(0, activeExpiry - now));

    try {
      const profile = await fetchMyAdminProfile(nextUser.id);
      setAdminProfile(profile);
    } catch {
      setAdminProfile(null);
    } finally {
      setAuthLoading(false);
    }
  }, []);

  // Supabase Auth session listener
  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      void syncUserProfile(data.session?.user ?? null);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!active) return;
        void syncUserProfile(session?.user ?? null);
      }
    );

    return () => {
      active = false;
      authListener.subscription.unsubscribe();
    };
  }, [syncUserProfile]);

  // Initial fetch + Supabase Realtime sync
  useEffect(() => {
    void refreshCms();

    const channel = supabase
      .channel('rassakopi-cms-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'cms_sections' },
        () => {
          void refreshCms();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'menu_items' },
        () => {
          void refreshCms();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'gallery_items' },
        () => {
          void refreshCms();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'feature_items' },
        () => {
          void refreshCms();
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [refreshCms]);

  // Pathname routing (/admin) & keyboard shortcut (Ctrl/Cmd + Shift + E)
  useEffect(() => {
    if (
      window.location.pathname.endsWith('/admin/') ||
      isLegacyAdminHash(window.location.hash)
    ) {
      const targetAdminPath = getAdminPathFromCurrent(window.location.pathname);
      history.replaceState(
        null,
        '',
        targetAdminPath + window.location.search
      );
      setIsCmsOpen(true);
    }

    const syncFromLocation = () => {
      if (isLegacyAdminHash(window.location.hash)) {
        const targetAdminPath = getAdminPathFromCurrent(window.location.pathname);
        history.replaceState(
          null,
          '',
          targetAdminPath + window.location.search
        );
        setIsCmsOpen(true);
        return;
      }
      setIsCmsOpen(isAdminPath(window.location.pathname));
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'e') {
        e.preventDefault();
        if (isAdminPath(window.location.pathname)) {
          const publicPath = getPublicPathFromCurrent(window.location.pathname);
          history.pushState(null, '', publicPath + window.location.search);
          setIsCmsOpen(false);
        } else {
          const adminPath = getAdminPathFromCurrent(window.location.pathname);
          history.pushState({ cms: true }, '', adminPath + window.location.search);
          setIsCmsOpen(true);
        }
      }
    };

    window.addEventListener('popstate', syncFromLocation);
    window.addEventListener('hashchange', syncFromLocation);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('popstate', syncFromLocation);
      window.removeEventListener('hashchange', syncFromLocation);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const adminRole: AdminRole | null = adminProfile?.isActive
    ? adminProfile.role
    : null;
  const isAdmin = adminRole === 'super_admin' || adminRole === 'admin';
  const isSuperAdmin = adminRole === 'super_admin';

  // Ensure non-super_admin cannot remain on 'accounts' tab
  useEffect(() => {
    if (activeCmsTab === 'accounts' && !isSuperAdmin) {
      setActiveCmsTab('hero');
    }
  }, [activeCmsTab, isSuperAdmin]);

  const openCms = (tab?: CmsTabId) => {
    if (tab && (tab !== 'accounts' || isSuperAdmin)) {
      setActiveCmsTab(tab);
    }
    if (!isAdminPath(window.location.pathname)) {
      const adminPath = getAdminPathFromCurrent(window.location.pathname);
      history.pushState({ cms: true }, '', adminPath + window.location.search);
    }
    setIsCmsOpen(true);
  };

  const closeCms = () => {
    setIsCmsOpen(false);
    if (
      isAdminPath(window.location.pathname) ||
      isLegacyAdminHash(window.location.hash)
    ) {
      const publicPath = getPublicPathFromCurrent(window.location.pathname);
      history.pushState(null, '', publicPath + window.location.search);
    }
  };

  // Enforce strict 60-minute (1 hour) Admin & Super Admin login session
  useEffect(() => {
    if (!user || !sessionExpiresAt) {
      setSessionRemainingMs(null);
      return;
    }

    let expiring = false;
    const expireSession = async () => {
      if (expiring) return;
      expiring = true;
      clearStoredSessionExpiry();
      await supabase.auth.signOut();
      setUser(null);
      setAdminProfile(null);
      setSessionExpiresAt(null);
      setSessionRemainingMs(null);
      setSessionExpiredMessage(
        'Sesi login 60 menit Anda telah berakhir. Silakan masuk kembali.'
      );
    };

    const tick = () => {
      const remaining = sessionExpiresAt - Date.now();
      if (remaining <= 0) {
        setSessionRemainingMs(0);
        void expireSession();
      } else {
        setSessionRemainingMs(remaining);
      }
    };

    tick();
    const timerId = window.setInterval(tick, 1000);
    const handleFocusOrVisibility = () => {
      if (!document.hidden) tick();
    };
    window.addEventListener('focus', handleFocusOrVisibility);
    document.addEventListener('visibilitychange', handleFocusOrVisibility);

    return () => {
      window.clearInterval(timerId);
      window.removeEventListener('focus', handleFocusOrVisibility);
      document.removeEventListener('visibilitychange', handleFocusOrVisibility);
    };
  }, [user, sessionExpiresAt]);

  const signInAdmin = async (email: string, password: string) => {
    setSessionExpiredMessage(null);
    clearStoredSessionExpiry();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (error) {
      throw new Error(error.message);
    }
    if (data.user) {
      const expiresAt = Date.now() + ADMIN_SESSION_DURATION_MS;
      writeStoredSessionExpiry(data.user.id, expiresAt);
      setSessionExpiresAt(expiresAt);
      setSessionRemainingMs(ADMIN_SESSION_DURATION_MS);
    }
    await syncUserProfile(data.user ?? null);
  };

  const signOutAdmin = async () => {
    clearStoredSessionExpiry();
    setSessionExpiredMessage(null);
    setSessionExpiresAt(null);
    setSessionRemainingMs(null);
    await supabase.auth.signOut();
    setAdminProfile(null);
    setUser(null);
  };

  const clearSessionExpiredMessage = useCallback(() => {
    setSessionExpiredMessage(null);
  }, []);

  return (
    <CmsContext.Provider
      value={{
        content,
        schemaReady,
        hasCloudMenuItems,
        hasCloudGalleryItems,
        hasCloudWhyRassa,
        hasCloudAboutTiles,
        hasCloudStoryPillars,
        user,
        adminProfile,
        adminRole,
        authLoading,
        isAdmin,
        isSuperAdmin,
        isCmsOpen,
        activeCmsTab,
        setActiveCmsTab,
        openCms,
        closeCms,
        refreshCms,
        signInAdmin,
        signOutAdmin,
        sessionRemainingMs,
        sessionExpiredMessage,
        clearSessionExpiredMessage,
      }}
    >
      {children}
    </CmsContext.Provider>
  );
}

export function useCms(): CmsContextValue {
  const ctx = useContext(CmsContext);
  if (!ctx) {
    throw new Error('useCms must be used within CmsProvider');
  }
  return ctx;
}
