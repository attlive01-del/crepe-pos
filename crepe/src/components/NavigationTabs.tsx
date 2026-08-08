import React from 'react';
import { Language } from '../types';
import { translations } from '../utils/i18n';
import { ShoppingBag, Receipt, BarChart3, TrendingUp, Calculator, Settings } from 'lucide-react';

export type TabType = 'quick_sale' | 'expenses' | 'reports' | 'analytics' | 'calculator' | 'settings';

interface NavigationTabsProps {
  activeTab: TabType;
  onChangeTab: (tab: TabType) => void;
  lang: Language;
}

export const NavigationTabs: React.FC<NavigationTabsProps> = ({ activeTab, onChangeTab, lang }) => {
  const t = translations[lang];

  const tabs = [
    { id: 'quick_sale' as TabType, label: t.quickSale, icon: ShoppingBag },
    { id: 'expenses' as TabType, label: t.expenses, icon: Receipt },
    { id: 'reports' as TabType, label: t.reportsAndData, icon: BarChart3 },
    { id: 'analytics' as TabType, label: t.financialAnalytics, icon: TrendingUp },
    { id: 'calculator' as TabType, label: t.costCalculator, icon: Calculator },
    { id: 'settings' as TabType, label: t.settings, icon: Settings },
  ];

  return (
    <nav className="bg-[#0f172a]/90 backdrop-blur-md border-b border-slate-800 px-4 py-2 sticky top-[61px] z-20 overflow-x-auto no-scrollbar shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-start sm:justify-center gap-1.5 min-w-max">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onChangeTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 scale-[1.02]'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950' : 'text-amber-500'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
