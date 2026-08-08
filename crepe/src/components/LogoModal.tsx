import React from 'react';
import { X } from 'lucide-react';

interface LogoModalProps {
  isOpen: boolean;
  onClose: () => void;
  logoUrl: string;
  storeName: string;
}

export const LogoModal: React.FC<LogoModalProps> = ({ isOpen, onClose, logoUrl, storeName }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative max-w-lg w-full bg-[#0f172a] rounded-2xl p-6 text-center shadow-2xl border border-slate-800">
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-2 rounded-full text-slate-400 hover:text-slate-100 bg-slate-800 transition border border-slate-700"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>
        <h3 className="text-xl font-black mb-4 text-slate-100">{storeName}</h3>
        <div className="flex items-center justify-center p-4 bg-[#020617] rounded-xl mb-4 border border-slate-800">
          <img
            src={logoUrl}
            alt={storeName}
            className="max-h-72 object-contain rounded-lg shadow-sm"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1519676867240-f03562e64548?auto=format&fit=crop&w=300&q=80';
            }}
          />
        </div>
        <button
          onClick={onClose}
          className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl transition shadow-lg shadow-amber-500/20"
        >
          إغلاق المعاينة
        </button>
      </div>
    </div>
  );
};
