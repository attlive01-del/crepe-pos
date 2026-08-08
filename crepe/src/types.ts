export type Language = 'ar' | 'en';

export interface CurrencySettings {
  baseCurrencySymbol: string; // e.g. '$'
  baseCurrencyCode: string;   // e.g. 'USD'
  localCurrencySymbol: string; // e.g. 'ل.ل' or 'ج.م' or 'ر.س'
  localCurrencyCode: string;   // e.g. 'LBP' or 'EGP' or 'SAR'
  exchangeRate: number;        // e.g. 89500 (1 USD = 89500 LBP)
}

export interface StoreSettings {
  storeName: string;
  storeNameEn: string;
  logoUrl: string;
  dailyTargetUsd: number;
}

export type CategoryType = 'crepe' | 'waffle' | 'pancake' | 'drink' | 'extra' | 'custom';

export interface MenuItem {
  id: string;
  nameAr: string;
  nameEn: string;
  priceUsd: number;
  category: CategoryType;
  iconName?: string;
  colorBg?: string;
  available: boolean;
  unitCostUsd?: number;
}

export interface CartItem {
  cartId: string;
  item: MenuItem;
  quantity: number;
  customPriceUsd?: number;
  notes?: string;
  selectedAddons?: string[];
}

export interface SaleItemSummary {
  itemId?: string;
  nameAr: string;
  nameEn: string;
  quantity: number;
  priceUsd: number;
  totalUsd: number;
}

export interface SaleRecord {
  id: string;
  orderNumber: string;
  timestamp: number; // Date.now()
  items: SaleItemSummary[];
  totalUsd: number;
  totalLocal: number;
  exchangeRate: number;
  paymentMethod: 'cash' | 'card' | 'transfer';
  status: 'completed' | 'voided';
  notes?: string;
}

export type ExpenseCategory = 'raw_materials' | 'packaging' | 'utilities' | 'rent_salaries' | 'other';

export interface ExpenseRecord {
  id: string;
  timestamp: number;
  category: ExpenseCategory;
  description: string;
  tags: string[];
  amountUsd: number;
  amountLocal: number;
  exchangeRate: number;
}

export interface RecipeCostItem {
  id: string;
  itemName: string;
  batterCostUsd: number;
  fillingCostUsd: number;
  packagingCostUsd: number;
  targetPriceUsd: number;
}
