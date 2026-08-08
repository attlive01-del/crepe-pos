import { CurrencySettings, StoreSettings, MenuItem, SaleRecord, ExpenseRecord, RecipeCostItem } from '../types';

export const defaultCurrencySettings: CurrencySettings = {
  baseCurrencySymbol: '$',
  baseCurrencyCode: 'USD',
  localCurrencySymbol: 'ل.ل',
  localCurrencyCode: 'LBP',
  exchangeRate: 89500,
};

export const defaultStoreSettings: StoreSettings = {
  storeName: 'كريباي لنقطة البيع - Crepeye POS',
  storeNameEn: 'Crepeye POS & Dessert Stand',
  logoUrl: 'https://images.unsplash.com/photo-1519676867240-f03562e64548?auto=format&fit=crop&w=300&q=80',
  dailyTargetUsd: 250,
};

export const defaultMenuItems: MenuItem[] = [
  {
    id: 'item-1',
    nameAr: 'كريب نوتيلا بالموز',
    nameEn: 'Nutella Banana Crepe',
    priceUsd: 3.50,
    category: 'crepe',
    iconName: 'UtensilsCrossed',
    colorBg: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200',
    available: true,
    unitCostUsd: 1.10,
  },
  {
    id: 'item-2',
    nameAr: 'كريب لوتس كرانش',
    nameEn: 'Lotus Biscoff Crepe',
    priceUsd: 4.00,
    category: 'crepe',
    iconName: 'Cookie',
    colorBg: 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-200',
    available: true,
    unitCostUsd: 1.30,
  },
  {
    id: 'item-3',
    nameAr: 'كريب بستاشيو ملكي',
    nameEn: 'Pistachio Royal Crepe',
    priceUsd: 4.50,
    category: 'crepe',
    iconName: 'Sparkles',
    colorBg: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200',
    available: true,
    unitCostUsd: 1.60,
  },
  {
    id: 'item-4',
    nameAr: 'كريب مالح (جبنة ومرتديلا)',
    nameEn: 'Savory Cheese & Turkey Crepe',
    priceUsd: 3.80,
    category: 'crepe',
    iconName: 'Sandwich',
    colorBg: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-200',
    available: true,
    unitCostUsd: 1.25,
  },
  {
    id: 'item-5',
    nameAr: 'وافل بلجيكي بالشوكلاتة',
    nameEn: 'Belgian Chocolate Waffle',
    priceUsd: 3.80,
    category: 'waffle',
    iconName: 'Grid',
    colorBg: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200',
    available: true,
    unitCostUsd: 1.15,
  },
  {
    id: 'item-6',
    nameAr: 'وافل ستيك مع فواكه',
    nameEn: 'Waffle Stick with Fruits',
    priceUsd: 3.00,
    category: 'waffle',
    iconName: 'Apple',
    colorBg: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200',
    available: true,
    unitCostUsd: 0.90,
  },
  {
    id: 'item-7',
    nameAr: 'ميني بان كيك (12 قطعة)',
    nameEn: 'Mini Pancakes (12 Pcs)',
    priceUsd: 4.20,
    category: 'pancake',
    iconName: 'Circle',
    colorBg: 'bg-yellow-100 text-yellow-900 dark:bg-yellow-950 dark:text-yellow-200',
    available: true,
    unitCostUsd: 1.20,
  },
  {
    id: 'item-8',
    nameAr: 'إضافة صوص نوتيلا / لوتس',
    nameEn: 'Extra Nutella / Lotus Dip',
    priceUsd: 0.75,
    category: 'extra',
    iconName: 'PlusCircle',
    colorBg: 'bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200',
    available: true,
    unitCostUsd: 0.20,
  },
  {
    id: 'item-9',
    nameAr: 'إضافة فواكه طازجة',
    nameEn: 'Extra Fresh Fruits',
    priceUsd: 0.80,
    category: 'extra',
    iconName: 'Apple',
    colorBg: 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200',
    available: true,
    unitCostUsd: 0.30,
  },
  {
    id: 'item-10',
    nameAr: 'ميلك شيك شوكولاتة',
    nameEn: 'Chocolate Milkshake',
    priceUsd: 3.20,
    category: 'drink',
    iconName: 'Coffee',
    colorBg: 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200',
    available: true,
    unitCostUsd: 0.95,
  },
  {
    id: 'item-11',
    nameAr: 'اسبريسو / قهوة مثلجة',
    nameEn: 'Espresso / Iced Coffee',
    priceUsd: 2.20,
    category: 'drink',
    iconName: 'CupSoda',
    colorBg: 'bg-stone-100 text-stone-800 dark:bg-stone-800 dark:text-stone-200',
    available: true,
    unitCostUsd: 0.50,
  },
  {
    id: 'item-12',
    nameAr: 'مياه معدنية / مشروب غازي',
    nameEn: 'Water / Soft Drink',
    priceUsd: 1.00,
    category: 'drink',
    iconName: 'GlassWater',
    colorBg: 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-200',
    available: true,
    unitCostUsd: 0.35,
  },
];

// Seed realistic initial sales for today and previous hours
const now = Date.now();
const hour = 3600 * 1000;

