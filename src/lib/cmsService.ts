import { createEphemeralAuthClient, supabase } from './supabase';
import { DEFAULT_CMS_STATE } from '@/src/data/cmsDefaults';
import type { FeatureIconName } from '@/src/data/features';
import type { MenuCategory } from '@/src/data/menu';
import type {
  AboutContent,
  AdminRole,
  CmsAdminAccount,
  CmsFeatureItem,
  CmsGalleryItem,
  CmsMenuItem,
  CmsSectionId,
  CmsSiteState,
  FinalCtaContent,
  FooterContent,
  GalleryHeaderContent,
  HeroContent,
  MarqueeContent,
  MenuHeaderContent,
  VisitContent,
  WhyRassaHeaderContent,
} from '@/src/types/cms';

export interface CmsFetchResult {
  state: CmsSiteState;
  hasCloudMenuItems: boolean;
  hasCloudGalleryItems: boolean;
  hasCloudWhyRassa: boolean;
  hasCloudAboutTiles: boolean;
  hasCloudStoryPillars: boolean;
  schemaReady: boolean;
}

function clampStr(val: unknown, maxLen: number): string {
  const s = typeof val === 'string' ? val : String(val ?? '');
  return s.slice(0, maxLen);
}

export function normalizeMenuCategory(raw: unknown): MenuCategory {
  if (raw === 'Non Coffee' || raw === 'Non-Coffee') return 'Non Coffee';
  if (raw === 'Black Series') return 'Black Series';
  if (raw === 'Makanan') return 'Makanan';
  if (raw === 'Cemilan') return 'Cemilan';
  if (raw === 'Aneka Roti' || raw === 'Food & Snacks') return 'Aneka Roti';
  return 'Coffee';
}

const LEGACY_ASSET_MAP: Record<string, string> = {
  '/assets/aistudio/rk-merah_3eab846b.png': '/assets/brand/rassa-logo.png',
  '/assets/aistudio/ripped-paper_26126c62.png': '/assets/brand/torn-edge-paper.png',
  '/assets/aistudio/hs-1_cd29f32f.png': '/assets/hero/hero-coffee-splash.png',
  '/assets/aistudio/hs-2_b26ad454.png': '/assets/hero/hero-iced-cup.png',
  '/src/assets/images/about_barista_craft_1794809733562.jpg': '/assets/about/barista-craft.jpg',
  '/src/assets/images/splash_cup_crimson_1794811142519.jpg': '/assets/why-rassa/crimson-splash-cup.png',
  '/assets/why-rassa/crimson-splash-cup.jpg': '/assets/why-rassa/crimson-splash-cup.png',
  '/src/assets/images/gallery_cafe_interior_1794809736966.jpg': '/assets/gallery/cafe-interior.jpg',
  '/src/assets/images/gallery_espresso_pull_1794809737051.jpg': '/assets/gallery/espresso-pull.jpg',
  '/src/assets/images/hero_signature_coffee_clean_1794809753444.jpg': '/assets/gallery/signature-iced-latte.jpg',
  '/src/assets/images/gallery_customer_moment_1794809738132.jpg': '/assets/gallery/customer-moment.jpg',
  '/src/assets/images/gallery_pour_over_brew_1794809756125.jpg': '/assets/gallery/pour-over-brew.jpg',
  '/src/assets/images/menu_seasalt_caramel_1794833008589.jpg': '/assets/menu/sea-salt-caramel.jpg',
  '/src/assets/images/menu_kopi_pandan_1794833008458.jpg': '/assets/menu/kopi-susu-pandan.jpg',
  '/src/assets/images/menu_choco_pistachio_1794833008339.jpg': '/assets/menu/choco-pistachio.jpg',
  '/src/assets/images/menu_matcha_strawberry_1794833008223.jpg': '/assets/menu/matcha-strawberry.jpg',
  '/src/assets/images/menu_black_series_1794833009483.jpg': '/assets/menu/black-series.jpg',
  '/src/assets/images/menu_rassa_latte_1794809733695.jpg': '/assets/menu/rassa-latte.jpg',
  '/src/assets/images/menu_iced_americano_1794809733630.jpg': '/assets/menu/iced-americano.jpg',
  '/src/assets/images/menu_hot_cappuccino_1794809735003.jpg': '/assets/menu/hot-cappuccino.jpg',
  '/src/assets/images/menu_iced_matcha_clean_1794809755426.jpg': '/assets/menu/iced-matcha.jpg',
  '/src/assets/images/menu_peach_tea_1794833006974.jpg': '/assets/menu/peach-mango-tea.jpg',
  '/src/assets/images/menu_lychee_honey_lemon_1794833006804.jpg': '/assets/menu/lychee-honey-lemon.jpg',
  '/src/assets/images/menu_yakult_fusion_1794833007419.jpg': '/assets/menu/yakult-fusion.jpg',
  '/src/assets/images/menu_indomie_komplit_1794833009915.jpg': '/assets/menu/indomie-komplit.jpg',
  '/src/assets/images/menu_cireng_pedas_1794833011765.jpg': '/assets/menu/cireng-ayam-pedas.jpg',
  '/src/assets/images/menu_french_fries_platter_1794833011081.jpg': '/assets/menu/french-fries-platter.jpg',
  '/src/assets/images/menu_singkong_keju_1794833013196.jpg': '/assets/menu/singkong-keju.jpg',
  '/src/assets/images/menu_pain_suisse_brownies_1794833013725.jpg': '/assets/menu/pain-suisse-brownies.jpg',
  '/src/assets/images/menu_butter_croissant_1794809735671.jpg': '/assets/menu/butter-croissant.jpg',
};

