import React from 'react';
import { SaleRecord, CurrencySettings, StoreSettings, Language } from '../types';
import { formatBaseCurrency, formatLocalCurrency } from '../utils/storage';
import { Printer, X, CheckCircle2 } from 'lucide-react';
import { translations } from '../utils/i18n';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  sale: SaleRecord | null;
  currency: CurrencySettings;
  store: StoreSettings;
  lang: Language;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  isOpen,
  onClose,
  sale,
  currency,
  store,
  lang,
}) => {
  if (!isOpen || !sale) return null;
  const t = translations[lang];

  const handlePrint = () => {
    window.print();
  };

  const formattedDate = new Date(sale.timestamp).toLocaleString(lang === 'ar' ? 'ar-EG' : 'en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 sm:p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative max-w-md w-full bg-[#0f172a] rounded-2xl shadow-2xl overflow-hidden border border-slate-800 flex flex-col max-h-[85vh] sm:max-h-[90vh]">
        {/* Header toolbar */}
        <div className="p-4 bg-amber-500 text-slate-950 flex items-center justify-between no-print shrink-0">
          <div className="flex items-center gap-2 font-black text-base sm:text-lg">
            <CheckCircle2 className="w-5 h-5 text-slate-950" />
            <span>{t.latestReceipt}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-amber-600/30 hover:bg-amber-600/50 text-slate-950 transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Receipt Paper Body */}
        <div className="p-5 sm:p-6 overflow-y-auto font-mono text-sm bg-[#020617] text-slate-200 print-area space-y-4">
          <div className="text-center pb-3 border-b border-dashed border-slate-700">
            <div className="flex justify-center mb-2">
              <img
                src={store.logoUrl}
                alt={store.storeName}
                className="w-16 h-16 object-cover rounded-full border-2 border-amber-500 shadow-md"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1519676867240-f03562e64548?auto=format&fit=crop&w=300&q=80';
                }}
              />
            </div>
            <h2 className="font-black text-xl font-sans tracking-wide text-slate-100">
              {lang === 'ar' ? store.storeName : store.storeNameEn}
            </h2>
            <p className="text-xs text-slate-400 mt-1">Crepeye POS System</p>
            <div className="text-xs text-slate-400 mt-2 space-y-0.5">
              <p>{t.orderNo}: <span className="font-bold text-amber-400">{sale.orderNumber}</span></p>
              <p>{formattedDate}</p>
            </div>
          </div>

          {/* Items list */}
          <div className="space-y-2 py-2 border-b border-dashed border-slate-700">
            <div className="flex justify-between font-bold text-xs uppercase text-slate-400 pb-1 border-b border-slate-800">
              <span>{t.quantity} x {t.customItemName}</span>
              <span>{t.total}</span>
            </div>
            {sale.items.map((item, idx) => (
              <div key={idx} className="flex justify-between items-start text-xs leading-relaxed">
                <div className="pr-2">
                  <span className="font-bold text-amber-400 mr-1">{item.quantity}x</span>
                  <span>{lang === 'ar' ? item.nameAr : item.nameEn}</span>
                  <div className="text-[10px] text-slate-400">
                    ({formatBaseCurrency(item.priceUsd, currency.baseCurrencySymbol)} / {t.quantity})
                  </div>
                </div>
                <div className="font-bold text-slate-100 whitespace-nowrap">
                  {formatBaseCurrency(item.totalUsd, currency.baseCurrencySymbol)}
                </div>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="space-y-1.5 pt-1 text-xs">
            <div className="flex justify-between items-center font-bold text-sm">
              <span>{t.totalBase}</span>
              <span className="text-amber-400 text-base">
                {formatBaseCurrency(sale.totalUsd, currency.baseCurrencySymbol)}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs text-slate-400">
              <span>{t.totalLocal}</span>
              <span className="font-semibold text-slate-200">
                {formatLocalCurrency(sale.totalUsd, sale.exchangeRate, currency.localCurrencySymbol)}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs text-slate-400 pt-1">
              <span>{t.exchangeRateLabel}</span>
              <span>1 {currency.baseCurrencySymbol} = {sale.exchangeRate.toLocaleString()} {currency.localCurrencySymbol}</span>
            </div>
            <div className="flex justify-between items-center text-xs text-slate-400">
              <span>{t.paymentMethod}:</span>
              <span className="font-medium capitalize text-slate-300">{t[sale.paymentMethod as keyof typeof t] || sale.paymentMethod}</span>
            </div>
            {sale.notes && (
              <div className="mt-2 p-2 bg-[#0f172a] border border-slate-800 rounded text-xs text-slate-300 italic">
                {t.notes}: {sale.notes}
              </div>
            )}
          </div>

          {/* Footer note */}
          <div className="text-center pt-4 border-t border-dashed border-slate-700">
            <p className="text-xs font-semibold text-slate-300">شكراً لزيارتكم! نتمنى لكم يوماً سعيداً 🥞</p>
            <p className="text-[10px] text-slate-500 mt-1">Thank you for visiting Crepeye!</p>
          </div>
        </div>

        {/* Action footer */}
        <div className="p-4 bg-[#0f172a] flex gap-2 border-t border-slate-800 no-print shrink-0">
          <button
            onClick={handlePrint}
            className="flex-1 py-2.5 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
          >
            <Printer className="w-4 h-4" />
            <span>{t.printReceipt}</span>
          </button>
          <button
            onClick={onClose}
            className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl transition border border-slate-700"
          >
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
};
