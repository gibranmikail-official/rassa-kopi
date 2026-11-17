export type MenuCategory =
  | 'Coffee'
  | 'Non Coffee'
  | 'Black Series'
  | 'Makanan'
  | 'Cemilan'
  | 'Aneka Roti';

export interface MenuItem {
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
}

export const MENU_CATEGORIES: Array<'All' | MenuCategory> = [
  'All',
  'Coffee',
  'Non Coffee',
  'Black Series',
  'Makanan',
  'Cemilan',
  'Aneka Roti',
];

export function isFavoriteMenuItem(
  item: Pick<MenuItem, 'isFavorite' | 'note'>
): boolean {
  if (item.isFavorite) return true;
  const note = (item.note ?? '').toLowerCase();
  return note.includes('⭐') || note.includes('favorit') || note.includes('favorite');
}

export const MENU_ITEMS: MenuItem[] = [
  // =========================================================================
  // SIGNATURE FAVORIT ⭐ & COFFEE HIGHLIGHTS (Featured on 'All' tab)
  // =========================================================================
  {
    id: 'coffee-sea-salt-caramel',
    name: 'Sea Salt Caramel',
    category: 'Coffee',
    description:
      'Espresso berpadu susu creamy dengan siraman saus karamel gurih dan taburan sea salt.',
    priceLabel: 'Rp 35.000',
    numericPrice: 35000,
    image: '/assets/menu/sea-salt-caramel.jpg',
    imageAlt: 'Iced Sea Salt Caramel Latte dengan cream foam dan saus karamel keemasan',
    featured: true,
    isFavorite: true,
    note: '⭐ Menu Favorit',
  },
  {
    id: 'coffee-kopi-susu-butterscotch',
    name: 'Kopi Susu Butterscotch',
    category: 'Coffee',
    description:
      'Perpaduan espresso house blend, susu segar, dan manis legit saus butterscotch.',
    priceLabel: 'Rp 30.000',
    numericPrice: 30000,
    image: '/assets/gallery/signature-iced-latte.jpg',
    imageAlt: 'Gelas kaca Kopi Susu Butterscotch dingin dengan swirl karamel lembut',
    featured: true,
    isFavorite: true,
    note: '⭐ Menu Favorit',
  },
  {
    id: 'non-coffee-choco-pistachio',
    name: 'Choco Pistachio',
    category: 'Non Coffee',
    description:
      'Dark cokelat pekat berlapis krim pistachio lembut dan remahan kacang pistachio panggang.',
    priceLabel: 'Rp 35.000',
    numericPrice: 35000,
    image: '/assets/menu/choco-pistachio.jpg',
    imageAlt: 'Iced Choco Pistachio dengan lapisan cream pistachio hijau dan taburan pistachio',
    featured: true,
    isFavorite: true,
    note: '⭐ Menu Favorit',
  },
  {
    id: 'non-coffee-matcha-strawberry',
    name: 'Matcha Strawberry',
    category: 'Non Coffee',
    description:
      'Ceremonial matcha segar yang dituang di atas susu dingin dan compote stroberi manis-asam.',
    priceLabel: 'Rp 40.000',
    numericPrice: 40000,
    image: '/assets/menu/matcha-strawberry.jpg',
    imageAlt: 'Minuman tiga lapis Iced Matcha Strawberry dengan potongan buah stroberi segar',
    featured: true,
    isFavorite: true,
    note: '⭐ Menu Favorit',
  },

  // =========================================================================
  // COFFEE (Remaining Coffee Menu)
  // =========================================================================
  {
    id: 'coffee-kopi-susu-gula-aren',
    name: 'Kopi Susu Gula Aren',
    category: 'Coffee',
    description:
      'Kopi susu klasik andalan Rassa dengan espresso double shot, susu segar, dan gula aren murni.',
    priceLabel: 'Rp 25.000',
    numericPrice: 25000,
    image: '/assets/menu/rassa-latte.jpg',
    imageAlt: 'Iced Kopi Susu Gula Aren berlapis es batu jernih',
    featured: true,
  },
  {
    id: 'coffee-black-coffee',
    name: 'Black Coffee',
    category: 'Coffee',
    description:
      'Americano dingin atau panas dengan karakter clean, bold, dan crema keemasan.',
    priceLabel: 'Rp 25.000',
    numericPrice: 25000,
    image: '/assets/menu/iced-americano.jpg',
    imageAlt: 'Iced Black Coffee dengan gradasi espresso bening dan es batu',
    featured: false,
  },
  {
    id: 'coffee-beans-arabica',
    name: 'Beans Arabica',
    category: 'Coffee',
    description:
      'Ekstraksi espresso murni pilihan biji Arabica Nusantara dengan aroma floral dan aftertaste bersih.',
    priceLabel: 'Rp 30.000',
    numericPrice: 30000,
    image: '/assets/gallery/espresso-pull.jpg',
    imageAlt: 'Ekstraksi espresso Beans Arabica dari portafilter bottomless',
    featured: false,
  },
  {
    id: 'coffee-kopi-filter',
    name: 'Kopi Filter',
    category: 'Coffee',
    description:
      'Seduhan manual brew V60 dengan keseimbangan rasa buah segar dan body yang ringan.',
    priceLabel: 'Rp 30.000',
    numericPrice: 30000,
    image: '/assets/gallery/pour-over-brew.jpg',
    imageAlt: 'Penyajian manual brew Kopi Filter dengan teko gooseneck',
    featured: false,
  },
  {
    id: 'coffee-white',
    name: 'White',
    category: 'Coffee',
    description:
      'Kombinasi espresso lembut dengan micro-foam susu panas atau dingin yang seimbang.',
    priceLabel: 'Rp 30.000',
    numericPrice: 30000,
    image: '/assets/menu/hot-cappuccino.jpg',
    imageAlt: 'Secangkir kopi susu White dengan latte art rosetta di cangkir putih',
    featured: false,
  },
  {
    id: 'coffee-latte-cappuccino-magic',
    name: 'Latte, Cappuccino, Magic Caramel Latte',
    category: 'Coffee',
    description:
      'Pilihan klasik Latte, Cappuccino berbusa tebal, atau Magic Caramel Latte yang manis aromatik.',
    priceLabel: 'Rp 30.000',
    numericPrice: 30000,
    image: '/assets/about/barista-craft.jpg',
    imageAlt: 'Barista menuang susu ke espresso untuk Latte, Cappuccino, atau Magic Caramel Latte',
    featured: false,
  },
  {
    id: 'coffee-kopi-susu-pandan',
    name: 'Kopi Susu Pandan',
    category: 'Coffee',
    description:
      'Racikan kopi susu harum ekstrak pandan alami yang memberi sensasi manis lembut khas tropis.',
    priceLabel: 'Rp 30.000',
    numericPrice: 30000,
    image: '/assets/menu/kopi-susu-pandan.jpg',
    imageAlt: 'Iced Kopi Susu Pandan berlapis hijau pandan dan espresso segar',
    featured: false,
  },
  {
    id: 'coffee-kopi-susu-pistachio',
    name: 'Kopi Susu Pistachio',
    category: 'Coffee',
    description:
      'Kopi susu creamy berpadu pasta pistachio kacang panggang dengan rasa gurih yang elegan.',
    priceLabel: 'Rp 30.000',
    numericPrice: 30000,
    image: '/assets/menu/choco-pistachio.jpg',
    imageAlt: 'Iced Kopi Susu Pistachio dengan cream foam pistachio hijau',
    featured: false,
  },

  // =========================================================================
  // NON COFFEE (Remaining Non Coffee Menu)
  // =========================================================================
  {
    id: 'non-coffee-peach-mango-tea',
    name: 'Peach Tea / Mango Tea',
    category: 'Non Coffee',
    description:
      'Es teh seduh segar pilihan rasa buah peach atau mangga yang manis menyegarkan.',
    priceLabel: 'Rp 22.000',
    numericPrice: 22000,
    image: '/assets/menu/peach-mango-tea.jpg',
    imageAlt: 'Gelas tinggi Iced Peach & Mango Tea dengan irisan buah peach dan daun mint',
    featured: false,
  },
  {
    id: 'non-coffee-lychee-tea',
    name: 'Lychee Tea',
    category: 'Non Coffee',
    description:
      'Teh dingin aromatik berpadu manis buah leci utuh yang menyegarkan sepanjang hari.',
    priceLabel: 'Rp 25.000',
    numericPrice: 25000,
    image: '/assets/menu/lychee-honey-lemon.jpg',
    imageAlt: 'Iced Lychee Tea jernih dengan buah leci utuh dan daun mint segar',
    featured: false,
  },
  {
    id: 'non-coffee-honey-lemon',
    name: 'Honey Lemon',
    category: 'Non Coffee',
    description:
      'Perpaduan madu alami dan perasan lemon segar dengan sensasi asam-manis yang ringan.',
    priceLabel: 'Rp 27.000',
    numericPrice: 27000,
    image: '/assets/menu/lychee-honey-lemon.jpg',
    imageAlt: 'Iced Honey Lemon berwarna keemasan dengan irisan lemon segar',
    featured: false,
  },
  {
    id: 'non-coffee-dark-chocolate',
    name: 'Dark Chocolate',
    category: 'Non Coffee',
    description:
      'Cokelat hitam premium yang dikocok pekat dengan susu dingin tanpa rasa pahit berlebih.',
    priceLabel: 'Rp 30.000',
    numericPrice: 30000,
    image: '/assets/menu/choco-pistachio.jpg',
    imageAlt: 'Minuman Dark Chocolate dingin kaya rasa dalam gelas minimalis',
    featured: false,
  },
  {
    id: 'non-coffee-yakult-strawberry-mango',
    name: 'Yakult – Strawberry / Mango',
    category: 'Non Coffee',
    description:
      'Minuman probiotik Yakult segar dengan puree buah stroberi atau mangga pilihan.',
    priceLabel: 'Rp 30.000',
    numericPrice: 30000,
    image: '/assets/menu/yakult-fusion.jpg',
    imageAlt: 'Iced Yakult Strawberry berlapis puree buah merah muda dan susu probiotik',
    featured: false,
  },
  {
    id: 'non-coffee-matcha-latte',
    name: 'Matcha Latte',
    category: 'Non Coffee',
    description:
      'Bubuk matcha Jepang murni yang dikocok lembut bersama susu segar pilihan.',
    priceLabel: 'Rp 35.000',
    numericPrice: 35000,
    image: '/assets/menu/iced-matcha.jpg',
    imageAlt: 'Iced Matcha Latte hijau cerah di atas meja batu putih',
    featured: false,
  },

  // =========================================================================
  // BLACK SERIES
  // =========================================================================
  {
    id: 'black-series-lemon',
    name: 'Lemon',
    category: 'Black Series',
    description:
      'Espresso double shot yang dipadukan kesegaran perasan lemon dingin dan sparkling finish.',
    priceLabel: 'Rp 35.000',
    numericPrice: 35000,
    image: '/assets/menu/black-series.jpg',
    imageAlt: 'Black Series Lemon dengan lapisan espresso dan irisan lemon segar',
    featured: true,
  },
  {
    id: 'black-series-orange',
    name: 'Orange',
    category: 'Black Series',
    description:
      'Kombinasi berani kopi hitam house blend dengan manis-segar jeruk citrus pilihan.',
    priceLabel: 'Rp 35.000',
    numericPrice: 35000,
    image: '/assets/menu/black-series.jpg',
    imageAlt: 'Black Series Orange dengan irisan jeruk dan lapisan espresso',
    featured: false,
  },
  {
    id: 'black-series-mango',
    name: 'Mango',
    category: 'Black Series',
    description:
      'Sensasi unik espresso hitam dingin bertemu sari buah mangga tropis yang menyegarkan.',
    priceLabel: 'Rp 35.000',
    numericPrice: 35000,
    image: '/assets/menu/peach-mango-tea.jpg',
    imageAlt: 'Black Series Mango bernuansa kuning keemasan menyegarkan',
    featured: false,
  },
  {
    id: 'black-series-strawberry',
    name: 'Strawberry',
    category: 'Black Series',
    description:
      'Racikan kopi hitam segar berpadu asam-manis buah stroberi yang ringan di tenggorokan.',
    priceLabel: 'Rp 35.000',
    numericPrice: 35000,
    image: '/assets/menu/matcha-strawberry.jpg',
    imageAlt: 'Black Series Strawberry dengan sentuhan compote buah beri segar',
    featured: false,
  },
  {
    id: 'black-series-peach',
    name: 'Peach',
    category: 'Black Series',
    description:
      'Perpaduan espresso bersih dengan aroma harum buah persik manis dan es batu jernih.',
    priceLabel: 'Rp 35.000',
    numericPrice: 35000,
    image: '/assets/menu/peach-mango-tea.jpg',
    imageAlt: 'Black Series Peach dengan potongan buah persik segar',
    featured: false,
  },
  {
    id: 'black-series-lychee',
    name: 'Lychee',
    category: 'Black Series',
    description:
      'Kopi hitam dingin bercampur kesegaran buah leci yang ringan dan memuaskan dahaga.',
    priceLabel: 'Rp 35.000',
    numericPrice: 35000,
    image: '/assets/menu/lychee-honey-lemon.jpg',
    imageAlt: 'Black Series Lychee dengan buah leci segar di atas meja putih',
    featured: false,
  },

  // =========================================================================
  // MAKANAN
  // =========================================================================
  {
    id: 'makanan-indomie-komplit',
    name: 'Indomie Komplit',
    category: 'Makanan',
    description:
      'Disajikan hangat dengan telur, bakso, sawi hijau, dan bawang goreng. Pilihan rasa: Goreng, Kari Ayam, Ayam Bawang, dan Soto.',
    priceLabel: 'Rp 20.000',
    numericPrice: 20000,
    image: '/assets/menu/indomie-komplit.jpg',
    imageAlt: 'Mangkuk Indomie Komplit dengan telur mata sapi, bakso, sayuran, dan bawang goreng',
    featured: true,
    note: 'Goreng · Kari · Ayam Bawang · Soto',
  },
  {
    id: 'makanan-indomie-double-komplit',
    name: 'Indomie Double Komplit',
    category: 'Makanan',
    description:
      'Porsi double ekstra kenyang lengkap dengan telur, bakso, dan sayuran. Pilihan rasa: Goreng, Kari Ayam, Ayam Bawang, dan Soto.',
    priceLabel: 'Rp 25.000',
    numericPrice: 25000,
    image: '/assets/menu/indomie-komplit.jpg',
    imageAlt: 'Porsi hangat Indomie Double Komplit dengan topping lengkap',
    featured: false,
    note: 'Goreng · Kari · Ayam Bawang · Soto',
  },

  // =========================================================================
  // CEMILAN
  // =========================================================================
  {
    id: 'cemilan-cireng-ayam-pedas',
    name: 'Cireng Ayam Pedas (8 pcs)',
    category: 'Cemilan',
    description:
      'Cireng renyah isi suwiran ayam bumbu pedas gurih (8 pcs), disajikan dengan cocolan sambal.',
    priceLabel: 'Rp 25.000',
    numericPrice: 25000,
    image: '/assets/menu/cireng-ayam-pedas.jpg',
    imageAlt: 'Cireng Ayam Pedas renyah keemasan di piring keramik putih dengan saus sambal',
    featured: true,
  },
  {
    id: 'cemilan-french-fries',
    name: 'French Fries',
    category: 'Cemilan',
    description:
      'Kentang goreng keemasan yang renyah di luar dan lembut di dalam dengan saus cocolan.',
    priceLabel: 'Rp 25.000',
    numericPrice: 25000,
    image: '/assets/menu/french-fries-platter.jpg',
    imageAlt: 'Kentang goreng renyah French Fries disajikan hangat dengan saus',
    featured: false,
  },
  {
    id: 'cemilan-singkong-keju',
    name: 'Singkong Keju',
    category: 'Cemilan',
    description:
      'Singkong goreng empuk merekah dengan bagian luar renyah dan taburan parutan keju melimpah.',
    priceLabel: 'Rp 25.000',
    numericPrice: 25000,
    image: '/assets/menu/singkong-keju.jpg',
    imageAlt: 'Singkong Keju renyah bertabur parutan keju cheddar di piring putih',
    featured: false,
  },
  {
    id: 'cemilan-snack-platter',
    name: 'Snack Platter',
    category: 'Cemilan',
    description:
      'Paket berbagi berisi kentang goreng, chicken nugget, dan sosis goreng dengan dua saus pilihan.',
    priceLabel: 'Rp 35.000',
    numericPrice: 35000,
    image: '/assets/menu/french-fries-platter.jpg',
    imageAlt: 'Snack Platter berisi kentang goreng, nugget, sosis, saus sambal, dan mayones',
    featured: false,
  },

  // =========================================================================
  // ANEKA ROTI
  // =========================================================================
  {
    id: 'roti-pain-suisse',
    name: 'Pain Suisse',
    category: 'Aneka Roti',
    description:
      'Pastry berlapis renyah dengan isian krim custard lembut dan potongan dark chocolate.',
    priceLabel: 'Rp 25.000',
    numericPrice: 25000,
    image: '/assets/menu/pain-suisse-brownies.jpg',
    imageAlt: 'Pastry Pain Suisse keemasan berlipat renyah dengan isian cokelat',
    featured: true,
  },
  {
    id: 'roti-brownies',
    name: 'Brownies',
    category: 'Aneka Roti',
    description:
      'Fudgy chocolate brownies panggang dengan pinggiran renyah dan tengah cokelat pekat.',
    priceLabel: 'Rp 25.000',
    numericPrice: 25000,
    image: '/assets/menu/pain-suisse-brownies.jpg',
    imageAlt: 'Potongan Fudgy Brownies cokelat pekat disajikan di piring putih',
    featured: false,
  },
  {
    id: 'roti-danish-cheese',
    name: 'Danish Cheese',
    category: 'Aneka Roti',
    description:
      'Pastry danish panggang hangat dengan lapisan mentega renyah dan krim keju gurih manis.',
    priceLabel: 'Rp 30.000',
    numericPrice: 30000,
    image: '/assets/menu/butter-croissant.jpg',
    imageAlt: 'Danish Cheese pastry panggang keemasan di atas piring keramik putih',
    featured: false,
  },
  {
    id: 'roti-croissant-cheese',
    name: 'Croissant Cheese',
    category: 'Aneka Roti',
    description:
      'Croissant mentega klasik bertekstur flaky dengan isian dan lelehan keju gurih.',
    priceLabel: 'Rp 30.000',
    numericPrice: 30000,
    image: '/assets/menu/butter-croissant.jpg',
    imageAlt: 'Croissant Cheese panggang renyah disajikan di piring keramik putih',
    featured: false,
  },
];
