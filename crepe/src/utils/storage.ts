import { CurrencySettings, StoreSettings, MenuItem, SaleRecord, ExpenseRecord, RecipeCostItem } from '../types';
import { defaultCurrencySettings, defaultStoreSettings, defaultMenuItems, defaultInitialSales, defaultInitialExpenses, defaultRecipeCosts } from '../data/defaultData';

const KEYS = {
  CURRENCY: 'crepeye_currency_settings',
  STORE: 'crepeye_store_settings',
  MENU: 'crepeye_menu_items',
  SALES: 'crepeye_sales_records',
  EXPENSES: 'crepeye_expense_records',
  RECIPES: 'crepeye_recipe_costs',
  LANG: 'crepeye_language',
};

export const getStoredCurrency = (): CurrencySettings => {
  try {
    const data = localStorage.getItem(KEYS.CURRENCY);
    return data ? JSON.parse(data) : defaultCurrencySettings;
  } catch (e) {
    console.error('Error loading currency settings', e);
    return defaultCurrencySettings;
  }
};

export const saveStoredCurrency = (settings: CurrencySettings): void => {
  try {
    localStorage.setItem(KEYS.CURRENCY, JSON.stringify(settings));
  } catch (e) {
    console.error('Error saving currency settings', e);
  }
};

export const getStoredStoreSettings = (): StoreSettings => {
  try {
    const data = localStorage.getItem(KEYS.STORE);
    return data ? JSON.parse(data) : defaultStoreSettings;
  } catch (e) {
    console.error('Error loading store settings', e);
    return defaultStoreSettings;
  }
};

export const saveStoredStoreSettings = (settings: StoreSettings): void => {
  try {
    localStorage.setItem(KEYS.STORE, JSON.stringify(settings));
  } catch (e) {
    console.error('Error saving store settings', e);
  }
};

export const getStoredMenuItems = (): MenuItem[] => {
  try {
    const data = localStorage.getItem(KEYS.MENU);
    return data ? JSON.parse(data) : defaultMenuItems;
  } catch (e) {
    console.error('Error loading menu items', e);
    return defaultMenuItems;
  }
};

export const saveStoredMenuItems = (items: MenuItem[]): void => {
  try {
    localStorage.setItem(KEYS.MENU, JSON.stringify(items));
  } catch (e) {
    console.error('Error saving menu items', e);
  }
};

export const getStoredSales = (): SaleRecord[] => {
  try {
    const data = localStorage.getItem(KEYS.SALES);
    return data ? JSON.parse(data) : defaultInitialSales;
  } catch (e) {
    console.error('Error loading sales', e);
    return defaultInitialSales;
  }
};

export const saveStoredSales = (sales: SaleRecord[]): void => {
  try {
    localStorage.setItem(KEYS.SALES, JSON.stringify(sales));
  } catch (e) {
    console.error('Error saving sales', e);
  }
};

export const getStoredExpenses = (): ExpenseRecord[] => {
  try {
    const data = localStorage.getItem(KEYS.EXPENSES);
    return data ? JSON.parse(data) : defaultInitialExpenses;
  } catch (e) {
    console.error('Error loading expenses', e);
    return defaultInitialExpenses;
  }
};

export const saveStoredExpenses = (expenses: ExpenseRecord[]): void => {
  try {
    localStorage.setItem(KEYS.EXPENSES, JSON.stringify(expenses));
  } catch (e) {
    console.error('Error saving expenses', e);
  }
};

export const getStoredRecipes = (): RecipeCostItem[] => {
  try {
    const data = localStorage.getItem(KEYS.RECIPES);
    return data ? JSON.parse(data) : defaultRecipeCosts;
  } catch (e) {
    console.error('Error loading recipes', e);
    return defaultRecipeCosts;
  }
};

export const saveStoredRecipes = (recipes: RecipeCostItem[]): void => {
  try {
    localStorage.setItem(KEYS.RECIPES, JSON.stringify(recipes));
  } catch (e) {
    console.error('Error saving recipes', e);
  }
};

export const clearAllApplicationData = (): void => {
  try {
    Object.values(KEYS).forEach((k) => localStorage.removeItem(k));
  } catch (e) {
    console.error('Error clearing data', e);
  }
};

// Export entire local database as a JSON file
export const exportFullBackup = (): void => {
  try {
    const backupObj = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      currency: getStoredCurrency(),
      store: getStoredStoreSettings(),
      menuItems: getStoredMenuItems(),
      sales: getStoredSales(),
      expenses: getStoredExpenses(),
      recipes: getStoredRecipes(),
    };

    const jsonStr = JSON.stringify(backupObj, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `crepeye_pos_backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (e) {
    console.error('Error exporting backup', e);
  }
};

// Import backup JSON into local storage
export const importFullBackup = (jsonString: string): boolean => {
  try {
    const data = JSON.parse(jsonString);
    if (data.currency) saveStoredCurrency(data.currency);
    if (data.store) saveStoredStoreSettings(data.store);
    if (data.menuItems) saveStoredMenuItems(data.menuItems);
    if (data.sales) saveStoredSales(data.sales);
    if (data.expenses) saveStoredExpenses(data.expenses);
    if (data.recipes) saveStoredRecipes(data.recipes);
    return true;
  } catch (e) {
    console.error('Error importing backup JSON', e);
    return false;
  }
};

// Formatting helpers
export const formatBaseCurrency = (amountUsd: number, symbol = '$'): string => {
  return `${symbol}${amountUsd.toFixed(2)}`;
};

export const formatLocalCurrency = (amountUsd: number, exchangeRate: number, symbol = 'ل.ل'): string => {
  const localVal = amountUsd * exchangeRate;
  // Format with integer separators if large number
  return `${Math.round(localVal).toLocaleString('ar-EG')} ${symbol}`;
};

export const convertToLocal = (amountUsd: number, exchangeRate: number): number => {
  return amountUsd * exchangeRate;
};

export const convertToBase = (amountLocal: number, exchangeRate: number): number => {
  if (exchangeRate <= 0) return 0;
  return amountLocal / exchangeRate;
};

// CSV Export helpers
export const exportToCSV = (filename: string, rows: object[]): void => {
  if (!rows || !rows.length) return;
  const separator = ',';
  const keys = Object.keys(rows[0]);
  const csvContent =
    '\uFEFF' + // UTF-8 BOM for Excel Arabic support
    keys.join(separator) +
    '\n' +
    rows
      .map((row) => {
        return keys
          .map((k) => {
            let cell = (row as Record<string, unknown>)[k] ?? '';
            if (typeof cell === 'object') {
              cell = JSON.stringify(cell);
            }
            const cellStr = String(cell).replace(/"/g, '""');
            if (cellStr.search(/("|,|\n)/g) >= 0) {
              return `"${cellStr}"`;
            }
            return cellStr;
          })
          .join(separator);
      })
      .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
