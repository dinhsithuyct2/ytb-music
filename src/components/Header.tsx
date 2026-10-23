import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  LogOut,
  RefreshCw,
  Library,
  CheckCircle2,
  X,
  Smartphone,
  Download,
  Share,
} from 'lucide-react';
import { ViewType, UserProfile } from '../types/music';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { IOSInstallGuideModal } from './IOSInstallGuideModal';
import { Youtube } from 'lucide-react';

interface HeaderProps {
  currentView: ViewType;
  setCurrentView: (view: ViewType) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onSearchSubmit: (q: string) => void;
  user: UserProfile | null;
  onLogin: () => void;
  onLogout: () => void;
  onRefreshYouTube: () => void;
  onOpenYouTubeSync?: () => void;
  isSyncing: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  setCurrentView,
  searchQuery,
  setSearchQuery,
  onSearchSubmit,
  user,
  onLogin,
  onLogout,
  onRefreshYouTube,
  onOpenYouTubeSync,
  isSyncing,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);

  const { isInstallable, isStandalone, isIOS, install } = usePWAInstall();
  const menuRef = useRef<HTMLDivElement>(null);
  const mobileInputRef = useRef<HTMLInputElement>(null);

  // Close profile dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSearchSubmit(searchQuery);
    }
  };

  const handleInstallClick = () => {
    if (isInstallable) {
      install();
    } else {
      setShowIOSModal(true);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#030303]/95 backdrop-blur-xl border-b border-[#212121] px-3 sm:px-4 md:px-6 pt-[env(safe-area-inset-top,0px)] transition-all select-none">
        <div className="h-14 md:h-16 flex items-center justify-between gap-2 sm:gap-4">
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-3 sm:gap-6 shrink-0">
            <button
              onClick={() => {
                setCurrentView('home');
                setIsMobileSearchOpen(false);
              }}
              className="flex items-center gap-2 group cursor-pointer focus:outline-none"
            >
              {/* Official YouTube Music Red Play Icon */}
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#FF0000] flex items-center justify-center text-white shadow-md shadow-[#ff0000]/20 group-hover:scale-105 transition-transform shrink-0">
                <svg
                  className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current ml-0.5"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <polygon points="8,5 19,12 8,19" />
                </svg>
              </div>
              <div className="flex items-baseline tracking-tight">
                <span className="text-base sm:text-lg font-bold text-white tracking-tighter">YouTube</span>
                <span className="text-base sm:text-lg font-normal text-white/90 ml-1">Music</span>
              </div>
            </button>

            {/* Desktop Navigation tabs */}
            <nav className="hidden md:flex items-center gap-1">
              <button
                onClick={() => setCurrentView('home')}
                className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors cursor-pointer ${
                  currentView === 'home'
                    ? 'bg-white text-black font-semibold'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                Trang chủ
              </button>
              <button
                onClick={() => setCurrentView('explore')}
                className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors cursor-pointer ${
                  currentView === 'explore'
                    ? 'bg-white text-black font-semibold'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                Khám phá
              </button>
              <button
                onClick={() => setCurrentView('library')}
                className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors cursor-pointer ${
                  currentView === 'library'
                    ? 'bg-white text-black font-semibold'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                Thư viện
              </button>
            </nav>
          </div>

          {/* Desktop Search Bar (hidden on mobile, expandable on click) */}
          <div className="hidden sm:flex flex-1 max-w-xl mx-2">
            <div
              className={`relative flex items-center w-full h-9 md:h-10 px-3 rounded-full border transition-all ${
                isFocused
                  ? 'bg-[#181818] border-white/40 shadow-lg shadow-black/50'
                  : 'bg-[#181818]/80 border-white/10 hover:border-white/20'
              }`}
            >
              <Search className="w-4 h-4 text-white/50 shrink-0 mr-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                onKeyDown={handleKeyDown}
                placeholder="Tìm bài hát, nghệ sĩ, playlist..."
                className="w-full bg-transparent text-sm text-white placeholder-white/40 focus:outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    if (currentView === 'search') setCurrentView('home');
                  }}
                  className="text-white/40 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Right controls: Mobile search button, PWA Install button & Google Auth */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            {/* Mobile search toggle */}
            <button
              onClick={() => {
                setIsMobileSearchOpen(!isMobileSearchOpen);
                if (!isMobileSearchOpen) {
                  setTimeout(() => mobileInputRef.current?.focus(), 100);
                }
              }}
              className="sm:hidden p-2 rounded-full text-white/80 active:bg-white/10 transition-colors"
              aria-label="Tìm kiếm"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Install as Native App Button (Shows when not running in standalone mode) */}
            {!isStandalone && (
              <button
                onClick={handleInstallClick}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full bg-red-600/20 hover:bg-red-600/30 border border-red-500/40 text-red-400 text-xs font-semibold transition-all active:scale-95 cursor-pointer shadow-sm"
                title="Cài đặt YouTube Music để chạy toàn màn hình"
              >
                <Smartphone className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden xs:inline">Cài App</span>
                <span className="xs:hidden">App</span>
              </button>
            )}

            {user ? (
              /* Logged In User Avatar & Dropdown */
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="flex items-center gap-2 p-1 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
                >
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || 'Tài khoản'}
                      className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-white/20 object-cover"
                    />
                  ) : (
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-linear-to-tr from-red-600 to-amber-600 flex items-center justify-center text-xs font-bold text-white">
                      {user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
                    </div>
                  )}
                </button>

                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-[#212121] border border-[#383838] shadow-2xl p-3 z-50 text-white animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center gap-3 p-2 border-b border-[#333333] pb-3">
                      {user.photoURL ? (
                        <img
                          src={user.photoURL}
                          alt={user.displayName || ''}
                          className="w-10 h-10 rounded-full border border-white/20"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center font-bold">
                          {user.displayName?.charAt(0) || 'U'}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold truncate">{user.displayName || 'Người dùng Google'}</p>
                        <p className="text-xs text-white/50 truncate">{user.email}</p>
                        <div className="flex items-center gap-1 mt-1 text-[11px] text-emerald-400">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Đã kết nối tài khoản Google</span>
                        </div>
                      </div>
                    </div>

                    <div className="py-2 space-y-1">
                      {!isStandalone && (
                        <button
                          onClick={() => {
                            setIsMenuOpen(false);
                            handleInstallClick();
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
                        >
                          <Smartphone className="w-4 h-4" />
                          <span>Thêm vào Màn hình chính (PWA)</span>
                        </button>
                      )}

                      {onOpenYouTubeSync && (
                        <button
                          onClick={() => {
                            setIsMenuOpen(false);
                            onOpenYouTubeSync();
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-colors cursor-pointer"
                        >
                          <Youtube className="w-4 h-4 fill-current text-red-500" />
                          <span>Đồng bộ từ YouTube</span>
                        </button>
                      )}

                      <button
                        onClick={() => {
                          onRefreshYouTube();
                          setIsMenuOpen(false);
                        }}
                        disabled={isSyncing}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
                      >
                        <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin text-red-500' : ''}`} />
                        <span>{isSyncing ? 'Đang đồng bộ...' : 'Đồng bộ Cloud Firestore'}</span>
                      </button>

                      <button
                        onClick={() => {
                          setCurrentView('library');
                          setIsMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
                      >
                        <Library className="w-4 h-4" />
                        <span>Quản lý thư viện bài hát</span>
                      </button>
                    </div>

                    <div className="border-t border-[#333333] pt-2">
                      <button
                        onClick={() => {
                          onLogout();
                          setIsMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-colors cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Đăng xuất Google</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Google Sign-In Button */
              <button
                onClick={onLogin}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white text-black hover:bg-white/90 text-xs sm:text-sm font-medium transition-all shadow-sm cursor-pointer active:scale-95"
              >
                <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 48 48">
                  <path
                    fill="#EA4335"
                    d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                  />
                  <path
                    fill="#4285F4"
                    d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                  />
                  <path
                    fill="#34A853"
                    d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                  />
                </svg>
                <span className="hidden sm:inline">Đăng nhập</span>
                <span className="sm:hidden font-medium">Vào</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Expandable Search Bar */}
        {isMobileSearchOpen && (
          <div className="sm:hidden pb-3 pt-1 animate-in slide-in-from-top-2 duration-200">
            <div className="flex items-center w-full h-10 px-3 rounded-full bg-[#1e1e1e] border border-white/20">
              <Search className="w-4 h-4 text-white/50 shrink-0 mr-2.5" />
              <input
                ref={mobileInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    onSearchSubmit(searchQuery);
                    setIsMobileSearchOpen(false);
                  }
                }}
                placeholder="Tìm bài hát, nghệ sĩ..."
                className="w-full bg-transparent text-sm text-white placeholder-white/40 focus:outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-white/40 p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* iOS Safari Add to Home Screen Instructions Modal */}
      <IOSInstallGuideModal
        isOpen={showIOSModal}
        onClose={() => setShowIOSModal(false)}
      />
    </>
  );
};
