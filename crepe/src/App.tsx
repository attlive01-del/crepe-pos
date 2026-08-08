import React, { useState, useEffect } from 'react';
import {
  CurrencySettings,
  StoreSettings,
  MenuItem,
  SaleRecord,
  ExpenseRecord,
  Language,
} from './types';
import {
  getStoredCurrency,
  saveStoredCurrency,
  getStoredStoreSettings,
  saveStoredStoreSettings,
  getStoredMenuItems,
  saveStoredMenuItems,
  getStoredSales,
  saveStoredSales,
  getStoredExpenses,
  saveStoredExpenses,
  clearAllApplicationData,
} from './utils/storage';
import { Header } from './components/Header';
import { NavigationTabs, TabType } from './components/NavigationTabs';
import { QuickSale } from './components/QuickSale';
import { Expenses } from './components/Expenses';
import { ReportsData } from './components/ReportsData';
import { FinancialAnalytics } from './components/FinancialAnalytics';
import { CostCalculator } from './components/CostCalculator';
import { Settings } from './components/Settings';
import { ReceiptModal } from './components/ReceiptModal';

export default function App() {
  const [lang, setLang] = useState<Language>('ar');
  const [activeTab, setActiveTab] = useState<TabType>('quick_sale');

  // Application Persistent State
  const [currency, setCurrency] = useState<CurrencySettings>(getStoredCurrency);
  const [store, setStore] = useState<StoreSettings>(getStoredStoreSettings);
  const [menuItems, setMenuItems] = useState<MenuItem[]>(getStoredMenuItems);
  const [sales, setSales] = useState<SaleRecord[]>(getStoredSales);
  const [expenses, setExpenses] = useState<ExpenseRecord[]>(getStoredExpenses);

  // Active Receipt Modal state
  const [lastSaleReceipt, setLastSaleReceipt] = useState<SaleRecord | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);

  // Set page direction according to language and ensure dark theme
  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
    document.documentElement.classList.add('dark');
  }, [lang]);

  // Sync state changes to localStorage
  const handleUpdateCurrency = (newCurrency: CurrencySettings) => {
    setCurrency(newCurrency);
    saveStoredCurrency(newCurrency);
  };

  const handleUpdateStore = (newStore: StoreSettings) => {
    setStore(newStore);
    saveStoredStoreSettings(newStore);
  };

  const handleUpdateMenuItems = (newItems: MenuItem[]) => {
    setMenuItems(newItems);
    saveStoredMenuItems(newItems);
  };

  const handleAddSale = (sale: SaleRecord) => {
    const updated = [sale, ...sales];
    setSales(updated);
    saveStoredSales(updated);

    // Show Receipt Modal
    setLastSaleReceipt(sale);
    setIsReceiptModalOpen(true);
  };

  const handleVoidSale = (saleId: string) => {
    const updated = sales.map((s) => (s.id === saleId ? { ...s, status: 'voided' as const } : s));
    setSales(updated);
    saveStoredSales(updated);
  };

  const handleDeleteSale = (saleId: string) => {
    const updated = sales.filter((s) => s.id !== saleId);
    setSales(updated);
    saveStoredSales(updated);
  };

  const handleAddExpense = (exp: ExpenseRecord) => {
    const updated = [exp, ...expenses];
    setExpenses(updated);
    saveStoredExpenses(updated);
  };

  const handleDeleteExpense = (expId: string) => {
    const updated = expenses.filter((e) => e.id !== expId);
    setExpenses(updated);
    saveStoredExpenses(updated);
  };

  const handleImportSales = (importedSales: SaleRecord[]) => {
    const updated = [...importedSales, ...sales];
    setSales(updated);
    saveStoredSales(updated);
  };

  const handleClearAllData = () => {
    clearAllApplicationData();
    window.location.reload();
  };

  const handleAddMenuItemSingle = (newItem: MenuItem) => {
    const updated = [...menuItems, newItem];
    setMenuItems(updated);
    saveStoredMenuItems(updated);
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 font-sans selection:bg-amber-500 selection:text-slate-950 transition-colors duration-200">
      {/* Header with branding and live exchange ticker */}
      <Header
        store={store}
        currency={currency}
        onUpdateCurrency={handleUpdateCurrency}
        lang={lang}
        onToggleLang={() => setLang(lang === 'ar' ? 'en' : 'ar')}
      />

      {/* Navigation Bar */}
      <NavigationTabs activeTab={activeTab} onChangeTab={setActiveTab} lang={lang} />

      {/* Tab Screen Views */}
      <main className="pb-12">
        {activeTab === 'quick_sale' && (
          <QuickSale
            menuItems={menuItems}
            currency={currency}
            store={store}
            lang={lang}
            sales={sales}
            onAddSale={handleAddSale}
            onVoidSale={handleVoidSale}
            onAddMenuItem={handleAddMenuItemSingle}
          />
        )}

        {activeTab === 'expenses' && (
          <Expenses
            expenses={expenses}
            currency={currency}
            lang={lang}
            onAddExpense={handleAddExpense}
            onDeleteExpense={handleDeleteExpense}
          />
        )}

        {activeTab === 'reports' && (
          <ReportsData
            sales={sales}
            expenses={expenses}
            currency={currency}
            lang={lang}
            onDeleteSale={handleDeleteSale}
            onImportSales={handleImportSales}
            onClearAllData={handleClearAllData}
          />
        )}

        {activeTab === 'analytics' && (
          <FinancialAnalytics
            sales={sales}
            expenses={expenses}
            currency={currency}
            store={store}
            lang={lang}
          />
        )}

        {activeTab === 'calculator' && (
          <CostCalculator
            menuItems={menuItems}
            currency={currency}
            lang={lang}
            onAddMenuItem={handleAddMenuItemSingle}
          />
        )}

        {activeTab === 'settings' && (
          <Settings
            store={store}
            currency={currency}
            menuItems={menuItems}
            lang={lang}
            onUpdateStore={handleUpdateStore}
            onUpdateCurrency={handleUpdateCurrency}
            onUpdateMenuItems={handleUpdateMenuItems}
          />
        )}
      </main>

      {/* Latest Receipt Printable Modal */}
      <ReceiptModal
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        sale={lastSaleReceipt}
        currency={currency}
        store={store}
        lang={lang}
      />
    </div>
  );
}