export function normalizeAssetUrl(raw: unknown, fallback = ''): string {
  if (typeof raw !== 'string' || !raw.trim()) return fallback;
  const trimmed = raw.trim();
  return LEGACY_ASSET_MAP[trimmed] ?? trimmed;
}

export function sanitizeId(raw: string): string {
  const cleaned = raw
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
  return cleaned || `item-${Date.now()}`;
}

function isMissingTableError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const errObj = error as { code?: string; message?: string };
  return (
    errObj.code === '42P01' ||
    errObj.code === 'PGRST205' ||
    (typeof errObj.message === 'string' &&
      (errObj.message.includes('does not exist') ||
        errObj.message.includes('Could not find the table')))
  );
}

async function getCurrentUidOrThrow(): Promise<string> {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    throw new Error('Autentikasi diperlukan sebelum menyimpan perubahan CMS.');
  }
  return data.user.id;
}

export function sectionPayloadToPartialState(
  sectionId: CmsSectionId,
  payload: Record<string, unknown>
): Partial<CmsSiteState> {
  switch (sectionId) {
    case 'hero': {
      const d = DEFAULT_CMS_STATE.hero;
      return {
        hero: {
          eyebrow: (payload.eyebrow as string) ?? d.eyebrow,
          line1: (payload.line1 as string) ?? d.line1,
          line2: (payload.line2 as string) ?? d.line2,
          line3Highlight: (payload.line3Highlight as string) ?? d.line3Highlight,
          description: (payload.description as string) ?? d.description,
          primaryCtaLabel: (payload.primaryCtaLabel as string) ?? d.primaryCtaLabel,
          secondaryCtaLabel: (payload.secondaryCtaLabel as string) ?? d.secondaryCtaLabel,
          splashImage: normalizeAssetUrl(payload.splashImage, d.splashImage),
          cupImage: normalizeAssetUrl(payload.cupImage, d.cupImage),
        },
      };
    }
    case 'marquee': {
      const d = DEFAULT_CMS_STATE.marquee;
      return {
        marquee: {
          frontPhrase: (payload.frontPhrase as string) ?? d.frontPhrase,
          backPhrase: (payload.backPhrase as string) ?? d.backPhrase,
        },
      };
    }
    case 'about': {
      const d = DEFAULT_CMS_STATE.about;
      return {
        about: {
          eyebrow: (payload.eyebrow as string) ?? d.eyebrow,
          headlinePart1: (payload.headlinePart1 as string) ?? d.headlinePart1,
          headlinePart2: (payload.headlinePart2 as string) ?? d.headlinePart2,
          headlinePart3: (payload.headlinePart3 as string) ?? d.headlinePart3,
          headlinePart4: (payload.headlinePart4 as string) ?? d.headlinePart4,
          pillImage1: normalizeAssetUrl(payload.pillImage1, d.pillImage1),
          pillImage2: normalizeAssetUrl(payload.pillImage2, d.pillImage2),
          pillImage3: normalizeAssetUrl(payload.pillImage3, d.pillImage3),
          description: (payload.description as string) ?? d.description,
          ctaLabel: (payload.ctaLabel as string) ?? d.ctaLabel,
          storyModalHeadline: (payload.storyModalHeadline as string) ?? d.storyModalHeadline,
          storyModalParagraph1:
            (payload.storyModalParagraph1 as string) ?? d.storyModalParagraph1,
          storyModalParagraph2:
            (payload.storyModalParagraph2 as string) ?? d.storyModalParagraph2,
          storyModalImage: normalizeAssetUrl(payload.storyModalImage, d.storyModalImage),
        },
      };
    }
    case 'menu_header': {
      const d = DEFAULT_CMS_STATE.menuHeader;
      return {
        menuHeader: {
          eyebrow: (payload.eyebrow as string) ?? d.eyebrow,
          title: (payload.title as string) ?? d.title,
          description: (payload.description as string) ?? d.description,
          ctaLabel: (payload.ctaLabel as string) ?? d.ctaLabel,
          footnote: (payload.footnote as string) ?? d.footnote,
        },
      };
    }
    case 'why_rassa': {
      const d = DEFAULT_CMS_STATE.whyRassaHeader;
      return {
        whyRassaHeader: {
          eyebrow: (payload.eyebrow as string) ?? d.eyebrow,
          title: (payload.title as string) ?? d.title,
          centerImage: normalizeAssetUrl(payload.centerImage, d.centerImage),
        },
      };
    }
    case 'gallery_header': {
      const d = DEFAULT_CMS_STATE.galleryHeader;
      return {
        galleryHeader: {
          eyebrow: (payload.eyebrow as string) ?? d.eyebrow,
          title: (payload.title as string) ?? d.title,
          description: (payload.description as string) ?? d.description,
        },
      };
    }
    case 'visit': {
      const d = DEFAULT_CMS_STATE.visit;
      return {
        visit: {
          eyebrow: (payload.eyebrow as string) ?? d.eyebrow,
          title: (payload.title as string) ?? d.title,
          description: (payload.description as string) ?? d.description,
          outletName: (payload.outletName as string) ?? d.outletName,
          address: (payload.address as string) ?? d.address,
          shortArea: (payload.shortArea as string) ?? d.shortArea,
          monThuHours: (payload.monThuHours as string) ?? d.monThuHours,
          friHours: (payload.friHours as string) ?? d.friHours,
          satHours: (payload.satHours as string) ?? d.satHours,
          sunHours: (payload.sunHours as string) ?? d.sunHours,
          sunClosed:
            typeof payload.sunClosed === 'boolean' ? payload.sunClosed : d.sunClosed,
          instagramHandle: (payload.instagramHandle as string) ?? d.instagramHandle,
          instagramUrl: (payload.instagramUrl as string) ?? d.instagramUrl,
          tiktokHandle: (payload.tiktokHandle as string) ?? d.tiktokHandle,
          tiktokUrl: (payload.tiktokUrl as string) ?? d.tiktokUrl,
          googleMapsUrl: (payload.googleMapsUrl as string) ?? d.googleMapsUrl,
          googleMapsEmbedUrl:
            (payload.googleMapsEmbedUrl as string) ?? d.googleMapsEmbedUrl,
          ctaLabel: (payload.ctaLabel as string) ?? d.ctaLabel,
        },
      };
    }
    case 'final_cta': {
      const d = DEFAULT_CMS_STATE.finalCta;
      return {
        finalCta: {
          eyebrow: (payload.eyebrow as string) ?? d.eyebrow,
          title: (payload.title as string) ?? d.title,
          description: (payload.description as string) ?? d.description,
          ctaLabel: (payload.ctaLabel as string) ?? d.ctaLabel,
          accentImage: normalizeAssetUrl(payload.accentImage, d.accentImage),
        },
      };
    }
    case 'footer': {
      const d = DEFAULT_CMS_STATE.footer;
      return {
        footer: {
          brandName: (payload.brandName as string) ?? d.brandName,
          logoUrl: normalizeAssetUrl(payload.logoUrl, d.logoUrl),
          tagline: (payload.tagline as string) ?? d.tagline,
          description: (payload.description as string) ?? d.description,
          hoursSummary: (payload.hoursSummary as string) ?? d.hoursSummary,
          centerImage: normalizeAssetUrl(payload.centerImage, d.centerImage),
          copyrightYear:
            typeof payload.copyrightYear === 'number'
              ? payload.copyrightYear
              : d.copyrightYear,
        },
      };
    }
  }
}

