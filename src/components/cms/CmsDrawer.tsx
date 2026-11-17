import { useCallback, useEffect, useState, type FormEvent, type ReactNode } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Coffee,
  Database,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Layers,
  LayoutTemplate,
  LogIn,
  LogOut,
  MapPin,
  Plus,
  RotateCcw,
  Save,
  ShieldAlert,
  Sparkles,
  Star,
  Trash2,
  Type,
  Users,
} from 'lucide-react';
import { useCms, type CmsTabId } from '@/src/context/CmsContext';
import { DEFAULT_CMS_STATE } from '@/src/data/cmsDefaults';
import {
  deleteGalleryItem,
  deleteMenuItem,
  replaceMenuItemsWithOfficialDefaults,
  sanitizeId,
  saveCmsSection,
  saveFeatureItem,
  saveGalleryItem,
  saveMenuItem,
  seedFeatureItemsDefaults,
  seedGalleryItemsDefaults,
  seedMenuItemsDefaults,
} from '@/src/lib/cmsService';
import type {
  AboutContent,
  CmsFeatureItem,
  CmsGalleryItem,
  CmsMenuItem,
  FinalCtaContent,
  FooterContent,
  GalleryHeaderContent,
  HeroContent,
  MarqueeContent,
  MenuHeaderContent,
  VisitContent,
  WhyRassaHeaderContent,
} from '@/src/types/cms';
import {
  MENU_CATEGORIES,
  isFavoriteMenuItem,
  type MenuCategory,
} from '@/src/data/menu';
import type { FeatureIconName } from '@/src/data/features';
import { ImageAssetPicker } from './ImageAssetPicker';
import { AccountsTab } from './AccountsTab';

const TABS: Array<{
  id: CmsTabId;
  label: string;
  icon: ReactNode;
  superAdminOnly?: boolean;
}> = [
  { id: 'hero', label: 'Hero & Running Text', icon: <LayoutTemplate className="w-4 h-4" /> },
  { id: 'about', label: 'About & Story', icon: <Type className="w-4 h-4" /> },
  { id: 'menu', label: 'Signature Menu', icon: <Coffee className="w-4 h-4" /> },
  { id: 'why-rassa', label: 'Why Choose Rassa', icon: <Sparkles className="w-4 h-4" /> },
  { id: 'gallery', label: 'Gallery', icon: <ImageIcon className="w-4 h-4" /> },
  { id: 'visit', label: 'Visit Us & Map', icon: <MapPin className="w-4 h-4" /> },
  { id: 'cta-footer', label: 'Final CTA & Footer', icon: <Layers className="w-4 h-4" /> },
  {
    id: 'accounts',
    label: 'Akun & Role',
    icon: <Users className="w-4 h-4" />,
    superAdminOnly: true,
  },
];

