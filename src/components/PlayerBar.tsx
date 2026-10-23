import React, { useState, useRef } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Volume2,
  VolumeX,
  Volume1,
  Maximize2,
  ListMusic,
  FileText,
  Heart,
  Video,
  Music,
} from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { formatSeconds } from '../services/youtube';

export const PlayerBar: React.FC = () => {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    isShuffle,
    repeatMode,
    playerMode,
    isQueueOpen,
    isLyricsOpen,
    togglePlayPause,
    playNext,
    playPrevious,
    seek,
    setVolume,
    toggleMute,
    toggleShuffle,
    toggleRepeat,
    togglePlayerMode,
    setIsExpanded,
    setIsQueueOpen,
    setIsLyricsOpen,
    isLiked: isTrackLiked,
    toggleLike,
  } = usePlayer();

  const isLiked = currentTrack ? isTrackLiked(currentTrack.id || currentTrack.videoId) : false;
  const [isHoveringScrubber, setIsHoveringScrubber] = useState<boolean>(false);
  const [hoverPosition, setHoverPosition] = useState<number>(0);
  const progressBarRef = useRef<HTMLDivElement>(null);

  // Compute progress percentage
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  // Handle seeking via clicking or dragging scrubber
  const handleSeekClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current || duration <= 0) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const fraction = Math.max(0, Math.min(1, clickX / rect.width));
    seek(fraction * duration);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const hoverX = e.clientX - rect.left;
    const fraction = Math.max(0, Math.min(1, hoverX / rect.width));
    setHoverPosition(fraction);
  };

  const renderVolumeIcon = () => {
    if (isMuted || volume === 0) return <VolumeX className="w-4 h-4 text-white/70" />;
    if (volume < 50) return <Volume1 className="w-4 h-4 text-white/70" />;
    return <Volume2 className="w-4 h-4 text-white/70" />;
  };

  if (!currentTrack) return null;

  return (
    <>
      {/* ======================================================== */}
      {/* MOBILE MINI-PLAYER (YouTube Music Native Mobile Style)    */}
      {/* Docked flush edge-to-edge directly above bottom nav bar  */}
      {/* ======================================================== */}
      <div
        className="md:hidden fixed z-40 left-0 right-0 bottom-[52px] bg-[#212121] border-t border-[#333333] select-none touch-press shadow-2xl"
        style={{ WebkitTapHighlightColor: 'transparent' }}
      >
        {/* Continuous progress bar along the top edge of mini player */}
        <div className="w-full h-[2px] bg-white/15 relative">
          <div
            className="h-full bg-red-600 transition-all duration-200"
            style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
          />
        </div>

        <div className="h-14 px-3 flex items-center justify-between gap-3">
          {/* Tap anywhere on left/center to expand full screen */}
          <div
            onClick={() => setIsExpanded(true)}
            className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer active:opacity-75 transition-opacity"
          >
            <div className="relative w-10 h-10 rounded-md overflow-hidden shrink-0 border border-white/10 shadow-md">
              <img
                src={currentTrack.thumbnail}
                alt={currentTrack.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-sm font-semibold text-white truncate leading-snug">
                {currentTrack.title}
              </h4>
              <p className="text-xs text-white/60 truncate leading-tight mt-0.5">
                {currentTrack.artist || currentTrack.channelTitle}
              </p>
            </div>
          </div>

          {/* Right Action Controls: Play/Pause & Next */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={(e) => {
                e.stopPropagation();
                togglePlayPause();
              }}
              className="w-10 h-10 rounded-full flex items-center justify-center text-white active:bg-white/10 transition-colors cursor-pointer"
              aria-label={isPlaying ? 'Tạm dừng' : 'Phát'}
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 fill-current" />
              ) : (
                <Play className="w-5 h-5 fill-current ml-0.5" />
              )}
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                playNext();
              }}
              className="w-10 h-10 rounded-full flex items-center justify-center text-white/80 active:bg-white/10 transition-colors cursor-pointer"
              aria-label="Bài kế tiếp"
            >
              <SkipForward className="w-5 h-5 fill-current" />
            </button>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* DESKTOP PLAYER BAR (YouTube Music Web Desktop Style)     */}
      {/* ======================================================== */}
      <footer className="hidden md:flex fixed bottom-0 left-0 right-0 z-50 h-[4.75rem] bg-[#121212] border-t border-[#272727] select-none flex-col justify-between">
        {/* Top Scrubber Progress Bar */}
        <div
          ref={progressBarRef}
          onClick={handleSeekClick}
          onMouseEnter={() => setIsHoveringScrubber(true)}
          onMouseLeave={() => setIsHoveringScrubber(false)}
          onMouseMove={handleMouseMove}
          className="w-full h-1 group hover:h-2 transition-all cursor-pointer bg-white/10 relative"
        >
          {/* Progress fill */}
          <div
            className="h-full bg-red-600 relative transition-all"
            style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
          >
            {/* Scrubber thumb handle */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-red-600 rounded-full shadow-md scale-0 group-hover:scale-100 transition-transform" />
          </div>

          {/* Hover preview tooltip */}
          {isHoveringScrubber && duration > 0 && (
            <div
              className="absolute -top-7 -translate-x-1/2 px-2 py-0.5 rounded bg-[#282828] text-[11px] text-white font-mono pointer-events-none shadow"
              style={{ left: `${hoverPosition * 100}%` }}
            >
              {formatSeconds(hoverPosition * duration)}
            </div>
          )}
        </div>

        {/* Main Bar Content */}
        <div className="flex-1 px-4 md:px-6 flex items-center justify-between gap-4">
          {/* Left: Track Details */}
          <div className="flex items-center gap-3.5 min-w-0 w-1/4">
            <div
              onClick={() => setIsExpanded(true)}
              className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0 group cursor-pointer border border-white/10"
            >
              <img
                src={currentTrack.thumbnail}
                alt={currentTrack.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Maximize2 className="w-4 h-4 text-white" />
              </div>
            </div>

            <div className="min-w-0 flex-1">
              <h4
                onClick={() => setIsExpanded(true)}
                className="text-sm font-semibold text-white truncate hover:underline cursor-pointer"
              >
                {currentTrack.title}
              </h4>
              <p className="text-xs text-white/60 truncate mt-0.5">
                {currentTrack.artist || currentTrack.channelTitle}
              </p>
            </div>

            <button
              onClick={() => currentTrack && toggleLike(currentTrack)}
              className="p-1.5 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-colors cursor-pointer shrink-0"
              title={isLiked ? 'Bỏ thích' : 'Thích bài hát'}
            >
              <Heart
                className={`w-4 h-4 ${isLiked ? 'text-red-500 fill-red-500' : ''}`}
              />
            </button>
          </div>

          {/* Center: Playback Controls & Scrubber Times */}
          <div className="flex flex-col items-center justify-center gap-1 flex-1 max-w-xl">
            <div className="flex items-center gap-4">
              {/* Shuffle button */}
              <button
                onClick={toggleShuffle}
                className={`p-2 rounded-full transition-colors cursor-pointer ${
                  isShuffle ? 'text-red-500 bg-red-500/10' : 'text-white/60 hover:text-white hover:bg-white/10'
                }`}
                title={isShuffle ? 'Trộn bài: Đang bật' : 'Trộn bài: Đang tắt'}
              >
                <Shuffle className="w-4 h-4" />
              </button>

              {/* Previous track */}
              <button
                onClick={playPrevious}
                className="p-2 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                title="Bài trước đó"
              >
                <SkipBack className="w-5 h-5 fill-current" />
              </button>

              {/* Play / Pause button */}
              <button
                onClick={togglePlayPause}
                className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-transform shadow-lg cursor-pointer"
                title={isPlaying ? 'Tạm dừng (Phím Space)' : 'Phát (Phím Space)'}
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5 fill-current" />
                ) : (
                  <Play className="w-5 h-5 fill-current ml-0.5" />
                )}
              </button>

              {/* Next track */}
              <button
                onClick={playNext}
                className="p-2 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                title="Bài tiếp theo"
              >
                <SkipForward className="w-5 h-5 fill-current" />
              </button>

              {/* Repeat button */}
              <button
                onClick={toggleRepeat}
                className={`p-2 rounded-full transition-colors cursor-pointer ${
                  repeatMode !== 'off'
                    ? 'text-red-500 bg-red-500/10'
                    : 'text-white/60 hover:text-white hover:bg-white/10'
                }`}
                title={
                  repeatMode === 'one'
                    ? 'Lặp lại 1 bài'
                    : repeatMode === 'all'
                    ? 'Lặp lại danh sách'
                    : 'Không lặp lại'
                }
              >
                {repeatMode === 'one' ? (
                  <Repeat1 className="w-4 h-4" />
                ) : (
                  <Repeat className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* Time indicator */}
            <div className="flex items-center gap-1.5 text-[11px] font-mono text-white/50">
              <span>{formatSeconds(currentTime)}</span>
              <span>/</span>
              <span>{formatSeconds(duration)}</span>
            </div>
          </div>

          {/* Right: Audio/Video mode, Queue, Lyrics, Volume, Expand */}
          <div className="flex items-center justify-end gap-2 w-1/4">
            {/* Audio / Video Switcher */}
            <button
              onClick={togglePlayerMode}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors cursor-pointer ${
                playerMode === 'video'
                  ? 'bg-red-500/20 border-red-500/50 text-red-400'
                  : 'bg-white/5 border-white/10 text-white/70 hover:text-white'
              }`}
              title="Chuyển đổi giữa chế độ Nghe Nhạc (Audio) và Xem MV (Video)"
            >
              {playerMode === 'video' ? (
                <>
                  <Video className="w-3.5 h-3.5 text-red-400" />
                  <span>Video MV</span>
                </>
              ) : (
                <>
                  <Music className="w-3.5 h-3.5" />
                  <span>Audio</span>
                </>
              )}
            </button>

            {/* Lyrics toggle */}
            <button
              onClick={() => setIsLyricsOpen(!isLyricsOpen)}
              className={`p-2 rounded-full transition-colors cursor-pointer ${
                isLyricsOpen ? 'text-red-500 bg-red-500/10' : 'text-white/60 hover:text-white hover:bg-white/10'
              }`}
              title="Lời bài hát"
            >
              <FileText className="w-4 h-4" />
            </button>

            {/* Queue toggle */}
            <button
              onClick={() => setIsQueueOpen(!isQueueOpen)}
              className={`p-2 rounded-full transition-colors cursor-pointer ${
                isQueueOpen ? 'text-red-500 bg-red-500/10' : 'text-white/60 hover:text-white hover:bg-white/10'
              }`}
              title="Danh sách chờ phát"
            >
              <ListMusic className="w-4 h-4" />
            </button>

            {/* Volume control with slider */}
            <div className="flex items-center gap-2 group/vol">
              <button
                onClick={toggleMute}
                className="p-1.5 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors cursor-pointer"
              >
                {renderVolumeIcon()}
              </button>
              <div className="w-20 flex items-center">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => setVolume(parseInt(e.target.value, 10))}
                  className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-white"
                />
              </div>
            </div>

            {/* Maximize Player */}
            <button
              onClick={() => setIsExpanded(true)}
              className="p-2 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Mở rộng trình phát"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </footer>
    </>
  );
};
