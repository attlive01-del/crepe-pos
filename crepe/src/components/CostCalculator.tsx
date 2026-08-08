import React, { useState } from 'react';
import { MenuItem, CurrencySettings, Language } from '../types';
import { formatBaseCurrency, formatLocalCurrency } from '../utils/storage';
import { translations } from '../utils/i18n';
import { Calculator, PlusCircle, CheckCircle2, Sparkles, AlertCircle, ThumbsUp, Flame, Layers, Box, DollarSign } from 'lucide-react';

interface CostCalculatorProps {
  menuItems?: MenuItem[];
  currency: CurrencySettings;
  lang: Language;
  onAddMenuItem: (item: MenuItem) => void;
}

export const CostCalculator: React.FC<CostCalculatorProps> = ({
  menuItems = [],
  currency,
  lang,
  onAddMenuItem,
}) => {
  const [recipeName, setRecipeName] = useState('خلطة كريب نوتيلا (دفعة 10 قطع)');
  const [selectedItemId, setSelectedItemId] = useState<string>('custom');
  const [batchYield, setBatchYield] = useState<string>('10'); // Default batch produces 10 units
  const [batterCost, setBatterCost] = useState('3.50'); // Total dough/batter for batch
  const [fillingCost, setFillingCost] = useState('6.00'); // Total filling for batch
  const [packagingCost, setPackagingCost] = useState('0.20'); // Per unit packaging cost
  const [targetPrice, setTargetPrice] = useState('3.50'); // Sale price for 1 unit
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const t = translations[lang];

  // Parse numbers
  const yieldCount = Math.max(1, parseInt(batchYield) || 1);
  const totalBatter = parseFloat(batterCost) || 0;
  const totalFilling = parseFloat(fillingCost) || 0;
  const unitPackaging = parseFloat(packagingCost) || 0;
  const unitSalePrice = parseFloat(targetPrice) || 0;

  // Batch & Unit Calculations
  const batchIngredientsCost = totalBatter + totalFilling;
  const unitIngredientsCost = batchIngredientsCost / yieldCount;
  const totalUnitCost = unitIngredientsCost + unitPackaging; // Cost per single piece
  const totalBatchCost = batchIngredientsCost + (unitPackaging * yieldCount); // Total batch cost

  const unitProfit = unitSalePrice - totalUnitCost;
  const totalBatchProfit = unitProfit * yieldCount;
  const marginPct = unitSalePrice > 0 ? (unitProfit / unitSalePrice) * 100 : 0;

  // Quick preset yield buttons
  const yieldPresets = [1, 5, 10, 15, 20, 30, 50];

  // Handle selecting an item from the menu items dropdown
  const handleSelectMenuItem = (itemId: string) => {
    setSelectedItemId(itemId);
    if (itemId === 'custom') return;

    const item = menuItems.find((m) => m.id === itemId);
    if (item) {
      const name = lang === 'ar' ? item.nameAr : item.nameEn;
      setRecipeName(name);
      if (item.priceUsd) {
        setTargetPrice(item.priceUsd.toString());
      }
      if (item.unitCostUsd && item.unitCostUsd > 0) {
        // If single unit cost is set, calculate batch costs for current yield
        const calcBatter = (item.unitCostUsd * 0.3 * yieldCount).toFixed(2);
        const calcFilling = (item.unitCostUsd * 0.5 * yieldCount).toFixed(2);
        const calcPkg = (item.unitCostUsd * 0.2).toFixed(2);
        setBatterCost(calcBatter);
        setFillingCost(calcFilling);
        setPackagingCost(calcPkg);
      }
    }
  };

  // Determine Profitability Status Level
  const getProfitabilityLevel = () => {
    if (unitProfit < 0) return { label: t.levelLoss, bg: 'bg-rose-950/80 text-rose-300 border border-rose-800', icon: AlertCircle };
    if (marginPct >= 60) return { label: t.levelExcellent, bg: 'bg-emerald-950/80 text-emerald-300 border border-emerald-800', icon: Flame };
    if (marginPct >= 40) return { label: t.levelGood, bg: 'bg-amber-950/80 text-amber-300 border border-amber-800', icon: ThumbsUp };
    return { label: t.levelSlim, bg: 'bg-yellow-950/80 text-yellow-300 border border-yellow-800', icon: AlertCircle };
  };

  const level = getProfitabilityLevel();
  const LevelIcon = level.icon;

  // Save to POS Menu
  const handleSaveToMenu = () => {
    if (!recipeName.trim() || unitSalePrice <= 0) return;

    const newItem: MenuItem = {
      id: `recipe-${Date.now()}`,
      nameAr: recipeName.trim(),
      nameEn: recipeName.trim(),
      priceUsd: unitSalePrice,
      category: recipeName.toLowerCase().includes('وافل') ? 'waffle' : recipeName.toLowerCase().includes('بان') ? 'pancake' : 'crepe',
      iconName: 'Sparkles',
      colorBg: 'bg-amber-500/10 text-amber-300',
      available: true,
      unitCostUsd: totalUnitCost,
    };

    onAddMenuItem(newItem);
    setToastMsg(`تم إضافة (${recipeName.trim()}) بتكلفة ${totalUnitCost.toFixed(2)}$ للقطعة الواحدة إلى القائمة! 🎉`);
    setTimeout(() => setToastMsg(null), 3500);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white px-6 py-3 rounded-2xl shadow-2xl font-bold flex items-center gap-2 animate-bounce border border-emerald-400">
          <CheckCircle2 className="w-5 h-5 text-white" />
          <span>{toastMsg}</span>
        </div>
      )}

      <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
          <div className="p-3 bg-amber-500 text-slate-950 font-bold rounded-2xl shadow-lg shadow-amber-500/20">
            <Calculator className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-black text-lg text-slate-100">
              {t.calculatorTitle}
            </h2>
            <p className="text-xs text-slate-400 font-medium">
              حدد مكونات الدفعة/الخلطة وعدد القطع الناتجة ليقوم النظام بحساب تكلفة القطعة الواحدة وهامش الربح بدقة
            </p>
          </div>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Menu Item Dropdown Select & Name Input */}
          <div className="md:col-span-2 space-y-2">
            <label className="block text-xs font-semibold text-slate-300">
              {t.recipeName}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Dropdown Menu Select */}
              <div>
                <select
                  value={selectedItemId}
                  onChange={(e) => handleSelectMenuItem(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs font-bold bg-[#020617] text-slate-100 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="custom">-- اختر صنفاً من قائمة المنتجات --</option>
                  {menuItems.map((item) => (
                    <option key={item.id} value={item.id}>
                      {lang === 'ar' ? item.nameAr : item.nameEn} ({item.priceUsd.toFixed(2)}$)
                    </option>
                  ))}
                </select>
              </div>

              {/* Editable Name Input */}
              <div>
                <input
                  type="text"
                  value={recipeName}
                  onChange={(e) => {
                    setRecipeName(e.target.value);
                    setSelectedItemId('custom');
                  }}
                  placeholder="أو اكتب اسم صنف مخصص..."
                  className="w-full px-3.5 py-2.5 text-xs font-bold bg-[#020617] text-slate-100 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 placeholder-slate-500"
                />
              </div>
            </div>
          </div>

          {/* Batch Yield (Number of Pieces / Servings Produced) */}
          <div className="md:col-span-2 bg-[#020617] p-4 rounded-xl border border-amber-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                <Layers className="w-4 h-4" />
                <span>{t.batchYield}</span>
              </label>
              <span className="text-[11px] font-bold text-slate-400 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
                الكمية الإجمالية للدفعة: <strong className="text-amber-400">{yieldCount} قطع</strong>
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <input
                type="number"
                min="1"
                step="1"
                value={batchYield}
                onChange={(e) => setBatchYield(e.target.value)}
                className="w-full sm:w-36 px-3.5 py-2.5 text-base font-black text-amber-400 bg-[#0f172a] border border-amber-500/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-center"
              />

              {/* Quick Yield Preset Pills */}
              <div className="flex flex-wrap items-center gap-1.5 w-full">
                <span className="text-[10px] text-slate-500 font-bold ml-1">اختيار سريع:</span>
                {yieldPresets.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setBatchYield(preset.toString())}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition border ${
                      yieldCount === preset
                        ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md'
                        : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    {preset} {preset === 1 ? 'قطعة' : 'قطع'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Batter / Dough Cost for Entire Batch */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              {t.batterCost} ($)
            </label>
            <input
              type="number"
              step="0.05"
              value={batterCost}
              onChange={(e) => setBatterCost(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm font-bold bg-[#020617] text-amber-400 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <span className="text-[10px] text-slate-500 block mt-1">
              تكلفة الخلطة للقطعة الواحدة: {(totalBatter / yieldCount).toFixed(2)}$
            </span>
          </div>

          {/* Filling Cost for Entire Batch */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              {t.fillingCost} ($)
            </label>
            <input
              type="number"
              step="0.05"
              value={fillingCost}
              onChange={(e) => setFillingCost(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm font-bold bg-[#020617] text-amber-400 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <span className="text-[10px] text-slate-500 block mt-1">
              تكلفة الحشوات للقطعة الواحدة: {(totalFilling / yieldCount).toFixed(2)}$
            </span>
          </div>

          {/* Packaging Cost per Unit */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              {t.packagingCost} ($)
            </label>
            <input
              type="number"
              step="0.05"
              value={packagingCost}
              onChange={(e) => setPackagingCost(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm font-bold bg-[#020617] text-amber-400 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <span className="text-[10px] text-slate-500 block mt-1">
              علبة + شوكة + كيس لكل قطعة مستقلة
            </span>
          </div>

          {/* Target Sale Price per Unit */}
          <div>
            <label className="block text-xs font-semibold text-amber-400 mb-1">
              {t.targetPrice} ($)
            </label>
            <input
              type="number"
              step="0.10"
              value={targetPrice}
              onChange={(e) => setTargetPrice(e.target.value)}
              className="w-full px-3.5 py-2.5 text-base font-black text-amber-400 bg-[#020617] border border-amber-500/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <span className="text-[10px] text-amber-400/80 block mt-1">
              سعر البيع النهائي المقترح للزبون
            </span>
          </div>
        </div>

        {/* Calculated Results Panel */}
        <div className="p-5 bg-[#020617] rounded-2xl border border-slate-800 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-center">
            {/* Total Batch Cost */}
            <div className="p-3 bg-[#0f172a] rounded-xl border border-slate-800 shadow-md">
              <span className="text-[11px] font-semibold text-slate-400 block mb-1">{t.totalBatchCost}</span>
              <span className="text-lg font-black text-slate-200">
                {formatBaseCurrency(totalBatchCost, currency.baseCurrencySymbol)}
              </span>
              <span className="text-[10px] font-bold text-slate-500 block mt-0.5">
                ({yieldCount} قطعة مجهزة)
              </span>
            </div>

            {/* Cost Per Single Unit (THE MAIN RESULT REQUESTED) */}
            <div className="p-3 bg-[#0f172a] rounded-xl border-2 border-amber-500/60 shadow-lg shadow-amber-500/10 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-amber-500 text-slate-950 font-black text-[9px] px-2 py-0.5 rounded-bl-lg">
                تكلفة القطعة الصافية
              </div>
              <span className="text-[11px] font-bold text-amber-400 block mb-1 mt-1">{t.totalUnitCost}</span>
              <span className="text-2xl font-black text-amber-300">
                {formatBaseCurrency(totalUnitCost, currency.baseCurrencySymbol)}
              </span>
              <span className="text-[10px] font-bold text-amber-400/80 block mt-0.5">
                {formatLocalCurrency(totalUnitCost, currency.exchangeRate, currency.localCurrencySymbol)}
              </span>
            </div>

            {/* Unit Net Profit */}
            <div className="p-3 bg-[#0f172a] rounded-xl border border-slate-800 shadow-md">
              <span className="text-[11px] font-semibold text-slate-400 block mb-1">{t.unitProfit}</span>
              <span className={`text-lg font-black ${unitProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {formatBaseCurrency(unitProfit, currency.baseCurrencySymbol)}
              </span>
              <span className="text-[10px] font-bold text-slate-500 block mt-0.5">
                {formatLocalCurrency(unitProfit, currency.exchangeRate, currency.localCurrencySymbol)}
              </span>
            </div>

            {/* Batch Total Profit */}
            <div className="p-3 bg-[#0f172a] rounded-xl border border-slate-800 shadow-md">
              <span className="text-[11px] font-semibold text-slate-400 block mb-1">{t.batchProfit}</span>
              <span className={`text-lg font-black ${totalBatchProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {formatBaseCurrency(totalBatchProfit, currency.baseCurrencySymbol)}
              </span>
              <span className="text-[10px] font-bold text-slate-500 block mt-0.5">
                صافي ربح {yieldCount} قطعة
              </span>
            </div>
          </div>

          {/* Level Badge & Profit Margin % */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-[#0f172a] rounded-xl border border-slate-800">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-300">{t.profitabilityLevel}</span>
              <div className={`px-3 py-1 rounded-xl text-xs font-black flex items-center gap-1.5 ${level.bg}`}>
                <LevelIcon className="w-4 h-4" />
                <span>{level.label}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400">{t.marginPercentage}</span>
              <span className="text-base font-black text-amber-400 bg-slate-900 px-3 py-1 rounded-xl border border-slate-800">
                {marginPct.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        {/* Action Button: Add to POS Menu */}
        <button
          onClick={handleSaveToMenu}
          className="w-full py-3.5 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm rounded-xl transition shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
        >
          <PlusCircle className="w-5 h-5" />
          <span>{t.saveToMenuBtn}</span>
        </button>
      </div>
    </div>
  );
};