export const defaultInitialSales: SaleRecord[] = [
  {
    id: 'sale-1001',
    orderNumber: 'CR-1001',
    timestamp: now - (hour * 0.5),
    items: [
      { nameAr: 'كريب نوتيلا بالموز', nameEn: 'Nutella Banana Crepe', quantity: 2, priceUsd: 3.50, totalUsd: 7.00 },
      { nameAr: 'ميلك شيك شوكولاتة', nameEn: 'Chocolate Milkshake', quantity: 1, priceUsd: 3.20, totalUsd: 3.20 }
    ],
    totalUsd: 10.20,
    totalLocal: 10.20 * 89500,
    exchangeRate: 89500,
    paymentMethod: 'cash',
    status: 'completed',
    notes: 'بدون موز على قطعة واحدة'
  },
  {
    id: 'sale-1002',
    orderNumber: 'CR-1002',
    timestamp: now - (hour * 1.8),
    items: [
      { nameAr: 'وافل بلجيكي بالشوكلاتة', nameEn: 'Belgian Chocolate Waffle', quantity: 1, priceUsd: 3.80, totalUsd: 3.80 },
      { nameAr: 'إضافة صوص نوتيلا / لوتس', nameEn: 'Extra Nutella / Lotus Dip', quantity: 1, priceUsd: 0.75, totalUsd: 0.75 }
    ],
    totalUsd: 4.55,
    totalLocal: 4.55 * 89500,
    exchangeRate: 89500,
    paymentMethod: 'cash',
    status: 'completed',
  },
  {
    id: 'sale-1003',
    orderNumber: 'CR-1003',
    timestamp: now - (hour * 3.2),
    items: [
      { nameAr: 'ميني بان كيك (12 قطعة)', nameEn: 'Mini Pancakes (12 Pcs)', quantity: 2, priceUsd: 4.20, totalUsd: 8.40 },
      { nameAr: 'اسبريسو / قهوة مثلجة', nameEn: 'Espresso / Iced Coffee', quantity: 2, priceUsd: 2.20, totalUsd: 4.40 }
    ],
    totalUsd: 12.80,
    totalLocal: 12.80 * 89500,
    exchangeRate: 89500,
    paymentMethod: 'card',
    status: 'completed',
  },
  {
    id: 'sale-1004',
    orderNumber: 'CR-1004',
    timestamp: now - (hour * 5.0),
    items: [
      { nameAr: 'كريب بستاشيو ملكي', nameEn: 'Pistachio Royal Crepe', quantity: 1, priceUsd: 4.50, totalUsd: 4.50 }
    ],
    totalUsd: 4.50,
    totalLocal: 4.50 * 89500,
    exchangeRate: 89500,
    paymentMethod: 'cash',
    status: 'completed',
  },
  {
    id: 'sale-1005',
    orderNumber: 'CR-1005',
    timestamp: now - (hour * 7.5),
    items: [
      { nameAr: 'كريب مالح (جبنة ومرتديلا)', nameEn: 'Savory Cheese & Turkey Crepe', quantity: 3, priceUsd: 3.80, totalUsd: 11.40 },
      { nameAr: 'مياه معدنية / مشروب غازي', nameEn: 'Water / Soft Drink', quantity: 3, priceUsd: 1.00, totalUsd: 3.00 }
    ],
    totalUsd: 14.40,
    totalLocal: 14.40 * 89500,
    exchangeRate: 89500,
    paymentMethod: 'cash',
    status: 'completed',
  }
];

export const defaultInitialExpenses: ExpenseRecord[] = [
  {
    id: 'exp-1',
    timestamp: now - (hour * 24),
    category: 'raw_materials',
    description: 'شراء شوكولاتة نوتيلا 3 كجم + زبدة لوتس',
    tags: ['نوتيلا', 'لوتس', 'مواد خام'],
    amountUsd: 35.00,
    amountLocal: 35.00 * 89500,
    exchangeRate: 89500,
  },
  {
    id: 'exp-2',
    timestamp: now - (hour * 18),
    category: 'packaging',
    description: 'علب كريب مثلثات + كراتين وافل + أكياس ورقية',
    tags: ['تغليف', 'علب'],
    amountUsd: 18.50,
    amountLocal: 18.50 * 89500,
    exchangeRate: 89500,
  },
  {
    id: 'exp-3',
    timestamp: now - (hour * 12),
    category: 'utilities',
    description: 'تعبئة أسطوانة غاز للماكينة',
    tags: ['غاز'],
    amountUsd: 12.00,
    amountLocal: 12.00 * 89500,
    exchangeRate: 89500,
  },
];

export const defaultRecipeCosts: RecipeCostItem[] = [
  {
    id: 'rec-1',
    itemName: 'كريب نوتيلا بالموز',
    batterCostUsd: 0.35,
    fillingCostUsd: 0.55,
    packagingCostUsd: 0.20,
    targetPriceUsd: 3.50,
  },
  {
    id: 'rec-2',
    itemName: 'وافل بلجيكي بالشوكلاتة',
    batterCostUsd: 0.40,
    fillingCostUsd: 0.55,
    packagingCostUsd: 0.20,
    targetPriceUsd: 3.80,
  }
];
