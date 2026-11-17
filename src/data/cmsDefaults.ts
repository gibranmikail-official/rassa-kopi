import { siteConfig } from '@/src/config/siteConfig';
import { WHY_RASSA_FEATURES } from '@/src/data/features';
import { GALLERY_ITEMS } from '@/src/data/gallery';
import { MENU_ITEMS } from '@/src/data/menu';
import type { CmsFeatureItem, CmsSiteState } from '@/src/types/cms';

export interface PresetAsset {
  label: string;
  url: string;
}

export const PRESET_ASSETS: PresetAsset[] = [
  { label: 'Rassa Logo (Red)', url: '/assets/brand/rassa-logo.png' },
  { label: 'Hero Splash (Coffee Splash)', url: '/assets/hero/hero-coffee-splash.png' },
  { label: 'Hero Iced Coffee Cup', url: '/assets/hero/hero-iced-cup.png' },
  { label: 'Coffee Bar & Craft (About)', url: '/assets/about/barista-craft.jpg' },
  { label: 'Crimson Splash Cup (Why Rassa)', url: '/assets/why-rassa/crimson-splash-cup.png' },
  { label: 'Cafe Minimalist Interior', url: '/assets/gallery/cafe-interior.jpg' },
  { label: 'Espresso Pull', url: '/assets/gallery/espresso-pull.jpg' },
  { label: 'Signature Iced Latte', url: '/assets/gallery/signature-iced-latte.jpg' },
  { label: 'Customer Moment', url: '/assets/gallery/customer-moment.jpg' },
  { label: 'Pour-Over Craft', url: '/assets/gallery/pour-over-brew.jpg' },
  { label: 'Sea Salt Caramel', url: '/assets/menu/sea-salt-caramel.jpg' },
  { label: 'Kopi Susu Pandan', url: '/assets/menu/kopi-susu-pandan.jpg' },
  { label: 'Rassa Signature Latte', url: '/assets/menu/rassa-latte.jpg' },
  { label: 'Iced Black Americano', url: '/assets/menu/iced-americano.jpg' },
  { label: 'Hot Cappuccino', url: '/assets/menu/hot-cappuccino.jpg' },
  { label: 'Ceremonial Iced Matcha', url: '/assets/menu/iced-matcha.jpg' },
  { label: 'Choco Pistachio', url: '/assets/menu/choco-pistachio.jpg' },
  { label: 'Matcha Strawberry', url: '/assets/menu/matcha-strawberry.jpg' },
  { label: 'Black Series Citrus', url: '/assets/menu/black-series.jpg' },
  { label: 'Peach / Mango Tea', url: '/assets/menu/peach-mango-tea.jpg' },
  { label: 'Lychee & Honey Lemon', url: '/assets/menu/lychee-honey-lemon.jpg' },
  { label: 'Yakult Berry Fusion', url: '/assets/menu/yakult-fusion.jpg' },
  { label: 'Indomie Komplit', url: '/assets/menu/indomie-komplit.jpg' },
  { label: 'Cireng Ayam Pedas', url: '/assets/menu/cireng-ayam-pedas.jpg' },
  { label: 'French Fries & Platter', url: '/assets/menu/french-fries-platter.jpg' },
  { label: 'Singkong Keju', url: '/assets/menu/singkong-keju.jpg' },
  { label: 'Pain Suisse & Brownies', url: '/assets/menu/pain-suisse-brownies.jpg' },
  { label: 'Butter Croissant', url: '/assets/menu/butter-croissant.jpg' },
];

