import React from 'react';
import { usePlayer } from '../context/PlayerContext';
import { Minimize2 } from 'lucide-react';

export const BackgroundPlayerHost: React.FC = () => {
  const { playerMode, togglePlayerMode } = usePlayer();

  return (
    <>
      {/* 
        Persistent container for YouTube IFrame.
        CRITICAL FOR PLAYBACK RELIABILITY:
        - When playerMode === 'audio', we keep dimensions at 320x180 and move it offscreen.
          YouTube IFrame API enforces minimum dimensions (~200px) and checks visibility;
          rendering it at 1x1 or opacity:0 causes YouTube error 150/101 (embed restricted).
          Offscreen positioning ensures 100% reliable uninterrupted audio playback!
        - When playerMode === 'video', we float it in a sleek PiP window with controls.
      */}
      <div
        className={`transition-all duration-300 z-40 ${
          playerMode === 'video'
            ? 'fixed bottom-20 md:bottom-24 right-4 md:right-6 w-72 sm:w-80 md:w-96 aspect-video bg-black rounded-2xl shadow-2xl border border-white/20 overflow-hidden shadow-red-950/40'
            : 'fixed -bottom-[3000px] -right-[3000px] w-[320px] h-[180px] pointer-events-none'
        }`}
      >
        {playerMode === 'video' && (
          <div className="absolute top-0 left-0 right-0 p-2 bg-linear-to-b from-black/80 to-transparent flex items-center justify-between z-10">
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[11px] text-white/90">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              <span>Đang phát video</span>
            </div>
            <button
              onClick={togglePlayerMode}
              className="p-1 rounded-full bg-black/60 hover:bg-black text-white/80 hover:text-white transition-colors cursor-pointer"
              title="Chuyển sang chế độ chỉ nghe âm thanh"
            >
              <Minimize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <div className="w-full h-full">
          <div id="youtube-persistent-player" className="w-full h-full" />
        </div>
      </div>
    </>
  );
};
