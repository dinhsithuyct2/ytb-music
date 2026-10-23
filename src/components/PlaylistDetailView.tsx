import React from 'react';
import {
  Play,
  Shuffle,
  Clock,
  ArrowLeft,
  Heart,
  Plus,
  ListPlus,
  Share2,
  Trash2,
} from 'lucide-react';
import { Playlist, Track } from '../types/music';
import { usePlayer } from '../context/PlayerContext';

interface PlaylistDetailViewProps {
  playlist: Playlist;
  tracks: Track[];
  onBack: () => void;
  isLoading: boolean;
}

export const PlaylistDetailView: React.FC<PlaylistDetailViewProps> = ({
  playlist,
  tracks,
  onBack,
  isLoading,
}) => {
  const {
    playTrack,
    currentTrack,
    addToQueue,
    isLiked: isTrackLiked,
    toggleLike,
    deletePlaylist,
    removeTrackFromPlaylist,
  } = usePlayer();

  const handlePlayAll = () => {
    if (tracks.length > 0) {
      playTrack(tracks[0], tracks, 0);
    }
  };

  const handleShufflePlay = () => {
    if (tracks.length > 0) {
      const randomIndex = Math.floor(Math.random() * tracks.length);
      playTrack(tracks[randomIndex], tracks, randomIndex);
    }
  };

  const handleDeletePlaylist = async () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa danh sách phát này?')) {
      await deletePlaylist(playlist.id);
      onBack();
    }
  };

  const handleRemoveTrack = async (e: React.MouseEvent, trackId: string) => {
    e.stopPropagation();
    await removeTrackFromPlaylist(playlist.id, trackId);
  };

  const isCustomPlaylist = playlist.isOwner && playlist.id !== 'liked_videos';

  return (
    <div className="flex-1 overflow-y-auto px-3.5 sm:px-6 md:px-8 py-3.5 sm:py-5 space-y-6 sm:space-y-8 custom-scrollbar pb-36 sm:pb-32 md:pb-28">
      {/* Top back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-white/70 hover:text-white text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Quay lại</span>
      </button>

      {/* Playlist Hero Banner */}
      <div className="flex flex-col md:flex-row items-center md:items-end gap-6 md:gap-8 bg-linear-to-b from-white/10 to-transparent p-6 rounded-3xl border border-white/5">
        <div className="w-48 h-48 md:w-56 md:h-56 rounded-2xl overflow-hidden shrink-0 shadow-2xl border border-white/10">
          <img
            src={playlist.thumbnail}
            alt={playlist.title}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex-1 min-w-0 text-center md:text-left space-y-2">
          <span className="text-xs uppercase font-bold text-red-500 tracking-wider">
            {playlist.id === 'liked_videos' ? 'Yêu thích' : 'Danh sách phát'}
          </span>
          <h1 className="text-2xl md:text-4xl font-extrabold text-white tracking-tight line-clamp-2">
            {playlist.title}
          </h1>
          {playlist.description && (
            <p className="text-xs md:text-sm text-white/60 line-clamp-2 max-w-2xl">
              {playlist.description}
            </p>
          )}
          <p className="text-xs text-white/50 pt-1">
            {playlist.author} · {tracks.length} bài hát
          </p>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-4">
            <button
              onClick={handlePlayAll}
              disabled={tracks.length === 0}
              className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-white text-black hover:bg-white/90 font-semibold text-sm transition-transform hover:scale-105 active:scale-95 cursor-pointer shadow-lg disabled:opacity-50"
            >
              <Play className="w-4 h-4 fill-current ml-0.5" />
              <span>Phát tất cả</span>
            </button>

            <button
              onClick={handleShufflePlay}
              disabled={tracks.length === 0}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#242424] hover:bg-[#333] text-white font-medium text-sm border border-white/10 transition-colors cursor-pointer disabled:opacity-50"
            >
              <Shuffle className="w-4 h-4 text-white/70" />
              <span>Trộn bài</span>
            </button>

            {isCustomPlaylist && (
              <button
                onClick={handleDeletePlaylist}
                className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-red-600/20 hover:bg-red-600/30 text-red-400 font-medium text-sm border border-red-500/20 transition-colors cursor-pointer"
                title="Xóa danh sách phát này"
              >
                <Trash2 className="w-4 h-4" />
                <span>Xóa playlist</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tracks Table */}
      <div>
        <div className="grid grid-cols-12 gap-4 px-4 py-2 border-b border-white/10 text-xs font-semibold text-white/40 uppercase tracking-wider">
          <span className="col-span-1 text-center">#</span>
          <span className="col-span-7 sm:col-span-6">Tiêu đề bài hát</span>
          <span className="hidden sm:inline sm:col-span-3">Nghệ sĩ / Kênh</span>
          <span className="col-span-4 sm:col-span-2 text-right">
            <Clock className="w-3.5 h-3.5 inline" />
          </span>
        </div>

        {isLoading ? (
          <div className="py-12 text-center text-white/50 text-sm">
            Đang tải danh sách bài hát...
          </div>
        ) : tracks.length > 0 ? (
          <div className="divide-y divide-white/5">
            {tracks.map((track, index) => {
              const trackId = track.id || track.videoId;
              const isCurrent = currentTrack?.videoId === track.videoId;
              const isFav = isTrackLiked(trackId);

              return (
                <div
                  key={`${trackId}-${index}`}
                  className={`grid grid-cols-12 gap-4 items-center px-4 py-3 rounded-xl transition-colors group cursor-pointer ${
                    isCurrent ? 'bg-[#222222]' : 'hover:bg-white/5'
                  }`}
                  onClick={() => playTrack(track, tracks, index)}
                >
                  {/* Number / Play icon on hover */}
                  <div className="col-span-1 text-center flex items-center justify-center">
                    <span
                      className={`text-xs font-mono group-hover:hidden ${
                        isCurrent ? 'text-red-500 font-bold' : 'text-white/40'
                      }`}
                    >
                      {index + 1}
                    </span>
                    <Play className="w-4 h-4 fill-white text-white hidden group-hover:inline ml-0.5" />
                  </div>

                  {/* Title & thumbnail */}
                  <div className="col-span-7 sm:col-span-6 flex items-center gap-3 min-w-0">
                    <img
                      src={track.thumbnail}
                      alt={track.title}
                      className="w-10 h-10 rounded-lg object-cover shrink-0 border border-white/10"
                    />
                    <div className="min-w-0 flex-1">
                      <p
                        className={`text-sm font-medium truncate ${
                          isCurrent ? 'text-red-400 font-bold' : 'text-white'
                        }`}
                      >
                        {track.title}
                      </p>
                      <p className="text-xs text-white/50 truncate sm:hidden">
                        {track.artist || track.channelTitle}
                      </p>
                    </div>
                  </div>

                  {/* Artist */}
                  <div className="hidden sm:block sm:col-span-3 min-w-0">
                    <p className="text-xs text-white/60 truncate">
                      {track.artist || track.channelTitle}
                    </p>
                  </div>

                  {/* Action buttons & Duration */}
                  <div className="col-span-4 sm:col-span-2 flex items-center justify-end gap-2 text-xs font-mono text-white/40">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleLike(track);
                      }}
                      className="p-1 rounded hover:bg-white/10 text-white/50 hover:text-white transition-colors cursor-pointer"
                      title={isFav ? 'Bỏ thích' : 'Thích bài hát'}
                    >
                      <Heart className={`w-4 h-4 ${isFav ? 'text-red-500 fill-red-500' : ''}`} />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        addToQueue(track);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-white/10 text-white/70 hover:text-white transition-opacity cursor-pointer"
                      title="Thêm vào danh sách chờ"
                    >
                      <ListPlus className="w-4 h-4" />
                    </button>

                    {isCustomPlaylist && (
                      <button
                        onClick={(e) => handleRemoveTrack(e, trackId)}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-500/20 text-white/40 hover:text-red-400 transition-opacity cursor-pointer"
                        title="Xóa khỏi danh sách phát"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}

                    <span>{track.duration || '3:30'}</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-12 text-center text-white/50 text-sm">
            Danh sách phát này chưa có bài hát nào.
          </div>
        )}
      </div>
    </div>
  );
};
