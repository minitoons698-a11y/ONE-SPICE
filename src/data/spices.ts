export type CulinaryCategory =
  | 'Floral & Rare'
  | 'Warming & Sweet'
  | 'Heat & Smoke'
  | 'Earthy & Bold';

export interface WeightTier {
  label: string;
  grams: number;
  price: number;
}

export interface Spice {
  id: string;
  name: string;
  botanicalName: string;
  category: CulinaryCategory;
  grade: string;
  image: string;
  imageAlt: string;
  shortDescription: string;
  inStock: boolean;
  weightTiers: WeightTier[];
  pairings: string[];
}

export interface OrderItem {
  spiceId: string;
  name: string;
  weightLabel: string;
  unitPrice: number;
  quantity: number;
}

export type OrderStatus = 'Pending' | 'Preparing' | 'Ready' | 'Completed' | 'Cancelled';
export type PaymentMethod = 'momo' | 'airtel' | 'cod';

export interface CustomerOrder {
  docId: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  fulfillment: 'pickup' | 'delivery';
  deliveryAddress: string;
  paymentMethod: PaymentMethod;
  paymentPhone: string;
  paymentReference: string;
  paymentConfirmed: boolean;
  notes: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: OrderStatus;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface ShopInquiry {
  docId: string;
  name: string;
  email: string;
  topic: string;
  message: string;
  status: 'New' | 'Replied';
  createdAt?: unknown;
}

export type AdminRole = 'admin' | 'major_admin';

export interface AdminAccount {
  docId: string;
  email: string;
  displayName: string;
  role: AdminRole;
  mustChangePassword: boolean;
  createdBy: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface PasswordResetRequest {
  docId: string;
  email: string;
  note: string;
  status: 'Pending' | 'Resolved';
  createdAt?: unknown;
}

export interface PaymentSettings {
  momoNumber: string;
  momoName: string;
  airtelNumber: string;
  airtelName: string;
  updatedBy?: string;
}

export const DEFAULT_PAYMENT_SETTINGS: PaymentSettings = {
  momoNumber: '+256 772 995 000',
  momoName: 'One Spice Apothecary',
  airtelNumber: '+256 752 995 000',
  airtelName: 'One Spice Apothecary',
};

export function formatUGX(amount: number): string {
  return `UGX ${Math.round(amount).toLocaleString('en-US')}`;
}

export const CATEGORIES: Array<'All Spices' | CulinaryCategory> = [
  'All Spices',
  'Floral & Rare',
  'Warming & Sweet',
  'Heat & Smoke',
  'Earthy & Bold',
];

export const HERO_IMAGE = '/src/assets/images/hero_spice_atelier_1795194679523.jpg';

export const SHOP_INFO = {
  brand: 'One Spice',
  tiktokHandle: '@monero995',
  tiktokUrl: 'https://www.tiktok.com/@monero995?is_from_webapp=1&sender_device=pc',
  addressLine1: 'One Spice Shop · Kampala',
  addressLine2: 'Uganda (Pinned on Google Maps)',
  hours: [
    { days: 'Tuesday – Friday', time: '09:00 – 19:00' },
    { days: 'Saturday', time: '09:00 – 18:30' },
    { days: 'Sunday', time: '11:00 – 16:00' },
    { days: 'Monday', time: 'Closed (Roasting & Milling)' },
  ],
  phone: '+256 772 995 000',
  email: 'hello@onespice.shop',
  mapsUrl: 'https://maps.app.goo.gl/8qZm5Sxhz4vCQTBEA',
  deliveryFeeUGX: 10000,
  freeDeliveryThresholdUGX: 150000,
};

export const SPICES: Spice[] = [
  {
    id: 'kashmiri-mongra-saffron',
    name: 'Kashmiri Mongra Saffron',
    botanicalName: 'Crocus sativus',
    category: 'Floral & Rare',
    grade: 'Grade A1 All-Red Stigma',
    image: '/src/assets/images/spice_kashmiri_saffron_1795194680088.jpg',
    imageAlt: 'Deep crimson Kashmiri Mongra saffron threads in a dark stoneware dish on travertine',
    shortDescription: 'Long, unbroken crimson stigmas prized for honeyed floral perfume and luminous golden color.',
    inStock: true,
    weightTiers: [
      { label: '2g Glass Vial', grams: 2, price: 65000 },
      { label: '5g Apothecary Jar', grams: 5, price: 150000 },
      { label: '10g Chef Tin', grams: 10, price: 280000 },
    ],
    pairings: ['malabar-green-cardamom', 'ceylon-alba-cinnamon', 'wild-anatolian-sumac'],
  },
  {
    id: 'wild-anatolian-sumac',
    name: 'Wild Anatolian Sumac',
    botanicalName: 'Rhus coriaria',
    category: 'Floral & Rare',
    grade: 'Single-Estate Coarse Ruby Grind',
    image: '/src/assets/images/spice_sumac_berries_1795194679927.jpg',
    imageAlt: 'Deep ruby ground wild sumac beside whole dried berries in a shallow ceramic dish',
    shortDescription: 'Bright, wine-toned wild berries sun-cured and stone-milled for natural citrus acidity.',
    inStock: true,
    weightTiers: [
      { label: '50g Pouch', grams: 50, price: 32000 },
      { label: '100g Apothecary Jar', grams: 100, price: 58000 },
      { label: '250g Pantry Tin', grams: 250, price: 125000 },
    ],
    pairings: ['aleppo-halaby-chili', 'royal-roasted-cumin', 'kashmiri-mongra-saffron'],
  },
  {
    id: 'ceylon-alba-cinnamon',
    name: 'Ceylon Alba Cinnamon',
    botanicalName: 'Cinnamomum verum',
    category: 'Warming & Sweet',
    grade: 'Alba Grade Ultra-Thin Quills',
    image: '/src/assets/images/spice_ceylon_cinnamon_1795194679677.jpg',
    imageAlt: 'Multi-layered pale golden Ceylon Alba cinnamon quills beside shaved bark on travertine',
    shortDescription: 'Paper-thin concentric layers of true Sri Lankan inner bark with delicate citrus and clove perfume.',
    inStock: true,
    weightTiers: [
      { label: '40g Quill Bundle', grams: 40, price: 48000 },
      { label: '85g Apothecary Jar', grams: 85, price: 88000 },
      { label: '200g Chef Tin', grams: 200, price: 175000 },
    ],
    pairings: ['malabar-green-cardamom', 'whole-star-anise', 'kashmiri-mongra-saffron'],
  },
  {
    id: 'malabar-green-cardamom',
    name: 'Malabar Green Cardamom',
    botanicalName: 'Elettaria cardamomum',
    category: 'Warming & Sweet',
    grade: '8mm Bold Emerald Pods',
    image: '/src/assets/images/spice_green_cardamom_1795194680154.jpg',
    imageAlt: 'Plump emerald green cardamom pods and dark seeds inside a carved basalt mortar',
    shortDescription: 'Vibrant 8mm emerald pods packed with sticky black seeds bursting with eucalyptus and lemon-mint oils.',
    inStock: true,
    weightTiers: [
      { label: '40g Pouch', grams: 40, price: 40000 },
      { label: '90g Apothecary Jar', grams: 90, price: 76000 },
      { label: '220g Pantry Tin', grams: 220, price: 160000 },
    ],
    pairings: ['ceylon-alba-cinnamon', 'whole-star-anise', 'tellicherry-garbled-pepper'],
  },
  {
    id: 'whole-star-anise',
    name: 'Whole Star Anise',
    botanicalName: 'Illicium verum',
    category: 'Warming & Sweet',
    grade: '8-Point Select Whole Pods',
    image: '/src/assets/images/spice_star_anise_1795194679818.jpg',
    imageAlt: 'Sculptural mahogany eight-pointed star anise pods and glossy seeds on travertine',
    shortDescription: 'Intact eight-pointed mahogany stars rich in sweet anethole essential oil and deep licorice complexity.',
    inStock: true,
    weightTiers: [
      { label: '45g Pouch', grams: 45, price: 28000 },
      { label: '100g Apothecary Jar', grams: 100, price: 54000 },
      { label: '250g Pantry Tin', grams: 250, price: 115000 },
    ],
    pairings: ['ceylon-alba-cinnamon', 'tellicherry-garbled-pepper', 'malabar-green-cardamom'],
  },
  {
    id: 'aleppo-halaby-chili',
    name: 'Aleppo Halaby Chili',
    botanicalName: 'Capsicum annuum',
    category: 'Heat & Smoke',
    grade: 'Sun-Dried Oil-Rubbed Flakes',
    image: '/src/assets/images/spice_aleppo_chili_1795194680114.jpg',
    imageAlt: 'Burgundy crushed Aleppo chili flakes with olive oil sheen in a ceramic bowl and brass spoon',
    shortDescription: 'Silky burgundy flakes cured with sea salt and olive oil—fruity sun-dried tomato depth with gentle creeping heat.',
    inStock: true,
    weightTiers: [
      { label: '50g Pouch', grams: 50, price: 36000 },
      { label: '110g Apothecary Jar', grams: 110, price: 68000 },
      { label: '250g Pantry Tin', grams: 250, price: 138000 },
    ],
    pairings: ['wild-anatolian-sumac', 'royal-roasted-cumin', 'oak-smoked-pimenton'],
  },
  {
    id: 'oak-smoked-pimenton',
    name: 'Oak-Smoked Pimentón',
    botanicalName: 'Capsicum annuum',
    category: 'Heat & Smoke',
    grade: 'La Vera D.O.P. Dulce & Agridulce',
    image: '/src/assets/images/spice_smoked_paprika_1795194680042.jpg',
    imageAlt: 'Brick-red Spanish oak-smoked pimenton paprika mounded in a handmade ceramic spoon',
    shortDescription: 'Velvety brick-red Spanish pepper slow-smoked for two weeks over holm oak embers.',
    inStock: true,
    weightTiers: [
      { label: '55g Pouch', grams: 55, price: 32000 },
      { label: '120g Apothecary Tin', grams: 120, price: 62000 },
      { label: '250g Chef Tin', grams: 250, price: 120000 },
    ],
    pairings: ['aleppo-halaby-chili', 'royal-roasted-cumin', 'tellicherry-garbled-pepper'],
  },
  {
    id: 'tellicherry-garbled-pepper',
    name: 'Tellicherry Garbled Pepper',
    botanicalName: 'Piper nigrum',
    category: 'Earthy & Bold',
    grade: 'TGSEB Extra-Bold Whole Berries',
    image: '/src/assets/images/spice_tellicherry_pepper_1795194679722.jpg',
    imageAlt: 'Plump dark Tellicherry black peppercorns in a matte black ceramic bowl with brass scoop',
    shortDescription: 'Late-ripened extra-bold Malabar berries prized for complex citrus, pine, and warm wood aromatics over blunt heat.',
    inStock: true,
    weightTiers: [
      { label: '60g Pouch', grams: 60, price: 36000 },
      { label: '125g Apothecary Jar', grams: 125, price: 65000 },
      { label: '300g Pantry Tin', grams: 300, price: 130000 },
    ],
    pairings: ['royal-roasted-cumin', 'oak-smoked-pimenton', 'malabar-green-cardamom'],
  },
  {
    id: 'royal-roasted-cumin',
    name: 'Royal Roasted Cumin',
    botanicalName: 'Cuminum cyminum',
    category: 'Earthy & Bold',
    grade: 'Whole Heritage Seed',
    image: '/src/assets/images/spice_cumin_seeds_1795194679858.jpg',
    imageAlt: 'Warm toasted golden-brown royal cumin seeds in a handmade speckled stoneware dish',
    shortDescription: 'Plump, oil-rich heirloom seeds bursting with nutty roasted warmth, smoky earth, and subtle citrus lift.',
    inStock: true,
    weightTiers: [
      { label: '55g Pouch', grams: 55, price: 28000 },
      { label: '115g Apothecary Jar', grams: 115, price: 54000 },
      { label: '275g Pantry Tin', grams: 275, price: 110000 },
    ],
    pairings: ['aleppo-halaby-chili', 'wild-anatolian-sumac', 'tellicherry-garbled-pepper'],
  },
];