export async function fetchAllCmsData(): Promise<CmsFetchResult> {
  const [sectionsRes, menuRes, galleryRes, featuresRes] = await Promise.all([
    supabase
      .from('cms_sections')
      .select('section_id, payload')
      .eq('is_public', true),
    supabase
      .from('menu_items')
      .select('*')
      .eq('is_public', true)
      .order('sort_order', { ascending: true }),
    supabase
      .from('gallery_items')
      .select('*')
      .eq('is_public', true)
      .order('sort_order', { ascending: true }),
    supabase
      .from('feature_items')
      .select('*')
      .eq('is_public', true)
      .order('sort_order', { ascending: true }),
  ]);

  const errors = [
    sectionsRes.error,
    menuRes.error,
    galleryRes.error,
    featuresRes.error,
  ].filter(Boolean);

  if (errors.some(isMissingTableError)) {
    return {
      state: DEFAULT_CMS_STATE,
      hasCloudMenuItems: false,
      hasCloudGalleryItems: false,
      hasCloudWhyRassa: false,
      hasCloudAboutTiles: false,
      hasCloudStoryPillars: false,
      schemaReady: false,
    };
  }

  let nextState: CmsSiteState = { ...DEFAULT_CMS_STATE };

  if (sectionsRes.data) {
    const sectionUpdates: Partial<CmsSiteState> = {};
    for (const row of sectionsRes.data) {
      const sectionId = row.section_id as CmsSectionId;
      const payload =
        row.payload && typeof row.payload === 'object'
          ? (row.payload as Record<string, unknown>)
          : {};
      Object.assign(sectionUpdates, sectionPayloadToPartialState(sectionId, payload));
    }
    nextState = { ...nextState, ...sectionUpdates };
  }

  const menuRows = menuRes.data ?? [];
  const hasCloudMenuItems = menuRows.length > 0;
  if (hasCloudMenuItems) {
    nextState.menuItems = menuRows.map((d) => {
      const note = d.note || undefined;
      const isFavorite =
        Boolean(note) &&
        (note!.includes('⭐') ||
          note!.toLowerCase().includes('favorit') ||
          note!.toLowerCase().includes('favorite'));
      return {
        id: d.id,
        name: d.name ?? '',
        category: normalizeMenuCategory(d.category),
        description: d.description ?? '',
        priceLabel: d.price_label ?? '',
        numericPrice: typeof d.numeric_price === 'number' ? d.numeric_price : 0,
        image: normalizeAssetUrl(d.image),
        imageAlt: d.image_alt ?? d.name ?? '',
        featured: Boolean(d.featured),
        isFavorite,
        note,
        sortOrder: typeof d.sort_order === 'number' ? d.sort_order : 0,
      };
    });
  }

  const galleryRows = galleryRes.data ?? [];
  const hasCloudGalleryItems = galleryRows.length > 0;
  if (hasCloudGalleryItems) {
    nextState.galleryItems = galleryRows.map((d) => ({
      id: d.id,
      title: d.title ?? '',
      category: d.category ?? '',
      caption: d.caption ?? '',
      image: normalizeAssetUrl(d.image),
      alt: d.alt ?? d.title ?? '',
      sortOrder: typeof d.sort_order === 'number' ? d.sort_order : 0,
    }));
  }

  const featureRows: CmsFeatureItem[] = (featuresRes.data ?? []).map((d) => ({
    id: d.id,
    group: d.group,
    badgeNumber: d.badge_number ?? '01',
    title: d.title ?? '',
    description: d.description ?? '',
    icon: (d.icon as FeatureIconName) ?? 'coffee',
    image: normalizeAssetUrl(d.image),
    category: normalizeMenuCategory(d.category),
    sortOrder: typeof d.sort_order === 'number' ? d.sort_order : 0,
  }));

  const whyList = featureRows.filter((f) => f.group === 'why_rassa');
  const tileList = featureRows.filter((f) => f.group === 'about_tile');
  const pillarList = featureRows.filter((f) => f.group === 'story_pillar');

  if (whyList.length > 0) nextState.whyRassaFeatures = whyList;
  if (tileList.length > 0) nextState.aboutTiles = tileList;
  if (pillarList.length > 0) nextState.storyPillars = pillarList;

  return {
    state: nextState,
    hasCloudMenuItems,
    hasCloudGalleryItems,
    hasCloudWhyRassa: whyList.length > 0,
    hasCloudAboutTiles: tileList.length > 0,
    hasCloudStoryPillars: pillarList.length > 0,
    schemaReady: true,
  };
}

