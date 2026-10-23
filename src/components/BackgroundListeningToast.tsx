import React, { useState } from 'react';
import { Headphones, CheckCircle2, X } from 'lucide-react';

export const BackgroundListeningToast: React.FC = () => {
  const [isOpen, setIsOpen] = useState(true);

  if (!isOpen) return null;

  return (
    <div className="fixed top-18 right-4 md:right-8 z-40 max-w-sm p-3.5 rounded-2xl bg-[#1a1a1a]/95 backdrop-blur-md border border-emerald-500/30 text-white shadow-2xl animate-in slide-in-from-top-4 duration-300">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
          <Headphones className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0 pr-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Đã kích hoạt nghe nhạc dưới nền</span>
          </div>
          <p className="text-xs text-white/70 mt-1 leading-snug">
            Bạn có thể thoải mái chuyển sang tab khác hoặc thu nhỏ trình duyệt, nhạc vẫn tiếp tục phát liền mạch. Sử dụng phím Media bàn phím để điều khiển.
          </p>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="p-1 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
