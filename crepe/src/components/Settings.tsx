import React, { useState } from 'react';
import { StoreSettings, CurrencySettings, MenuItem, CategoryType, Language } from '../types';
import { translations } from '../utils/i18n';
import { Settings as SettingsIcon, Image, DollarSign, Plus, Trash2, CheckCircle2, Save, Eye, EyeOff, Upload, Search, Filter, HardDrive, Download, Smartphone, Share2, WifiOff, Database, RefreshCw } from 'lucide-react';
import { exportFullBackup, importFullBackup } from '../utils/storage';

interface SettingsProps {
  store: StoreSettings;
  currency: CurrencySettings;
  menuItems: MenuItem[];
  lang: Language;
  onUpdateStore: (store: StoreSettings) => void;
  onUpdateCurrency: (currency: CurrencySettings) => void;
  onUpdateMenuItems: (items: MenuItem[]) => void;
}

export const Settings: React.FC<SettingsProps> = ({
  store,
  currency,
  menuItems,
  lang,
  onUpdateStore,
  onUpdateCurrency,
  onUpdateMenuItems,
}) => {
  // Local state forms
  const [storeNameAr, setStoreNameAr] = useState(store.storeName);
  const [storeNameEn, setStoreNameEn] = useState(store.storeNameEn);
  const [logoUrl, setLogoUrl] = useState(store.logoUrl);
  const [dailyTarget, setDailyTarget] = useState(store.dailyTargetUsd.toString());

  const [baseSymbol, setBaseSymbol] = useState(currency.baseCurrencySymbol);
  const [localSymbol, setLocalSymbol] = useState(currency.localCurrencySymbol);
  const [exchangeRate, setExchangeRate] = useState(currency.exchangeRate.toString());

  // New Menu Item form
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState<CategoryType>('crepe');
  const [newItemPrice, setNewItemPrice] = useState('');

  // Menu Management Search & Filter state
  const [menuFilterCategory, setMenuFilterCategory] = useState<string>('all');
  const [menuSearchQuery, setMenuSearchQuery] = useState<string>('');

  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const t = translations[lang];

  // Filter menu items for settings list
  const filteredMenuItems = menuItems.filter((item) => {
    const matchesCategory = menuFilterCategory === 'all' || item.category === menuFilterCategory;
    const itemName = (lang === 'ar' ? item.nameAr : item.nameEn).toLowerCase();
    const matchesSearch = itemName.includes(menuSearchQuery.toLowerCase().trim());
    return matchesCategory && matchesSearch;
  });

  // Save General & Currency Settings
  const handleSaveGeneral = (e: React.FormEvent) => {
    e.preventDefault();
    const rateNum = parseFloat(exchangeRate);
    const targetNum = parseFloat(dailyTarget);

    if (isNaN(rateNum) || rateNum <= 0) return;

    onUpdateStore({
      ...store,
      storeName: storeNameAr.trim() || store.storeName,
      storeNameEn: storeNameEn.trim() || store.storeNameEn,
      logoUrl: logoUrl.trim() || store.logoUrl,
      dailyTargetUsd: !isNaN(targetNum) && targetNum > 0 ? targetNum : 250,
    });

    onUpdateCurrency({
      ...currency,
      baseCurrencySymbol: baseSymbol.trim() || '$',
      localCurrencySymbol: localSymbol.trim() || 'ل.ل',
      exchangeRate: rateNum,
    });

    setToastMsg(t.settingsSavedMsg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Image Upload handler for local file
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setLogoUrl(result);
        onUpdateStore({
          ...store,
          logoUrl: result,
        });
        setToastMsg('تم حفظ وتحديث صورة الشعار بنجاح! 🖼️');
        setTimeout(() => setToastMsg(null), 3000);
      };
      reader.readAsDataURL(file);
    }
  };

  // Add new menu item
  const handleAddMenuItem = (e: React.FormEvent) => {
    e.preventDefault();
    const priceNum = parseFloat(newItemPrice);
    if (!newItemName.trim() || isNaN(priceNum) || priceNum <= 0) return;

    const newItem: MenuItem = {
      id: `menu-${Date.now()}`,
      nameAr: newItemName.trim(),
      nameEn: newItemName.trim(),
      priceUsd: priceNum,
      category: newItemCategory,
      iconName: 'Sparkles',
      colorBg: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200',
      available: true,
      unitCostUsd: priceNum * 0.35,
    };

    onUpdateMenuItems([...menuItems, newItem]);
    setNewItemName('');
    setNewItemPrice('');
    setToastMsg('تم إضافة الصنف الجديد بنجاح!');
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Toggle item availability
  const handleToggleAvailable = (id: string) => {
    const updated = menuItems.map((item) =>
      item.id === id ? { ...item, available: !item.available } : item
    );
    onUpdateMenuItems(updated);
  };

  // Edit item price
  const handleEditPrice = (id: string, newPrice: number) => {
    const updated = menuItems.map((item) =>
      item.id === id ? { ...item, priceUsd: newPrice } : item
    );
    onUpdateMenuItems(updated);
  };

  // Delete item
  const handleDeleteItem = (id: string) => {
    const updated = menuItems.filter((item) => item.id !== id);
    onUpdateMenuItems(updated);
  };

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white px-6 py-3 rounded-2xl shadow-2xl font-bold flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-white" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* General & Currency Settings Form */}
      <form onSubmit={handleSaveGeneral} className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
          <div className="p-3 bg-amber-500 text-slate-950 font-bold rounded-2xl shadow-lg shadow-amber-500/20">
            <SettingsIcon className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-black text-lg text-slate-100">
              {t.settingsTitle}
            </h2>
            <p className="text-xs text-slate-400 font-medium">
              تخصيص الهوية التجارية وسعر الصرف والعملة المحلية
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Store Name Arabic */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              {t.storeNameAr}
            </label>
            <input
              type="text"
              value={storeNameAr}
              onChange={(e) => setStoreNameAr(e.target.value)}
              className="w-full px-3.5 py-2 text-xs font-bold bg-[#020617] border border-slate-700 rounded-xl text-slate-100"
            />
          </div>

          {/* Store Name English */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              {t.storeNameEnLabel}
            </label>
            <input
              type="text"
              value={storeNameEn}
              onChange={(e) => setStoreNameEn(e.target.value)}
              className="w-full px-3.5 py-2 text-xs font-bold bg-[#020617] border border-slate-700 rounded-xl text-slate-100"
            />
          </div>

          {/* Logo URL & Upload */}
          <div className="md:col-span-2 space-y-2">
            <label className="block text-xs font-semibold text-slate-300">
              {t.logoUrlLabel}
            </label>
            <div className="flex flex-col sm:flex-row items-center gap-3">
              {/* Logo Thumbnail Preview */}
              <div className="w-14 h-14 shrink-0 rounded-2xl overflow-hidden border-2 border-amber-500 bg-[#020617] flex items-center justify-center p-0.5 shadow-md">
                <img
                  src={logoUrl || store.logoUrl}
                  alt="Logo Preview"
                  className="w-full h-full object-cover rounded-xl"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1519676867240-f03562e64548?auto=format&fit=crop&w=300&q=80';
                  }}
                />
              </div>

              <div className="flex-1 w-full flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  placeholder="رابط الصورة أو اختر ملف..."
                  className="flex-1 px-3.5 py-2 text-xs bg-[#020617] border border-slate-700 rounded-xl text-slate-100"
                />
                <label className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl cursor-pointer transition flex items-center justify-center gap-1.5 shadow-md shrink-0">
                  <Upload className="w-4 h-4 text-slate-950" />
                  <span>رفع صورة جديدة</span>
                  <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                </label>
              </div>
            </div>
          </div>

          {/* Currency Settings */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              {t.baseSymbol}
            </label>
            <input
              type="text"
              value={baseSymbol}
              onChange={(e) => setBaseSymbol(e.target.value)}
              className="w-full px-3.5 py-2 text-xs font-bold bg-[#020617] border border-slate-700 rounded-xl text-slate-100"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              {t.localSymbol}
            </label>
            <input
              type="text"
              value={localSymbol}
              onChange={(e) => setLocalSymbol(e.target.value)}
              className="w-full px-3.5 py-2 text-xs font-bold bg-[#020617] border border-slate-700 rounded-xl text-slate-100"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-amber-400 mb-1">
              {t.exchangeRateValue}
            </label>
            <input
              type="number"
              step="any"
              value={exchangeRate}
              onChange={(e) => setExchangeRate(e.target.value)}
              className="w-full px-3.5 py-2 text-xs font-black text-amber-400 bg-[#020617] border border-slate-700 rounded-xl"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              {t.dailyTargetSetting}
            </label>
            <input
              type="number"
              value={dailyTarget}
              onChange={(e) => setDailyTarget(e.target.value)}
              className="w-full px-3.5 py-2 text-xs font-bold bg-[#020617] border border-slate-700 rounded-xl text-slate-100"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-3 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm rounded-xl transition shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
        >
          <Save className="w-4 h-4" />
          <span>{t.saveSettingsBtn}</span>
        </button>
      </form>

      {/* Menu Item Management Section */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
        <h3 className="font-extrabold text-base text-slate-100 pb-3 border-b border-slate-800">
          {t.menuManagement}
        </h3>

        {/* Form: Add New Item */}
        <form onSubmit={handleAddMenuItem} className="p-4 bg-[#020617] rounded-2xl border border-slate-800 space-y-3">
          <span className="font-bold text-xs text-slate-300 block">
            {t.addNewMenuItem}
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              type="text"
              required
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              placeholder="اسم الصنف الجديد..."
              className="px-3 py-2 text-xs bg-[#0f172a] border border-slate-700 rounded-xl text-slate-100"
            />

            <select
              value={newItemCategory}
              onChange={(e) => setNewItemCategory(e.target.value as CategoryType)}
              className="px-3 py-2 text-xs font-bold bg-[#0f172a] border border-slate-700 rounded-xl text-slate-200"
            >
              <option value="crepe">{t.categoryCrepe}</option>
              <option value="waffle">{t.categoryWaffle}</option>
              <option value="pancake">{t.categoryPancake}</option>
              <option value="drink">{t.categoryDrink}</option>
              <option value="extra">{t.categoryExtra}</option>
            </select>

            <div className="flex gap-2">
              <input
                type="number"
                step="0.10"
                required
                value={newItemPrice}
                onChange={(e) => setNewItemPrice(e.target.value)}
                placeholder="السعر بالدولار ($)"
                className="w-full px-3 py-2 text-xs font-bold bg-[#0f172a] border border-slate-700 rounded-xl text-slate-100"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shrink-0 shadow-md"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </form>

        {/* Search & Category Filters Bar */}
        <div className="space-y-3 pt-2">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={menuSearchQuery}
                onChange={(e) => setMenuSearchQuery(e.target.value)}
                placeholder="ابحث عن صنف..."
                className="w-full pr-9 pl-3 py-2 text-xs bg-[#020617] border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* Total Items Count Badge */}
            <span className="text-xs font-bold text-slate-400 bg-[#020617] px-3 py-1.5 rounded-xl border border-slate-800 shrink-0">
              عرض {filteredMenuItems.length} من أصل {menuItems.length} صنف
            </span>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
            {[
              { id: 'all', label: 'الكل' },
              { id: 'crepe', label: t.categoryCrepe },
              { id: 'waffle', label: t.categoryWaffle },
              { id: 'pancake', label: t.categoryPancake },
              { id: 'drink', label: t.categoryDrink },
              { id: 'extra', label: t.categoryExtra },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setMenuFilterCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap border shrink-0 ${
                  menuFilterCategory === cat.id
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20'
                    : 'bg-[#020617] text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Existing Menu Items List with Scrollbar */}
        <div className="space-y-2 max-h-80 sm:max-h-[420px] overflow-y-auto pr-1 sm:pr-2 scrollbar-thin scrollbar-thumb-slate-700">
          {filteredMenuItems.length === 0 ? (
            <div className="py-8 text-center text-slate-500 text-xs font-semibold bg-[#020617] rounded-xl border border-slate-800">
              لا توجد أصناف تطابق البحث أو التصنيف المحدد
            </div>
          ) : (
            filteredMenuItems.map((item) => (
              <div
                key={item.id}
                className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition ${
                  item.available
                    ? 'bg-[#020617] border-slate-800'
                    : 'bg-slate-900/60 border-slate-800/80 opacity-60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleToggleAvailable(item.id)}
                    className={`p-1.5 rounded-lg transition ${
                      item.available ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-slate-800 text-slate-500'
                    }`}
                    title={t.availableToggle}
                  >
                    {item.available ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                  <div>
                    <h4 className="font-bold text-xs text-slate-100">
                      {lang === 'ar' ? item.nameAr : item.nameEn}
                    </h4>
                    <span className="text-[10px] text-slate-400 font-semibold capitalize">{item.category}</span>
                  </div>
                </div>

                {/* Editable Price */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-400">$</span>
                  <input
                    type="number"
                    step="0.10"
                    value={item.priceUsd}
                    onChange={(e) => handleEditPrice(item.id, parseFloat(e.target.value) || 0)}
                    className="w-20 px-2 py-1 text-xs font-bold text-amber-400 bg-[#0f172a] border border-slate-700 rounded-lg text-center focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                  <button
                    onClick={() => handleDeleteItem(item.id)}
                    className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-950/50 rounded-lg transition"
                    title={t.deleteItem}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Local Database & Standalone PWA Offline Section */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4 col-span-1 lg:col-span-2">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
          <Database className="w-5 h-5 text-emerald-400" />
          <h3 className="text-sm font-black text-slate-100">قاعدة البيانات المحلية والعمل بدون إنترنت (PWA)</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Info Card: Local Storage Status */}
          <div className="bg-[#020617] border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
              <Smartphone className="w-4 h-4 shrink-0" />
              <span>تطبيق محلي 100% منفصل على هاتفك (iOS & Android)</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              عند تثبيت التطبيق على جهازك (أندرويد أو آيفون)، فإنه يعمل كتطبيق مستقل بذاته يُحفظ بالكامل في ذاكرة جهازك.
            </p>
            <ul className="text-[11px] text-slate-400 space-y-1.5 list-disc list-inside">
              <li>جميع المبيعات والمصاريف والأصناف تُحفظ في ذاكرة الهاتف المحلية (LocalStorage).</li>
              <li>التطبيق لا يحتاج إلى سيرفر Vercel أو إنترنت بعد التثبيت.</li>
              <li>يمكنك إيقاف أو إلغاء سيرفر Vercel وسيبقى التطبيق يعمل بكفاءة كاملة على الأجهزة المثبت عليها.</li>
            </ul>
          </div>

          {/* Guide Card: Android & iPhone Installation Steps */}
          <div className="bg-[#020617] border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs mb-1">
              <Smartphone className="w-4 h-4 shrink-0 text-amber-400" />
              <span>طريقة التثبيت على أندرويد وآيفون:</span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-2 bg-slate-900/80 rounded-lg border border-slate-800 space-y-1">
                <span className="font-extrabold text-amber-400 block">📱 أندرويد (Android - Chrome / Samsung):</span>
                <p className="text-[11px] text-slate-300">
                  افتخ الرابط في متصفح Chrome أو Samsung Internet 👈 اضغط على زر القائمة (⋮) أعلى اليسار 👈 اختر <strong className="text-slate-100">"تثبيت التطبيق" (Install App)</strong> أو <strong className="text-slate-100">"الإضافة إلى الشاشة الرئيسية"</strong>.
                </p>
              </div>

              <div className="p-2 bg-slate-900/80 rounded-lg border border-slate-800 space-y-1">
                <span className="font-extrabold text-emerald-400 block">🍏 آيفون (iPhone - Safari):</span>
                <p className="text-[11px] text-slate-300">
                  افتح الرابط في متصفح Safari 👈 اضغط على زر المشاركة (Share ⬆️) بالأسفل 👈 اختر <strong className="text-slate-100">"إضافة إلى الشاشة الرئيسية" (Add to Home Screen)</strong>.
                </p>
              </div>
            </div>
          </div>

          {/* Action Card: Backup & Restore JSON */}
          <div className="bg-[#020617] border border-slate-800 rounded-xl p-4 space-y-3 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-amber-400 font-bold text-xs mb-1">
                <HardDrive className="w-4 h-4 shrink-0" />
                <span>النسخ الاحتياطي واستعادة البيانات</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed mb-3">
                قم بتحميل نسخة احتياطية من جميع بيانات المحل (المبيعات، المشروبات، المصاريف، الإعدادات) كملف JSON آمن للاحتفاظ بها أو نقلها لهاتف آخر.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                onClick={() => {
                  exportFullBackup();
                  setToastMsg('تم تصدير النسخة الاحتياطية بنجاح! 💾');
                  setTimeout(() => setToastMsg(null), 3000);
                }}
                className="flex-1 py-2.5 px-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl transition flex items-center justify-center gap-1.5 shadow-md"
              >
                <Download className="w-4 h-4" />
                <span>تصدير نسخة احتياطية (JSON)</span>
              </button>

              <label className="flex-1 py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer border border-slate-700">
                <Upload className="w-4 h-4 text-emerald-400" />
                <span>استعادة نسخة احتياطية</span>
                <input
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        const content = event.target?.result as string;
                        if (content && importFullBackup(content)) {
                          setToastMsg('تم استعادة البيانات بنجاح! يرجى إعادة تحديث الصفحة 🔄');
                          setTimeout(() => window.location.reload(), 1500);
                        } else {
                          setToastMsg('خطأ في ملف النسخة الاحتياطية!');
                          setTimeout(() => setToastMsg(null), 3000);
                        }
                      };
                      reader.readAsText(file);
                    }
                  }}
                />
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