export async function saveCmsSection(
  sectionId: CmsSectionId,
  value:
    | HeroContent
    | MarqueeContent
    | AboutContent
    | MenuHeaderContent
    | WhyRassaHeaderContent
    | GalleryHeaderContent
    | VisitContent
    | FinalCtaContent
    | FooterContent
): Promise<void> {
  const uid = await getCurrentUidOrThrow();
  const { error } = await supabase.from('cms_sections').upsert(
    {
      section_id: sectionId,
      payload: value,
      is_public: true,
      updated_by: uid,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'section_id' }
  );
  if (error) throw new Error(error.message);
}

function mapMenuItemToRow(item: CmsMenuItem, uid: string) {
  const numericPrice = Math.max(
    0,
    Math.min(100000000, Number.isFinite(item.numericPrice) ? item.numericPrice : 0)
  );
  const sortOrder = Math.max(
    0,
    Math.min(10000, Number.isFinite(item.sortOrder) ? Math.round(item.sortOrder) : 0)
  );
  return {
    id: sanitizeId(item.id || item.name),
    name: clampStr(item.name || 'Untitled Item', 120),
    category: item.category,
    description: clampStr(item.description, 400),
    price_label: clampStr(item.priceLabel, 40),
    numeric_price: numericPrice,
    image: clampStr(item.image, 1000),
    image_alt: clampStr(item.imageAlt || item.name, 240),
    featured: Boolean(item.featured),
    note: clampStr(item.note ?? '', 60),
    sort_order: sortOrder,
    is_public: true,
    updated_by: uid,
    updated_at: new Date().toISOString(),
  };
}

