import React from 'react';
import { Home, Compass, Library, Search } from 'lucide-react';
import { ViewType } from '../types/music';

interface MobileBottomNavProps {
  currentView: ViewType;
  setCurrentView: (view: ViewType) => void;
  onOpenSearch?: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentView,
  setCurrentView,
  onOpenSearch,
}) => {
  const navItems = [
    {
      id: 'home' as ViewType,
      label: 'Trang chủ',
      icon: Home,
    },
    {
      id: 'explore' as ViewType,
      label: 'Khám phá',
      icon: Compass,
    },
    {
      id: 'library' as ViewType,
      label: 'Thư viện',
      icon: Library,
    },
    {
      id: 'search' as ViewType,
      label: 'Tìm kiếm',
      icon: Search,
      action: onOpenSearch,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#121212] border-t border-[#262626] md:hidden select-none shadow-2xl h-[52px]">
      <div className="flex items-center justify-around h-full px-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;

          return (
            <button
              key={item.id}
              onClick={() => {
                if (item.action) {
                  item.action();
                } else {
                  setCurrentView(item.id);
                }
              }}
              className={`flex-1 flex flex-col items-center justify-center py-1 gap-1 text-[10px] font-medium transition-all touch-press ${
                isActive ? 'text-white' : 'text-white/50 hover:text-white/80'
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform ${
                    isActive ? 'scale-110 text-white fill-white/20' : ''
                  }`}
                  strokeWidth={isActive ? 2.3 : 1.8}
                />
                {isActive && (
                  <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-red-600 rounded-full" />
                )}
              </div>
              <span className={`tracking-tight ${isActive ? 'font-semibold text-white' : ''}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
