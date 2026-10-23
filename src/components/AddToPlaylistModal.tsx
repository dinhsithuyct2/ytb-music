import React, { useState } from 'react';
import { X, Plus, Check, ListMusic, Music2 } from 'lucide-react';
import { Track } from '../types/music';
import { usePlayer } from '../context/PlayerContext';

interface AddToPlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  track: Track | null;
}

export const AddToPlaylistModal: React.FC<AddToPlaylistModalProps> = ({
  isOpen,
  onClose,
  track,
}) => {
  const { userPlaylists, addTrackToPlaylist, createPlaylist, user } = usePlayer();
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [addedPlaylists, setAddedPlaylists] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !track) return null;

  const handleAddToPlaylist = async (playlistId: string) => {
    try {
      await addTrackToPlaylist(playlistId, track);
      setAddedPlaylists((prev) => [...prev, playlistId]);
      setTimeout(() => {
        onClose();
      }, 700);
    } catch (err) {
      console.error('Lỗi khi thêm bài hát vào danh sách phát:', err);
    }
  };

  const handleCreateAndAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const created = await createPlaylist(newTitle.trim());
      await addTrackToPlaylist(created.id, track);
      setNewTitle('');
      setIsCreatingNew(false);
      setAddedPlaylists((prev) => [...prev, created.id]);
      setTimeout(() => {
        onClose();
      }, 700);
    } catch (err) {
      console.error('Lỗi tạo và thêm vào danh sách phát:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-md rounded-3xl bg-[#1c1c1c] border border-white/10 p-5 sm:p-6 shadow-2xl relative text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <ListMusic className="w-5 h-5 text-red-500" />
            <h3 className="text-base sm:text-lg font-bold">Thêm vào danh sách phát</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Track Preview */}
        <div className="flex items-center gap-3 my-4 p-3 rounded-2xl bg-white/5 border border-white/5">
          <img
            src={track.thumbnail}
            alt={track.title}
            className="w-12 h-12 rounded-xl object-cover shrink-0 border border-white/10"
          />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold truncate text-white">{track.title}</p>
            <p className="text-xs text-white/60 truncate mt-0.5">
              {track.artist || track.channelTitle}
            </p>
          </div>
        </div>

        {/* New Playlist Form or Toggle Button */}
        {isCreatingNew ? (
          <form onSubmit={handleCreateAndAdd} className="mb-4 space-y-3">
            <input
              type="text"
              autoFocus
              placeholder="Tên danh sách phát mới..."
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-[#2a2a2a] border border-white/15 text-sm text-white placeholder-white/40 focus:outline-none focus:border-red-500"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsCreatingNew(false);
                  setNewTitle('');
                }}
                className="px-3.5 py-1.5 rounded-full text-xs font-semibold text-white/60 hover:text-white cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={!newTitle.trim() || isSubmitting}
                className="px-4 py-1.5 rounded-full bg-white text-black text-xs font-semibold hover:bg-white/90 disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? 'Đang tạo...' : 'Tạo và thêm'}
              </button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setIsCreatingNew(true)}
            className="w-full mb-3 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold border border-white/10 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4 text-red-500" />
            <span>Tạo danh sách phát mới</span>
          </button>
        )}

        {/* Existing Playlists List */}
        <div className="max-h-60 overflow-y-auto space-y-1 custom-scrollbar pr-1">
          {userPlaylists.length > 0 ? (
            userPlaylists.map((pl) => {
              const isAdded =
                addedPlaylists.includes(pl.id) ||
                pl.tracks?.some((t) => (t.id || t.videoId) === (track.id || track.videoId));

              return (
                <div
                  key={pl.id}
                  onClick={() => !isAdded && handleAddToPlaylist(pl.id)}
                  className={`flex items-center justify-between p-2.5 rounded-xl transition-colors cursor-pointer ${
                    isAdded ? 'bg-red-500/10 text-red-400' : 'hover:bg-white/5 text-white/80'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={pl.thumbnail}
                      alt={pl.title}
                      className="w-9 h-9 rounded-lg object-cover shrink-0 border border-white/10"
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate text-white">{pl.title}</p>
                      <p className="text-[11px] text-white/50">{pl.itemCount || 0} bài hát</p>
                    </div>
                  </div>

                  <div className="shrink-0 pl-2">
                    {isAdded ? (
                      <span className="flex items-center gap-1 text-xs text-red-400 font-semibold">
                        <Check className="w-4 h-4" />
                        <span>Đã có</span>
                      </span>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToPlaylist(pl.id);
                        }}
                        className="px-3 py-1 rounded-full bg-white/10 hover:bg-white text-xs text-white hover:text-black font-medium transition-colors"
                      >
                        Thêm
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-6 text-center text-white/50 text-xs">
              <Music2 className="w-8 h-8 text-white/20 mx-auto mb-2" />
              Bạn chưa có danh sách phát nào. Hãy nhấn "Tạo danh sách phát mới" ở trên để lưu bài hát này.
            </div>
          )}
        </div>

        {/* Firestore Sync Note */}
        {user ? (
          <p className="text-[11px] text-white/40 text-center mt-4">
            Đồng bộ theo thời gian thực với Cloud Firestore cho tài khoản {user.email}
          </p>
        ) : (
          <p className="text-[11px] text-white/40 text-center mt-4">
            Danh sách phát được lưu tạm trên thiết bị. Đăng nhập Google để đồng bộ vĩnh viễn trên Cloud Firestore.
          </p>
        )}
      </div>
    </div>
  );
};
