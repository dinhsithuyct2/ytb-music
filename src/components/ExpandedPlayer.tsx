import React, { useState, useRef } from 'react';
import {
  ChevronDown,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Heart,
  ListMusic,
  FileText,
  Video,
  Music,
  Trash2,
  Share2,
} from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { formatSeconds } from '../services/youtube';

export const ExpandedPlayer: React.FC = () => {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    playerMode,
    isShuffle,
    repeatMode,
    queue,
    queueIndex,
    isExpanded,
    togglePlayPause,
    playNext,
    playPrevious,
    seek,
    toggleShuffle,
    toggleRepeat,
    togglePlayerMode,
    setIsExpanded,
    playTrack,
    removeFromQueue,
    isLiked: isTrackLiked,
    toggleLike,
  } = usePlayer();

  const [activeTab, setActiveTab] = useState<'player' | 'queue' | 'lyrics'>('player');
  const isLiked = currentTrack ? isTrackLiked(currentTrack.id || currentTrack.videoId) : false;
  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  const [touchTranslateY, setTouchTranslateY] = useState<number>(0);

  const scrubberRef = useRef<HTMLDivElement>(null);

  if (!isExpanded || !currentTrack) return null;

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  // Handle touch drag down to close (native iOS sheet gesture)
  const handleTouchStart = (e: React.TouchEvent) => {
    // Only trigger swipe-down if near top of player
    if (e.touches[0].clientY < 180) {
      setTouchStartY(e.touches[0].clientY);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartY !== null) {
      const deltaY = e.touches[0].clientY - touchStartY;
      if (deltaY > 0) {
        setTouchTranslateY(deltaY);
      }
    }
  };

  const handleTouchEnd = () => {
    if (touchTranslateY > 120) {
      setIsExpanded(false);
    }
    setTouchStartY(null);
    setTouchTranslateY(0);
  };

  // Scrubber touch seek
  const handleScrubberTouch = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!scrubberRef.current || duration <= 0) return;
    const rect = scrubberRef.current.getBoundingClientRect();
    const touchX = e.touches[0].clientX;
    const fraction = Math.max(0, Math.min(1, (touchX - rect.left) / rect.width));
    seek(fraction * duration);
  };

  const handleScrubberClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!scrubberRef.current || duration <= 0) return;
    const rect = scrubberRef.current.getBoundingClientRect();
    const fraction = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    seek(fraction * duration);
  };

  const lyricsSample = [
    'Lời bài hát: ' + currentTrack.title,
    'Trình bày: ' + (currentTrack.artist || currentTrack.channelTitle),
    '',
    '♪ Giai điệu ngân vang trong không gian nhẹ nhàng',
    '♪ Từng nốt nhạc đồng điệu cùng nhịp đập con tim',
    '♪ Dẫu năm tháng qua đi, cảm xúc vẫn vẹn nguyên nơi này',
    '',
    '[Điệp khúc]',
    '♪ Và ta cứ thế trôi theo từng câu hát',
    '♪ Đắm mình trong thế giới thanh âm vô tận...',
    '♪ Hãy để âm nhạc dẫn lối tâm hồn bạn hôm nay.',
  ];

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        transform: touchTranslateY > 0 ? `translateY(${touchTranslateY}px)` : undefined,
        transition: touchStartY === null ? 'transform 0.2s ease-out' : 'none',
      }}
      className="fixed inset-0 top-0 bottom-0 left-0 right-0 z-50 bg-[#030303] text-white flex flex-col w-full h-full h-[100dvh] min-h-[100dvh] max-h-[100dvh] overflow-hidden select-none animate-in fade-in slide-in-from-bottom-6 duration-200"
    >
      {/* Dynamic blurred ambient glow behind the player */}
      <div
        className="absolute inset-0 opacity-25 blur-3xl pointer-events-none scale-150 transition-all duration-700"
        style={{
          backgroundImage: `radial-gradient(circle at 50% 35%, rgba(255, 30, 50, 0.45), transparent 70%)`,
        }}
      />

      {/* Top Header - Safe Area on iPhone */}
      <header className="relative z-10 px-4 md:px-6 pt-[calc(0.75rem+env(safe-area-inset-top,0px))] pb-3 flex items-center justify-between">
        <button
          onClick={() => setIsExpanded(false)}
          className="p-2 -ml-2 rounded-full hover:bg-white/10 active:bg-white/20 transition-colors text-white/80 hover:text-white cursor-pointer"
          title="Thu nhỏ"
        >
          <ChevronDown className="w-7 h-7" />
        </button>

        {/* Audio / Video Song Toggle (YouTube Music Native Pill) */}
        <div className="flex items-center p-0.5 bg-[#1f1f1f] border border-white/10 rounded-full">
          <button
            onClick={() => {
              if (playerMode !== 'audio') togglePlayerMode();
            }}
            className={`flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              playerMode === 'audio'
                ? 'bg-white text-black shadow-sm'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <Music className="w-3.5 h-3.5" />
            <span>Bài hát</span>
          </button>
          <button
            onClick={() => {
              if (playerMode !== 'video') togglePlayerMode();
            }}
            className={`flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              playerMode === 'video'
                ? 'bg-red-600 text-white shadow-sm'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            <span>Video MV</span>
          </button>
        </div>

        <button
          onClick={() => currentTrack && toggleLike(currentTrack)}
          title={isLiked ? 'Bỏ thích' : 'Thích bài hát'}
          className="p-2 -mr-2 rounded-full hover:bg-white/10 active:bg-white/20 transition-colors text-white/80 hover:text-white cursor-pointer"
        >
          <Heart className={`w-6 h-6 ${isLiked ? 'text-red-500 fill-red-500' : ''}`} />
        </button>
      </header>

      {/* Main Tab Controller: Đang phát / Danh sách chờ / Lời bài hát */}
      <div className="relative z-10 flex items-center justify-center gap-2 px-4 py-1">
        <button
          onClick={() => setActiveTab('player')}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
            activeTab === 'player'
              ? 'bg-white/15 text-white font-semibold'
              : 'text-white/50 hover:text-white/80'
          }`}
        >
          Đang phát
        </button>
        <button
          onClick={() => setActiveTab('queue')}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
            activeTab === 'queue'
              ? 'bg-white/15 text-white font-semibold'
              : 'text-white/50 hover:text-white/80'
          }`}
        >
          Tiếp theo ({queue.length})
        </button>
        <button
          onClick={() => setActiveTab('lyrics')}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
            activeTab === 'lyrics'
              ? 'bg-white/15 text-white font-semibold'
              : 'text-white/50 hover:text-white/80'
          }`}
        >
          Lời bài hát
        </button>
      </div>

      {/* Main View Area */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-between px-6 py-2 overflow-y-auto max-w-lg mx-auto w-full custom-scrollbar pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))]">
        {activeTab === 'player' && (
          <div className="w-full flex-1 flex flex-col justify-between py-2">
            {/* Big Album Art */}
            <div className="flex-1 flex items-center justify-center py-4">
              <div className="relative w-64 h-64 sm:w-80 sm:h-80 max-h-[42vh] max-w-[42vh] aspect-square rounded-2xl overflow-hidden shadow-2xl border border-white/10 group">
                <img
                  src={currentTrack.thumbnail}
                  alt={currentTrack.title}
                  className={`w-full h-full object-cover transition-transform duration-700 ${
                    isPlaying ? 'scale-105' : 'scale-100'
                  }`}
                />
              </div>
            </div>

            {/* Track Info */}
            <div className="w-full flex items-center justify-between mb-4">
              <div className="min-w-0 flex-1 pr-4">
                <h2 className="text-lg sm:text-xl font-bold text-white truncate leading-tight">
                  {currentTrack.title}
                </h2>
                <p className="text-sm text-white/60 truncate mt-1">
                  {currentTrack.artist || currentTrack.channelTitle}
                </p>
              </div>
              <button
                onClick={() => currentTrack && toggleLike(currentTrack)}
                className="p-2 rounded-full hover:bg-white/10 text-white/60 shrink-0 cursor-pointer"
                title={isLiked ? 'Bỏ thích' : 'Thích bài hát'}
              >
                <Heart className={`w-5 h-5 ${isLiked ? 'text-red-500 fill-red-500' : ''}`} />
              </button>
            </div>

            {/* Scrubber Progress Slider */}
            <div className="w-full mb-6">
              <div
                ref={scrubberRef}
                onClick={handleScrubberClick}
                onTouchStart={handleScrubberTouch}
                onTouchMove={handleScrubberTouch}
                className="w-full h-4 flex items-center cursor-pointer group"
              >
                <div className="w-full h-1.5 bg-white/20 rounded-full relative overflow-hidden">
                  <div
                    className="h-full bg-red-600 rounded-full transition-all"
                    style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
                  />
                </div>
              </div>
              <div className="flex justify-between text-xs font-mono text-white/50 -mt-1">
                <span>{formatSeconds(currentTime)}</span>
                <span>{formatSeconds(duration)}</span>
              </div>
            </div>

            {/* Playback Controls */}
            <div className="flex items-center justify-between w-full px-2 mb-2">
              <button
                onClick={toggleShuffle}
                className={`p-3 rounded-full cursor-pointer transition-colors active:scale-90 ${
                  isShuffle ? 'text-red-500 bg-red-500/10' : 'text-white/60 hover:text-white'
                }`}
                title="Trộn bài"
              >
                <Shuffle className="w-5 h-5" />
              </button>

              <button
                onClick={playPrevious}
                className="p-3 rounded-full text-white/80 hover:text-white cursor-pointer active:scale-90 transition-transform"
                title="Bài trước đó"
              >
                <SkipBack className="w-7 h-7 fill-current" />
              </button>

              <button
                onClick={togglePlayPause}
                className="w-16 h-16 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-transform shadow-2xl cursor-pointer"
                title={isPlaying ? 'Tạm dừng' : 'Phát'}
              >
                {isPlaying ? (
                  <Pause className="w-8 h-8 fill-current" />
                ) : (
                  <Play className="w-8 h-8 fill-current ml-1" />
                )}
              </button>

              <button
                onClick={playNext}
                className="p-3 rounded-full text-white/80 hover:text-white cursor-pointer active:scale-90 transition-transform"
                title="Bài tiếp theo"
              >
                <SkipForward className="w-7 h-7 fill-current" />
              </button>

              <button
                onClick={toggleRepeat}
                className={`p-3 rounded-full cursor-pointer transition-colors active:scale-90 ${
                  repeatMode !== 'off'
                    ? 'text-red-500 bg-red-500/10'
                    : 'text-white/60 hover:text-white'
                }`}
                title="Lặp lại"
              >
                {repeatMode === 'one' ? (
                  <Repeat1 className="w-5 h-5" />
                ) : (
                  <Repeat className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Queue */}
        {activeTab === 'queue' && (
          <div className="w-full flex-1 py-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white/50 mb-3">
              Danh sách chờ phát ({queue.length})
            </h3>
            <div className="space-y-2 overflow-y-auto max-h-[60vh] custom-scrollbar pr-1">
              {queue.map((track, idx) => {
                const isCurrent = idx === queueIndex;
                return (
                  <div
                    key={`${track.id}-${idx}`}
                    className={`flex items-center gap-3 p-2.5 rounded-xl transition-colors ${
                      isCurrent
                        ? 'bg-white/10 border border-white/20'
                        : 'active:bg-white/5'
                    }`}
                  >
                    <span className="w-5 text-center text-xs font-mono text-white/40">
                      {isCurrent ? '▶' : idx + 1}
                    </span>
                    <img
                      src={track.thumbnail}
                      alt={track.title}
                      className="w-10 h-10 rounded-lg object-cover border border-white/10 shrink-0"
                    />
                    <div
                      onClick={() => playTrack(track, queue, idx)}
                      className="flex-1 min-w-0 cursor-pointer"
                    >
                      <p
                        className={`text-sm font-medium truncate ${
                          isCurrent ? 'text-red-400 font-bold' : 'text-white'
                        }`}
                      >
                        {track.title}
                      </p>
                      <p className="text-xs text-white/50 truncate">
                        {track.artist || track.channelTitle}
                      </p>
                    </div>
                    <button
                      onClick={() => removeFromQueue(idx)}
                      className="p-2 text-white/40 hover:text-red-400 rounded-lg active:bg-white/10 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 3: Lyrics */}
        {activeTab === 'lyrics' && (
          <div className="w-full flex-1 py-4 text-center overflow-y-auto max-h-[60vh] custom-scrollbar">
            <div className="space-y-4">
              {lyricsSample.map((line, i) => (
                <p
                  key={i}
                  className={`text-base sm:text-lg transition-colors ${
                    line.startsWith('♪')
                      ? 'text-white font-medium hover:text-red-400'
                      : line.startsWith('[')
                      ? 'text-red-500 font-bold uppercase tracking-wider text-xs mt-4'
                      : 'text-white/60 text-sm'
                  }`}
                >
                  {line}
                </p>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
