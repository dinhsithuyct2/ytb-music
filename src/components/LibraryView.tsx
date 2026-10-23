import React, { useState } from 'react';
import {
  Library,
  Heart,
  ListMusic,
  RefreshCw,
  Plus,
  Play,
  LogIn,
  Search,
  ExternalLink,
  Music2,
  Trash2,
  CloudCheck,
  CheckCircle2,
  Youtube,
  Sparkles,
  FolderSync,
} from 'lucide-react';
import { Playlist, Track, UserProfile } from '../types/music';
import { usePlayer } from '../context/PlayerContext';
import { YouTubeSyncModal } from './YouTubeSyncModal';

interface LibraryViewProps {
  user: UserProfile | null;
  userPlaylists: Playlist[];
  likedTracks: Track[];
  onSelectPlaylist: (playlist: Playlist) => void;
  onSelectLikedSongs: () => void;
  onLogin: () => void;
  onRefresh: () => void;
  isSyncing: boolean;
}

export const LibraryView: React.FC<LibraryViewProps> = ({
  user,
  userPlaylists,
  likedTracks,
  onSelectPlaylist,
  onSelectLikedSongs,
  onLogin,
  onRefresh,
  isSyncing,
}) => {
  const { playTrack, createPlaylist, deletePlaylist } = usePlayer();
  const [filterQuery, setFilterQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'playlists' | 'liked'>('playlists');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const filteredPlaylists = userPlaylists.filter((p) =>
    p.title.toLowerCase().includes(filterQuery.toLowerCase())
  );

  const handleCreatePlaylist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || isCreating) return;

    setIsCreating(true);
    try {
      const created = await createPlaylist(newTitle.trim(), newDesc.trim());
      setNewTitle('');
      setNewDesc('');
      setShowCreateModal(false);
      onSelectPlaylist(created);
    } catch (err) {
      console.error('Error creating playlist:', err);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeletePlaylist = async (e: React.MouseEvent, playlistId: string) => {
    e.stopPropagation();
    if (window.confirm('Bạn có chắc chắn muốn xóa danh sách phát này không?')) {
      await deletePlaylist(playlistId);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto px-3.5 sm:px-6 md:px-8 py-3.5 sm:py-5 space-y-6 sm:space-y-8 custom-scrollbar pb-36 sm:pb-32 md:pb-28">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-white/50 text-xs font-semibold uppercase tracking-wider mb-1">
            <Library className="w-4 h-4 text-red-500" />
            <span>Thư viện cá nhân</span>
            {user && (
              <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-normal lowercase tracking-normal">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>đồng bộ Firestore</span>
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Thư viện âm nhạc của bạn
          </h1>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          <button
            onClick={() => setShowSyncModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-linear-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-semibold shadow-lg shadow-red-600/20 transition-all cursor-pointer hover:scale-105 active:scale-95"
            title="Đồng bộ playlist và bài hát từ tài khoản hoặc kênh YouTube"
          >
            <Youtube className="w-4 h-4 fill-current shrink-0" />
            <span>Đồng bộ YouTube</span>
          </button>

          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#212121] hover:bg-[#2c2c2c] text-white text-xs font-semibold border border-white/10 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-red-500" />
            <span>Tạo danh sách phát</span>
          </button>

          {user && (
            <button
              onClick={onRefresh}
              disabled={isSyncing}
              className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-[#212121] hover:bg-[#2c2c2c] text-white/80 hover:text-white text-xs font-semibold border border-white/10 transition-colors cursor-pointer"
              title="Làm mới dữ liệu từ Cloud Firestore"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-red-500' : ''}`} />
              <span className="hidden sm:inline">{isSyncing ? 'Đang tải...' : 'Làm mới'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Featured YouTube Sync banner for logged-in users */}
      {user && (
        <div className="p-4 sm:p-5 rounded-2xl bg-linear-to-r from-[#220d11] via-[#1a1420] to-[#141414] border border-red-500/25 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-red-600 flex items-center justify-center text-white shrink-0 shadow-md shadow-red-600/30">
              <Youtube className="w-6 h-6 fill-current" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Đồng bộ từ tài khoản YouTube của bạn</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-red-500/20 text-red-400">
                  Khuyên dùng
                </span>
              </h3>
              <p className="text-xs text-white/60 mt-0.5">
                Nhập danh sách phát cá nhân, bài hát đã thích (Liked Videos) từ YouTube vào thư viện để thưởng thức mọi lúc.
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowSyncModal(true)}
            className="self-start sm:self-auto px-4 py-2 rounded-full bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shrink-0 shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center gap-2"
          >
            <FolderSync className="w-3.5 h-3.5" />
            <span>Mở bảng đồng bộ</span>
          </button>
        </div>
      )}

      {/* When user is NOT logged in: Prominent Google Sign-in card */}
      {!user && (
        <div className="p-6 sm:p-8 rounded-3xl bg-linear-to-b from-[#1a1420] to-[#121212] border border-[#2e2638] text-center max-w-2xl mx-auto my-4 shadow-2xl">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-3xl bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-500 mx-auto mb-4">
            <Music2 className="w-7 h-7 sm:w-8 sm:h-8" />
          </div>
          <h2 className="text-lg sm:text-2xl font-bold text-white mb-2">
            Đăng nhập để đồng bộ qua Cloud Firestore
          </h2>
          <p className="text-xs sm:text-sm text-white/60 max-w-md mx-auto mb-6">
            Đăng nhập tài khoản Google an toàn để lưu giữ vĩnh viễn các danh sách phát đã tạo, bài hát yêu thích và lịch sử nghe nhạc trên mọi thiết bị.
          </p>

          <button
            onClick={onLogin}
            className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white text-black hover:bg-white/90 font-semibold text-sm shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            {/* Google Logo SVG */}
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 48 48">
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
            <span>Đăng nhập với Google</span>
          </button>
        </div>
      )}

      {/* Sub tabs and search within library */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#212121] pb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('playlists')}
            className={`px-4 py-2 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'playlists'
                ? 'bg-white text-black'
                : 'bg-[#212121] text-white/70 hover:text-white'
            }`}
          >
            Danh sách phát ({userPlaylists.length})
          </button>
          <button
            onClick={() => setActiveTab('liked')}
            className={`px-4 py-2 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'liked'
                ? 'bg-white text-black'
                : 'bg-[#212121] text-white/70 hover:text-white'
            }`}
          >
            Bài hát đã thích ({likedTracks.length})
          </button>
        </div>

        {/* Quick search inside library */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            placeholder="Lọc trong thư viện..."
            className="w-full pl-8 pr-3 py-1.5 rounded-full bg-[#181818] border border-white/10 text-xs text-white placeholder-white/40 focus:outline-none focus:border-white/30"
          />
        </div>
      </div>

      {/* Tab 1: User's Playlists */}
      {activeTab === 'playlists' && (
        <div>
          {/* Liked songs quick banner card */}
          <div
            onClick={onSelectLikedSongs}
            className="mb-6 p-4 rounded-2xl bg-linear-to-r from-red-900/40 via-purple-900/30 to-[#181818] border border-red-500/20 hover:border-red-500/40 transition-all cursor-pointer flex items-center justify-between group"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-linear-to-br from-indigo-500 via-red-500 to-amber-500 flex items-center justify-center shrink-0 shadow-lg">
                <Heart className="w-6 h-6 text-white fill-white" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white group-hover:text-red-400 transition-colors">
                  Bài hát đã thích
                </h3>
                <p className="text-xs text-white/60 mt-0.5">
                  {likedTracks.length} bài hát đã lưu trong tài khoản của bạn
                </p>
              </div>
            </div>

            <div className="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md">
              <Play className="w-5 h-5 fill-current ml-0.5" />
            </div>
          </div>

          {filteredPlaylists.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {filteredPlaylists.map((playlist) => (
                <div
                  key={playlist.id}
                  onClick={() => onSelectPlaylist(playlist)}
                  className="group relative flex flex-col p-3 rounded-2xl bg-[#161616]/70 hover:bg-[#222] border border-white/5 hover:border-white/15 transition-all cursor-pointer"
                >
                  <div className="relative aspect-square w-full rounded-xl overflow-hidden mb-3 border border-white/10 shadow-md">
                    <img
                      src={playlist.thumbnail}
                      alt={playlist.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <Play className="w-5 h-5 fill-current ml-0.5" />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start justify-between gap-1">
                    <h4 className="text-sm font-semibold text-white truncate flex-1">{playlist.title}</h4>
                    {playlist.isOwner && (
                      <button
                        onClick={(e) => handleDeletePlaylist(e, playlist.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-500/20 text-white/40 hover:text-red-400 transition-opacity"
                        title="Xóa danh sách phát"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-white/50 truncate mt-1">
                    {playlist.itemCount || (playlist.tracks ? playlist.tracks.length : 0)} bài hát
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center bg-[#161616] rounded-2xl border border-white/5 space-y-4 max-w-lg mx-auto">
              <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/50 mx-auto">
                <ListMusic className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">
                  {filterQuery
                    ? 'Không tìm thấy danh sách phát phù hợp'
                    : 'Thư viện chưa có danh sách phát nào'}
                </p>
                <p className="text-xs text-white/50 mt-1">
                  Đồng bộ ngay từ tài khoản YouTube hoặc tạo danh sách bài hát yêu thích đầu tiên của bạn.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
                <button
                  onClick={() => setShowSyncModal(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-md transition-colors cursor-pointer"
                >
                  <Youtube className="w-3.5 h-3.5 fill-current" />
                  <span>Đồng bộ từ YouTube</span>
                </button>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-red-500" />
                  <span>Tạo danh sách mới</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Liked Songs list */}
      {activeTab === 'liked' && (
        <div className="space-y-2">
          {likedTracks.length > 0 ? (
            likedTracks.map((track, idx) => (
              <div
                key={`${track.id || track.videoId}-${idx}`}
                onClick={() => playTrack(track, likedTracks, idx)}
                className="flex items-center gap-4 p-3 rounded-xl bg-[#161616] hover:bg-[#222] border border-white/5 hover:border-white/10 transition-colors cursor-pointer group"
              >
                <span className="w-6 text-center text-xs font-mono text-white/40">{idx + 1}</span>
                <img
                  src={track.thumbnail}
                  alt={track.title}
                  className="w-11 h-11 rounded-lg object-cover border border-white/10 shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-white truncate group-hover:text-red-400">
                    {track.title}
                  </p>
                  <p className="text-xs text-white/50 truncate">
                    {track.artist || track.channelTitle}
                  </p>
                </div>
                <span className="text-xs font-mono text-white/40">{track.duration || '3:30'}</span>
              </div>
            ))
          ) : (
            <div className="p-8 text-center bg-[#161616] rounded-2xl border border-white/5">
              <p className="text-sm text-white/60">
                Chưa có bài hát đã thích. Bấm vào biểu tượng trái tim khi đang nghe bài hát bất kỳ để lưu lại vào đây.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Modal Tạo danh sách phát mới */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-3xl bg-[#1c1c1c] border border-white/10 p-6 shadow-2xl relative text-white">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5 text-red-500" />
              <span>Tạo danh sách phát mới</span>
            </h3>
            <form onSubmit={handleCreatePlaylist} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1.5">
                  Tên danh sách phát *
                </label>
                <input
                  type="text"
                  autoFocus
                  required
                  placeholder="Ví dụ: Nhạc chill đêm khuya..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#2a2a2a] border border-white/15 text-sm text-white placeholder-white/40 focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1.5">
                  Mô tả (tùy chọn)
                </label>
                <textarea
                  rows={3}
                  placeholder="Mô tả về phong cách âm nhạc hoặc danh sách bài hát..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#2a2a2a] border border-white/15 text-sm text-white placeholder-white/40 focus:outline-none focus:border-red-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-full text-xs font-semibold text-white/70 hover:text-white cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={!newTitle.trim() || isCreating}
                  className="px-5 py-2 rounded-full bg-red-600 hover:bg-red-700 text-white text-xs font-semibold disabled:opacity-50 transition-colors cursor-pointer"
                >
                  {isCreating ? 'Đang tạo...' : 'Tạo danh sách'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Đồng bộ YouTube */}
      <YouTubeSyncModal
        isOpen={showSyncModal}
        onClose={() => setShowSyncModal(false)}
        user={user}
        onLogin={onLogin}
        onPlaylistImported={(imported) => {
          onSelectPlaylist(imported);
        }}
      />
    </div>
  );
};