export async function saveMenuItem(item: CmsMenuItem): Promise<void> {
  const uid = await getCurrentUidOrThrow();
  const row = mapMenuItemToRow(item, uid);
  const { error } = await supabase
    .from('menu_items')
    .upsert(row, { onConflict: 'id' });
  if (error) throw new Error(error.message);
}

export async function deleteMenuItem(itemId: string): Promise<void> {
  await getCurrentUidOrThrow();
  const id = sanitizeId(itemId);
  const { error } = await supabase.from('menu_items').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

function mapGalleryItemToRow(photo: CmsGalleryItem, uid: string) {
  const sortOrder = Math.max(
    0,
    Math.min(10000, Number.isFinite(photo.sortOrder) ? Math.round(photo.sortOrder) : 0)
  );
  return {
    id: sanitizeId(photo.id || photo.title),
    title: clampStr(photo.title || 'Untitled Photo', 120),
    category: clampStr(photo.category || 'Coffee Moment', 80),
    caption: clampStr(photo.caption, 360),
    image: clampStr(photo.image, 1000),
    alt: clampStr(photo.alt || photo.title, 240),
    sort_order: sortOrder,
    is_public: true,
    updated_by: uid,
    updated_at: new Date().toISOString(),
  };
}

export async function saveGalleryItem(photo: CmsGalleryItem): Promise<void> {
  const uid = await getCurrentUidOrThrow();
  const row = mapGalleryItemToRow(photo, uid);
  const { error } = await supabase
    .from('gallery_items')
    .upsert(row, { onConflict: 'id' });
  if (error) throw new Error(error.message);
}

export async function deleteGalleryItem(photoId: string): Promise<void> {
  await getCurrentUidOrThrow();
  const id = sanitizeId(photoId);
  const { error } = await supabase.from('gallery_items').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

function mapFeatureItemToRow(item: CmsFeatureItem, uid: string) {
  const sortOrder = Math.max(
    0,
    Math.min(10000, Number.isFinite(item.sortOrder) ? Math.round(item.sortOrder) : 0)
  );
  return {
    id: sanitizeId(item.id || item.title),
    group: item.group,
    badge_number: clampStr(item.badgeNumber, 16),
    title: clampStr(item.title || 'Feature', 120),
    description: clampStr(item.description, 400),
    icon: item.icon,
    image: clampStr(item.image, 1000),
    category: clampStr(item.category, 40),
    sort_order: sortOrder,
    is_public: true,
    updated_by: uid,
    updated_at: new Date().toISOString(),
  };
}

export async function saveFeatureItem(item: CmsFeatureItem): Promise<void> {
  const uid = await getCurrentUidOrThrow();
  const row = mapFeatureItemToRow(item, uid);
  const { error } = await supabase
    .from('feature_items')
    .upsert(row, { onConflict: 'id' });
  if (error) throw new Error(error.message);
}

export async function seedMenuItemsDefaults(): Promise<void> {
  const uid = await getCurrentUidOrThrow();
  const rows = DEFAULT_CMS_STATE.menuItems.map((item) => mapMenuItemToRow(item, uid));
  const { error } = await supabase
    .from('menu_items')
    .upsert(rows, { onConflict: 'id' });
  if (error) throw new Error(error.message);
}

export async function replaceMenuItemsWithOfficialDefaults(): Promise<void> {
  const uid = await getCurrentUidOrThrow();
  const { error: delError } = await supabase
    .from('menu_items')
    .delete()
    .neq('id', '__keep_none__');
  if (delError) throw new Error(delError.message);

  const rows = DEFAULT_CMS_STATE.menuItems.map((item) => mapMenuItemToRow(item, uid));
  const { error } = await supabase
    .from('menu_items')
    .upsert(rows, { onConflict: 'id' });
  if (error) throw new Error(error.message);
}

export async function seedGalleryItemsDefaults(): Promise<void> {
  const uid = await getCurrentUidOrThrow();
  const rows = DEFAULT_CMS_STATE.galleryItems.map((photo) =>
    mapGalleryItemToRow(photo, uid)
  );
  const { error } = await supabase
    .from('gallery_items')
    .upsert(rows, { onConflict: 'id' });
  if (error) throw new Error(error.message);
}

export async function seedFeatureItemsDefaults(
  items: CmsFeatureItem[]
): Promise<void> {
  const uid = await getCurrentUidOrThrow();
  const rows = items.map((item) => mapFeatureItemToRow(item, uid));
  const { error } = await supabase
    .from('feature_items')
    .upsert(rows, { onConflict: 'id' });
  if (error) throw new Error(error.message);
}

// =============================================================================
// RBAC & Account Management (Super Admin Only)
// =============================================================================

export async function fetchMyAdminProfile(
  userId: string
): Promise<CmsAdminAccount | null> {
  const { data, error } = await supabase
    .from('admin_users')
    .select('id, email, full_name, role, is_active, created_at')
    .eq('id', userId)
    .maybeSingle();

  if (error || !data) return null;

  return {
    id: data.id,
    email: data.email,
    fullName: data.full_name ?? '',
    role: data.role as AdminRole,
    isActive: Boolean(data.is_active),
    createdAt: data.created_at,
  };
}

export async function fetchAdminAccounts(): Promise<CmsAdminAccount[]> {
  const { data, error } = await supabase
    .from('admin_users')
    .select('id, email, full_name, role, is_active, created_at')
    .order('created_at', { ascending: true });

  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => ({
    id: row.id,
    email: row.email,
    fullName: row.full_name ?? '',
    role: row.role as AdminRole,
    isActive: Boolean(row.is_active),
    createdAt: row.created_at,
  }));
}

export async function createCmsAccount(params: {
  email: string;
  password: string;
  fullName: string;
  role: AdminRole;
}): Promise<'created' | 'updated_existing'> {
  const cleanEmail = params.email.trim().toLowerCase();
  const cleanName = params.fullName.trim();

  // Step 1: Verified via Supabase SECURITY DEFINER RPC (strictly super_admin only)
  const { data: prepStatus, error: prepError } = await supabase.rpc(
    'prepare_admin_account',
    {
      p_email: cleanEmail,
      p_role: params.role,
      p_full_name: cleanName,
    }
  );

  if (prepError) {
    throw new Error(prepError.message);
  }

  if (prepStatus === 'linked_existing') {
    return 'updated_existing';
  }

  // Step 2: Create Auth account using ephemeral client so Super Admin stays signed in
  const ephemeral = createEphemeralAuthClient();
  const { data: signUpData, error: signUpError } = await ephemeral.auth.signUp({
    email: cleanEmail,
    password: params.password,
    options: {
      data: {
        full_name: cleanName,
      },
    },
  });

  if (signUpError) {
    throw new Error(signUpError.message);
  }

  if (!signUpData.user) {
    throw new Error('Gagal membuat akun Supabase Auth baru.');
  }

  return 'created';
}

export async function updateAdminAccountRole(
  accountId: string,
  role: AdminRole
): Promise<void> {
  const { error } = await supabase
    .from('admin_users')
    .update({ role, updated_at: new Date().toISOString() })
    .eq('id', accountId);
  if (error) throw new Error(error.message);
}

export async function toggleAdminAccountActive(
  accountId: string,
  isActive: boolean
): Promise<void> {
  const { error } = await supabase
    .from('admin_users')
    .update({ is_active: isActive, updated_at: new Date().toISOString() })
    .eq('id', accountId);
  if (error) throw new Error(error.message);
}

export async function deleteAdminAccountRecord(accountId: string): Promise<void> {
  const { error } = await supabase
    .from('admin_users')
    .delete()
    .eq('id', accountId);
  if (error) throw new Error(error.message);
}

// =============================================================================
// Supabase Storage Upload (JPEG, JPG, PNG, SVG, WebP)
// =============================================================================

export const CMS_STORAGE_BUCKET = 'rassakopi-assets';
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // 5 MB

const EXT_TO_MIME: Record<string, string> = {
  jpeg: 'image/jpeg',
  jpg: 'image/jpeg',
  png: 'image/png',
  svg: 'image/svg+xml',
  webp: 'image/webp',
};

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/pjpeg',
  'image/png',
  'image/svg+xml',
  'image/webp',
]);