export const DEFAULT_ABOUT_TILES: CmsFeatureItem[] = [
  {
    id: 'about-tile-coffee',
    group: 'about_tile',
    badgeNumber: '01',
    title: 'KOPI FAVORIT',
    description: 'Sea Salt Caramel, Kopi Susu Butterscotch, dan racikan espresso pilihan.',
    icon: 'coffee',
    image: '/assets/menu/sea-salt-caramel.jpg',
    category: 'Coffee',
    sortOrder: 0,
  },
  {
    id: 'about-tile-non-coffee',
    group: 'about_tile',
    badgeNumber: '02',
    title: 'NON COFFEE',
    description: 'Matcha Strawberry, Choco Pistachio, dan teh buah yang menyegarkan.',
    icon: 'droplets',
    image: '/assets/menu/matcha-strawberry.jpg',
    category: 'Non Coffee',
    sortOrder: 1,
  },
  {
    id: 'about-tile-black-series',
    group: 'about_tile',
    badgeNumber: '03',
    title: 'BLACK SERIES',
    description: 'Perpaduan kopi hitam dingin dengan buah lemon, orange, peach, dan leci.',
    icon: 'coffee',
    image: '/assets/menu/black-series.jpg',
    category: 'Black Series',
    sortOrder: 2,
  },
  {
    id: 'about-tile-makanan-cemilan',
    group: 'about_tile',
    badgeNumber: '04',
    title: 'MAKANAN & CEMILAN',
    description: 'Indomie Komplit hangat, Cireng Ayam Pedas, hingga Snack Platter.',
    icon: 'sun',
    image: '/assets/menu/indomie-komplit.jpg',
    category: 'Makanan',
    sortOrder: 3,
  },
  {
    id: 'about-tile-roti',
    group: 'about_tile',
    badgeNumber: '05',
    title: 'ANEKA ROTI',
    description: 'Pain Suisse, Brownies, Danish Cheese, dan Croissant Cheese panggang segar.',
    icon: 'sun',
    image: '/assets/menu/pain-suisse-brownies.jpg',
    category: 'Aneka Roti',
    sortOrder: 4,
  },
];

export const DEFAULT_STORY_PILLARS: CmsFeatureItem[] = [
  {
    id: 'story-pillar-01',
    group: 'story_pillar',
    badgeNumber: '01',
    title: 'Simplicity',
    description: 'Clean flavors and a calm, uncluttered coffee bar environment.',
    icon: 'coffee',
    image: '',
    category: 'Coffee',
    sortOrder: 0,
  },
  {
    id: 'story-pillar-02',
    group: 'story_pillar',
    badgeNumber: '02',
    title: 'Consistency',
    description: 'Careful preparation so every visit tastes familiar and comforting.',
    icon: 'droplets',
    image: '',
    category: 'Coffee',
    sortOrder: 1,
  },
  {
    id: 'story-pillar-03',
    group: 'story_pillar',
    badgeNumber: '03',
    title: 'Community',
    description: 'An inviting space open to students, creators, and professionals.',
    icon: 'sun',
    image: '',
    category: 'Coffee',
    sortOrder: 2,
  },
];

