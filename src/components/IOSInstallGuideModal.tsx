import React from 'react';
import { X, Share, PlusSquare, Smartphone, Check, Sparkles } from 'lucide-react';

interface IOSInstallGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const IOSInstallGuideModal: React.FC<IOSInstallGuideModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200">
      <div
        className="w-full sm:max-w-md bg-[#181818] border-t sm:border border-white/15 rounded-t-3xl sm:rounded-2xl p-6 shadow-2xl text-white pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))] sm:pb-6 animate-in slide-in-from-bottom duration-300 relative"
      >
        {/* Pull handle indicator on mobile */}
        <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-4 sm:hidden" />

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center shadow-lg shadow-red-600/30">
              <svg className="w-5 h-5 fill-white ml-0.5" viewBox="0 0 24 24">
                <polygon points="8,5 19,12 8,19" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-white leading-tight">Cài đặt YouTube Music</h3>
              <p className="text-xs text-white/50">Mở toàn màn hình như App thật</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Benefits banner */}
        <div className="p-3 mb-5 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-white/80 space-y-1">
          <div className="flex items-center gap-2 font-medium text-red-400">
            <Sparkles className="w-4 h-4 shrink-0" />
            <span>Trải nghiệm Native App trên iPhone:</span>
          </div>
          <p className="text-white/70 pl-6">
            • Ẩn thanh địa chỉ và công cụ của Safari.<br />
            • Toàn màn hình viền đen cao cấp, chạm lướt mượt mà.<br />
            • Phát nhạc dưới nền mượt mà khi khoá màn hình hoặc chuyển ứng dụng.
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-3.5 text-sm">
          {/* Step 1 */}
          <div className="flex items-start gap-3.5 p-3 rounded-xl bg-white/5 border border-white/5">
            <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
              1
            </div>
            <div className="flex-1">
              <p className="font-medium text-white flex items-center gap-1.5 flex-wrap">
                Nhấn vào nút <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-white/10 rounded font-semibold text-white"><Share className="w-3.5 h-3.5 text-blue-400" /> Chia sẻ</span>
              </p>
              <p className="text-xs text-white/50 mt-0.5">
                Nằm ở thanh công cụ phía dưới cùng trình duyệt Safari của iPhone.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex items-start gap-3.5 p-3 rounded-xl bg-white/5 border border-white/5">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
              2
            </div>
            <div className="flex-1">
              <p className="font-medium text-white flex items-center gap-1.5 flex-wrap">
                Chọn <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-white/10 rounded font-semibold text-white"><PlusSquare className="w-3.5 h-3.5 text-emerald-400" /> Thêm vào MH chính</span>
              </p>
              <p className="text-xs text-white/50 mt-0.5">
                (Add to Home Screen) trong danh sách tác vụ mở ra.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex items-start gap-3.5 p-3 rounded-xl bg-white/5 border border-white/5">
            <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
              3
            </div>
            <div className="flex-1">
              <p className="font-medium text-white">
                Bấm <span className="font-bold text-white underline">Thêm</span> (Add) ở góc trên bên phải
              </p>
              <p className="text-xs text-white/50 mt-0.5">
                Biểu tượng YouTube Music sẽ xuất hiện trên màn hình chính iPhone của bạn.
              </p>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-5">
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-white text-black font-semibold text-sm hover:bg-white/90 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg"
          >
            <Check className="w-4 h-4" />
            <span>Đã hiểu, tôi sẽ thực hiện</span>
          </button>
        </div>
      </div>
    </div>
  );
};