function Field({
  label,
  value,
  onChange,
  maxLength,
  multiline = false,
  rows = 3,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  maxLength: number;
  multiline?: boolean;
  rows?: number;
  placeholder?: string;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <label className="block text-xs font-bold uppercase tracking-wider text-[#1A1A1A]">
          {label}
        </label>
        <span className="text-[11px] text-[#777777] tabular-nums">
          {value.length}/{maxLength}
        </span>
      </div>
      {multiline ? (
        <textarea
          rows={rows}
          value={value}
          maxLength={maxLength}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-3.5 py-2.5 rounded-xl border border-black/12 bg-white text-sm text-[#1A1A1A] focus:outline-2 focus:outline-[#CC0000] resize-y"
        />
      ) : (
        <input
          type="text"
          value={value}
          maxLength={maxLength}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-3.5 py-2.5 rounded-xl border border-black/12 bg-white text-sm text-[#1A1A1A] focus:outline-2 focus:outline-[#CC0000]"
        />
      )}
    </div>
  );
}

export function CmsDrawer() {
  const {
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
    closeCms,
    refreshCms,
    signInAdmin,
    signOutAdmin,
    sessionRemainingMs,
    sessionExpiredMessage,
    clearSessionExpiredMessage,
  } = useCms();

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // Local editable form drafts synchronized with live CMS state
  const [heroDraft, setHeroDraft] = useState<HeroContent>(content.hero);
  const [marqueeDraft, setMarqueeDraft] = useState<MarqueeContent>(content.marquee);
  const [aboutDraft, setAboutDraft] = useState<AboutContent>(content.about);
  const [aboutTilesDraft, setAboutTilesDraft] = useState<CmsFeatureItem[]>(
    content.aboutTiles
  );
  const [storyPillarsDraft, setStoryPillarsDraft] = useState<CmsFeatureItem[]>(
    content.storyPillars
  );
  const [menuHeaderDraft, setMenuHeaderDraft] = useState<MenuHeaderContent>(
    content.menuHeader
  );
  const [whyHeaderDraft, setWhyHeaderDraft] = useState<WhyRassaHeaderContent>(
    content.whyRassaHeader
  );
  const [whyFeaturesDraft, setWhyFeaturesDraft] = useState<CmsFeatureItem[]>(
    content.whyRassaFeatures
  );
  const [galleryHeaderDraft, setGalleryHeaderDraft] =
    useState<GalleryHeaderContent>(content.galleryHeader);
  const [visitDraft, setVisitDraft] = useState<VisitContent>(content.visit);
  const [finalCtaDraft, setFinalCtaDraft] = useState<FinalCtaContent>(
    content.finalCta
  );
  const [footerDraft, setFooterDraft] = useState<FooterContent>(content.footer);

  // Menu & Gallery editing sub-states
  const [editingMenuItem, setEditingMenuItem] = useState<CmsMenuItem | null>(
    null
  );
  const [editingGalleryItem, setEditingGalleryItem] =
    useState<CmsGalleryItem | null>(null);

  useEffect(() => {
    setHeroDraft(content.hero);
    setMarqueeDraft(content.marquee);
    setAboutDraft(content.about);
    setAboutTilesDraft(content.aboutTiles);
    setStoryPillarsDraft(content.storyPillars);
    setMenuHeaderDraft(content.menuHeader);
    setWhyHeaderDraft(content.whyRassaHeader);
    setWhyFeaturesDraft(content.whyRassaFeatures);
    setGalleryHeaderDraft(content.galleryHeader);
    setVisitDraft(content.visit);
    setFinalCtaDraft(content.finalCta);
    setFooterDraft(content.footer);
  }, [content]);

  useEffect(() => {
    if (!isCmsOpen) return;
    document.title = 'Rassa Kopi — Admin Portal';
    return () => {
      document.title = 'Rassa Kopi — Brewed with Passion, Served with Soul';
    };
  }, [isCmsOpen]);

  const notify = useCallback((type: 'success' | 'error', text: string) => {
    setStatusMsg({ type, text });
    window.setTimeout(() => {
      setStatusMsg((curr) => (curr?.text === text ? null : curr));
    }, 4500);
  }, []);

  const formatSessionTimer = (ms: number) => {
    const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const handleLoginSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    clearSessionExpiredMessage();
    setLoginLoading(true);
    try {
      await signInAdmin(loginEmail, loginPassword);
      setLoginPassword('');
    } catch (err) {
      setLoginError(
        err instanceof Error
          ? err.message
          : 'Login gagal. Periksa email dan password Anda.'
      );
    } finally {
      setLoginLoading(false);
    }
  };

  const runSave = async (label: string, fn: () => Promise<void>) => {
    setSaving(true);
    try {
      await fn();
      await refreshCms();
      notify('success', `${label} saved to Supabase & published live.`);
    } catch (err) {
      notify(
        'error',
        err instanceof Error ? err.message : `Failed to save ${label}.`
      );
    } finally {
      setSaving(false);
    }
  };

  const handleSaveMenuItemForm = async () => {
    if (!editingMenuItem) return;
    await runSave(`Menu item "${editingMenuItem.name}"`, async () => {
      if (!hasCloudMenuItems) {
        await seedMenuItemsDefaults();
      }
      await saveMenuItem(editingMenuItem);
      setEditingMenuItem(null);
    });
  };

  const handleDeleteMenuItem = async (item: CmsMenuItem) => {
    await runSave(`Delete "${item.name}"`, async () => {
      if (!hasCloudMenuItems) {
        await seedMenuItemsDefaults();
      }
      await deleteMenuItem(item.id);
    });
  };

  const handleSaveGalleryItemForm = async () => {
    if (!editingGalleryItem) return;
    await runSave(`Gallery photo "${editingGalleryItem.title}"`, async () => {
      if (!hasCloudGalleryItems) {
        await seedGalleryItemsDefaults();
      }
      await saveGalleryItem(editingGalleryItem);
      setEditingGalleryItem(null);
    });
  };

  const handleDeleteGalleryItem = async (photo: CmsGalleryItem) => {
    await runSave(`Delete "${photo.title}"`, async () => {
      if (!hasCloudGalleryItems) {
        await seedGalleryItemsDefaults();
      }
      await deleteGalleryItem(photo.id);
    });
  };

  if (!isCmsOpen) return null;

  return (
    <div className="h-screen w-full overflow-hidden bg-[#F5F5F5] text-[#1A1A1A] flex flex-col">
      {/* Top Studio Header */}
      <header className="z-30 px-4 sm:px-8 py-3 sm:py-4 border-b border-black/8 bg-white flex items-center justify-between gap-3 sm:gap-4 shrink-0">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <img
            src={content.footer.logoUrl}
            alt="Rassa Kopi"
            className="h-8 sm:h-9 w-auto object-contain shrink-0"
          />
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              {adminRole && (
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    adminRole === 'super_admin'
                      ? 'bg-[#CC0000] text-white'
                      : 'bg-[#1A1A1A] text-white'
                  }`}
                >
                  {adminRole === 'super_admin' ? 'Super Admin' : 'Admin'}
                </span>
              )}
              {user && isAdmin && sessionRemainingMs !== null && (
                <span
                  title="Sesi login berlaku 60 menit (1 jam)"
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold tabular-nums border ${
                    sessionRemainingMs <= 5 * 60 * 1000
                      ? 'bg-amber-50 text-amber-800 border-amber-300'
                      : 'bg-[#F5F5F5] text-[#1A1A1A] border-black/8'
                  }`}
                >
                  <Clock className="w-3 h-3 text-[#CC0000]" aria-hidden="true" />
                  <span>Sesi {formatSessionTimer(sessionRemainingMs)}</span>
                </span>
              )}
            </div>
            <p className="text-[11px] sm:text-xs text-[#666666] truncate">
              {user
                ? `Signed in as ${user.email}`
                : 'Sign in with your Supabase Admin Email & Password'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button
            type="button"
            onClick={closeCms}
            aria-label="Lihat Website"
            className="inline-flex items-center justify-center gap-1.5 min-h-[38px] px-3 sm:px-3.5 py-2 rounded-full border border-black/12 bg-white hover:border-[#CC0000] hover:text-[#CC0000] text-xs font-bold text-[#1A1A1A] cursor-pointer transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
            <span className="hidden sm:inline">Lihat Website</span>
          </button>
          {user && (
            <button
              type="button"
              onClick={() => void signOutAdmin()}
              aria-label="Sign Out"
              className="inline-flex items-center justify-center gap-1.5 min-h-[38px] px-3 sm:px-3.5 py-2 rounded-full border border-black/8 sm:border-transparent text-xs font-semibold text-[#666666] hover:text-[#CC0000] hover:bg-[#F5F5F5] cursor-pointer transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          )}
        </div>
      </header>

            {/* Status Toast Banner */}
            {statusMsg && (
              <div
                className={`shrink-0 px-6 py-2.5 text-xs font-semibold flex items-center gap-2 border-b ${
                  statusMsg.type === 'success'
                    ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                    : 'bg-red-50 text-[#CC0000] border-red-200'
                }`}
              >
                {statusMsg.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
                ) : (
                  <ShieldAlert className="w-4 h-4 shrink-0" aria-hidden="true" />
                )}
                <span className="truncate">{statusMsg.text}</span>
              </div>
            )}

            {/* Auth Gate or CMS Workspace */}
            {authLoading ? (
              <div className="flex-1 flex items-center justify-center p-8 text-sm text-[#666666]">
                Checking admin session...
              </div>
            ) : !user ? (
              <div className="flex-1 flex items-center justify-center p-4 sm:p-6 bg-[#F5F5F5] overflow-y-auto">
                <form
                  onSubmit={(e) => void handleLoginSubmit(e)}
                  className="max-w-md w-full bg-white rounded-2xl p-5 sm:p-8 border border-black/8 shadow-sm space-y-5"
                >
                  <div className="text-center space-y-2">
                    <div className="w-14 h-14 rounded-2xl bg-[#CC0000]/10 text-[#CC0000] flex items-center justify-center mx-auto">
                      <LogIn className="w-6 h-6" aria-hidden="true" />
                    </div>
                    <h3 className="font-display text-2xl font-extrabold uppercase text-[#1A1A1A]">
                      Admin Sign In
                    </h3>
                    <p className="text-xs text-[#666666] leading-relaxed">
                      Masuk menggunakan Email & Password akun{' '}
                      <strong className="text-[#1A1A1A]">Super Admin</strong> atau{' '}
                      <strong className="text-[#1A1A1A]">Admin</strong> untuk mengelola konten Rassa Kopi.
                    </p>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F5F5F5] border border-black/8 text-[11px] font-semibold text-[#1A1A1A]">
                      <Clock className="w-3.5 h-3.5 text-[#CC0000]" aria-hidden="true" />
                      <span>Masa sesi login: 60 menit (1 jam)</span>
                    </div>
                  </div>

                  {!schemaReady && (
                    <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-left text-xs text-amber-900 flex items-start gap-2.5">
                      <Database className="w-4 h-4 shrink-0 mt-0.5 text-amber-700" />
                      <div>
                        <p className="font-bold">Database SQL belum dijalankan</p>
                        <p className="text-[11px] mt-0.5">
                          Jalankan isi file <code className="font-mono">supabase/schema.sql</code> di Supabase SQL Editor sebelum login.
                        </p>
                      </div>
                    </div>
                  )}

                  {sessionExpiredMessage && !loginError && (
                    <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs font-medium text-amber-900 flex items-start gap-2">
                      <Clock className="w-4 h-4 shrink-0 mt-0.5 text-amber-700" aria-hidden="true" />
                      <span>{sessionExpiredMessage}</span>
                    </div>
                  )}

                  {loginError && (
                    <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-medium text-[#CC0000]">
                      {loginError}
                    </div>
                  )}

                  <div className="space-y-3.5 text-left">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#1A1A1A]">
                        Email
                      </label>
                      <input
                        type="email"
                        required
                        autoComplete="email"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        placeholder="admin@rassakopi.com"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-black/12 bg-white text-sm text-[#1A1A1A] focus:outline-2 focus:outline-[#CC0000]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#1A1A1A]">
                        Password
                      </label>
                      <div className="relative">
                        <input
                          type={showLoginPassword ? 'text' : 'password'}
                          required
                          autoComplete="current-password"
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-black/12 bg-white text-sm text-[#1A1A1A] focus:outline-2 focus:outline-[#CC0000]"
                        />
                        <button
                          type="button"
                          onClick={() => setShowLoginPassword((prev) => !prev)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#666666] hover:text-[#1A1A1A] p-1 cursor-pointer"
                          aria-label={showLoginPassword ? 'Hide password' : 'Show password'}
                        >
                          {showLoginPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loginLoading}
                    className="w-full inline-flex items-center justify-center gap-2.5 px-6 py-3 rounded-full bg-[#CC0000] hover:bg-[#A80000] text-white text-sm font-bold cursor-pointer transition-colors disabled:opacity-50"
                  >
                    <LogIn className="w-4 h-4" aria-hidden="true" />
                    <span>{loginLoading ? 'Signing In...' : 'Sign In to CMS'}</span>
                  </button>
                </form>
              </div>
            ) : !isAdmin ? (
              <div className="flex-1 flex items-center justify-center p-6 bg-[#F5F5F5]">
                <div className="max-w-md w-full bg-white rounded-2xl p-8 border border-black/8 shadow-sm text-center space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-[#CC0000]/10 text-[#CC0000] flex items-center justify-center mx-auto">
                    <ShieldAlert className="w-6 h-6" aria-hidden="true" />
                  </div>
                  <h3 className="font-display text-2xl font-extrabold uppercase text-[#1A1A1A]">
                    Admin Permission Required
                  </h3>
                  <p className="text-sm text-[#666666] leading-relaxed">
                    Signed in as <strong className="text-[#1A1A1A]">{user.email}</strong>,{' '}
                    {adminProfile && !adminProfile.isActive
                      ? 'tetapi akun Anda sedang dinonaktifkan.'
                      : 'tetapi akun ini belum terdaftar di tabel admin_users atau skrip SQL schema belum dijalankan.'}
                  </p>
                  <button
                    type="button"
                    onClick={() => void signOutAdmin()}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-[#CC0000] text-[#CC0000] hover:bg-[#CC0000] hover:text-white text-xs font-bold cursor-pointer transition-colors"
                  >
                    <LogOut className="w-4 h-4" aria-hidden="true" />
                    <span>Sign Out & Switch Account</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex-1 min-h-0 flex flex-col md:flex-row max-w-7xl w-full mx-auto bg-white md:my-5 md:rounded-3xl md:border md:border-black/8 md:shadow-sm overflow-hidden">
                {/* Fixed Sidebar Section Tabs */}
                <aside className="md:w-64 border-b md:border-b-0 md:border-r border-black/8 bg-[#F5F5F5] p-2.5 sm:p-3.5 flex md:flex-col gap-1.5 overflow-x-auto md:overflow-hidden no-scrollbar shrink-0">
                  {TABS.filter((tab) => !tab.superAdminOnly || isSuperAdmin).map(
                    (tab) => {
                      const active = activeCmsTab === tab.id;
                      return (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => setActiveCmsTab(tab.id)}
                          className={`inline-flex items-center gap-2 sm:gap-2.5 min-h-[40px] px-3.5 py-2 sm:py-2.5 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 cursor-pointer transition-all ${
                            active
                              ? 'bg-[#CC0000] text-white shadow-xs'
                              : 'text-[#1A1A1A]/80 hover:bg-white hover:text-[#CC0000]'
                          }`}
                        >
                          {tab.icon}
                          <span>{tab.label}</span>
                        </button>
                      );
                    }
                  )}
                </aside>

                {/* Scrollable Editor Body */}
                <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-7 space-y-6 sm:space-y-8">
                  {!schemaReady && (
                    <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-3">
                      <Database className="w-4 h-4 shrink-0 mt-0.5 text-amber-700" />
                      <div>
                        <p className="font-bold">Tabel Supabase CMS belum terdeteksi</p>
                        <p className="mt-0.5 leading-relaxed">
                          Jalankan skrip <code className="font-mono font-semibold">supabase/schema.sql</code> di Supabase SQL Editor agar perubahan dapat tersimpan ke database.
                        </p>
                      </div>
                    </div>
                  )}
                  {/* TAB 1: HERO & MARQUEE */}
                  {activeCmsTab === 'hero' && (
                    <>
                      <section className="space-y-5">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-black/8 pb-3">
                          <div>
                            <h3 className="font-display text-2xl font-extrabold uppercase text-[#1A1A1A]">
                              Hero Section
                            </h3>
                            <p className="text-xs text-[#666666]">
                              Headline, supporting copy, buttons, and layered coffee visuals.
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setHeroDraft(DEFAULT_CMS_STATE.hero)}
                              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full border border-black/12 text-xs font-semibold text-[#666666] hover:text-[#1A1A1A] cursor-pointer"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>Reset</span>
                            </button>
                            <button
                              type="button"
                              disabled={saving}
                              onClick={() =>
                                void runSave('Hero Section', () =>
                                  saveCmsSection('hero', heroDraft)
                                )
                              }
                              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#CC0000] hover:bg-[#A80000] text-white text-xs font-bold cursor-pointer disabled:opacity-50"
                            >
                              <Save className="w-3.5 h-3.5" />
                              <span>{saving ? 'Saving...' : 'Save Hero'}</span>
                            </button>
                          </div>
                        </div>

                        <Field
                          label="Eyebrow Label"
                          value={heroDraft.eyebrow}
                          maxLength={120}
                          onChange={(v) => setHeroDraft({ ...heroDraft, eyebrow: v })}
                        />
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <Field
                            label="Headline Line 1"
                            value={heroDraft.line1}
                            maxLength={90}
                            onChange={(v) => setHeroDraft({ ...heroDraft, line1: v })}
                          />
                          <Field
                            label="Headline Line 2"
                            value={heroDraft.line2}
                            maxLength={90}
                            onChange={(v) => setHeroDraft({ ...heroDraft, line2: v })}
                          />
                          <Field
                            label="Line 3 (Crimson)"
                            value={heroDraft.line3Highlight}
                            maxLength={90}
                            onChange={(v) =>
                              setHeroDraft({ ...heroDraft, line3Highlight: v })
                            }
                          />
                        </div>
                        <Field
                          label="Supporting Description"
                          value={heroDraft.description}
                          maxLength={1200}
                          multiline
                          rows={3}
                          onChange={(v) =>
                            setHeroDraft({ ...heroDraft, description: v })
                          }
                        />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <Field
                            label="Primary Button Text"
                            value={heroDraft.primaryCtaLabel}
                            maxLength={80}
                            onChange={(v) =>
                              setHeroDraft({ ...heroDraft, primaryCtaLabel: v })
                            }
                          />
                          <Field
                            label="Secondary Button Text"
                            value={heroDraft.secondaryCtaLabel}
                            maxLength={80}
                            onChange={(v) =>
                              setHeroDraft({ ...heroDraft, secondaryCtaLabel: v })
                            }
                          />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
                          <ImageAssetPicker
                            label="Splash Layer Image (Back)"
                            value={heroDraft.splashImage}
                            onChange={(v) =>
                              setHeroDraft({ ...heroDraft, splashImage: v })
                            }
                          />
                          <ImageAssetPicker
                            label="Coffee Cup Image (Front)"
                            value={heroDraft.cupImage}
                            onChange={(v) =>
                              setHeroDraft({ ...heroDraft, cupImage: v })
                            }
                          />
                        </div>
                      </section>

                      <section className="space-y-4 pt-6 border-t border-black/10">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div>
                            <h3 className="font-display text-2xl font-extrabold uppercase text-[#1A1A1A]">
                              Diagonal Running Text
                            </h3>
                            <p className="text-xs text-[#666666]">
                              Text scrolling across the crossed crimson ribbons below Hero.
                            </p>
                          </div>
                          <button
                            type="button"
                            disabled={saving}
                            onClick={() =>
                              void runSave('Running Text', () =>
                                saveCmsSection('marquee', marqueeDraft)
                              )
                            }
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#CC0000] hover:bg-[#A80000] text-white text-xs font-bold cursor-pointer disabled:opacity-50"
                          >
                            <Save className="w-3.5 h-3.5" />
                            <span>Save Running Text</span>
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <Field
                            label="Front Ribbon Text"
                            value={marqueeDraft.frontPhrase}
                            maxLength={120}
                            onChange={(v) =>
                              setMarqueeDraft({ ...marqueeDraft, frontPhrase: v })
                            }
                          />
                          <Field
                            label="Back Ribbon Text"
                            value={marqueeDraft.backPhrase}
                            maxLength={120}
                            onChange={(v) =>
                              setMarqueeDraft({ ...marqueeDraft, backPhrase: v })
                            }
                          />
                        </div>
                      </section>
                    </>
                  )}

                  {/* TAB 2: ABOUT & STORY */}
                  {activeCmsTab === 'about' && (
                    <div className="space-y-8">
                      <section className="space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-black/8 pb-3">
                          <div>
                            <h3 className="font-display text-2xl font-extrabold uppercase text-[#1A1A1A]">
                              About Manifesto & Story Modal
                            </h3>
                            <p className="text-xs text-[#666666]">
                              Headline segments wrap around the 3 inline photo pills.
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setAboutDraft(DEFAULT_CMS_STATE.about)}
                              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full border border-black/12 text-xs font-semibold text-[#666666] cursor-pointer"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>Reset</span>
                            </button>
                            <button
                              type="button"
                              disabled={saving}
                              onClick={() =>
                                void runSave('About Section', () =>
                                  saveCmsSection('about', aboutDraft)
                                )
                              }
                              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#CC0000] hover:bg-[#A80000] text-white text-xs font-bold cursor-pointer disabled:opacity-50"
                            >
                              <Save className="w-3.5 h-3.5" />
                              <span>Save About</span>
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <Field
                            label="Eyebrow Label"
                            value={aboutDraft.eyebrow}
                            maxLength={120}
                            onChange={(v) => setAboutDraft({ ...aboutDraft, eyebrow: v })}
                          />
                          <Field
                            label="Button Label"
                            value={aboutDraft.ctaLabel}
                            maxLength={80}
                            onChange={(v) => setAboutDraft({ ...aboutDraft, ctaLabel: v })}
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <Field
                            label="Headline Part 1"
                            value={aboutDraft.headlinePart1}
                            maxLength={70}
                            onChange={(v) =>
                              setAboutDraft({ ...aboutDraft, headlinePart1: v })
                            }
                          />
                          <Field
                            label="Headline Part 2"
                            value={aboutDraft.headlinePart2}
                            maxLength={80}
                            onChange={(v) =>
                              setAboutDraft({ ...aboutDraft, headlinePart2: v })
                            }
                          />
                          <Field
                            label="Headline Part 3"
                            value={aboutDraft.headlinePart3}
                            maxLength={70}
                            onChange={(v) =>
                              setAboutDraft({ ...aboutDraft, headlinePart3: v })
                            }
                          />
                          <Field
                            label="Headline Part 4"
                            value={aboutDraft.headlinePart4}
                            maxLength={60}
                            onChange={(v) =>
                              setAboutDraft({ ...aboutDraft, headlinePart4: v })
                            }
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <ImageAssetPicker
                            label="Inline Pill Photo 1"
                            value={aboutDraft.pillImage1}
                            onChange={(v) =>
                              setAboutDraft({ ...aboutDraft, pillImage1: v })
                            }
                          />
                          <ImageAssetPicker
                            label="Inline Pill Photo 2"
                            value={aboutDraft.pillImage2}
                            onChange={(v) =>
                              setAboutDraft({ ...aboutDraft, pillImage2: v })
                            }
                          />
                          <ImageAssetPicker
                            label="Inline Pill Photo 3"
                            value={aboutDraft.pillImage3}
                            onChange={(v) =>
                              setAboutDraft({ ...aboutDraft, pillImage3: v })
                            }
                          />
                        </div>

                        <Field
                          label="Section Description"
                          value={aboutDraft.description}
                          maxLength={1200}
                          multiline
                          rows={3}
                          onChange={(v) =>
                            setAboutDraft({ ...aboutDraft, description: v })
                          }
                        />

                        <div className="p-4 rounded-2xl bg-[#F5F5F5] border border-black/8 space-y-4">
                          <p className="text-xs font-bold uppercase tracking-wider text-[#CC0000]">
                            Story Pop-up Modal Content
                          </p>
                          <Field
                            label="Modal Headline"
                            value={aboutDraft.storyModalHeadline}
                            maxLength={300}
                            onChange={(v) =>
                              setAboutDraft({ ...aboutDraft, storyModalHeadline: v })
                            }
                          />
                          <ImageAssetPicker
                            label="Modal Hero Image"
                            value={aboutDraft.storyModalImage}
                            onChange={(v) =>
                              setAboutDraft({ ...aboutDraft, storyModalImage: v })
                            }
                          />
                          <Field
                            label="Story Paragraph 1"
                            value={aboutDraft.storyModalParagraph1}
                            maxLength={550}
                            multiline
                            rows={2}
                            onChange={(v) =>
                              setAboutDraft({ ...aboutDraft, storyModalParagraph1: v })
                            }
                          />
                          <Field
                            label="Story Paragraph 2"
                            value={aboutDraft.storyModalParagraph2}
                            maxLength={550}
                            multiline
                            rows={2}
                            onChange={(v) =>
                              setAboutDraft({ ...aboutDraft, storyModalParagraph2: v })
                            }
                          />
                        </div>
                      </section>

                      {/* 5 Preview Category Tiles */}
                      <section className="space-y-4 pt-6 border-t border-black/10">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div>
                            <h4 className="font-display text-xl font-extrabold uppercase text-[#1A1A1A]">
                              Category Preview Tiles (Top of About)
                            </h4>
                            <p className="text-xs text-[#666666]">
                              5 quick-jump category cards displayed above Our Story.
                            </p>
                          </div>
                          <button
                            type="button"
                            disabled={saving}
                            onClick={() =>
                              void runSave('About Preview Tiles', async () => {
                                if (!hasCloudAboutTiles) {
                                  await seedFeatureItemsDefaults(aboutTilesDraft);
                                } else {
                                  for (const t of aboutTilesDraft) {
                                    await saveFeatureItem(t);
                                  }
                                }
                              })
                            }
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#CC0000] hover:bg-[#A80000] text-white text-xs font-bold cursor-pointer disabled:opacity-50"
                          >
                            <Save className="w-3.5 h-3.5" />
                            <span>Save All Tiles</span>
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {aboutTilesDraft.map((tile, idx) => (
                            <div
                              key={tile.id}
                              className="p-4 rounded-2xl border border-black/8 bg-white space-y-3"
                            >
                              <Field
                                label={`Tile ${idx + 1} Label`}
                                value={tile.title}
                                maxLength={120}
                                onChange={(v) => {
                                  const next = [...aboutTilesDraft];
                                  next[idx] = { ...tile, title: v };
                                  setAboutTilesDraft(next);
                                }}
                              />
                              <div className="space-y-1.5">
                                <label className="block text-xs font-bold uppercase tracking-wider text-[#1A1A1A]">
                                  Target Menu Category
                                </label>
                                <select
                                  value={tile.category}
                                  onChange={(e) => {
                                    const next = [...aboutTilesDraft];
                                    next[idx] = {
                                      ...tile,
                                      category: e.target.value as MenuCategory,
                                    };
                                    setAboutTilesDraft(next);
                                  }}
                                  className="w-full px-3 py-2 rounded-xl border border-black/12 bg-white text-xs font-medium text-[#1A1A1A]"
                                >
                                  {MENU_CATEGORIES.filter((c) => c !== 'All').map((cat) => (
                                    <option key={cat} value={cat}>
                                      {cat}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <ImageAssetPicker
                                label="Tile Image"
                                value={tile.image}
                                onChange={(v) => {
                                  const next = [...aboutTilesDraft];
                                  next[idx] = { ...tile, image: v };
                                  setAboutTilesDraft(next);
                                }}
                              />
                            </div>
                          ))}
                        </div>
                      </section>

                      {/* 3 Story Modal Pillars */}
                      <section className="space-y-4 pt-6 border-t border-black/10">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <h4 className="font-display text-xl font-extrabold uppercase text-[#1A1A1A]">
                            Story Modal Pillars
                          </h4>
                          <button
                            type="button"
                            disabled={saving}
                            onClick={() =>
                              void runSave('Story Pillars', async () => {
                                if (!hasCloudStoryPillars) {
                                  await seedFeatureItemsDefaults(storyPillarsDraft);
                                } else {
                                  for (const p of storyPillarsDraft) {
                                    await saveFeatureItem(p);
                                  }
                                }
                              })
                            }
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#CC0000] hover:bg-[#A80000] text-white text-xs font-bold cursor-pointer disabled:opacity-50"
                          >
                            <Save className="w-3.5 h-3.5" />
                            <span>Save Pillars</span>
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          {storyPillarsDraft.map((pillar, idx) => (
                            <div
                              key={pillar.id}
                              className="p-4 rounded-2xl border border-black/8 bg-white space-y-3"
                            >
                              <Field
                                label="Number"
                                value={pillar.badgeNumber}
                                maxLength={16}
                                onChange={(v) => {
                                  const next = [...storyPillarsDraft];
                                  next[idx] = { ...pillar, badgeNumber: v };
                                  setStoryPillarsDraft(next);
                                }}
                              />
                              <Field
                                label="Title"
                                value={pillar.title}
                                maxLength={120}
                                onChange={(v) => {
                                  const next = [...storyPillarsDraft];
                                  next[idx] = { ...pillar, title: v };
                                  setStoryPillarsDraft(next);
                                }}
                              />
                              <Field
                                label="Description"
                                value={pillar.description}
                                maxLength={400}
                                multiline
                                rows={2}
                                onChange={(v) => {
                                  const next = [...storyPillarsDraft];
                                  next[idx] = { ...pillar, description: v };
                                  setStoryPillarsDraft(next);
                                }}
                              />
                            </div>
                          ))}
                        </div>
                      </section>
                    </div>
                  )}

                  {/* TAB 3: SIGNATURE MENU */}
                  {activeCmsTab === 'menu' && (
                    <div className="space-y-8">
                      <section className="space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-black/8 pb-3">
                          <div>
                            <h3 className="font-display text-2xl font-extrabold uppercase text-[#1A1A1A]">
                              Menu Header Copy
                            </h3>
                            <p className="text-xs text-[#666666]">
                              Title, subtitle, button text, and pricing disclaimer.
                            </p>
                          </div>
                          <button
                            type="button"
                            disabled={saving}
                            onClick={() =>
                              void runSave('Menu Header', () =>
                                saveCmsSection('menu_header', menuHeaderDraft)
                              )
                            }
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#CC0000] hover:bg-[#A80000] text-white text-xs font-bold cursor-pointer disabled:opacity-50"
                          >
                            <Save className="w-3.5 h-3.5" />
                            <span>Save Header</span>
                          </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <Field
                            label="Eyebrow Label"
                            value={menuHeaderDraft.eyebrow}
                            maxLength={120}
                            onChange={(v) =>
                              setMenuHeaderDraft({ ...menuHeaderDraft, eyebrow: v })
                            }
                          />
                          <Field
                            label="Full Menu Button Label"
                            value={menuHeaderDraft.ctaLabel}
                            maxLength={80}
                            onChange={(v) =>
                              setMenuHeaderDraft({ ...menuHeaderDraft, ctaLabel: v })
                            }
                          />
                        </div>
                        <Field
                          label="Section Title"
                          value={menuHeaderDraft.title}
                          maxLength={300}
                          onChange={(v) =>
                            setMenuHeaderDraft({ ...menuHeaderDraft, title: v })
                          }
                        />
                        <Field
                          label="Subtitle"
                          value={menuHeaderDraft.description}
                          maxLength={1200}
                          multiline
                          rows={2}
                          onChange={(v) =>
                            setMenuHeaderDraft({ ...menuHeaderDraft, description: v })
                          }
                        />
                        <Field
                          label="Menu Footnote"
                          value={menuHeaderDraft.footnote}
                          maxLength={300}
                          onChange={(v) =>
                            setMenuHeaderDraft({ ...menuHeaderDraft, footnote: v })
                          }
                        />
                      </section>

                      <section className="space-y-4 pt-6 border-t border-black/10">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <h4 className="font-display text-xl font-extrabold uppercase text-[#1A1A1A]">
                              Menu Items ({content.menuItems.length})
                            </h4>
                            <p className="text-xs text-[#666666]">
                              Add, edit, feature, or remove drinks and pastries.
                            </p>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <button
                              type="button"
                              disabled={saving}
                              onClick={() => {
                                setEditingMenuItem(null);
                                void runSave('Sync Menu Resmi', () =>
                                  replaceMenuItemsWithOfficialDefaults()
                                );
                              }}
                              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-black/12 bg-white hover:border-[#CC0000] hover:text-[#CC0000] text-[#1A1A1A] text-xs font-bold cursor-pointer disabled:opacity-50 transition-colors"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>Sync Menu Resmi (34)</span>
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setEditingMenuItem({
                                  id: sanitizeId(`menu-${Date.now()}`),
                                  name: '',
                                  category: 'Coffee',
                                  description: '',
                                  priceLabel: 'Rp 28.000',
                                  numericPrice: 28000,
                                  image: '/assets/menu/rassa-latte.jpg',
                                  imageAlt: '',
                                  featured: true,
                                  isFavorite: false,
                                  note: '',
                                  sortOrder: content.menuItems.length,
                                })
                              }
                              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#CC0000] hover:bg-[#A80000] text-white text-xs font-bold cursor-pointer"
                            >
                              <Plus className="w-4 h-4" />
                              <span>Add Menu Item</span>
                            </button>
                          </div>
                        </div>

                        {/* Add/Edit Menu Item Inline Card */}
                        {editingMenuItem && (
                          <div className="p-5 rounded-2xl bg-[#F5F5F5] border-2 border-[#CC0000]/30 space-y-4">
                            <div className="flex items-center justify-between">
                              <h5 className="font-display text-lg font-extrabold uppercase text-[#CC0000]">
                                {editingMenuItem.name
                                  ? `Editing: ${editingMenuItem.name}`
                                  : 'New Menu Item'}
                              </h5>
                              <button
                                type="button"
                                onClick={() => setEditingMenuItem(null)}
                                className="text-xs font-semibold text-[#666666] hover:text-[#1A1A1A] cursor-pointer"
                              >
                                Cancel
                              </button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <Field
                                label="Item Name"
                                value={editingMenuItem.name}
                                maxLength={120}
                                onChange={(v) =>
                                  setEditingMenuItem({ ...editingMenuItem, name: v })
                                }
                              />
                              <div className="space-y-1.5">
                                <label className="block text-xs font-bold uppercase tracking-wider text-[#1A1A1A]">
                                  Category
                                </label>
                                <select
                                  value={editingMenuItem.category}
                                  onChange={(e) =>
                                    setEditingMenuItem({
                                      ...editingMenuItem,
                                      category: e.target.value as MenuCategory,
                                    })
                                  }
                                  className="w-full px-3.5 py-2.5 rounded-xl border border-black/12 bg-white text-sm text-[#1A1A1A]"
                                >
                                  {MENU_CATEGORIES.filter((c) => c !== 'All').map((cat) => (
                                    <option key={cat} value={cat}>
                                      {cat}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <Field
                                label="Price Display Label"
                                value={editingMenuItem.priceLabel}
                                maxLength={40}
                                onChange={(v) =>
                                  setEditingMenuItem({
                                    ...editingMenuItem,
                                    priceLabel: v,
                                  })
                                }
                              />
                              <Field
                                label="Badge Note (Optional)"
                                value={editingMenuItem.note ?? ''}
                                maxLength={60}
                                placeholder="e.g., House Favorite"
                                onChange={(v) =>
                                  setEditingMenuItem({ ...editingMenuItem, note: v })
                                }
                              />
                            </div>

                            <Field
                              label="Description"
                              value={editingMenuItem.description}
                              maxLength={400}
                              multiline
                              rows={2}
                              onChange={(v) =>
                                setEditingMenuItem({
                                  ...editingMenuItem,
                                  description: v,
                                })
                              }
                            />

                            <ImageAssetPicker
                              label="Product Photo"
                              value={editingMenuItem.image}
                              onChange={(v) =>
                                setEditingMenuItem({ ...editingMenuItem, image: v })
                              }
                            />

                            <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                              <div className="flex flex-wrap items-center gap-4">
                                <label className="inline-flex items-center gap-2 text-xs font-bold text-[#1A1A1A] cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={editingMenuItem.featured}
                                    onChange={(e) =>
                                      setEditingMenuItem({
                                        ...editingMenuItem,
                                        featured: e.target.checked,
                                      })
                                    }
                                    className="w-4 h-4 accent-[#CC0000]"
                                  />
                                  <span>Featured in Signature Menu (&ldquo;All&rdquo; tab)</span>
                                </label>

                                <label className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1A1A1A] cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={isFavoriteMenuItem(editingMenuItem)}
                                    onChange={(e) => {
                                      const checked = e.target.checked;
                                      const currentNote = (editingMenuItem.note ?? '').trim();
                                      setEditingMenuItem({
                                        ...editingMenuItem,
                                        isFavorite: checked,
                                        note: checked
                                          ? currentNote || '⭐ Menu Favorit'
                                          : currentNote === '⭐ Menu Favorit'
                                          ? ''
                                          : currentNote,
                                      });
                                    }}
                                    className="w-4 h-4 accent-[#CC0000]"
                                  />
                                  <Star
                                    className="w-3.5 h-3.5 fill-amber-400 text-amber-400"
                                    aria-hidden="true"
                                  />
                                  <span>Tandai Menu Favorit</span>
                                </label>
                              </div>

                              <button
                                type="button"
                                disabled={saving || !editingMenuItem.name.trim()}
                                onClick={() => void handleSaveMenuItemForm()}
                                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#CC0000] hover:bg-[#A80000] text-white text-xs font-bold cursor-pointer disabled:opacity-50"
                              >
                                <Save className="w-3.5 h-3.5" />
                                <span>{saving ? 'Saving...' : 'Save Item'}</span>
                              </button>
                            </div>
                          </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                          {content.menuItems.map((item) => {
                            const favorite = isFavoriteMenuItem(item);
                            return (
                              <div
                                key={item.id}
                                className="p-3.5 rounded-2xl border border-black/8 bg-white flex items-center gap-3.5"
                              >
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="w-16 h-16 rounded-xl object-cover bg-[#F5F5F5] shrink-0"
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center flex-wrap gap-1.5">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#CC0000]">
                                      {item.category}
                                    </span>
                                    {favorite && (
                                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-50 border border-amber-200/80 text-amber-700">
                                        <Star
                                          className="w-2.5 h-2.5 fill-amber-400 text-amber-400"
                                          aria-hidden="true"
                                        />
                                        <span>Favorit</span>
                                      </span>
                                    )}
                                    {item.featured && (
                                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-[#F5F5F5] text-[#1A1A1A]">
                                        Featured
                                      </span>
                                    )}
                                  </div>
                                  <p className="font-display text-base font-bold text-[#1A1A1A] truncate">
                                    {item.name}
                                  </p>
                                  <p className="text-xs font-semibold text-[#666666]">
                                    {item.priceLabel}
                                  </p>
                                </div>
                                <div className="flex flex-col gap-1 shrink-0">
                                  <button
                                    type="button"
                                    onClick={() => setEditingMenuItem(item)}
                                    className="px-3 py-1 rounded-lg bg-[#F5F5F5] hover:bg-[#CC0000] text-[#1A1A1A] hover:text-white text-[11px] font-bold cursor-pointer transition-colors"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    type="button"
                                    disabled={saving}
                                    onClick={() => void handleDeleteMenuItem(item)}
                                    className="px-3 py-1 rounded-lg text-[11px] font-semibold text-[#666666] hover:text-[#CC0000] cursor-pointer inline-flex items-center justify-center"
                                    aria-label={`Delete ${item.name}`}
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </section>
                    </div>
                  )}

                  {/* TAB 4: WHY CHOOSE RASSA */}
                  {activeCmsTab === 'why-rassa' && (
                    <div className="space-y-8">
                      <section className="space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-black/8 pb-3">
                          <div>
                            <h3 className="font-display text-2xl font-extrabold uppercase text-[#1A1A1A]">
                              Why Choose Rassa Header
                            </h3>
                            <p className="text-xs text-[#666666]">
                              Section heading and center focal coffee splash image.
                            </p>
                          </div>
                          <button
                            type="button"
                            disabled={saving}
                            onClick={() =>
                              void runSave('Why Rassa Header', () =>
                                saveCmsSection('why_rassa', whyHeaderDraft)
                              )
                            }
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#CC0000] hover:bg-[#A80000] text-white text-xs font-bold cursor-pointer disabled:opacity-50"
                          >
                            <Save className="w-3.5 h-3.5" />
                            <span>Save Header</span>
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <Field
                            label="Eyebrow Label"
                            value={whyHeaderDraft.eyebrow}
                            maxLength={120}
                            onChange={(v) =>
                              setWhyHeaderDraft({ ...whyHeaderDraft, eyebrow: v })
                            }
                          />
                          <Field
                            label="Section Title"
                            value={whyHeaderDraft.title}
                            maxLength={300}
                            onChange={(v) =>
                              setWhyHeaderDraft({ ...whyHeaderDraft, title: v })
                            }
                          />
                        </div>

                        <ImageAssetPicker
                          label="Center Focal Cup Image"
                          value={whyHeaderDraft.centerImage}
                          onChange={(v) =>
                            setWhyHeaderDraft({ ...whyHeaderDraft, centerImage: v })
                          }
                        />
                      </section>

                      <section className="space-y-4 pt-6 border-t border-black/10">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <h4 className="font-display text-xl font-extrabold uppercase text-[#1A1A1A]">
                            4 Experience Highlights
                          </h4>
                          <button
                            type="button"
                            disabled={saving}
                            onClick={() =>
                              void runSave('Why Rassa Features', async () => {
                                if (!hasCloudWhyRassa) {
                                  await seedFeatureItemsDefaults(whyFeaturesDraft);
                                } else {
                                  for (const f of whyFeaturesDraft) {
                                    await saveFeatureItem(f);
                                  }
                                }
                              })
                            }
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#CC0000] hover:bg-[#A80000] text-white text-xs font-bold cursor-pointer disabled:opacity-50"
                          >
                            <Save className="w-3.5 h-3.5" />
                            <span>Save All 4 Highlights</span>
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {whyFeaturesDraft.map((feat, idx) => (
                            <div
                              key={feat.id}
                              className="p-4 rounded-2xl border border-black/8 bg-white space-y-3"
                            >
                              <div className="grid grid-cols-2 gap-3">
                                <Field
                                  label={`Highlight ${idx + 1} Title`}
                                  value={feat.title}
                                  maxLength={120}
                                  onChange={(v) => {
                                    const next = [...whyFeaturesDraft];
                                    next[idx] = { ...feat, title: v };
                                    setWhyFeaturesDraft(next);
                                  }}
                                />
                                <div className="space-y-1.5">
                                  <label className="block text-xs font-bold uppercase tracking-wider text-[#1A1A1A]">
                                    Icon
                                  </label>
                                  <select
                                    value={feat.icon}
                                    onChange={(e) => {
                                      const next = [...whyFeaturesDraft];
                                      next[idx] = {
                                        ...feat,
                                        icon: e.target.value as FeatureIconName,
                                      };
                                      setWhyFeaturesDraft(next);
                                    }}
                                    className="w-full px-3 py-2.5 rounded-xl border border-black/12 bg-white text-xs font-medium"
                                  >
                                    <option value="coffee">Coffee</option>
                                    <option value="droplets">Droplets</option>
                                    <option value="layout-grid">Grid</option>
                                    <option value="sun">Sun</option>
                                  </select>
                                </div>
                              </div>
                              <Field
                                label="Description"
                                value={feat.description}
                                maxLength={400}
                                multiline
                                rows={2}
                                onChange={(v) => {
                                  const next = [...whyFeaturesDraft];
                                  next[idx] = { ...feat, description: v };
                                  setWhyFeaturesDraft(next);
                                }}
                              />
                            </div>
                          ))}
                        </div>
                      </section>
                    </div>
                  )}

                  {/* TAB 5: GALLERY */}
                  {activeCmsTab === 'gallery' && (
                    <div className="space-y-8">
                      <section className="space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-black/8 pb-3">
                          <div>
                            <h3 className="font-display text-2xl font-extrabold uppercase text-[#1A1A1A]">
                              Gallery Header
                            </h3>
                            <p className="text-xs text-[#666666]">
                              Heading and subtitle above the 6-frame editorial photo grid.
                            </p>
                          </div>
                          <button
                            type="button"
                            disabled={saving}
                            onClick={() =>
                              void runSave('Gallery Header', () =>
                                saveCmsSection('gallery_header', galleryHeaderDraft)
                              )
                            }
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#CC0000] hover:bg-[#A80000] text-white text-xs font-bold cursor-pointer disabled:opacity-50"
                          >
                            <Save className="w-3.5 h-3.5" />
                            <span>Save Header</span>
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <Field
                            label="Eyebrow Label"
                            value={galleryHeaderDraft.eyebrow}
                            maxLength={120}
                            onChange={(v) =>
                              setGalleryHeaderDraft({
                                ...galleryHeaderDraft,
                                eyebrow: v,
                              })
                            }
                          />
                          <Field
                            label="Title"
                            value={galleryHeaderDraft.title}
                            maxLength={300}
                            onChange={(v) =>
                              setGalleryHeaderDraft({
                                ...galleryHeaderDraft,
                                title: v,
                              })
                            }
                          />
                        </div>
                        <Field
                          label="Description"
                          value={galleryHeaderDraft.description}
                          maxLength={1200}
                          multiline
                          rows={2}
                          onChange={(v) =>
                            setGalleryHeaderDraft({
                              ...galleryHeaderDraft,
                              description: v,
                            })
                          }
                        />
                      </section>

                      <section className="space-y-4 pt-6 border-t border-black/10">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <h4 className="font-display text-xl font-extrabold uppercase text-[#1A1A1A]">
                            Gallery Frames ({content.galleryItems.length})
                          </h4>
                          <button
                            type="button"
                            onClick={() =>
                              setEditingGalleryItem({
                                id: sanitizeId(`gallery-${Date.now()}`),
                                title: '',
                                category: 'Coffee Moment',
                                caption: '',
                                image: '/assets/gallery/cafe-interior.jpg',
                                alt: '',
                                sortOrder: content.galleryItems.length,
                              })
                            }
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#CC0000] hover:bg-[#A80000] text-white text-xs font-bold cursor-pointer"
                          >
                            <Plus className="w-4 h-4" />
                            <span>Add Photo</span>
                          </button>
                        </div>

                        {editingGalleryItem && (
                          <div className="p-5 rounded-2xl bg-[#F5F5F5] border-2 border-[#CC0000]/30 space-y-4">
                            <div className="flex items-center justify-between">
                              <h5 className="font-display text-lg font-extrabold uppercase text-[#CC0000]">
                                {editingGalleryItem.title
                                  ? `Editing: ${editingGalleryItem.title}`
                                  : 'New Gallery Frame'}
                              </h5>
                              <button
                                type="button"
                                onClick={() => setEditingGalleryItem(null)}
                                className="text-xs font-semibold text-[#666666] cursor-pointer"
                              >
                                Cancel
                              </button>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <Field
                                label="Photo Title"
                                value={editingGalleryItem.title}
                                maxLength={120}
                                onChange={(v) =>
                                  setEditingGalleryItem({
                                    ...editingGalleryItem,
                                    title: v,
                                  })
                                }
                              />
                              <Field
                                label="Category Label"
                                value={editingGalleryItem.category}
                                maxLength={80}
                                onChange={(v) =>
                                  setEditingGalleryItem({
                                    ...editingGalleryItem,
                                    category: v,
                                  })
                                }
                              />
                            </div>
                            <Field
                              label="Caption"
                              value={editingGalleryItem.caption}
                              maxLength={360}
                              multiline
                              rows={2}
                              onChange={(v) =>
                                setEditingGalleryItem({
                                  ...editingGalleryItem,
                                  caption: v,
                                })
                              }
                            />
                            <ImageAssetPicker
                              label="Photograph"
                              value={editingGalleryItem.image}
                              onChange={(v) =>
                                setEditingGalleryItem({
                                  ...editingGalleryItem,
                                  image: v,
                                })
                              }
                            />
                            <div className="flex justify-end">
                              <button
                                type="button"
                                disabled={
                                  saving || !editingGalleryItem.title.trim()
                                }
                                onClick={() => void handleSaveGalleryItemForm()}
                                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#CC0000] hover:bg-[#A80000] text-white text-xs font-bold cursor-pointer disabled:opacity-50"
                              >
                                <Save className="w-3.5 h-3.5" />
                                <span>{saving ? 'Saving...' : 'Save Frame'}</span>
                              </button>
                            </div>
                          </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                          {content.galleryItems.map((photo) => (
                            <div
                              key={photo.id}
                              className="p-3.5 rounded-2xl border border-black/8 bg-white flex items-center gap-3.5"
                            >
                              <img
                                src={photo.image}
                                alt={photo.alt}
                                className="w-16 h-16 rounded-xl object-cover bg-[#F5F5F5] shrink-0"
                              />
                              <div className="flex-1 min-w-0">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-[#CC0000]">
                                  {photo.category}
                                </span>
                                <p className="font-display text-base font-bold text-[#1A1A1A] truncate">
                                  {photo.title}
                                </p>
                                <p className="text-xs text-[#666666] line-clamp-1">
                                  {photo.caption}
                                </p>
                              </div>
                              <div className="flex flex-col gap-1 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => setEditingGalleryItem(photo)}
                                  className="px-3 py-1 rounded-lg bg-[#F5F5F5] hover:bg-[#CC0000] text-[#1A1A1A] hover:text-white text-[11px] font-bold cursor-pointer"
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  disabled={saving}
                                  onClick={() => void handleDeleteGalleryItem(photo)}
                                  className="px-3 py-1 rounded-lg text-[11px] font-semibold text-[#666666] hover:text-[#CC0000] cursor-pointer inline-flex items-center justify-center"
                                  aria-label={`Delete ${photo.title}`}
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </section>
                    </div>
                  )}

                  {/* TAB 6: VISIT US & MAP */}
                  {activeCmsTab === 'visit' && (
                    <section className="space-y-5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-black/8 pb-3">
                        <div>
                          <h3 className="font-display text-2xl font-extrabold uppercase text-[#1A1A1A]">
                            Visit Us, Hours & Socials
                          </h3>
                          <p className="text-xs text-[#666666]">
                            Address, daily opening schedule, Instagram, TikTok, and Google Maps.
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setVisitDraft(DEFAULT_CMS_STATE.visit)}
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full border border-black/12 text-xs font-semibold text-[#666666] cursor-pointer"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Reset</span>
                          </button>
                          <button
                            type="button"
                            disabled={saving}
                            onClick={() =>
                              void runSave('Visit Us', () =>
                                saveCmsSection('visit', visitDraft)
                              )
                            }
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#CC0000] hover:bg-[#A80000] text-white text-xs font-bold cursor-pointer disabled:opacity-50"
                          >
                            <Save className="w-3.5 h-3.5" />
                            <span>Save Visit Us</span>
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Field
                          label="Eyebrow Label"
                          value={visitDraft.eyebrow}
                          maxLength={120}
                          onChange={(v) => setVisitDraft({ ...visitDraft, eyebrow: v })}
                        />
                        <Field
                          label="Section Title"
                          value={visitDraft.title}
                          maxLength={300}
                          onChange={(v) => setVisitDraft({ ...visitDraft, title: v })}
                        />
                      </div>

                      <Field
                        label="Description"
                        value={visitDraft.description}
                        maxLength={1200}
                        multiline
                        rows={2}
                        onChange={(v) => setVisitDraft({ ...visitDraft, description: v })}
                      />

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Field
                          label="Outlet Name"
                          value={visitDraft.outletName}
                          maxLength={120}
                          onChange={(v) =>
                            setVisitDraft({ ...visitDraft, outletName: v })
                          }
                        />
                        <Field
                          label="Short Area Label"
                          value={visitDraft.shortArea}
                          maxLength={120}
                          onChange={(v) =>
                            setVisitDraft({ ...visitDraft, shortArea: v })
                          }
                        />
                      </div>

                      <Field
                        label="Full Address"
                        value={visitDraft.address}
                        maxLength={400}
                        multiline
                        rows={2}
                        onChange={(v) => setVisitDraft({ ...visitDraft, address: v })}
                      />

                      <div className="p-4 rounded-2xl bg-[#F5F5F5] border border-black/8 space-y-4">
                        <p className="text-xs font-bold uppercase tracking-wider text-[#CC0000]">
                          Operating Hours
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <Field
                            label="Monday - Thursday"
                            value={visitDraft.monThuHours}
                            maxLength={80}
                            onChange={(v) =>
                              setVisitDraft({ ...visitDraft, monThuHours: v })
                            }
                          />
                          <Field
                            label="Friday"
                            value={visitDraft.friHours}
                            maxLength={80}
                            onChange={(v) =>
                              setVisitDraft({ ...visitDraft, friHours: v })
                            }
                          />
                          <Field
                            label="Saturday"
                            value={visitDraft.satHours}
                            maxLength={80}
                            onChange={(v) =>
                              setVisitDraft({ ...visitDraft, satHours: v })
                            }
                          />
                          <Field
                            label="Sunday"
                            value={visitDraft.sunHours}
                            maxLength={80}
                            onChange={(v) =>
                              setVisitDraft({ ...visitDraft, sunHours: v })
                            }
                          />
                        </div>
                        <label className="inline-flex items-center gap-2 text-xs font-bold text-[#1A1A1A] cursor-pointer">
                          <input
                            type="checkbox"
                            checked={visitDraft.sunClosed}
                            onChange={(e) =>
                              setVisitDraft({
                                ...visitDraft,
                                sunClosed: e.target.checked,
                              })
                            }
                            className="w-4 h-4 accent-[#CC0000]"
                          />
                          <span>Highlight Sunday status in Crimson Red (Closed)</span>
                        </label>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Field
                          label="Instagram Handle"
                          value={visitDraft.instagramHandle}
                          maxLength={80}
                          onChange={(v) =>
                            setVisitDraft({ ...visitDraft, instagramHandle: v })
                          }
                        />
                        <Field
                          label="Instagram URL"
                          value={visitDraft.instagramUrl}
                          maxLength={300}
                          onChange={(v) =>
                            setVisitDraft({ ...visitDraft, instagramUrl: v })
                          }
                        />
                        <Field
                          label="TikTok Handle"
                          value={visitDraft.tiktokHandle}
                          maxLength={80}
                          onChange={(v) =>
                            setVisitDraft({ ...visitDraft, tiktokHandle: v })
                          }
                        />
                        <Field
                          label="TikTok URL"
                          value={visitDraft.tiktokUrl}
                          maxLength={300}
                          onChange={(v) =>
                            setVisitDraft({ ...visitDraft, tiktokUrl: v })
                          }
                        />
                      </div>

                      <Field
                        label="Google Maps Directions URL"
                        value={visitDraft.googleMapsUrl}
                        maxLength={500}
                        onChange={(v) =>
                          setVisitDraft({ ...visitDraft, googleMapsUrl: v })
                        }
                      />
                      <Field
                        label="Google Maps Embed Iframe URL"
                        value={visitDraft.googleMapsEmbedUrl}
                        maxLength={800}
                        onChange={(v) =>
                          setVisitDraft({ ...visitDraft, googleMapsEmbedUrl: v })
                        }
                      />
                    </section>
                  )}

                  {/* TAB 7: FINAL CTA & FOOTER */}
                  {activeCmsTab === 'cta-footer' && (
                    <div className="space-y-8">
                      <section className="space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-black/8 pb-3">
                          <div>
                            <h3 className="font-display text-2xl font-extrabold uppercase text-[#1A1A1A]">
                              Final CTA Section
                            </h3>
                            <p className="text-xs text-[#666666]">
                              Red closing banner right before the footer.
                            </p>
                          </div>
                          <button
                            type="button"
                            disabled={saving}
                            onClick={() =>
                              void runSave('Final CTA', () =>
                                saveCmsSection('final_cta', finalCtaDraft)
                              )
                            }
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#CC0000] hover:bg-[#A80000] text-white text-xs font-bold cursor-pointer disabled:opacity-50"
                          >
                            <Save className="w-3.5 h-3.5" />
                            <span>Save Final CTA</span>
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <Field
                            label="Eyebrow Label"
                            value={finalCtaDraft.eyebrow}
                            maxLength={120}
                            onChange={(v) =>
                              setFinalCtaDraft({ ...finalCtaDraft, eyebrow: v })
                            }
                          />
                          <Field
                            label="Button Label"
                            value={finalCtaDraft.ctaLabel}
                            maxLength={80}
                            onChange={(v) =>
                              setFinalCtaDraft({ ...finalCtaDraft, ctaLabel: v })
                            }
                          />
                        </div>
                        <Field
                          label="Headline"
                          value={finalCtaDraft.title}
                          maxLength={300}
                          onChange={(v) =>
                            setFinalCtaDraft({ ...finalCtaDraft, title: v })
                          }
                        />
                        <Field
                          label="Description"
                          value={finalCtaDraft.description}
                          maxLength={1200}
                          multiline
                          rows={2}
                          onChange={(v) =>
                            setFinalCtaDraft({ ...finalCtaDraft, description: v })
                          }
                        />
                        <ImageAssetPicker
                          label="Side Accent Image"
                          value={finalCtaDraft.accentImage}
                          onChange={(v) =>
                            setFinalCtaDraft({ ...finalCtaDraft, accentImage: v })
                          }
                        />
                      </section>

                      <section className="space-y-4 pt-6 border-t border-black/10">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div>
                            <h3 className="font-display text-2xl font-extrabold uppercase text-[#1A1A1A]">
                              Brand & Footer
                            </h3>
                            <p className="text-xs text-[#666666]">
                              Logo image across Navbar & Footer, philosophy text, hours summary, and copyright.
                            </p>
                          </div>
                          <button
                            type="button"
                            disabled={saving}
                            onClick={() =>
                              void runSave('Footer & Brand', () =>
                                saveCmsSection('footer', footerDraft)
                              )
                            }
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#CC0000] hover:bg-[#A80000] text-white text-xs font-bold cursor-pointer disabled:opacity-50"
                          >
                            <Save className="w-3.5 h-3.5" />
                            <span>Save Footer</span>
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <Field
                            label="Brand Name"
                            value={footerDraft.brandName}
                            maxLength={120}
                            onChange={(v) =>
                              setFooterDraft({ ...footerDraft, brandName: v })
                            }
                          />
                          <Field
                            label="Tagline"
                            value={footerDraft.tagline}
                            maxLength={200}
                            onChange={(v) =>
                              setFooterDraft({ ...footerDraft, tagline: v })
                            }
                          />
                        </div>
                        <Field
                          label="Footer Philosophy Text"
                          value={footerDraft.description}
                          maxLength={1200}
                          multiline
                          rows={2}
                          onChange={(v) =>
                            setFooterDraft({ ...footerDraft, description: v })
                          }
                        />
                        <Field
                          label="Footer Hours Summary"
                          value={footerDraft.hoursSummary}
                          maxLength={200}
                          onChange={(v) =>
                            setFooterDraft({ ...footerDraft, hoursSummary: v })
                          }
                        />
                        <ImageAssetPicker
                          label="Brand Logo (Navbar & Footer)"
                          value={footerDraft.logoUrl}
                          onChange={(v) =>
                            setFooterDraft({
                              ...footerDraft,
                              logoUrl: v,
                              centerImage: v,
                            })
                          }
                        />
                      </section>
                    </div>
                  )}

                  {/* TAB 8: ACCOUNTS & ROLES (SUPER ADMIN ONLY) */}
                  {activeCmsTab === 'accounts' && isSuperAdmin && user && (
                    <AccountsTab currentUserId={user.id} onNotify={notify} />
                  )}
                </div>
              </div>
            )}
    </div>
  );
}