export const DEFAULT_CMS_STATE: CmsSiteState = {
  hero: {
    eyebrow: 'Rassa Kopi · Minimalist Coffee Shop',
    line1: 'A BETTER DAY',
    line2: 'STARTS WITH',
    line3Highlight: 'BETTER COFFEE.',
    description:
      'Discover your favorite coffee, enjoy every little moment, and make your day a little better with Rassa Kopi.',
    primaryCtaLabel: 'Explore Our Menu',
    secondaryCtaLabel: 'Our Story',
    splashImage: '/assets/hero/hero-coffee-splash.png',
    cupImage: '/assets/hero/hero-iced-cup.png',
  },
  marquee: {
    frontPhrase: 'Brewed Fresh, Waiting for You',
    backPhrase: 'Brewed Fresh, Waiting for You',
  },
  about: {
    eyebrow: 'OUR STORY',
    headlinePart1: 'MORE THAN JUST A',
    headlinePart2: 'CUP OF COFFEE. WE BRING TOGETHER',
    headlinePart3: 'QUALITY & MEANINGFUL',
    headlinePart4: 'MOMENTS.',
    pillImage1: '/assets/about/barista-craft.jpg',
    pillImage2: '/assets/gallery/pour-over-brew.jpg',
    pillImage3: '/assets/gallery/customer-moment.jpg',
    description:
      'At Rassa Kopi, we believe every cup has a story. We bring together coffee, quality, and meaningful moments to create an enjoyable experience for everyone.',
    ctaLabel: 'Discover Our Story',
    storyModalHeadline: 'More Than Just a Cup of Coffee.',
    storyModalParagraph1:
      'At Rassa Kopi, we believe every cup has a story. We bring together coffee, quality, and meaningful moments to create an enjoyable experience for everyone.',
    storyModalParagraph2:
      'Whether you are starting your morning commute, catching up with a friend, or taking a quiet pause in the afternoon, our space and recipes are crafted to make daily rituals feel effortless and welcoming.',
    storyModalImage: '/assets/gallery/cafe-interior.jpg',
  },
  menuHeader: {
    eyebrow: 'SIGNATURE MENU',
    title: 'FIND YOUR PERFECT CUP.',
    description:
      'Explore our selection of coffee, black series, non-coffee favorites, warm food, snacks, and freshly baked pastries.',
    ctaLabel: 'View Full Menu',
    footnote:
      '⭐ Menandakan menu favorit pelanggan Rassa Kopi · Harga dapat berubah sewaktu-waktu.',
  },
  whyRassaHeader: {
    eyebrow: 'THE RASSA EXPERIENCE',
    title: 'WHY CHOOSE RASSA?',
    centerImage: '/assets/why-rassa/crimson-splash-cup.png',
  },
  galleryHeader: {
    eyebrow: 'GALLERY',
    title: 'A LITTLE LOOK INTO RASSA.',
    description:
      'Select any frame to view our space, coffee craft, and everyday moments in full size.',
  },
  visit: {
    eyebrow: 'VISIT US',
    title: 'YOUR NEXT COFFEE STOP.',
    description:
      'Looking for your next favorite coffee spot? Come and enjoy a cup with us.',
    outletName: siteConfig.location.outletName,
    address: siteConfig.location.address,
    shortArea: siteConfig.location.shortArea,
    monThuHours: siteConfig.location.operatingHours[0].hours,
    friHours: siteConfig.location.operatingHours[1].hours,
    satHours: siteConfig.location.operatingHours[2].hours,
    sunHours: siteConfig.location.operatingHours[3].hours,
    sunClosed: true,
    instagramHandle: siteConfig.location.instagramHandle,
    instagramUrl: siteConfig.location.instagramUrl,
    tiktokHandle: siteConfig.location.tiktokHandle,
    tiktokUrl: siteConfig.location.tiktokUrl,
    googleMapsUrl: siteConfig.location.googleMapsUrl,
    googleMapsEmbedUrl: siteConfig.location.googleMapsEmbedUrl,
    ctaLabel: 'Get Directions',
  },
  finalCta: {
    eyebrow: 'RASSA KOPI',
    title: 'MAKE TODAY A LITTLE BETTER.',
    description:
      'Your favorite coffee is waiting. Discover the taste and experience of Rassa Kopi.',
    ctaLabel: 'Explore Our Menu',
    accentImage: '/assets/why-rassa/crimson-splash-cup.png',
  },
  footer: {
    brandName: siteConfig.brandName,
    logoUrl: siteConfig.logoUrl,
    tagline: siteConfig.tagline,
    description:
      'A minimalist modern coffee shop crafted around quality coffee, calm spaces, and everyday moments worth savoring.',
    hoursSummary: siteConfig.location.hoursSummary,
    centerImage: siteConfig.logoUrl,
    copyrightYear: siteConfig.copyrightYear,
  },
  menuItems: MENU_ITEMS.map((item, idx) => ({
    ...item,
    sortOrder: idx,
  })),
  galleryItems: GALLERY_ITEMS.map((item, idx) => ({
    ...item,
    sortOrder: idx,
  })),
  aboutTiles: DEFAULT_ABOUT_TILES,
  whyRassaFeatures: WHY_RASSA_FEATURES.map((item, idx) => ({
    id: item.id,
    group: 'why_rassa',
    badgeNumber: item.number,
    title: item.title,
    description: item.description,
    icon: item.icon,
    image: '',
    category: 'Coffee',
    sortOrder: idx,
  })),
  storyPillars: DEFAULT_STORY_PILLARS,
};
