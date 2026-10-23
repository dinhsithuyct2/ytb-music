import React from 'react';
import {
  Home,
  Compass,
  Library,
  Heart,
  ListMusic,
  Plus,
  RefreshCw,
  Sparkles,
  Volume2,
  ExternalLink,
  Music2,
  Youtube,
} from 'lucide-react';
import { ViewType, Playlist, UserProfile } from '../types/music';

interface SidebarProps {
  currentView: ViewType;
  setCurrentView: (view: ViewType) => void;
  userPlaylists: Playlist[];
  curatedPlaylists: Playlist[];
  selectedPlaylistId: string | null;
  onSelectPlaylist: (playlist: Playlist) => void;
  onSelectLikedSongs: () => void;
  user: UserProfile | null;
  onLogin: () => void;
  onRefreshPlaylists: () => void;
  onOpenYouTubeSync?: () => void;
  isSyncing: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  setCurrentView,
  userPlaylists,
  curatedPlaylists,
  selectedPlaylistId,
  onSelectPlaylist,
  onSelectLikedSongs,
  user,
  onLogin,
  onRefreshPlaylists,
  onOpenYouTubeSync,
  isSyncing,
}) => {
  return (
    <aside className="w-64 shrink-0 bg-[#030303] border-r border-[#212121] hidden md:flex flex-col h-[calc(100vh-4rem-4.5rem)] select-none">
      {/* Primary Navigation Links */}
      <div className="p-3 space-y-1">
        <button
          onClick={() => setCurrentView('home')}
          className={`w-full flex items-center gap-4 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
            currentView === 'home'
              ? 'bg-[#212121] text-white font-semibold'
              : 'text-white/70 hover:text-white hover:bg-white/5'
          }`}
        >
          <Home className={`w-5 h-5 ${currentView === 'home' ? 'text-red-500' : ''}`} />
          <span>Trang chủ</span>
        </button>

        <button
          onClick={() => setCurrentView('explore')}
          className={`w-full flex items-center gap-4 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
            currentView === 'explore'
              ? 'bg-[#212121] text-white font-semibold'
              : 'text-white/70 hover:text-white hover:bg-white/5'
          }`}
        >
          <Compass className={`w-5 h-5 ${currentView === 'explore' ? 'text-red-500' : ''}`} />
          <span>Khám phá</span>
        </button>

        <button
          onClick={() => setCurrentView('library')}
          className={`w-full flex items-center gap-4 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
            currentView === 'library'
              ? 'bg-[#212121] text-white font-semibold'
              : 'text-white/70 hover:text-white hover:bg-white/5'
          }`}
        >
          <Library className={`w-5 h-5 ${currentView === 'library' ? 'text-red-500' : ''}`} />
          <span>Thư viện</span>
        </button>
      </div>

      <div className="mx-4 my-1 border-t border-[#212121]" />

      {/* Liked songs quick entry */}
      <div className="p-3 pt-2">
        <button
          onClick={onSelectLikedSongs}
          className={`w-full flex items-center gap-3.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
            selectedPlaylistId === 'liked_videos' && currentView === 'playlist'
              ? 'bg-[#212121] text-white font-semibold'
              : 'text-white/80 hover:text-white hover:bg-white/5'
          }`}
        >
          <div className="w-8 h-8 rounded-lg bg-linear-to-br from-indigo-600 via-red-500 to-amber-500 flex items-center justify-center shrink-0 shadow-sm">
            <Heart className="w-4 h-4 text-white fill-white" />
          </div>
          <div className="text-left min-w-0">
            <p className="text-sm font-medium truncate">Bài hát đã thích</p>
            <p className="text-[11px] text-white/50">Tự động đồng bộ</p>
          </div>
        </button>
      </div>

      {/* Playlist Section Header with Sync Button */}
      <div className="px-5 py-2 flex items-center justify-between text-xs font-semibold text-white/50 tracking-wider uppercase">
        <span>{user ? 'Danh sách phát của bạn' : 'Danh sách phát'}</span>
        <div className="flex items-center gap-1.5">
          {onOpenYouTubeSync && (
            <button
              onClick={onOpenYouTubeSync}
              title="Đồng bộ từ tài khoản hoặc kênh YouTube"
              className="text-red-500 hover:text-red-400 p-1 rounded-md hover:bg-white/5 transition-colors cursor-pointer"
            >
              <Youtube className="w-3.5 h-3.5 fill-current" />
            </button>
          )}
          {user ? (
            <button
              onClick={onRefreshPlaylists}
              disabled={isSyncing}
              title="Đồng bộ lại danh sách phát từ Cloud Firestore"
              className="hover:text-white p-1 rounded-md transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-red-500' : ''}`} />
            </button>
          ) : (
            <button
              onClick={onLogin}
              title="Đăng nhập Google để lưu trữ danh sách phát"
              className="hover:text-white text-[11px] text-red-400 capitalize cursor-pointer"
            >
              + Đăng nhập
            </button>
          )}
        </div>
      </div>

      {/* Scrollable Playlist List */}
      <div className="flex-1 overflow-y-auto px-3 space-y-0.5 custom-scrollbar pb-4">
        {user && userPlaylists.length > 0 ? (
          userPlaylists.map((playlist) => (
            <button
              key={playlist.id}
              onClick={() => onSelectPlaylist(playlist)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left transition-colors cursor-pointer group ${
                selectedPlaylistId === playlist.id && currentView === 'playlist'
                  ? 'bg-[#212121] text-white font-semibold'
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}
            >
              <img
                src={playlist.thumbnail}
                alt={playlist.title}
                className="w-8 h-8 rounded-md object-cover shrink-0 border border-white/10"
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm truncate font-medium group-hover:text-white">
                  {playlist.title}
                </p>
                <p className="text-[11px] text-white/40 truncate">
                  {playlist.itemCount} bài hát
                </p>
              </div>
            </button>
          ))
        ) : user && !isSyncing ? (
          <div className="px-3 py-4 text-center space-y-2">
            <p className="text-xs text-white/40">Chưa có playlist cá nhân nào trong thư viện.</p>
            {onOpenYouTubeSync && (
              <button
                onClick={onOpenYouTubeSync}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 text-xs font-semibold transition-colors cursor-pointer"
              >
                <Youtube className="w-3.5 h-3.5 fill-current" />
                <span>Đồng bộ từ YouTube</span>
              </button>
            )}
          </div>
        ) : null}

        {/* Curated featured playlists */}
        <div className="pt-2">
          <p className="px-3 py-1 text-[11px] font-semibold text-white/40 uppercase tracking-wider">
            Gợi ý thịnh hành
          </p>
          {curatedPlaylists.map((playlist) => (
            <button
              key={playlist.id}
              onClick={() => onSelectPlaylist(playlist)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left transition-colors cursor-pointer group ${
                selectedPlaylistId === playlist.id && currentView === 'playlist'
                  ? 'bg-[#212121] text-white font-semibold'
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}
            >
              <img
                src={playlist.thumbnail}
                alt={playlist.title}
                className="w-8 h-8 rounded-md object-cover shrink-0 border border-white/10"
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm truncate font-medium group-hover:text-white">
                  {playlist.title}
                </p>
                <p className="text-[11px] text-white/40 truncate">{playlist.author}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Background Playback Notice Footer */}
      <div className="p-3 m-3 rounded-2xl bg-[#121212] border border-[#272727] text-white/80">
        <div className="flex items-start gap-2.5">
          <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
            <Volume2 className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-white">Hỗ trợ nghe ngầm</p>
            <p className="text-[11px] text-white/60 leading-tight mt-0.5">
              Nhạc vẫn phát mượt mà khi bạn chuyển tab hoặc thu nhỏ cửa sổ trình duyệt.
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};
