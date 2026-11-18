import type { FeatureIconName } from '@/src/data/features';
import type { GalleryAlbumPhoto } from '@/src/data/gallery';
import type { MenuCategory } from '@/src/data/menu';

export type CmsSectionId =
  | 'hero'
  | 'marquee'
  | 'about'
  | 'menu_header'
  | 'why_rassa'
  | 'gallery_header'
  | 'visit'
  | 'final_cta'
  | 'footer';

export type FeatureGroup = 'why_rassa' | 'about_tile' | 'story_pillar';

export interface CmsFeatureItem {
  id: string;
  group: FeatureGroup;
  badgeNumber: string;
  title: string;
  description: string;
  icon: FeatureIconName;
  image: string;
  category: MenuCategory;
  sortOrder: number;
}

export interface CmsMenuItem {
  id: string;
  name: string;
  category: MenuCategory;
  description: string;
  priceLabel: string;
  numericPrice: number;
  image: string;
  imageAlt: string;
  featured: boolean;
  isFavorite?: boolean;
  note?: string;
  sortOrder: number;
}

export interface CmsGalleryItem {
  id: string;
  title: string;
  category: string;
  caption: string;
  image: string;
  alt: string;
  photos?: GalleryAlbumPhoto[];
  sortOrder: number;
}

export interface HeroContent {
  eyebrow: string;
  line1: string;
  line2: string;
  line3Highlight: string;
  description: string;
  primaryCtaLabel: string;
  secondaryCtaLabel: string;
  splashImage: string;
  cupImage: string;
}

export interface MarqueeContent {
  frontPhrase: string;
  backPhrase: string;
}

export interface AboutContent {
  eyebrow: string;
  headlinePart1: string;
  headlinePart2: string;
  headlinePart3: string;
  headlinePart4: string;
  pillImage1: string;
  pillImage2: string;
  pillImage3: string;
  description: string;
  ctaLabel: string;
  storyModalHeadline: string;
  storyModalParagraph1: string;
  storyModalParagraph2: string;
  storyModalImage: string;
}

export interface MenuHeaderContent {
  eyebrow: string;
  title: string;
  description: string;
  ctaLabel: string;
  footnote: string;
}

export interface WhyRassaHeaderContent {
  eyebrow: string;
  title: string;
  centerImage: string;
}

export interface GalleryHeaderContent {
  eyebrow: string;
  title: string;
  description: string;
}

export interface VisitContent {
  eyebrow: string;
  title: string;
  description: string;
  outletName: string;
  address: string;
  shortArea: string;
  monThuHours: string;
  friHours: string;
  satHours: string;
  sunHours: string;
  sunClosed: boolean;
  instagramHandle: string;
  instagramUrl: string;
  tiktokHandle: string;
  tiktokUrl: string;
  googleMapsUrl: string;
  googleMapsEmbedUrl: string;
  ctaLabel: string;
}

export interface FinalCtaContent {
  eyebrow: string;
  title: string;
  description: string;
  ctaLabel: string;
  accentImage: string;
}

export interface FooterContent {
  brandName: string;
  logoUrl: string;
  tagline: string;
  description: string;
  hoursSummary: string;
  centerImage: string;
  copyrightYear: number;
}

export interface CmsSiteState {
  hero: HeroContent;
  marquee: MarqueeContent;
  about: AboutContent;
  menuHeader: MenuHeaderContent;
  whyRassaHeader: WhyRassaHeaderContent;
  galleryHeader: GalleryHeaderContent;
  visit: VisitContent;
  finalCta: FinalCtaContent;
  footer: FooterContent;
  menuItems: CmsMenuItem[];
  galleryItems: CmsGalleryItem[];
  aboutTiles: CmsFeatureItem[];
  whyRassaFeatures: CmsFeatureItem[];
  storyPillars: CmsFeatureItem[];
}

export type AdminRole = 'super_admin' | 'admin';

export interface CmsAdminAccount {
  id: string;
  email: string;
  fullName: string;
  role: AdminRole;
  isActive: boolean;
  createdAt: string;
}

