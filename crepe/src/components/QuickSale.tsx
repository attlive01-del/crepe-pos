import React, { useState } from 'react';
import { MenuItem, CartItem, SaleRecord, CurrencySettings, StoreSettings, Language, CategoryType } from '../types';
import { formatBaseCurrency, formatLocalCurrency } from '../utils/storage';
import { translations } from '../utils/i18n';
import confetti from 'canvas-confetti';
import {
  Plus,
  Minus,
  Trash2,
  CheckCircle,
  PlusCircle,
  ShoppingBag,
  CreditCard,
  Banknote,
  Send,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Cookie,
  UtensilsCrossed,
  Sandwich,
  Grid,
  Apple,
  Circle,
  Coffee,
  CupSoda,
  GlassWater,
  FileText
} from 'lucide-react';

interface QuickSaleProps {
  menuItems: MenuItem[];
  currency: CurrencySettings;
  store: StoreSettings;
  lang: Language;
  sales: SaleRecord[];
  onAddSale: (sale: SaleRecord) => void;
  onVoidSale: (saleId: string) => void;
  onAddMenuItem: (item: MenuItem) => void;
}

export const QuickSale: React.FC<QuickSaleProps> = ({
  menuItems,
  currency,
  store,
  lang,
  sales,
  onAddSale,
  onVoidSale,
  onAddMenuItem,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<CategoryType | 'all'>('all');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'transfer'>('cash');
  const [orderNotes, setOrderNotes] = useState('');
  const [customName, setCustomName] = useState('');
  const [customPrice, setCustomPrice] = useState('');
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [voidingSaleId, setVoidingSaleId] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const t = translations[lang];

  // Helper icon renderer
  const getCategoryIcon = (iconName?: string) => {
    switch (iconName) {
      case 'UtensilsCrossed': return <UtensilsCrossed className="w-5 h-5" />;
      case 'Cookie': return <Cookie className="w-5 h-5" />;
      case 'Sparkles': return <Sparkles className="w-5 h-5" />;
      case 'Sandwich': return <Sandwich className="w-5 h-5" />;
      case 'Grid': return <Grid className="w-5 h-5" />;
      case 'Apple': return <Apple className="w-5 h-5" />;
      case 'Circle': return <Circle className="w-5 h-5" />;
      case 'Coffee': return <Coffee className="w-5 h-5" />;
      case 'CupSoda': return <CupSoda className="w-5 h-5" />;
      case 'GlassWater': return <GlassWater className="w-5 h-5" />;
      default: return <PlusCircle className="w-5 h-5" />;
    }
  };

  const categories: { id: CategoryType | 'all'; label: string }[] = [
    { id: 'all', label: t.allCategories },
    { id: 'crepe', label: t.categoryCrepe },
    { id: 'waffle', label: t.categoryWaffle },
    { id: 'pancake', label: t.categoryPancake },
    { id: 'drink', label: t.categoryDrink },
    { id: 'extra', label: t.categoryExtra },
  ];

  const filteredMenuItems = selectedCategory === 'all'
    ? menuItems.filter((i) => i.available)
    : menuItems.filter((i) => i.category === selectedCategory && i.available);

  // Cart operations
  const handleAddToCart = (item: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.item.id === item.id);
      if (existing) {
        return prev.map((c) =>
          c.item.id === item.id ? { ...c, quantity: c.quantity + 1 } : c
        );
      }
      return [...prev, { cartId: `${item.id}-${Date.now()}`, item, quantity: 1 }];
    });
  };

  const handleUpdateQuantity = (cartId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((c) => {
          if (c.cartId === cartId) {
            const newQty = c.quantity + delta;
            return newQty > 0 ? { ...c, quantity: newQty } : null;
          }
          return c;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleRemoveFromCart = (cartId: string) => {
    setCart((prev) => prev.filter((c) => c.cartId !== cartId));
  };

  const handleUpdateCartPrice = (cartId: string, newPrice: number) => {
    setCart((prev) =>
      prev.map((c) => (c.cartId === cartId ? { ...c, customPriceUsd: newPrice } : c))
    );
  };

  // Custom Item add
  const handleAddCustomItem = (e: React.FormEvent) => {
    e.preventDefault();
    const priceNum = parseFloat(customPrice);
    if (!customName.trim() || isNaN(priceNum) || priceNum <= 0) return;

    const newItem: MenuItem = {
      id: `custom-${Date.now()}`,
      nameAr: customName,
      nameEn: customName,
      priceUsd: priceNum,
      category: 'custom',
      iconName: 'PlusCircle',
      colorBg: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-200',
      available: true,
      unitCostUsd: priceNum * 0.3,
    };

    onAddMenuItem(newItem);
    handleAddToCart(newItem);
    setCustomName('');
    setCustomPrice('');
    setIsCustomModalOpen(false);
  };

  // Cart totals
  const totalUsd = cart.reduce((acc, c) => {
    const p = c.customPriceUsd !== undefined ? c.customPriceUsd : c.item.priceUsd;
    return acc + p * c.quantity;
  }, 0);

  const totalLocal = totalUsd * currency.exchangeRate;

  // Submit Sale
  const handleRegisterSale = () => {
    if (cart.length === 0) return;

    const newSale: SaleRecord = {
      id: `sale-${Date.now()}`,
      orderNumber: `CR-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: Date.now(),
      items: cart.map((c) => ({
        itemId: c.item.id,
        nameAr: c.item.nameAr,
        nameEn: c.item.nameEn,
        quantity: c.quantity,
        priceUsd: c.customPriceUsd !== undefined ? c.customPriceUsd : c.item.priceUsd,
        totalUsd: (c.customPriceUsd !== undefined ? c.customPriceUsd : c.item.priceUsd) * c.quantity,
      })),
      totalUsd,
      totalLocal,
      exchangeRate: currency.exchangeRate,
      paymentMethod,
      status: 'completed',
      notes: orderNotes.trim() || undefined,
    };

    onAddSale(newSale);

    // Celebrate with confetti balloons!
    confetti({
      particleCount: 65,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#f59e0b', '#10b981', '#3b82f6', '#ec4899'],
    });

    // Reset Cart & Show Notification
    setCart([]);
    setOrderNotes('');
    setToastMsg(t.saleSuccessMsg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const recentSalesList = sales.slice(0, 5);

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white px-6 py-3 rounded-2xl shadow-2xl font-bold flex items-center gap-2 animate-bounce">
          <CheckCircle className="w-5 h-5 text-white" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Main Grid: Left Items Selection, Right Cart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Menu Cards (8 cols) */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-4">
          {/* Category Filter Pills & Custom Button */}
          <div className="flex flex-wrap items-center justify-between gap-2 bg-[#0f172a] p-2.5 rounded-2xl border border-slate-800 shadow-lg">
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 max-w-full">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition whitespace-nowrap ${
                    selectedCategory === cat.id
                      ? 'bg-amber-500 text-slate-950 shadow-md'
                      : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
            <button
              onClick={() => setIsCustomModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition shrink-0 shadow-md"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{t.categoryCustom}</span>
            </button>
          </div>

          {/* Menu Items Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
            {filteredMenuItems.map((item) => {
              const inCartItem = cart.find((c) => c.item.id === item.id);
              return (
                <button
                  key={item.id}
                  onClick={() => handleAddToCart(item)}
                  className="group relative flex flex-col justify-between p-3.5 bg-[#0f172a] hover:bg-slate-800 border border-slate-800 hover:border-amber-500/50 rounded-2xl transition-all shadow-md text-right hover:scale-[1.02] active:scale-[0.98]"
                >
                  {/* Quantity badge if in cart */}
                  {inCartItem && (
                    <span className="absolute top-2 left-2 w-6 h-6 rounded-full bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center shadow-md">
                      {inCartItem.quantity}
                    </span>
                  )}

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500 group-hover:scale-110 transition-transform">
                        {getCategoryIcon(item.iconName)}
                      </div>
                    </div>
                    <h3 className="font-bold text-sm text-slate-100 leading-snug line-clamp-2 mb-1">
                      {lang === 'ar' ? item.nameAr : item.nameEn}
                    </h3>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-800 flex flex-col items-start w-full">
                    <span className="font-extrabold text-base text-amber-400">
                      {formatBaseCurrency(item.priceUsd, currency.baseCurrencySymbol)}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-400">
                      {formatLocalCurrency(item.priceUsd, currency.exchangeRate, currency.localCurrencySymbol)}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Order Cart / Bill (4-5 cols) */}
        <div className="lg:col-span-5 xl:col-span-4 bg-[#0f172a] border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-2xl space-y-4 lg:sticky lg:top-[125px] max-h-none lg:max-h-[calc(100vh-140px)] flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
            <div className="flex items-center gap-2 font-black text-base text-slate-100">
              <ShoppingBag className="w-5 h-5 text-amber-500" />
              <span>{t.currentOrder}</span>
            </div>
            {cart.length > 0 && (
              <span className="px-2.5 py-0.5 bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold text-xs rounded-full">
                {cart.reduce((a, b) => a + b.quantity, 0)} {t.itemsCount}
              </span>
            )}
          </div>

          {/* Cart Items List */}
          <div className="space-y-3 max-h-60 lg:max-h-[calc(100vh-420px)] overflow-y-auto pr-1 flex-1">
            {cart.length === 0 ? (
              <div className="py-12 text-center text-slate-500 space-y-2">
                <ShoppingBag className="w-12 h-12 mx-auto stroke-1 opacity-40" />
                <p className="text-xs font-semibold">{t.emptyCart}</p>
              </div>
            ) : (
              cart.map((cartItem) => {
                const itemPrice = cartItem.customPriceUsd !== undefined ? cartItem.customPriceUsd : cartItem.item.priceUsd;
                return (
                  <div
                    key={cartItem.cartId}
                    className="p-3 bg-[#020617] rounded-xl border border-slate-800 space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <h4 className="font-bold text-xs text-slate-100">
                          {lang === 'ar' ? cartItem.item.nameAr : cartItem.item.nameEn}
                        </h4>
                        <div className="text-[11px] text-amber-400 font-semibold mt-0.5">
                          {formatBaseCurrency(itemPrice * cartItem.quantity, currency.baseCurrencySymbol)}
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveFromCart(cartItem.cartId)}
                        className="text-red-400 hover:text-red-300 p-1 rounded-lg hover:bg-red-950/50 transition"
                        title={t.delete}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Quantity & Price Edit Controls */}
                    <div className="flex items-center justify-between pt-1 border-t border-slate-800">
                      <div className="flex items-center gap-1">
                        <span className="text-[11px] font-semibold text-slate-400">{t.price}: $</span>
                        <input
                          type="number"
                          step="0.10"
                          value={itemPrice}
                          onChange={(e) => handleUpdateCartPrice(cartItem.cartId, parseFloat(e.target.value) || 0)}
                          className="w-16 px-1.5 py-0.5 text-xs font-bold bg-[#0f172a] border border-slate-700 rounded text-center text-amber-400"
                        />
                      </div>

                      {/* Large (+ / -) Buttons */}
                      <div className="flex items-center gap-2 bg-[#0f172a] border border-slate-700 rounded-xl px-1 py-0.5">
                        <button
                          onClick={() => handleUpdateQuantity(cartItem.cartId, -1)}
                          className="w-7 h-7 flex items-center justify-center bg-slate-800 hover:bg-amber-500 hover:text-slate-950 rounded-lg text-slate-200 font-black transition"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="font-black text-xs px-1 min-w-[20px] text-center text-slate-100">
                          {cartItem.quantity}
                        </span>
                        <button
                          onClick={() => handleUpdateQuantity(cartItem.cartId, 1)}
                          className="w-7 h-7 flex items-center justify-center bg-slate-800 hover:bg-amber-500 hover:text-slate-950 rounded-lg text-slate-200 font-black transition"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Notes & Payment Method */}
          {cart.length > 0 && (
            <div className="space-y-3 pt-2 border-t border-slate-800">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  {t.notes}
                </label>
                <input
                  type="text"
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  placeholder={t.notesPlaceholder}
                  className="w-full px-3 py-1.5 text-xs bg-[#020617] border border-slate-700 rounded-xl text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  {t.paymentMethod}
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['cash', 'card', 'transfer'] as const).map((method) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setPaymentMethod(method)}
                      className={`py-1.5 px-2 rounded-xl text-xs font-bold border transition flex items-center justify-center gap-1 ${
                        paymentMethod === method
                          ? 'bg-amber-500 text-slate-950 border-amber-500'
                          : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                      }`}
                    >
                      {method === 'cash' && <Banknote className="w-3.5 h-3.5" />}
                      {method === 'card' && <CreditCard className="w-3.5 h-3.5" />}
                      {method === 'transfer' && <Send className="w-3.5 h-3.5" />}
                      <span>{t[method]}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Total Display Box */}
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-amber-200">{t.totalBase}</span>
                  <span className="text-xl font-black text-amber-400">
                    {formatBaseCurrency(totalUsd, currency.baseCurrencySymbol)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs text-amber-300 font-semibold pt-1 border-t border-amber-500/20">
                  <span>{t.totalLocal}</span>
                  <span className="text-sm font-bold">
                    {formatLocalCurrency(totalUsd, currency.exchangeRate, currency.localCurrencySymbol)}
                  </span>
                </div>
              </div>

              {/* Big tactile Submit button */}
              <button
                onClick={handleRegisterSale}
                className="w-full py-3.5 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-4 rounded-xl text-lg flex items-center justify-center gap-3 shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.01] active:scale-[0.99]"
              >
                <CheckCircle className="w-5 h-5" />
                <span>{t.registerSaleBtn}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Recent Sales Bar (Last 5 Sales) */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-4 shadow-lg space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-sm text-slate-100 flex items-center gap-2">
            <FileText className="w-4 h-4 text-amber-500" />
            <span>{t.recentSales}</span>
          </h3>
          <span className="text-xs font-semibold text-slate-400">
            {sales.filter((s) => s.status === 'completed').length} {t.statusCompleted}
          </span>
        </div>

        {recentSalesList.length === 0 ? (
          <p className="text-xs text-slate-500 py-2">{t.noData}</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {recentSalesList.map((sale) => {
              const isVoided = sale.status === 'voided';
              return (
                <div
                  key={sale.id}
                  className={`p-3 rounded-xl border transition flex flex-col justify-between ${
                    isVoided
                      ? 'bg-red-950/30 border-red-900 text-slate-400'
                      : 'bg-[#020617] border-slate-800'
                  }`}
                >
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-xs text-amber-400">
                        {sale.orderNumber}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {new Date(sale.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="text-xs font-semibold text-slate-200 line-clamp-1">
                      {sale.items.map((i) => (lang === 'ar' ? i.nameAr : i.nameEn)).join(', ')}
                    </div>
                  </div>

                  <div className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="font-extrabold text-xs text-slate-100">
                        {formatBaseCurrency(sale.totalUsd, currency.baseCurrencySymbol)}
                      </span>
                      {isVoided && (
                        <span className="text-[10px] font-bold text-red-400 block">
                          ({t.statusVoided})
                        </span>
                      )}
                    </div>
                    {!isVoided && (
                      <button
                        onClick={() => setVoidingSaleId(sale.id)}
                        className="p-1 text-slate-400 hover:text-red-400 hover:bg-red-950/50 rounded transition"
                        title={t.voidSale}
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Void Sale Modal */}
      {voidingSaleId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs">
          <div className="bg-[#0f172a] rounded-2xl p-6 max-w-sm w-full border border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="font-bold text-lg text-slate-100">{t.voidConfirmTitle}</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {t.voidConfirmText}
            </p>
            <div className="flex gap-2 justify-end pt-2">
              <button
                onClick={() => setVoidingSaleId(null)}
                className="px-4 py-2 bg-slate-800 text-slate-300 hover:bg-slate-700 rounded-xl text-xs font-semibold"
              >
                {t.cancel}
              </button>
              <button
                onClick={() => {
                  onVoidSale(voidingSaleId);
                  setVoidingSaleId(null);
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold shadow-md"
              >
                {t.confirm}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Custom Item Modal */}
      {isCustomModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs">
          <div className="bg-[#0f172a] rounded-2xl p-6 max-w-sm w-full border border-slate-800 shadow-2xl space-y-4">
            <h3 className="font-extrabold text-base text-slate-100">
              {t.customItemTitle}
            </h3>
            <form onSubmit={handleAddCustomItem} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  {t.customItemName}
                </label>
                <input
                  type="text"
                  required
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="مثال: كريب نوتيلا مزدوج"
                  className="w-full px-3 py-2 text-xs bg-[#020617] border border-slate-700 rounded-xl text-slate-100"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  {t.customItemPrice}
                </label>
                <input
                  type="number"
                  step="0.10"
                  required
                  value={customPrice}
                  onChange={(e) => setCustomPrice(e.target.value)}
                  placeholder="3.50"
                  className="w-full px-3 py-2 text-xs bg-[#020617] border border-slate-700 rounded-xl font-bold text-amber-400"
                />
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setIsCustomModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 hover:bg-slate-700 rounded-xl text-xs font-semibold"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md"
                >
                  {t.customItemAddBtn}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
