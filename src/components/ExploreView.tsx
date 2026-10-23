import React, { useState, useEffect } from 'react';
import {
  Flame,
  Compass,
  Play,
  RefreshCw,
  Sparkles,
  Music2,
  Disc3,
  Radio,
  Headphones,
} from 'lucide-react';
import { Track, Playlist } from '../types/music';
import { usePlayer } from '../context/PlayerContext';
import { fetchTrendingTracks } from '../services/youtube';

interface ExploreViewProps {
  trendingTracks: Track[];
  curatedPlaylists: Playlist[];
  onSelectPlaylist: (playlist: Playlist) => void;
  onSearchCategory: (genre: string) => void;
}

export const ExploreView: React.FC<ExploreViewProps> = ({
  trendingTracks: initialTracks,
  curatedPlaylists,
  onSelectPlaylist,
  onSearchCategory,
}) => {
  const { playTrack, currentTrack, isPlaying } = usePlayer();
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [tracks, setTracks] = useState<Track[]>(initialTracks);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // 4 Top Quick Explore Action Pills (Like YouTube Music Mobile)
  const quickPills = [
    { id: 'vpop', name: 'Bảng xếp hạng V-Pop', icon: Flame, color: 'from-red-600 to-rose-700', query: 'bảng xếp hạng vpop hot nhất hiện nay' },
    { id: 'all', name: 'Top Thịnh hành', icon: Sparkles, color: 'from-amber-600 to-orange-700', query: 'nhạc trẻ thịnh hành mới nhất' },
    { id: 'usuk', name: 'Billboard Hot 100', icon: Disc3, color: 'from-blue-600 to-indigo-700', query: 'billboard hot 100 pop hits' },
    { id: 'lofi', name: 'Lofi & Thư giãn', icon: Headphones, color: 'from-emerald-600 to-teal-800', query: 'lofi chill beats thư giãn' },
  ];

  // All Genres for Carousel & Exploration
  const genres = [
    { id: 'vpop', name: 'V-Pop Hot', color: 'from-rose-600 to-red-800', query: 'nhạc trẻ vpop thịnh hành' },
    { id: 'kpop', name: 'K-Pop Hits', color: 'from-pink-600 to-purple-800', query: 'kpop trending billboard' },
    { id: 'usuk', name: 'US-UK Pop', color: 'from-blue-600 to-indigo-800', query: 'us uk pop billboard' },
    { id: 'lofi', name: 'Lofi Chill', color: 'from-amber-600 to-orange-800', query: 'lofi chill beats' },
    { id: 'energy', name: 'EDM & Remix', color: 'from-violet-600 to-fuchsia-900', query: 'nhạc edm remix hot tiktok' },
    { id: 'rap', name: 'Rap Việt', color: 'from-emerald-600 to-teal-900', query: 'rap việt mới nhất' },
    { id: 'acoustic', name: 'Acoustic Mộc', color: 'from-yellow-600 to-amber-800', query: 'nhạc acoustic việt nam' },
    { id: 'ballad', name: 'Ballad Cảm Xúc', color: 'from-cyan-600 to-blue-800', query: 'nhạc ballad việt tâm trạng' },
  ];

  // Dynamically load tracks for the selected category
  useEffect(() => {
    let mounted = true;
    const loadTracks = async () => {
      setIsLoading(true);
      try {
        const live = await fetchTrendingTracks(activeCategory);
        if (mounted && live.length > 0) {
          setTracks(live);
        }
      } catch (err) {
        console.warn('Error loading explore tracks:', err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };
    loadTracks();
    return () => {
      mounted = false;
    };
  }, [activeCategory]);

  return (
    <div className="flex-1 overflow-y-auto px-3.5 sm:px-6 md:px-8 py-3.5 sm:py-5 space-y-5 sm:space-y-7 custom-scrollbar pb-36 sm:pb-32 md:pb-28">
      {/* Compact Header */}
      <div>
        <div className="flex items-center gap-1.5 text-red-500 text-[11px] font-semibold uppercase tracking-wider mb-0.5">
          <Compass className="w-3.5 h-3.5" />
          <span>Khám phá âm nhạc</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
          Bảng xếp hạng & Thể loại
        </h1>
      </div>

      {/* 4 Compact Top Navigation Pills (YouTube Music Style) */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
        {quickPills.map((pill) => {
          const Icon = pill.icon;
          const isActive = activeCategory === pill.id;
          return (
            <button
              key={pill.id}
              onClick={() => {
                setActiveCategory(pill.id);
                onSearchCategory(pill.query);
              }}
              className={`flex items-center gap-2.5 p-2.5 sm:p-3 rounded-xl bg-linear-to-r ${pill.color} text-left transition-all active:scale-95 cursor-pointer shadow-md ${
                isActive ? 'ring-2 ring-white shadow-lg' : 'opacity-90 hover:opacity-100'
              }`}
            >
              <div className="w-7 h-7 rounded-lg bg-black/25 flex items-center justify-center shrink-0">
                <Icon className="w-4 h-4 text-white" />
              </div>
              <span className="text-xs sm:text-sm font-bold text-white truncate leading-tight">
                {pill.name}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Music Charts - Top 10 Songs Immediately Visible */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-red-500" />
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Bảng xếp hạng bài hát hàng đầu
            </h2>
          </div>
          {isLoading ? (
            <div className="flex items-center gap-1.5 text-xs text-white/50">
              <RefreshCw className="w-3 h-3 animate-spin text-red-500" />
              <span>Đang tải...</span>
            </div>
          ) : (
            <span className="text-[11px] text-white/40">Cập nhật trực tiếp</span>
          )}
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-2.5 rounded-xl bg-white/5 animate-pulse border border-white/5"
              >
                <div className="w-5 text-center text-white/20 font-bold text-sm">{i + 1}</div>
                <div className="w-11 h-11 rounded-lg bg-white/10 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-white/10 rounded w-3/4" />
                  <div className="h-2 bg-white/10 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-1.5">
            {tracks.slice(0, 15).map((track, index) => {
              const isCurrent = currentTrack?.videoId === track.videoId;
              return (
                <div
                  key={track.id || track.videoId || index}
                  onClick={() => playTrack(track, tracks, index)}
                  className={`flex items-center gap-3 p-2 rounded-xl border transition-all cursor-pointer group ${
                    isCurrent
                      ? 'bg-[#282828] border-white/20 shadow-md'
                      : 'bg-[#141414] border-white/5 hover:bg-[#1f1f1f] hover:border-white/10'
                  }`}
                >
                  {/* Ranking index number */}
                  <span
                    className={`w-5 text-center font-bold text-sm shrink-0 ${
                      index < 3 ? 'text-red-500 font-extrabold text-base' : 'text-white/40'
                    }`}
                  >
                    {index + 1}
                  </span>

                  <div className="relative w-11 h-11 rounded-lg overflow-hidden shrink-0 border border-white/10">
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
                      <Play className="w-4 h-4 fill-white text-white ml-0.5" />
                    </div>
                  </div>

                  <div className="min-w-0 flex-1">
                    <h4
                      className={`text-sm font-semibold truncate leading-snug ${
                        isCurrent ? 'text-red-400' : 'text-white'
                      }`}
                    >
                      {track.title}
                    </h4>
                    <p className="text-xs text-white/50 truncate mt-0.5 leading-tight">
                      {track.artist || track.channelTitle}
                    </p>
                  </div>

                  <span className="text-[11px] font-mono text-white/40 shrink-0 pr-1">
                    {track.duration || '3:30'}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Genre Pills Carousel */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">Tất cả thể loại</h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {genres.map((g) => (
            <button
              key={g.id}
              onClick={() => {
                setActiveCategory(g.id);
                onSearchCategory(g.query);
              }}
              className={`p-3 rounded-xl bg-linear-to-br ${g.color} text-left flex flex-col justify-between h-18 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer shadow-md`}
            >
              <span className="font-bold text-white text-sm leading-tight drop-shadow">
                {g.name}
              </span>
              <span className="text-[10px] text-white/80 font-medium">Bấm nghe →</span>
            </button>
          ))}
        </div>
      </section>

      {/* Curated playlists */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">Tuyển tập chọn lọc</h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {curatedPlaylists.map((playlist) => (
            <div
              key={playlist.id}
              onClick={() => onSelectPlaylist(playlist)}
              className="group p-2.5 rounded-xl bg-[#141414] border border-white/5 hover:bg-[#1f1f1f] hover:border-white/10 transition-all cursor-pointer flex flex-col"
            >
              <div className="relative aspect-square rounded-lg overflow-hidden mb-2 border border-white/10">
                <img
                  src={playlist.thumbnail}
                  alt={playlist.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <h3 className="text-xs font-semibold text-white truncate group-hover:text-red-400 transition-colors">
                {playlist.title}
              </h3>
              <p className="text-[11px] text-white/40 line-clamp-1 mt-0.5">
                {playlist.description}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
