export interface GalleryAlbumPhoto {
  id: string;
  image: string;
  title?: string;
  caption?: string;
  alt?: string;
}

export interface GalleryPhoto {
  id: string;
  title: string;
  category: string;
  caption: string;
  image: string;
  alt: string;
  photos?: GalleryAlbumPhoto[];
}

export function getGalleryAlbumPhotos(album: GalleryPhoto): GalleryAlbumPhoto[] {
  if (album.photos && album.photos.length > 0) {
    return album.photos.map((photo, index) => ({
      id: photo.id || `${album.id}-photo-${index + 1}`,
      image: photo.image?.trim() || album.image,
      title: album.title,
      caption: album.caption,
      alt: album.alt || album.title,
    }));
  }
  return [
    {
      id: `${album.id}-cover`,
      image: album.image,
      title: album.title,
      caption: album.caption,
      alt: album.alt || album.title,
    },
  ];
}

export const GALLERY_ITEMS: GalleryPhoto[] = [
  {
    id: 'cafe-interior',
    title: 'Sunlit Oak Espresso Bar',
    category: 'Coffee Shop Interior',
    caption: 'Warm oak bar counter, pastries under glass, tall windows, and calm sunlit seating.',
    image: '/assets/brand/default-image.png',
    alt: 'Bright minimalist Rassa Kopi interior with oak espresso bar, pastries, plants, and natural window light',
  },
  {
    id: 'espresso-process',
    title: 'Bottomless Espresso Crema Pull',
    category: 'Espresso Extraction',
    caption: 'Rich golden crema flowing smoothly from a bottomless portafilter onto a calibrated scale.',
    image: '/assets/brand/default-image.png',
    alt: 'Close-up of rich golden espresso extracting from a bottomless portafilter into a clear glass',
  },
  {
    id: 'signature-product',
    title: 'Iced Signature Milk Coffee',
    category: 'Signature Beverage',
    caption: 'Chilled house espresso marbling naturally through cold fresh milk over ice.',
    image: '/assets/brand/default-image.png',
    alt: 'Clear tall glass of iced milk coffee with espresso swirls on a white studio plinth',
  },
  {
    id: 'customer-experience',
    title: 'Iced Lattes & Croissant Catch-Up',
    category: 'Guest Moments',
    caption: 'Warm laughter shared over iced lattes and flaky croissants by the window.',
    image: '/assets/brand/default-image.png',
    alt: 'Two guests laughing over iced coffee and fresh croissants at a white round cafe table',
  },
  {
    id: 'barista-preparing',
    title: 'Hand-Poured Microfoam Art',
    category: 'Barista Craft',
    caption: 'Steady milk-pitcher control pouring silky microfoam into a warm ceramic cup.',
    image: '/assets/about/barista-craft.jpg',
    alt: 'Barista in a navy apron pouring steamed microfoam into a white ceramic latte cup',
  },
  {
    id: 'pour-over-process',
    title: 'Gooseneck V60 Pour-Over',
    category: 'Manual Brew',
    caption: 'Steaming water poured steadily from a matte-black gooseneck kettle into a glass dripper.',
    image: '/assets/brand/default-image.png',
    alt: 'Barista pouring steaming water from a matte-black gooseneck kettle into a glass V60 coffee dripper',
  },
];
