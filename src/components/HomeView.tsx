import React, { useState, useEffect } from 'react';
import {
  Play,
  Sparkles,
  TrendingUp,
  Headphones,
  Compass,
  ArrowRight,
  RefreshCw,
  Flame,
} from 'lucide-react';
import { Track, Playlist, UserProfile } from '../types/music';
import { usePlayer } from '../context/PlayerContext';
import { fetchTrendingTracks } from '../services/youtube';

interface HomeViewProps {
  user: UserProfile | null;
  userPlaylists: Playlist[];
  curatedPlaylists: Playlist[];
  trendingTracks: Track[];
  onSelectPlaylist: (playlist: Playlist) => void;
  onSelectLikedSongs: () => void;
  onExploreClick: () => void;
  onLogin: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  user,
  userPlaylists,
  curatedPlaylists,
  trendingTracks: initialTracks,
  onSelectPlaylist,
  onSelectLikedSongs,
  onExploreClick,
  onLogin,
}) => {
  const { playTrack, currentTrack, isPlaying } = usePlayer();
  const [activeMood, setActiveMood] = useState<string>('all');
  const [tracks, setTracks] = useState<Track[]>(initialTracks);
  const [isLoadingTracks, setIsLoadingTracks] = useState<boolean>(false);

  // Time-based friendly greeting in Vietnamese
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Chào buổi sáng';
    if (hour < 18) return 'Chào buổi chiều';
    return 'Chào buổi tối';
  };

  // Filter moods
  const moods = [
    { id: 'all', label: 'Tất cả' },
    { id: 'vpop', label: 'V-Pop Hot' },
    { id: 'relax', label: 'Thư giãn' },
    { id: 'energy', label: 'Năng lượng' },
    { id: 'focus', label: 'Tập trung' },
    { id: 'lofi', label: 'Lofi Chill' },
  ];

  // Dynamically load tracks whenever activeMood changes
  useEffect(() => {
    let isMounted = true;
    const loadMoodTracks = async () => {
      setIsLoadingTracks(true);
      try {
        const liveTracks = await fetchTrendingTracks(activeMood);
        if (isMounted && liveTracks.length > 0) {
          setTracks(liveTracks);
        }
      } catch (err) {
        console.warn('Error fetching mood tracks:', err);
      } finally {
        if (isMounted) setIsLoadingTracks(false);
      }
    };

    loadMoodTracks();
    return () => {
      isMounted = false;
    };
  }, [activeMood]);

  return (
    <div className="flex-1 overflow-y-auto px-3.5 sm:px-6 md:px-8 py-3.5 sm:py-5 space-y-5 sm:space-y-7 custom-scrollbar pb-36 sm:pb-32 md:pb-28">
      {/* Top Banner / Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-white/50 text-xs font-semibold uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5 text-red-500" />
            <span>YouTube Music Trực Tuyến</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {getGreeting()}{user?.displayName ? `, ${user.displayName.split(' ')[0]}` : ''}
          </h1>
        </div>

        {/* Mood filter buttons */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {moods.map((m) => (
            <button
              key={m.id}
              onClick={() => setActiveMood(m.id)}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                activeMood === m.id
                  ? 'bg-white text-black shadow-sm font-bold'
                  : 'bg-[#212121] text-white/80 hover:text-white hover:bg-[#333]'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Quick Picks 4x3 Grid (Lựa chọn nhanh) */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-red-500" />
              <h2 className="text-xl font-bold text-white tracking-tight">Lựa chọn nhanh cho bạn</h2>
            </div>
            <p className="text-xs text-white/50 mt-0.5">
              Các bài hát thịnh hành cập nhật trực tiếp từ YouTube
            </p>
          </div>
          {isLoadingTracks && (
            <div className="flex items-center gap-2 text-xs text-white/50">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-red-500" />
              <span>Đang tải...</span>
            </div>
          )}
        </div>

        {isLoadingTracks ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-2.5 rounded-xl bg-white/5 animate-pulse border border-white/5"
              >
                <div className="w-12 h-12 rounded-lg bg-white/10 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 bg-white/10 rounded w-3/4" />
                  <div className="h-2.5 bg-white/10 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {tracks.slice(0, 12).map((track, idx) => {
              const isCurrent = currentTrack?.videoId === track.videoId;
              return (
                <div
                  key={track.id || track.videoId || idx}
                  onClick={() => playTrack(track, tracks, idx)}
                  className={`group flex items-center gap-3 p-2.5 rounded-xl transition-all cursor-pointer border ${
                    isCurrent
                      ? 'bg-[#2a2a2a] border-white/20 shadow-md'
                      : 'bg-[#181818]/60 border-white/5 hover:bg-[#222222] hover:border-white/10'
                  }`}
                >
                  <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0 border border-white/10">
                    <img
                      src={track.thumbnail}
                      alt={track.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div
                      className={`absolute inset-0 bg-black/50 flex items-center justify-center transition-opacity ${
                        isCurrent && isPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                      }`}
                    >
                      <Play className="w-5 h-5 fill-white text-white ml-0.5" />
                    </div>
                  </div>

                  <div className="min-w-0 flex-1">
                    <h4
                      className={`text-sm font-medium truncate ${
                        isCurrent ? 'text-red-400 font-bold' : 'text-white'
                      }`}
                    >
                      {track.title}
                    </h4>
                    <p className="text-xs text-white/50 truncate mt-0.5">
                      {track.artist || track.channelTitle}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Featured Playlists Carousel */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Danh sách phát chọn lọc</h2>
            <p className="text-xs text-white/50">Dành riêng cho bạn từ các bảng xếp hạng</p>
          </div>
          <button
            onClick={onExploreClick}
            className="flex items-center gap-1 text-xs font-semibold text-red-500 hover:text-red-400 transition-colors cursor-pointer"
          >
            <span>Xem tất cả</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {curatedPlaylists.map((playlist) => (
            <div
              key={playlist.id}
              onClick={() => onSelectPlaylist(playlist)}
              className="group p-3 rounded-2xl bg-[#161616]/60 border border-white/5 hover:bg-[#222] hover:border-white/10 transition-all cursor-pointer flex flex-col"
            >
              <div className="relative aspect-square rounded-xl overflow-hidden mb-3 border border-white/10 shadow-lg">
                <img
                  src={playlist.thumbnail}
                  alt={playlist.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center text-white shadow-xl">
                    <Play className="w-6 h-6 fill-current ml-0.5" />
                  </div>
                </div>
              </div>
              <h3 className="text-sm font-semibold text-white truncate group-hover:text-red-400 transition-colors">
                {playlist.title}
              </h3>
              <p className="text-xs text-white/50 line-clamp-2 mt-1 leading-relaxed">
                {playlist.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* User Playlists or Prompt to Sign In */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Thư viện của bạn</h2>
            <p className="text-xs text-white/50">Playlist và bài hát yêu thích trên YouTube</p>
          </div>
        </div>

        {user ? (
          userPlaylists.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {userPlaylists.slice(0, 5).map((pl) => (
                <div
                  key={pl.id}
                  onClick={() => onSelectPlaylist(pl)}
                  className="group p-3 rounded-2xl bg-[#161616]/60 border border-white/5 hover:bg-[#222] hover:border-white/10 transition-all cursor-pointer"
                >
                  <div className="relative aspect-square rounded-xl overflow-hidden mb-3 border border-white/10">
                    <img
                      src={pl.thumbnail}
                      alt={pl.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <h4 className="text-sm font-medium text-white truncate group-hover:text-white">
                    {pl.title}
                  </h4>
                  <p className="text-xs text-white/40 mt-0.5">{pl.itemCount} bài hát</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 rounded-2xl bg-[#141414] border border-white/5 text-center">
              <p className="text-sm text-white/70">Tài khoản chưa có danh sách phát YouTube công khai.</p>
            </div>
          )
        ) : (
          <div className="p-6 rounded-2xl bg-linear-to-r from-red-950/40 via-[#1c1c1c] to-[#121212] border border-red-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <h3 className="text-base font-bold text-white">Đăng nhập tài khoản Google</h3>
              <p className="text-xs text-white/60">
                Đồng bộ tự động danh sách phát và bài hát bạn đã thích trên YouTube cá nhân.
              </p>
            </div>
            <button
              onClick={onLogin}
              className="px-5 py-2.5 rounded-full bg-white text-black font-semibold text-xs hover:bg-white/90 active:scale-95 transition-all shadow-md shrink-0 cursor-pointer"
            >
              Đăng nhập ngay
            </button>
          </div>
        )}
      </section>
    </div>
  );
};