export async function uploadCmsAsset(
  file: File,
  folder = 'uploads'
): Promise<string> {
  await getCurrentUidOrThrow();

  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error('Ukuran file maksimal 5 MB.');
  }

  const rawName = file.name || 'asset';
  const dotIdx = rawName.lastIndexOf('.');
  const rawExt = dotIdx >= 0 ? rawName.slice(dotIdx + 1).toLowerCase() : '';
  const baseName = dotIdx >= 0 ? rawName.slice(0, dotIdx) : rawName;

  const mimeLower = (file.type || '').toLowerCase();
  let resolvedExt = rawExt;
  let contentType = EXT_TO_MIME[rawExt] || '';

  if (!contentType && mimeLower && ALLOWED_MIME_TYPES.has(mimeLower)) {
    if (mimeLower === 'image/png') {
      resolvedExt = 'png';
      contentType = 'image/png';
    } else if (mimeLower === 'image/svg+xml') {
      resolvedExt = 'svg';
      contentType = 'image/svg+xml';
    } else if (mimeLower === 'image/webp') {
      resolvedExt = 'webp';
      contentType = 'image/webp';
    } else {
      resolvedExt = 'jpg';
      contentType = 'image/jpeg';
    }
  }

  if (!contentType || !['jpeg', 'jpg', 'png', 'svg', 'webp'].includes(resolvedExt)) {
    throw new Error(
      'Format file tidak didukung. Gunakan JPEG, JPG, PNG, SVG, atau WebP.'
    );
  }

  if (mimeLower && !ALLOWED_MIME_TYPES.has(mimeLower)) {
    throw new Error(
      'Tipe MIME file tidak valid. Gunakan gambar JPEG, JPG, PNG, SVG, atau WebP.'
    );
  }

  const safeFolder = sanitizeId(folder);
  const safeBase = sanitizeId(baseName);
  const objectPath = `${safeFolder}/${Date.now()}-${safeBase}.${resolvedExt}`;

  const { error: uploadError } = await supabase.storage
    .from(CMS_STORAGE_BUCKET)
    .upload(objectPath, file, {
      contentType,
      cacheControl: '31536000',
      upsert: false,
    });

  if (uploadError) {
    if (
      uploadError.message.toLowerCase().includes('bucket') ||
      uploadError.message.toLowerCase().includes('not found')
    ) {
      throw new Error(
        `Bucket Storage "${CMS_STORAGE_BUCKET}" belum tersedia. Jalankan skrip supabase/schema.sql di Supabase SQL Editor.`
      );
    }
    throw new Error(uploadError.message);
  }

  const { data } = supabase.storage
    .from(CMS_STORAGE_BUCKET)
    .getPublicUrl(objectPath);

  return data.publicUrl;
}

