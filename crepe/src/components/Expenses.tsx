import React, { useState } from 'react';
import { ExpenseRecord, ExpenseCategory, CurrencySettings, Language } from '../types';
import { formatBaseCurrency, formatLocalCurrency, convertToBase, convertToLocal } from '../utils/storage';
import { translations } from '../utils/i18n';
import { Receipt, Tag, Plus, Trash2, CheckCircle2, DollarSign, RefreshCw } from 'lucide-react';

interface ExpensesProps {
  expenses: ExpenseRecord[];
  currency: CurrencySettings;
  lang: Language;
  onAddExpense: (expense: ExpenseRecord) => void;
  onDeleteExpense: (id: string) => void;
}

export const Expenses: React.FC<ExpensesProps> = ({
  expenses,
  currency,
  lang,
  onAddExpense,
  onDeleteExpense,
}) => {
  const [category, setCategory] = useState<ExpenseCategory>('raw_materials');
  const [description, setDescription] = useState('');
  const [inputCurrency, setInputCurrency] = useState<'USD' | 'LOCAL'>('USD');
  const [amountInput, setAmountInput] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [filterCategory, setFilterCategory] = useState<ExpenseCategory | 'all'>('all');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const t = translations[lang];

  const quickTagList = [
    'نوتيلا',
    'طحين',
    'لوتس',
    'غاز',
    'علب كريب',
    'شوكولاتة',
    'فواكه',
    'حليب',
    'أكياس',
    'إيجار',
    'رواتب',
    'كهرباء',
  ];

  const categories: { id: ExpenseCategory; label: string }[] = [
    { id: 'raw_materials', label: t.expRawMaterials },
    { id: 'packaging', label: t.expPackaging },
    { id: 'utilities', label: t.expUtilities },
    { id: 'rent_salaries', label: t.expRentSalaries },
    { id: 'other', label: t.expOther },
  ];

  const handleToggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags((prev) => prev.filter((t) => t !== tag));
    } else {
      setSelectedTags((prev) => [...prev, tag]);
      if (!description) {
        setDescription(tag);
      } else if (!description.includes(tag)) {
        setDescription((prev) => `${prev} - ${tag}`);
      }
    }
  };

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(amountInput);
    if (isNaN(val) || val <= 0 || !description.trim()) return;

    let amountUsd = val;
    let amountLocal = val * currency.exchangeRate;

    if (inputCurrency === 'LOCAL') {
      amountLocal = val;
      amountUsd = convertToBase(val, currency.exchangeRate);
    }

    const newExp: ExpenseRecord = {
      id: `exp-${Date.now()}`,
      timestamp: Date.now(),
      category,
      description: description.trim(),
      tags: selectedTags,
      amountUsd,
      amountLocal,
      exchangeRate: currency.exchangeRate,
    };

    onAddExpense(newExp);

    // Reset Form
    setDescription('');
    setAmountInput('');
    setSelectedTags([]);
    setToastMsg(t.expenseSuccess);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const filteredExpenses = filterCategory === 'all'
    ? expenses
    : expenses.filter((e) => e.category === filterCategory);

  const totalExpenseUsd = expenses.reduce((acc, e) => acc + e.amountUsd, 0);

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white px-6 py-3 rounded-2xl shadow-2xl font-bold flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-white" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Main Grid: Left Form, Right Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Form to record expense (5 cols) */}
        <div className="lg:col-span-5 bg-[#0f172a] border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800 font-extrabold text-base text-slate-100">
            <Receipt className="w-5 h-5 text-amber-500" />
            <span>{t.newExpense}</span>
          </div>

          <form onSubmit={handleAddExpense} className="space-y-4">
            {/* Expense Category Options */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-2">
                {t.categoryLabel}
              </label>
              <div className="space-y-1.5">
                {categories.map((cat) => (
                  <label
                    key={cat.id}
                    className={`flex items-center gap-3 p-2.5 rounded-xl border cursor-pointer transition text-xs font-bold ${
                      category === cat.id
                        ? 'bg-amber-500/10 border-amber-500 text-amber-300 shadow-sm'
                        : 'bg-[#020617] border-slate-800 text-slate-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="expense_category"
                      value={cat.id}
                      checked={category === cat.id}
                      onChange={() => setCategory(cat.id)}
                      className="accent-amber-500 w-4 h-4"
                    />
                    <span>{cat.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Description & Tag Shortcuts */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                {t.expenseDesc}
              </label>
              <input
                type="text"
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t.expenseDescPlaceholder}
                className="w-full px-3 py-2 text-xs bg-[#020617] border border-slate-700 rounded-xl text-slate-100"
              />

              {/* Quick Tags */}
              <div className="mt-2.5 space-y-1">
                <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                  <Tag className="w-3 h-3 text-amber-500" />
                  {t.quickTags}
                </span>
                <div className="flex flex-wrap gap-1">
                  {quickTagList.map((tag) => {
                    const isSelected = selectedTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => handleToggleTag(tag)}
                        className={`px-2 py-0.5 rounded-lg text-[11px] font-bold transition ${
                          isSelected
                            ? 'bg-amber-500 text-slate-950'
                            : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
                        }`}
                      >
                        #{tag}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Currency Input & Conversion */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-400">
                  {t.amount}
                </label>
                {/* Currency Switcher */}
                <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl border border-slate-700">
                  <button
                    type="button"
                    onClick={() => setInputCurrency('USD')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                      inputCurrency === 'USD'
                        ? 'bg-amber-500 text-slate-950 shadow-sm'
                        : 'text-slate-400'
                    }`}
                  >
                    $ {currency.baseCurrencyCode}
                  </button>
                  <button
                    type="button"
                    onClick={() => setInputCurrency('LOCAL')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                      inputCurrency === 'LOCAL'
                        ? 'bg-amber-500 text-slate-950 shadow-sm'
                        : 'text-slate-400'
                    }`}
                  >
                    {currency.localCurrencySymbol}
                  </button>
                </div>
              </div>

              <input
                type="number"
                step="any"
                required
                value={amountInput}
                onChange={(e) => setAmountInput(e.target.value)}
                placeholder={inputCurrency === 'USD' ? '15.00' : '1342500'}
                className="w-full px-3 py-2 text-base font-bold bg-[#020617] border border-slate-700 rounded-xl text-amber-400"
              />

              {/* Calculated Auto Conversion Display */}
              {amountInput && !isNaN(parseFloat(amountInput)) && parseFloat(amountInput) > 0 && (
                <div className="p-2.5 bg-amber-500/10 rounded-xl border border-amber-500/30 text-xs font-semibold text-amber-300 flex items-center justify-between">
                  <span className="flex items-center gap-1 text-slate-400">
                    <RefreshCw className="w-3.5 h-3.5 text-amber-500" />
                    المحسوب بالعملة الموازية:
                  </span>
                  <span className="font-bold text-amber-300">
                    {inputCurrency === 'USD'
                      ? formatLocalCurrency(parseFloat(amountInput), currency.exchangeRate, currency.localCurrencySymbol)
                      : formatBaseCurrency(convertToBase(parseFloat(amountInput), currency.exchangeRate), currency.baseCurrencySymbol)}
                  </span>
                </div>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm rounded-xl transition shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>{t.addExpenseBtn}</span>
            </button>
          </form>
        </div>

        {/* Right Column: Expense Records Table (7 cols) */}
        <div className="lg:col-span-7 bg-[#0f172a] border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div>
              <h3 className="font-extrabold text-base text-slate-100">
                {t.expensesHistory}
              </h3>
              <p className="text-xs font-semibold text-slate-400 mt-0.5">
                إجمالي المصاريف: <span className="text-rose-400 font-bold">{formatBaseCurrency(totalExpenseUsd, currency.baseCurrencySymbol)}</span>
              </p>
            </div>

            {/* Category Filter */}
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value as ExpenseCategory | 'all')}
              className="px-3 py-1.5 text-xs font-bold bg-slate-800 border border-slate-700 rounded-xl text-slate-200"
            >
              <option value="all">{t.filterCategory}: {t.allCategories}</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            {filteredExpenses.length === 0 ? (
              <p className="text-xs text-slate-500 py-8 text-center">{t.noExpenses}</p>
            ) : (
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-bold">
                    <th className="pb-2.5 font-semibold">{t.date}</th>
                    <th className="pb-2.5 font-semibold">{t.categoryLabel}</th>
                    <th className="pb-2.5 font-semibold">{t.expenseDesc}</th>
                    <th className="pb-2.5 font-semibold">{t.amount} ($)</th>
                    <th className="pb-2.5 font-semibold">{t.actions}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {filteredExpenses.map((exp) => (
                    <tr key={exp.id} className="hover:bg-slate-800/50 transition">
                      <td className="py-3 text-slate-400 whitespace-nowrap">
                        {new Date(exp.timestamp).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="py-3 font-bold text-amber-400 whitespace-nowrap">
                        {categories.find((c) => c.id === exp.category)?.label || exp.category}
                      </td>
                      <td className="py-3 text-slate-200 max-w-xs">
                        <div>{exp.description}</div>
                        {exp.tags && exp.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {exp.tags.map((t, idx) => (
                              <span key={idx} className="text-[10px] px-1.5 py-0.2 bg-slate-800 text-slate-400 rounded">
                                #{t}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="py-3 font-extrabold text-slate-100 whitespace-nowrap">
                        <div>{formatBaseCurrency(exp.amountUsd, currency.baseCurrencySymbol)}</div>
                        <div className="text-[10px] font-normal text-slate-400">
                          {formatLocalCurrency(exp.amountUsd, exp.exchangeRate, currency.localCurrencySymbol)}
                        </div>
                      </td>
                      <td className="py-3 whitespace-nowrap">
                        <button
                          onClick={() => onDeleteExpense(exp.id)}
                          className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-950/50 rounded-lg transition"
                          title={t.deleteExpense}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
