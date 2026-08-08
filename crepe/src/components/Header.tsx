import React, { useState } from 'react';
import { CurrencySettings, StoreSettings, Language } from '../types';
import { LogoModal } from './LogoModal';
import { translations } from '../utils/i18n';
import { Globe, RefreshCw, Radio, DollarSign, ExternalLink } from 'lucide-react';

interface HeaderProps {
  store: StoreSettings;
  currency: CurrencySettings;
  onUpdateCurrency: (updated: CurrencySettings) => void;
  lang: Language;
  onToggleLang: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  store,
  currency,
  onUpdateCurrency,
  lang,
  onToggleLang,
}) => {
  const [isLogoModalOpen, setIsLogoModalOpen] = useState(false);
  const [isEditRateOpen, setIsEditRateOpen] = useState(false);
  const [newRate, setNewRate] = useState(currency.exchangeRate.toString());

  const t = translations[lang];

  const handleSaveRate = (e: React.FormEvent) => {
    e.preventDefault();
    const rateNum = parseFloat(newRate);
    if (!isNaN(rateNum) && rateNum > 0) {
      onUpdateCurrency({ ...currency, exchangeRate: rateNum });
      setIsEditRateOpen(false);
    }
  };

  return (
    <header className="bg-[#0f172a]/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-30 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
        {/* Logo & Store Branding */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsLogoModalOpen(true)}
            className="group relative rounded-full overflow-hidden border-2 border-amber-500 shadow-lg shadow-amber-500/20 focus:outline-none focus:ring-2 focus:ring-amber-500 hover:scale-105 transition"
            title={t.logoPreview}
          >
            <img
              src={store.logoUrl}
              alt={store.storeName}
              className="w-11 h-11 object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1519676867240-f03562e64548?auto=format&fit=crop&w=300&q=80';
              }}
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
              <ExternalLink className="w-4 h-4 text-white" />
            </div>
          </button>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight leading-snug">
              {lang === 'ar' ? store.storeName : store.storeNameEn} <span className="text-amber-500 italic">POS</span>
            </h1>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="inline-flex items-center gap-1 text-emerald-400 font-medium bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                <Radio className="w-3 h-3 animate-pulse" />
                <span>محلي 100% (بدون خادم)</span>
              </span>
            </div>
          </div>
        </div>

        {/* Exchange Rate Ticker & Controls */}
        <div className="flex items-center flex-wrap gap-2 sm:gap-3">
          {/* Exchange Rate Bar */}
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl px-3 py-1.5 flex items-center gap-2 text-xs font-semibold text-amber-400">
            <DollarSign className="w-4 h-4 text-amber-500 shrink-0" />
            <span>
              1 {currency.baseCurrencySymbol} = <span className="font-bold text-amber-300">{currency.exchangeRate.toLocaleString()}</span> {currency.localCurrencySymbol}
            </span>
            <button
              onClick={() => {
                setNewRate(currency.exchangeRate.toString());
                setIsEditRateOpen(true);
              }}
              className="p-1 hover:bg-amber-500/20 rounded transition text-amber-400"
              title="تعديل سعر الصرف"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Language Toggle */}
          <button
            onClick={onToggleLang}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl transition border border-slate-700"
          >
            <Globe className="w-4 h-4 text-amber-500" />
            <span>{lang === 'ar' ? 'English' : 'العربية'}</span>
          </button>
        </div>
      </div>

      {/* Edit Rate Quick Modal */}
      {isEditRateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs">
          <div className="bg-[#0f172a] rounded-2xl p-6 max-w-sm w-full border border-slate-800 shadow-2xl">
            <h3 className="text-lg font-bold mb-3 text-slate-100">تحديث سعر الصرف السريع</h3>
            <form onSubmit={handleSaveRate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  سعر صرف 1 {currency.baseCurrencySymbol} بالعملة المحلية ({currency.localCurrencySymbol})
                </label>
                <input
                  type="number"
                  step="any"
                  value={newRate}
                  onChange={(e) => setNewRate(e.target.value)}
                  className="w-full px-3 py-2 bg-[#020617] border border-slate-700 rounded-xl font-bold text-lg text-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  autoFocus
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setIsEditRateOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 text-slate-950 font-bold rounded-xl text-xs hover:bg-amber-400 transition"
                >
                  {t.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Logo Zoom Modal */}
      <LogoModal
        isOpen={isLogoModalOpen}
        onClose={() => setIsLogoModalOpen(false)}
        logoUrl={store.logoUrl}
        storeName={lang === 'ar' ? store.storeName : store.storeNameEn}
      />
    </header>
  );
};
