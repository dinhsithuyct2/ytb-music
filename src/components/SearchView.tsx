import React, { useState, useEffect } from 'react';
import { Search, Play, ListPlus, Music2, X, TrendingUp } from 'lucide-react';
import { Track } from '../types/music';
import { usePlayer } from '../context/PlayerContext';

interface SearchViewProps {
  query: string;
  results: Track[];
  isSearching: boolean;
  onBack?: () => void;
  onSearchAgain?: (q: string) => void;
}

export const SearchView: React.FC<SearchViewProps> = ({
  query,
  results,
  isSearching,
  onSearchAgain,
}) => {
  const { playTrack, currentTrack, addToQueue } = usePlayer();
  const [localInput, setLocalInput] = useState<string>(query);

  // Sync with prop if changed from external navigation
  useEffect(() => {
    if (query) {
      setLocalInput(query);
    }
  }, [query]);

  const quickTags = [
    'Sơn Tùng M-TP',
    'Vũ. Bước Qua Mùa Cô Đơn',
    'Đen Vâu Nấu Ăn Cho Em',
    'HIEUTHUHAI Không Thể Say',
    'ROSÉ APT.',
    'Die With A Smile Lady Gaga',
    'Lofi Chill Thư Giãn',
    'Nhạc Trẻ Remix Hot TikTok',
    'Taylor Swift Cruel Summer',
    'Billie Eilish BIRDS OF A FEATHER',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (localInput.trim() && onSearchAgain) {
      onSearchAgain(localInput.trim());
    }
  };

  return (
    <div className="flex-1 overflow-y-auto px-3.5 sm:px-6 md:px-8 py-3.5 sm:py-5 space-y-5 custom-scrollbar pb-36 sm:pb-32 md:pb-28">
      {/* Search Bar (Spacious Full-Width Design, No Overlap) */}
      <form onSubmit={handleSubmit} className="w-full">
        <div className="flex items-center w-full h-12 px-3.5 sm:px-4 rounded-full bg-[#1e1e1e] border border-white/15 focus-within:border-white/40 focus-within:bg-[#252525] transition-all shadow-md">
          <Search className="w-4.5 h-4.5 text-white/50 shrink-0 mr-3" />
          <input
            type="text"
            value={localInput}
            onChange={(e) => setLocalInput(e.target.value)}
            placeholder="Tìm bài hát, nghệ sĩ, lời bài hát..."
            className="flex-1 min-w-0 bg-transparent text-sm sm:text-base text-white placeholder:text-white/40 focus:outline-none"
            autoFocus={!query}
          />
          {localInput && (
            <button
              type="button"
              onClick={() => setLocalInput('')}
              className="p-1 rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-colors mr-1 shrink-0 cursor-pointer"
              title="Xóa nội dung"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            type="submit"
            disabled={!localInput.trim()}
            className="px-3.5 sm:px-4 py-1.5 bg-red-600 hover:bg-red-700 active:bg-red-800 disabled:opacity-35 disabled:cursor-not-allowed text-white text-xs sm:text-sm font-semibold rounded-full cursor-pointer shrink-0 transition-all active:scale-95 shadow-sm"
          >
            Tìm
          </button>
        </div>
      </form>

      {/* Quick Search Tag Suggestions */}
      <div>
        <div className="flex items-center gap-1.5 text-xs font-semibold text-white/50 mb-2">
          <TrendingUp className="w-3.5 h-3.5 text-red-500" />
          <span>Tìm kiếm phổ biến:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {quickTags.map((tag) => (
            <button
              key={tag}
              onClick={() => {
                setLocalInput(tag);
                if (onSearchAgain) onSearchAgain(tag);
              }}
              className="px-3 py-1.5 rounded-full bg-[#1b1b1b] hover:bg-[#282828] border border-white/10 text-xs text-white/80 hover:text-white transition-colors cursor-pointer active:scale-95"
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Query Status */}
      {query && (
        <div className="pt-2">
          <h2 className="text-lg font-bold text-white">
            Kết quả cho: <span className="text-red-500">"{query}"</span>
          </h2>
          <p className="text-xs text-white/50 mt-0.5">
            {isSearching ? 'Đang tìm kiếm trực tiếp trên YouTube...' : `Tìm thấy ${results.length} bài hát`}
          </p>
        </div>
      )}

      {/* Search Results Display */}
      {isSearching ? (
        <div className="py-20 text-center text-white/50 text-sm">
          <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <span>Đang tìm kiếm trên YouTube Music...</span>
        </div>
      ) : results.length > 0 ? (
        <div className="space-y-2">
          {results.map((track, idx) => {
            const isCurrent = currentTrack?.videoId === track.videoId;
            return (
              <div
                key={`${track.id}-${idx}`}
                onClick={() => playTrack(track, results, idx)}
                className={`flex items-center gap-4 p-3 rounded-2xl border transition-all cursor-pointer group ${
                  isCurrent
                    ? 'bg-[#282828] border-white/20'
                    : 'bg-[#161616]/70 border-white/5 hover:bg-[#202020] hover:border-white/10'
                }`}
              >
                <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-white/10">
                  <img
                    src={track.thumbnail}
                    alt={track.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Play className="w-5 h-5 fill-white text-white ml-0.5" />
                  </div>
                </div>

                <div className="min-w-0 flex-1">
                  <h4
                    className={`text-sm font-semibold truncate ${
                      isCurrent ? 'text-red-400 font-bold' : 'text-white'
                    }`}
                  >
                    {track.title}
                  </h4>
                  <p className="text-xs text-white/50 truncate mt-0.5">
                    {track.artist || track.channelTitle}
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      addToQueue(track);
                    }}
                    className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors"
                    title="Thêm vào danh sách chờ"
                  >
                    <ListPlus className="w-4 h-4" />
                  </button>
                  <span className="text-xs font-mono text-white/40">{track.duration || '3:30'}</span>
                </div>
              </div>
            );
          })}
        </div>
      ) : query ? (
        <div className="py-20 text-center text-white/50 text-sm">
          <Music2 className="w-12 h-12 text-white/30 mx-auto mb-3" />
          <p>Không tìm thấy kết quả nào phù hợp với từ khóa này trên YouTube.</p>
        </div>
      ) : null}
    </div>
  );
};
