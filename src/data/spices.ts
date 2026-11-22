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

export interface CulinaryUse {
  dish: string;
  pairing: string;
  technique: string;
}

export interface SpiceOrigin {
  country: string;
  region: string;
  coordinates: string;
  elevation: string;
  harvestSeason: string;
  curingMethod: string;
  story: string;
}

export interface SensoryProfile {
  warmth: number; // 1 to 5
  aroma: number; // 1 to 5
  pungency: number; // 1 to 5
  sweetness: number; // 1 to 5
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
  lotCode: string;
  weightTiers: WeightTier[];
  tastingNotes: {
    summary: string;
    aroma: string;
    palate: string;
    finish: string;
    sensory: SensoryProfile;
  };
  culinaryUses: CulinaryUse[];
  origin: SpiceOrigin;
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
    lotCode: 'Harvest Lot KM-26',
    weightTiers: [
      { label: '2g Glass Vial', grams: 2, price: 65000 },
      { label: '5g Apothecary Jar', grams: 5, price: 150000 },
      { label: '10g Chef Tin', grams: 10, price: 280000 },
    ],
    tastingNotes: {
      summary:
        'Exceptionally high crocin and safranal concentration yields a saturated marigold infusion with silky honeyed depth and zero bitterness.',
      aroma: 'Dried wildflower honey, crisp autumn hay, warm cedar resin',
      palate: 'Velvety meadow floral, subtle mineral salinity, bittersweet almond',
      finish: 'Lingering warm hay and delicate golden tea tannins',
      sensory: { warmth: 2, aroma: 5, pungency: 2, sweetness: 3 },
    },
    culinaryUses: [
      {
        dish: 'Risotto alla Milanese',
        pairing: 'Aged Parmigiano, bone marrow, Carnaroli rice',
        technique: 'Steep 18 threads in 60ml warm chicken stock for 20 minutes before folding into rice during the final stir.',
      },
      {
        dish: 'Persian Jeweled Tahdig',
        pairing: 'Barberries, pistachio, clarified butter',
        technique: 'Mortar-crush threads with a pinch of raw sugar, then bloom over ice cubes for maximum pigment extraction.',
      },
      {
        dish: 'Saffron & Cardamom Poached Pears',
        pairing: 'Bosc pears, vanilla bean, dry white wine',
        technique: 'Infuse poaching syrup off-heat during the last 10 minutes to preserve volatile top-note florals.',
      },
    ],
    origin: {
      country: 'India',
      region: 'Pampore Karewa Highlands, Kashmir',
      coordinates: '34.02° N, 74.93° E',
      elevation: '1,600m',
      harvestSeason: 'Late October Dawn Harvest',
      curingMethod: 'Hand-separated stigma, slow shade-dried over charcoal warmth',
      story:
        'Cultivated on mineral-rich lacustrine Karewa terraces outside Pampore, each blossom is picked before sunrise so sunlight never degrades the fragile crimson tips.',
    },
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
    lotCode: 'Harvest Lot AS-14',
    weightTiers: [
      { label: '50g Pouch', grams: 50, price: 32000 },
      { label: '100g Apothecary Jar', grams: 100, price: 58000 },
      { label: '250g Pantry Tin', grams: 250, price: 125000 },
    ],
    tastingNotes: {
      summary:
        'Vibrant malic-acid brightness layered with dark cranberry fruitiness and subtle tea-leaf astringency without harsh vinegar sharpness.',
      aroma: 'Crushed pomegranate skin, sun-dried hibiscus, pink peppercorn',
      palate: 'Tart Meyer lemon zest, wild sour cherry, clean sea-salt minerality',
      finish: 'Crisp, mouthwatering citrus tannin that lifts rich meats',
      sensory: { warmth: 1, aroma: 4, pungency: 2, sweetness: 2 },
    },
    culinaryUses: [
      {
        dish: 'Musakhan Sumac Chicken',
        pairing: 'Caramelized shallots, pine nuts, olive oil flatbread',
        technique: 'Toss roasted thighs and sweet onions generously off-heat so the ruby oils coat without scorching.',
      },
      {
        dish: 'Charred Eggplant & Labneh',
        pairing: 'Strained yogurt, cold-pressed olive oil, flaky salt',
        technique: 'Dust directly over warm tahini or labneh immediately before serving for vibrant contrast.',
      },
      {
        dish: 'Crispy Sumac Shallots',
        pairing: 'Heirloom tomatoes, grilled sea bass, cured olives',
        technique: 'Macerate thinly sliced red onions with sumac and sea salt for 15 minutes to soften bite.',
      },
    ],
    origin: {
      country: 'Turkey',
      region: 'Gaziantep Limestone Foothills',
      coordinates: '37.06° N, 37.38° E',
      elevation: '850m',
      harvestSeason: 'Late August Wild Foraging',
      curingMethod: 'Sun-dried whole clusters, cold-milled without salt fillers',
      story:
        'Foraged from wild hillside shrubs around Gaziantep, these berries are milled pure with zero added salt or citric acid—leaving only natural berry oils and malic brightness.',
    },
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
    lotCode: 'Harvest Lot CA-09',
    weightTiers: [
      { label: '40g Quill Bundle', grams: 40, price: 48000 },
      { label: '85g Apothecary Jar', grams: 85, price: 88000 },
      { label: '200g Chef Tin', grams: 200, price: 175000 },
    ],
    tastingNotes: {
      summary:
        'Unlike fiery cassia bark, Alba-grade Ceylon cinnamon whispers with delicate clove blossom, sweet tangerine peel, and warm vanilla wood.',
      aroma: 'Candied bergamot peel, sweet cedarwood, gentle clove bud',
      palate: 'Silky honeyed warmth, soft floral spice, low coumarin sweetness',
      finish: 'Clean, lingering citrus-wood fragrance without harsh heat',
      sensory: { warmth: 3, aroma: 5, pungency: 1, sweetness: 5 },
    },
    culinaryUses: [
      {
        dish: 'Spiced Lamb & Apricot Tagine',
        pairing: 'Saffron, toasted almonds, preserved lemon',
        technique: 'Simmer one whole Alba quill gently in stock for 45 minutes; its fragile layers release flavor evenly.',
      },
      {
        dish: 'Brown Butter Morning Brioche',
        pairing: 'Cultured butter, muscovado sugar, cardamom',
        technique: 'Microplane or crumble by hand right before laminating into dough for peak volatile aroma.',
      },
      {
        dish: 'Single-Origin Hot Chocolate',
        pairing: '70% dark cacao, ancho chili, whole milk',
        technique: 'Steep broken quill shards in scalded cream for 10 minutes before whisking into melted chocolate.',
      },
    ],
    origin: {
      country: 'Sri Lanka',
      region: 'Matara Coastal Estates',
      coordinates: '5.95° N, 80.55° E',
      elevation: '120m',
      harvestSeason: 'Monsoon Peel Harvest',
      curingMethod: 'Hand-peeled inner cambium, rolled and air-dried in shade',
      story:
        'Alba is the rarest grading of true Ceylon cinnamon—measured at under 6mm quill diameter, hand-rolled by master peelers from tender young shoots along the southern coast.',
    },
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
    lotCode: 'Harvest Lot MC-31',
    weightTiers: [
      { label: '40g Pouch', grams: 40, price: 40000 },
      { label: '90g Apothecary Jar', grams: 90, price: 76000 },
      { label: '220g Pantry Tin', grams: 220, price: 160000 },
    ],
    tastingNotes: {
      summary:
        'Crisp camphoraceous coolness up front transitions rapidly into sweet resinous pine, Meyer lemon oil, and lingering black tea warmth.',
      aroma: 'Crushed eucalyptus leaf, fresh lime zest, sweet camphor',
      palate: 'Bright herbal mint, warm citrus blossom, dark resinous seed oil',
      finish: 'Cooling, aromatic palate cleanser with subtle peppery hum',
      sensory: { warmth: 3, aroma: 5, pungency: 3, sweetness: 4 },
    },
    culinaryUses: [
      {
        dish: 'Swedish Kardemummabullar',
        pairing: 'Pearl sugar, cultured butter, sourdough brioche',
        technique: 'Crack pods and stone-grind only the inner black seeds immediately before folding into dough.',
      },
      {
        dish: 'Arabic Qahwa Spiced Coffee',
        pairing: 'Light-roast arabica, saffron threads, dates',
        technique: 'Lightly bruise whole pods with the flat of a knife and simmer briefly with ground coffee.',
      },
      {
        dish: 'Slow-Braised Duck & Plum Glaze',
        pairing: 'Star anise, soy, dark plum, ginger',
        technique: 'Toast cracked pods in dry cast iron for 30 seconds until fragrant before deglazing.',
      },
    ],
    origin: {
      country: 'India',
      region: 'Idukki Cardamom Hills, Kerala',
      coordinates: '9.85° N, 76.97° E',
      elevation: '1,100m',
      harvestSeason: 'November Canopy Picking',
      curingMethod: 'Low-temperature kiln dried in dark rooms to lock chlorophyll green',
      story:
        'Grown beneath rainforest shade trees in Kerala’s misty Western Ghats, only the heaviest 8mm pods with full oil-rich seed clusters are selected for our jars.',
    },
    pairings: ['ceylon-alba-cinnamon', 'whole-star-anise', 'tellicherry-garbled-pepper'],
  },
  {
    id: 'whole-star-anise',
    name: 'Whole Star Anise',
    botanicalName: 'Illicium verum',
    category: 'Warming & Sweet',
    grade: 'Autumn Select 8-Point Pods',
    image: '/src/assets/images/spice_star_anise_1795194679818.jpg',
    imageAlt: 'Sculptural mahogany eight-pointed star anise pods and glossy seeds on travertine',
    shortDescription: 'Intact eight-pointed mahogany stars rich in sweet anethole essential oil and deep licorice complexity.',
    inStock: true,
    lotCode: 'Harvest Lot SA-19',
    weightTiers: [
      { label: '45g Pouch', grams: 45, price: 28000 },
      { label: '100g Apothecary Jar', grams: 100, price: 54000 },
      { label: '250g Pantry Tin', grams: 250, price: 115000 },
    ],
    tastingNotes: {
      summary:
        'Rich, woody sweetness anchored by bright fennel-licorice aromatics and a clean, warming spice backbone that deepens slow-simmered broths.',
      aroma: 'Sweet wild fennel, toasted mahogany bark, warm root beer spice',
      palate: 'Velvety licorice root, subtle clove warmth, bittersweet caramel',
      finish: 'Cooling, sweet aniseed linger that balances savory fats',
      sensory: { warmth: 4, aroma: 5, pungency: 2, sweetness: 4 },
    },
    culinaryUses: [
      {
        dish: '24-Hour Beef Pho Broth',
        pairing: 'Charred ginger, Saigon cinnamon, roasted marrow bones',
        technique: 'Dry-char two whole stars until edges blister lightly before dropping into simmering stock.',
      },
      {
        dish: 'Red-Braised Pork Belly (Hong Shao Rou)',
        pairing: 'Shaoxing wine, rock sugar, dark soy',
        technique: 'Simmer whole in caramelized soy glaze so the fat absorbs deep aromatic sweetness.',
      },
      {
        dish: 'Spiced Fig & Wine Compote',
        pairing: 'Black mission figs, Pinot Noir, orange zest',
        technique: 'Steep a single pod per pint of poaching liquid and remove prior to chilling.',
      },
    ],
    origin: {
      country: 'Vietnam',
      region: 'Lạng Sơn Mountain Groves',
      coordinates: '21.85° N, 106.76° E',
      elevation: '720m',
      harvestSeason: 'September Autumn Harvest',
      curingMethod: 'Sun-cured on woven bamboo mats until deep mahogany brown',
      story:
        'Hand-picked from mature evergreen trees in northern Vietnam’s mist-covered valleys; autumn harvests contain markedly higher essential oil than spring pickings.',
    },
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
    lotCode: 'Harvest Lot AH-22',
    weightTiers: [
      { label: '50g Pouch', grams: 50, price: 36000 },
      { label: '110g Apothecary Jar', grams: 110, price: 68000 },
      { label: '250g Pantry Tin', grams: 250, price: 138000 },
    ],
    tastingNotes: {
      summary:
        'A chef’s finishing chili built for flavor over fire: luscious raisin-like fruitiness, subtle cumin-like earth, and warm velvety heat.',
      aroma: 'Sun-dried plum tomato, sweet red bell pepper, roasted raisin',
      palate: 'Rich savory fruit, mild saline balance, gentle blooming warmth (10,000 SHU)',
      finish: 'Clean, lingering sweet chili glow that never numbs the palate',
      sensory: { warmth: 4, aroma: 4, pungency: 3, sweetness: 3 },
    },
    culinaryUses: [
      {
        dish: 'Çılbır Poached Eggs & Yogurt',
        pairing: 'Brown butter, garlic labneh, sourdough toast',
        technique: 'Bloom 1 tablespoon in sizzling brown butter off-heat for 10 seconds to release crimson oil.',
      },
      {
        dish: 'Grilled Halloumi & Watermelon',
        pairing: 'Fresh mint, lime juice, wildflower honey',
        technique: 'Finish seared cheese right off the grill for sparkling burgundy crunch and fruitiness.',
      },
      {
        dish: 'Roasted Carrot & Harissa Soup',
        pairing: 'Heirloom carrots, toasted cumin, coconut cream',
        technique: 'Stir into warm finishing oil rather than long-boiling to preserve its bright red berry notes.',
      },
    ],
    origin: {
      country: 'Turkey',
      region: 'Hatay & Kilis Border Plains',
      coordinates: '36.71° N, 37.11° E',
      elevation: '640m',
      harvestSeason: 'September Late-Summer Sun Cure',
      curingMethod: 'De-seeded, sun-dried on rooftops, coarsely crushed with olive oil & sea salt',
      story:
        'Grown along the historic Silk Road plains using heritage Halaby seed stock, each pod is painstakingly de-seeded before curing so only sweet flesh and warm oil remain.',
    },
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
    lotCode: 'Harvest Lot PV-08',
    weightTiers: [
      { label: '55g Pouch', grams: 55, price: 32000 },
      { label: '120g Apothecary Tin', grams: 120, price: 62000 },
      { label: '250g Chef Tin', grams: 250, price: 120000 },
    ],
    tastingNotes: {
      summary:
        'Deep hearthside smoke woven seamlessly into caramelized roasted red pepper sweetness, lending instant campfire depth to stews and rubs.',
      aroma: 'Seasoned holm oak embers, sweet roasted piquillo, dark cacao',
      palate: 'Silky sweet paprika fruit, rich woodsmoke, subtle bittersweet edge',
      finish: 'Warming, savory hearth aroma that anchors seafood and legumes',
      sensory: { warmth: 4, aroma: 5, pungency: 2, sweetness: 3 },
    },
    culinaryUses: [
      {
        dish: 'Galician Pulpo a la Feira',
        pairing: 'Braised octopus, waxy potatoes, extra-virgin olive oil',
        technique: 'Dust generously over hot sliced octopus and dress immediately with warm olive oil.',
      },
      {
        dish: 'Smoky White Bean & Chorizo Stew',
        pairing: 'Butter beans, charred garlic, sherry vinegar',
        technique: 'Swirl into warm soffritto for no more than 15 seconds before adding stock—never scorch.',
      },
      {
        dish: 'Dry-Rubbed Pork Shoulder',
        pairing: 'Dark brown sugar, Tellicherry pepper, fennel seed',
        technique: 'Blend 2:1 with coarse sea salt and garlic powder for crisp mahogany bark.',
      },
    ],
    origin: {
      country: 'Spain',
      region: 'La Vera Valley, Extremadura',
      coordinates: '40.12° N, 5.65° W',
      elevation: '490m',
      harvestSeason: 'October Autumn Picking',
      curingMethod: '15-day slow smoke over holm oak fires, stone-milled five times',
      story:
        'Inside traditional two-story stone dryers fed by smoldering holm oak logs, farmers hand-turn ripe Bola peppers every 24 hours until smoky and brittle.',
    },
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
    lotCode: 'Harvest Lot TG-41',
    weightTiers: [
      { label: '60g Pouch', grams: 60, price: 36000 },
      { label: '125g Apothecary Jar', grams: 125, price: 65000 },
      { label: '300g Pantry Tin', grams: 300, price: 130000 },
    ],
    tastingNotes: {
      summary:
        'Left on the vine until nearly ripe, these extra-large berries sacrifice brute piperine sting for layered grapefruit zest, juniper, and oak.',
      aroma: 'Crushed juniper berry, pink grapefruit pith, warm cedarwood',
      palate: 'Resinous pine needle, bright fermented fruit, clean warming bite',
      finish: 'Rounded, crackling pepper warmth that enhances without overwhelming',
      sensory: { warmth: 4, aroma: 4, pungency: 5, sweetness: 1 },
    },
    culinaryUses: [
      {
        dish: 'Cacio e Pepe Tradizionale',
        pairing: 'Pecorino Romano DOP, tonnarelli pasta, starchy pasta water',
        technique: 'Coarsely crack berries in a mortar and toast dry in a skillet until piney aromatics bloom.',
      },
      {
        dish: 'Steak au Poivre',
        pairing: 'Dry-aged ribeye, Cognac, heavy cream, shallots',
        technique: 'Press cracked peppercorns firmly into dry meat 10 minutes before searing in clarified butter.',
      },
      {
        dish: 'Black Pepper & Strawberry Tart',
        pairing: 'Macerated strawberries, mascarpone, balsamic',
        technique: 'Finish ripe berries with two freshly ground turns to amplify natural fruit sweetness.',
      },
    ],
    origin: {
      country: 'India',
      region: 'Thalassery (Tellicherry), Malabar Coast',
      coordinates: '11.75° N, 75.49° E',
      elevation: '380m',
      harvestSeason: 'January Late-Ripened Harvest',
      curingMethod: 'Sun-dried on clean granite terraces; top 10% largest berries garbled by sieve',
      story:
        'Only the largest berries measuring 4.75mm and above earn the TGSEB classification—packed with volatile essential oils developed during extra weeks on the vine.',
    },
    pairings: ['royal-roasted-cumin', 'oak-smoked-pimenton', 'malabar-green-cardamom'],
  },
  {
    id: 'royal-roasted-cumin',
    name: 'Royal Roasted Cumin',
    botanicalName: 'Cuminum cyminum',
    category: 'Earthy & Bold',
    grade: 'Whole Single-Origin Heritage Seed',
    image: '/src/assets/images/spice_cumin_seeds_1795194679858.jpg',
    imageAlt: 'Warm toasted golden-brown royal cumin seeds in a handmade speckled stoneware dish',
    shortDescription: 'Plump, oil-rich heirloom seeds bursting with nutty roasted warmth, smoky earth, and subtle citrus lift.',
    inStock: true,
    lotCode: 'Harvest Lot RC-17',
    weightTiers: [
      { label: '55g Pouch', grams: 55, price: 28000 },
      { label: '115g Apothecary Jar', grams: 115, price: 54000 },
      { label: '275g Pantry Tin', grams: 275, price: 110000 },
    ],
    tastingNotes: {
      summary:
        'Deeply savory and aromatic when dry-toasted, revealing roasted hazelnut richness, warm soil, and an unexpected whisper of green cardamom.',
      aroma: 'Toasted walnut shell, warm desert clay, dried lemon leaf',
      palate: 'Rich earthy cuminaldehyde, buttery roasted seed, subtle bitter herb',
      finish: 'Long, grounding savory resonance ideal for legumes and braised cuts',
      sensory: { warmth: 4, aroma: 5, pungency: 3, sweetness: 2 },
    },
    culinaryUses: [
      {
        dish: 'Tadka Dal with Ghee',
        pairing: 'Red lentils, mustard seed, crispy curry leaves, garlic',
        technique: 'Drop whole seeds into shimmering hot ghee for 12 seconds until they crackle and darken slightly.',
      },
      {
        dish: 'Charred Cauliflower & Tahini',
        pairing: 'Pomegranate seeds, lemon, parsley',
        technique: 'Crush toasted seeds coarsely in a mortar so irregular shards give pops of nutty aroma.',
      },
      {
        dish: 'Lamb Kofta Skewers',
        pairing: 'Aleppo chili, fresh coriander, red onion',
        technique: 'Blend freshly ground roasted cumin directly into minced shoulder before resting overnight.',
      },
    ],
    origin: {
      country: 'India',
      region: 'Unjha Arid Plains, Gujarat',
      coordinates: '23.80° N, 72.39° E',
      elevation: '145m',
      harvestSeason: 'March Dry-Season Harvest',
      curingMethod: 'Field-cured in dry desert winds, triple-cleaned for high oil yield',
      story:
        'Grown in arid sandy-loam soils where intense daytime sun concentrates essential cuminaldehyde oils inside every ridged seed.',
    },
    pairings: ['aleppo-halaby-chili', 'wild-anatolian-sumac', 'tellicherry-garbled-pepper'],
  },
];
