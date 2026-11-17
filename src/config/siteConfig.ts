export interface NavLinkItem {
  label: string;
  href: string;
}

export interface OperatingHourItem {
  days: string;
  hours: string;
  closed?: boolean;
}

export interface SiteConfig {
  brandName: string;
  logoUrl: string;
  tagline: string;
  copyrightYear: number;
  navLinks: NavLinkItem[];
  location: {
    outletName: string;
    address: string;
    shortArea: string;
    operatingHours: OperatingHourItem[];
    hoursSummary: string;
    googleMapsUrl: string;
    googleMapsEmbedUrl: string;
    instagramHandle: string;
    instagramUrl: string;
    tiktokHandle: string;
    tiktokUrl: string;
  };
}

export const siteConfig: SiteConfig = {
  brandName: 'RASSA KOPI',
  logoUrl: '/assets/brand/rassa-logo.png',
  tagline: 'Good Coffee, Better Moments.',
  copyrightYear: 2026,
  navLinks: [
    { label: 'Home', href: '#home' },
    { label: 'About', href: '#about' },
    { label: 'Menu', href: '#menu' },
    { label: 'Gallery', href: '#gallery' },
    { label: 'Visit', href: '#visit' },
  ],
  location: {
    outletName: 'Rassa Kopi',
    address:
      'Jl. Taman Kemang No.21, RT.14/RW.1, Bangka, Kec. Mampang Prpt., Kota Jakarta Selatan, Daerah Khusus Ibukota Jakarta 12730',
    shortArea: 'Taman Kemang, Jakarta Selatan',
    operatingHours: [
      { days: 'Monday - Thursday', hours: '9.00 am – 10.00 pm' },
      { days: 'Friday', hours: '9.00 am – 11.00 pm' },
      { days: 'Saturday', hours: '5.00 pm – 12.00 am' },
      { days: 'Sunday', hours: 'Closed', closed: true },
    ],
    hoursSummary: 'Mon–Thu 9am–10pm · Fri 9am–11pm · Sat 5pm–12am · Sun Closed',
    googleMapsUrl:
      'https://www.google.com/maps/search/?api=1&query=Rassa+Kopi+Jl.+Taman+Kemang+No.21+Jakarta+Selatan',
    googleMapsEmbedUrl:
      'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3966.0567211774573!2d106.80774907499062!3d-6.256258393732356!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69f15a579f006b%3A0x8afaa10888cbd3b8!2sRassa%20Kopi!5e0!3m2!1sen!2sid!4v1794813368598!5m2!1sen!2sid',
    instagramHandle: '@rassakopi',
    instagramUrl: 'https://www.instagram.com/rassakopi/',
    tiktokHandle: '@rassakopi',
    tiktokUrl: 'https://www.tiktok.com/@suhe_erna',
  },
};
