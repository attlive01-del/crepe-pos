import React, { useState } from 'react';
import { SaleRecord, ExpenseRecord, CurrencySettings, Language } from '../types';
import { formatBaseCurrency, formatLocalCurrency, exportToCSV } from '../utils/storage';
import { translations } from '../utils/i18n';
import {
  TrendingUp,
  Receipt,
  DollarSign,
  Download,
  Upload,
  Trash2,
  Search,
  Filter,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Calendar,
  CheckCircle2,
  XCircle,
  FileSpreadsheet
} from 'lucide-react';

interface ReportsDataProps {
  sales: SaleRecord[];
  expenses: ExpenseRecord[];
  currency: CurrencySettings;
  lang: Language;
  onDeleteSale: (saleId: string) => void;
  onImportSales: (imported: SaleRecord[]) => void;
  onClearAllData: () => void;
}

export const ReportsData: React.FC<ReportsDataProps> = ({
  sales,
  expenses,
  currency,
  lang,
  onDeleteSale,
  onImportSales,
  onClearAllData,
}) => {
  const [isToolsOpen, setIsToolsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'voided'>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'yesterday' | 'week' | 'month'>('all');
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const [confirmInput, setConfirmInput] = useState('');

  const t = translations[lang];

  // Totals
  const activeSales = sales.filter((s) => s.status === 'completed');
  const totalSalesUsd = activeSales.reduce((acc, s) => acc + s.totalUsd, 0);
  const totalExpensesUsd = expenses.reduce((acc, e) => acc + e.amountUsd, 0);
  const netProfitUsd = totalSalesUsd - totalExpensesUsd;

  // Filter Sales Ledger
  const now = Date.now();
  const dayMs = 86400 * 1000;

  const filteredSales = sales.filter((sale) => {
    // Status filter
    if (statusFilter !== 'all' && sale.status !== statusFilter) return false;

    // Date filter
    const saleDate = new Date(sale.timestamp);
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    if (dateFilter === 'today' && sale.timestamp < todayStart.getTime()) return false;
    if (dateFilter === 'yesterday') {
      const yesterdayStart = todayStart.getTime() - dayMs;
      if (sale.timestamp < yesterdayStart || sale.timestamp >= todayStart.getTime()) return false;
    }
    if (dateFilter === 'week' && sale.timestamp < todayStart.getTime() - dayMs * 7) return false;
    if (dateFilter === 'month' && sale.timestamp < todayStart.getTime() - dayMs * 30) return false;

    // Search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const matchOrder = sale.orderNumber.toLowerCase().includes(term);
      const matchItems = sale.items.some((i) => i.nameAr.toLowerCase().includes(term) || i.nameEn.toLowerCase().includes(term));
      const matchNotes = sale.notes?.toLowerCase().includes(term);
      return matchOrder || matchItems || matchNotes;
    }

    return true;
  });

  // Export handlers
  const handleExportSales = () => {
    const rows = sales.map((s) => ({
      OrderNumber: s.orderNumber,
      Date: new Date(s.timestamp).toLocaleString('en-US'),
      ItemsCount: s.items.length,
      ItemsSummary: s.items.map((i) => `${i.quantity}x ${i.nameAr}`).join(' | '),
      TotalUSD: s.totalUsd,
      TotalLocal: s.totalLocal,
      ExchangeRate: s.exchangeRate,
      PaymentMethod: s.paymentMethod,
      Status: s.status,
      Notes: s.notes || '',
    }));
    exportToCSV('Crepeye_Sales_Report', rows);
  };

  const handleExportExpenses = () => {
    const rows = expenses.map((e) => ({
      ID: e.id,
      Date: new Date(e.timestamp).toLocaleString('en-US'),
      Category: e.category,
      Description: e.description,
      Tags: e.tags.join('; '),
      AmountUSD: e.amountUsd,
      AmountLocal: e.amountLocal,
      ExchangeRate: e.exchangeRate,
    }));
    exportToCSV('Crepeye_Expenses_Report', rows);
  };

  // CSV Import handler
  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
        if (lines.length < 2) return;

        const importedSales: SaleRecord[] = [];
        // Skip header
        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(',').map((c) => c.replace(/^"|"$/g, ''));
          if (cols.length >= 5) {
            importedSales.push({
              id: `imported-${Date.now()}-${i}`,
              orderNumber: cols[0] || `IMP-${i}`,
              timestamp: Date.now() - i * 60000,
              items: [{ nameAr: cols[3] || 'صنف مستورد', nameEn: 'Imported Item', quantity: 1, priceUsd: parseFloat(cols[4]) || 0, totalUsd: parseFloat(cols[4]) || 0 }],
              totalUsd: parseFloat(cols[4]) || 0,
              totalLocal: (parseFloat(cols[4]) || 0) * currency.exchangeRate,
              exchangeRate: currency.exchangeRate,
              paymentMethod: 'cash',
              status: 'completed',
            });
          }
        }
        if (importedSales.length > 0) {
          onImportSales(importedSales);
          alert(`تم استيراد ${importedSales.length} طلب بنجاح!`);
        }
      } catch (err) {
        alert('خطأ في استيراد الملف. يرجى التأكد من بصيغة CSV الصحيحة.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Top Cards: Total Sales, Total Expenses, Net Profit */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Sales Card */}
        <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-5 shadow-lg flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 block mb-1">{t.totalSalesCard}</span>
            <div className="text-2xl font-black text-amber-400">
              {formatBaseCurrency(totalSalesUsd, currency.baseCurrencySymbol)}
            </div>
            <div className="text-xs font-bold text-slate-400 mt-1">
              {formatLocalCurrency(totalSalesUsd, currency.exchangeRate, currency.localCurrencySymbol)}
            </div>
          </div>
          <div className="p-3 bg-amber-500/10 text-amber-400 rounded-2xl border border-amber-500/20">
            <TrendingUp className="w-7 h-7" />
          </div>
        </div>

        {/* Total Expenses Card */}
        <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-5 shadow-lg flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 block mb-1">{t.totalExpensesCard}</span>
            <div className="text-2xl font-black text-rose-400">
              {formatBaseCurrency(totalExpensesUsd, currency.baseCurrencySymbol)}
            </div>
            <div className="text-xs font-bold text-slate-400 mt-1">
              {formatLocalCurrency(totalExpensesUsd, currency.exchangeRate, currency.localCurrencySymbol)}
            </div>
          </div>
          <div className="p-3 bg-rose-500/10 text-rose-400 rounded-2xl border border-rose-500/20">
            <Receipt className="w-7 h-7" />
          </div>
        </div>

        {/* Net Profit Card */}
        <div className={`bg-[#0f172a] border rounded-2xl p-5 shadow-lg flex items-center justify-between ${
          netProfitUsd >= 0 ? 'border-emerald-500/30' : 'border-rose-500/30'
        }`}>
          <div>
            <span className="text-xs font-semibold text-slate-400 block mb-1">{t.netProfitCard}</span>
            <div className={`text-2xl font-black ${netProfitUsd >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {formatBaseCurrency(netProfitUsd, currency.baseCurrencySymbol)}
            </div>
            <div className="text-xs font-bold text-slate-400 mt-1">
              {formatLocalCurrency(netProfitUsd, currency.exchangeRate, currency.localCurrencySymbol)}
            </div>
          </div>
          <div className={`p-3 rounded-2xl border ${
            netProfitUsd >= 0 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
          }`}>
            <DollarSign className="w-7 h-7" />
          </div>
        </div>
      </div>

      {/* Collapsible Data Management Toolbar */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
        <button
          onClick={() => setIsToolsOpen(!isToolsOpen)}
          className="w-full p-4 flex items-center justify-between hover:bg-slate-800/50 transition text-slate-100"
        >
          <div className="flex items-center gap-2 font-extrabold text-sm text-slate-100">
            <FileSpreadsheet className="w-5 h-5 text-amber-500" />
            <span>{t.dataManagementTools}</span>
          </div>
          {isToolsOpen ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
        </button>

        {isToolsOpen && (
          <div className="p-4 bg-[#020617] border-t border-slate-800 flex flex-wrap gap-3 items-center justify-between">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleExportSales}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl transition shadow-md"
              >
                <Download className="w-4 h-4" />
                <span>{t.exportSalesCSV}</span>
              </button>

              <button
                onClick={handleExportExpenses}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 transition shadow-md"
              >
                <Download className="w-4 h-4 text-amber-500" />
                <span>{t.exportExpensesCSV}</span>
              </button>

              <label className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition cursor-pointer shadow-md">
                <Upload className="w-4 h-4" />
                <span>{t.importCSV}</span>
                <input type="file" accept=".csv" onChange={handleImportFile} className="hidden" />
              </label>
            </div>

            <button
              onClick={() => setIsClearModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl transition shadow-md"
            >
              <Trash2 className="w-4 h-4" />
              <span>{t.clearAllData}</span>
            </button>
          </div>
        )}
      </div>

      {/* Detailed Ledger Section */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <h3 className="font-extrabold text-base text-slate-100">
            {t.detailedLedger}
          </h3>

          {/* Search & Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute top-1/2 -translate-y-1/2 right-3 pointer-events-none" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t.searchPlaceholder}
                className="pl-3 pr-9 py-1.5 text-xs bg-[#020617] border border-slate-700 rounded-xl text-slate-100 w-48 sm:w-64"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'completed' | 'voided')}
              className="px-3 py-1.5 text-xs font-bold bg-[#020617] border border-slate-700 rounded-xl text-slate-200"
            >
              <option value="all">{t.allStatus}</option>
              <option value="completed">{t.statusCompleted}</option>
              <option value="voided">{t.statusVoided}</option>
            </select>

            {/* Date Filter */}
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as 'all' | 'today' | 'yesterday' | 'week' | 'month')}
              className="px-3 py-1.5 text-xs font-bold bg-[#020617] border border-slate-700 rounded-xl text-slate-200"
            >
              <option value="all">{t.allTime}</option>
              <option value="today">{t.today}</option>
              <option value="yesterday">{t.yesterday}</option>
              <option value="week">{t.thisWeek}</option>
              <option value="month">{t.thisMonth}</option>
            </select>
          </div>
        </div>

        {/* Ledger Table */}
        <div className="overflow-x-auto">
          {filteredSales.length === 0 ? (
            <p className="text-xs text-slate-500 py-12 text-center">{t.noData}</p>
          ) : (
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-bold">
                  <th className="pb-2.5 font-semibold">{t.orderNo}</th>
                  <th className="pb-2.5 font-semibold">{t.date}</th>
                  <th className="pb-2.5 font-semibold">الأصناف والتفاصيل</th>
                  <th className="pb-2.5 font-semibold">{t.paymentMethod}</th>
                  <th className="pb-2.5 font-semibold">{t.status}</th>
                  <th className="pb-2.5 font-semibold">{t.total} ($)</th>
                  <th className="pb-2.5 font-semibold">{t.actions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredSales.map((sale) => {
                  const isVoided = sale.status === 'voided';
                  return (
                    <tr
                      key={sale.id}
                      className={`hover:bg-slate-800/50 transition ${
                        isVoided ? 'opacity-60 bg-red-950/20' : ''
                      }`}
                    >
                      <td className="py-3 font-bold text-amber-400 whitespace-nowrap">
                        {sale.orderNumber}
                      </td>
                      <td className="py-3 text-slate-400 whitespace-nowrap">
                        {new Date(sale.timestamp).toLocaleString(lang === 'ar' ? 'ar-EG' : 'en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="py-3 text-slate-200 max-w-sm">
                        <div className="font-semibold">
                          {sale.items.map((i) => `${i.quantity}x ${lang === 'ar' ? i.nameAr : i.nameEn}`).join(', ')}
                        </div>
                        {sale.notes && (
                          <div className="text-[10px] text-slate-400 italic mt-0.5">
                            ملاحظة: {sale.notes}
                          </div>
                        )}
                      </td>
                      <td className="py-3 font-bold text-slate-300 capitalize whitespace-nowrap">
                        {t[sale.paymentMethod as keyof typeof t] || sale.paymentMethod}
                      </td>
                      <td className="py-3 whitespace-nowrap">
                        {isVoided ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-300 bg-rose-950/80 border border-rose-900 px-2 py-0.5 rounded-md">
                            <XCircle className="w-3 h-3" />
                            {t.statusVoided}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-300 bg-emerald-950/80 border border-emerald-900 px-2 py-0.5 rounded-md">
                            <CheckCircle2 className="w-3 h-3" />
                            {t.statusCompleted}
                          </span>
                        )}
                      </td>
                      <td className="py-3 font-extrabold text-slate-100 whitespace-nowrap">
                        <div>{formatBaseCurrency(sale.totalUsd, currency.baseCurrencySymbol)}</div>
                        <div className="text-[10px] font-normal text-slate-400">
                          {formatLocalCurrency(sale.totalUsd, sale.exchangeRate, currency.localCurrencySymbol)}
                        </div>
                      </td>
                      <td className="py-3 whitespace-nowrap">
                        <button
                          onClick={() => onDeleteSale(sale.id)}
                          className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-950/50 rounded-lg transition"
                          title={t.delete}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Wipe All Data Confirmation Modal */}
      {isClearModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs">
          <div className="bg-[#0f172a] rounded-2xl p-6 max-w-md w-full border border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <AlertTriangle className="w-8 h-8 shrink-0" />
              <div>
                <h3 className="font-extrabold text-lg text-slate-100">{t.clearConfirmTitle}</h3>
                <p className="text-xs text-slate-400 font-normal mt-0.5">{t.clearConfirmText}</p>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-800">
              <label className="block text-xs font-semibold text-slate-300">
                {t.clearConfirmTypedMsg}
              </label>
              <input
                type="text"
                value={confirmInput}
                onChange={(e) => setConfirmInput(e.target.value)}
                placeholder={t.typeToConfirm}
                className="w-full px-3 py-2 text-xs bg-[#020617] border border-slate-700 rounded-xl font-bold text-slate-100"
              />
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button
                onClick={() => {
                  setIsClearModalOpen(false);
                  setConfirmInput('');
                }}
                className="px-4 py-2 bg-slate-800 text-slate-300 hover:bg-slate-700 rounded-xl text-xs font-semibold"
              >
                {t.cancel}
              </button>
              <button
                disabled={confirmInput !== 'مسح البيانات' && confirmInput !== 'CLEAR'}
                onClick={() => {
                  onClearAllData();
                  setIsClearModalOpen(false);
                  setConfirmInput('');
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition shadow-md"
              >
                {t.clearAllData}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
