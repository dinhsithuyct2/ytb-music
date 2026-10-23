import React, { useState } from 'react';
import {
  X,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Youtube,
  Link as LinkIcon,
  AtSign,
  Music2,
  FolderSync,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { requestYouTubeOAuthToken, getAccessToken } from '../services/auth';
import { syncYouTubeAccountData } from '../services/youtube';
import { UserProfile, Playlist } from '../types/music';

interface YouTubeSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile | null;
  onLogin: () => void;
  onPlaylistImported?: (playlist: Playlist) => void;
}

export const YouTubeSyncModal: React.FC<YouTubeSyncModalProps> = ({
  isOpen,
  onClose,
  user,
  onLogin,
  onPlaylistImported,
}) => {
  const { syncYouTubeData, importPlaylistFromYouTube, importPlaylistsFromChannel } = usePlayer();

  const [activeTab, setActiveTab] = useState<'account' | 'channel' | 'link'>('account');
  const [channelInput, setChannelInput] = useState('');
  const [playlistUrlInput, setPlaylistUrlInput] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [progressMsg, setProgressMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  // 1. Direct YouTube Account OAuth Sync
  const handleSyncAccount = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    setProgressMsg('Đang kiểm tra kết nối tài khoản Google/YouTube...');

    try {
      let token = await getAccessToken();

      // If no token cached or needing YouTube permissions, request elevated token
      if (!token) {
        setProgressMsg('Đang mở cửa sổ ủy quyền tài khoản YouTube...');
        token = await requestYouTubeOAuthToken();
      }

      if (!token) {
        throw new Error(
          'Không nhận được mã xác thực từ Google. Vui lòng cấp quyền truy cập YouTube hoặc sử dụng cách đồng bộ qua Link/Kênh ở thẻ bên cạnh.'
        );
      }

      const result = await syncYouTubeAccountData(token, (msg) => setProgressMsg(msg));

      const { newPlaylistsCount, newLikedCount } = await syncYouTubeData(result);

      setSuccessMsg(
        `Đồng bộ thành công! Đã cập nhật ${result.playlists.length} danh sách phát (${newPlaylistsCount} mới) và ${result.likedTracks.length} bài hát đã thích (${newLikedCount} mới) vào Cloud Firestore.`
      );
    } catch (err: any) {
      console.error('Lỗi đồng bộ tài khoản YouTube:', err);
      const isUnverified =
        err?.message?.includes('unverified') ||
        err?.message?.includes('xác minh') ||
        err?.code === 'auth/access_denied';

      if (isUnverified) {
        setErrorMsg(
          'Tài khoản Google đang bị giới hạn quyền truy cập do ứng dụng đang ở chế độ kiểm thử nội bộ. Bạn có thể sử dụng ngay tính năng "Quét qua Kênh (@handle)" hoặc "Nhập Link Playlist" bên cạnh để đồng bộ ngay lập tức mà không cần xác minh Google.'
        );
      } else {
        setErrorMsg(
          err?.message ||
            'Không thể đồng bộ trực tiếp từ tài khoản. Hãy thử dùng tính năng Nhập Kênh (@handle) hoặc Nhập Link Playlist.'
        );
      }
    } finally {
      setIsLoading(false);
      setProgressMsg('');
    }
  };

  // 2. Import by YouTube Channel (@handle)
  const handleSyncChannel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!channelInput.trim() || isLoading) return;

    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    setProgressMsg(`Đang quét danh sách phát từ kênh YouTube "${channelInput.trim()}"...`);

    try {
      const count = await importPlaylistsFromChannel(channelInput.trim());
      if (count === 0) {
        setErrorMsg(
          'Không tìm thấy danh sách phát công khai nào trên kênh này. Hãy kiểm tra lại @handle hoặc thử nhập link trực tiếp.'
        );
      } else {
        setSuccessMsg(
          `Đã quét và đồng bộ thành công ${count} danh sách phát từ kênh vào Thư viện và Cloud Firestore của bạn!`
        );
        setChannelInput('');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Lỗi khi quét danh sách phát từ kênh YouTube.');
    } finally {
      setIsLoading(false);
      setProgressMsg('');
    }
  };

  // 3. Import by Playlist Link or ID
  const handleSyncLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playlistUrlInput.trim() || isLoading) return;

    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    setProgressMsg('Đang trích xuất bài hát từ danh sách phát YouTube...');

    try {
      const playlist = await importPlaylistFromYouTube(playlistUrlInput.trim());
      setSuccessMsg(
        `Đã nhập thành công danh sách phát "${playlist.title}" với ${playlist.itemCount} bài hát vào Thư viện của bạn!`
      );
      setPlaylistUrlInput('');
      if (onPlaylistImported) {
        onPlaylistImported(playlist);
      }
    } catch (err: any) {
      setErrorMsg(
        err?.message ||
          'Không thể tải playlist từ liên kết này. Vui lòng kiểm tra lại liên kết YouTube.'
      );
    } finally {
      setIsLoading(false);
      setProgressMsg('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-xl rounded-3xl bg-[#161616] border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-[#262626] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-500 shrink-0">
              <Youtube className="w-6 h-6 fill-current" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <span>Đồng bộ từ YouTube</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-500/10 text-red-400 border border-red-500/20">
                  Real-time
                </span>
              </h3>
              <p className="text-xs text-white/50">
                Đưa bài hát và playlist cá nhân từ YouTube vào Thư viện của bạn
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center gap-1.5 p-2 bg-[#101010] border-b border-[#222]">
          <button
            onClick={() => {
              setActiveTab('account');
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'account'
                ? 'bg-red-600 text-white shadow-md'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <FolderSync className="w-3.5 h-3.5" />
            <span>Tài khoản YouTube</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('channel');
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'channel'
                ? 'bg-red-600 text-white shadow-md'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <AtSign className="w-3.5 h-3.5" />
            <span>Kênh (@handle)</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('link');
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'link'
                ? 'bg-red-600 text-white shadow-md'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <LinkIcon className="w-3.5 h-3.5" />
            <span>Link Playlist</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 custom-scrollbar">
          {/* Notification Messages */}
          {progressMsg && (
            <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-3 animate-pulse">
              <RefreshCw className="w-4 h-4 animate-spin shrink-0" />
              <span>{progressMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
              <div className="flex-1">{successMsg}</div>
            </div>
          )}

          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-start gap-3">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-amber-400" />
              <div className="flex-1 space-y-1">
                <p>{errorMsg}</p>
                {activeTab === 'account' && (
                  <p className="text-[11px] text-white/50 pt-1">
                    Gợi ý: Bạn có thể chọn thẻ <strong>Kênh (@handle)</strong> hoặc{' '}
                    <strong>Link Playlist</strong> ở trên để nhập ngay mà không gặp lỗi này.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* TAB 1: Tài khoản YouTube OAuth */}
          {activeTab === 'account' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-[#1f1f1f] border border-white/5 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-linear-to-tr from-amber-500 to-red-600 flex items-center justify-center font-bold text-white text-sm shrink-0">
                    {user?.displayName ? user.displayName.charAt(0).toUpperCase() : 'G'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-white truncate">
                      {user ? user.displayName : 'Chưa đăng nhập'}
                    </p>
                    <p className="text-xs text-white/50 truncate">
                      {user ? user.email : 'Đăng nhập Google để đồng bộ'}
                    </p>
                  </div>
                </div>

                <p className="text-xs text-white/60 leading-relaxed">
                  Ứng dụng sẽ kết nối với YouTube Data API để tải toàn bộ danh sách phát cá nhân và
                  danh sách các bài hát bạn đã bấm <strong>Thích</strong> (Liked Videos) trên
                  YouTube, sau đó lưu trữ vĩnh viễn trên Cloud Firestore.
                </p>
              </div>

              {user ? (
                <button
                  onClick={handleSyncAccount}
                  disabled={isLoading}
                  className="w-full py-3 px-4 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-red-600/25 transition-all disabled:opacity-50 cursor-pointer"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                  <span>{isLoading ? 'Đang đồng bộ từ YouTube...' : 'Đồng bộ tài khoản YouTube ngay'}</span>
                </button>
              ) : (
                <button
                  onClick={onLogin}
                  className="w-full py-3 px-4 rounded-2xl bg-white text-black hover:bg-white/90 font-semibold text-sm flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
                >
                  <Youtube className="w-4 h-4 text-red-600 fill-current" />
                  <span>Đăng nhập Google để tiếp tục</span>
                </button>
              )}
            </div>
          )}

          {/* TAB 2: Quét qua Kênh YouTube (@handle) */}
          {activeTab === 'channel' && (
            <form onSubmit={handleSyncChannel} className="space-y-4">
              <div className="p-4 rounded-2xl bg-[#1f1f1f] border border-white/5 space-y-2">
                <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-red-500" />
                  <span>Đồng bộ nhanh từ Kênh YouTube</span>
                </h4>
                <p className="text-xs text-white/60 leading-relaxed">
                  Nhập tên kênh hoặc @handle YouTube của bạn (ví dụ:{' '}
                  <code className="text-red-400 bg-black/40 px-1 py-0.5 rounded">@dinhsithuy</code>{' '}
                  hoặc tên kênh cá nhân). Hệ thống sẽ tự động quét và tải tất cả danh sách phát công
                  khai mà không cần yêu cầu cấp quyền OAuth.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1.5">
                  Tên kênh hoặc @handle YouTube
                </label>
                <div className="relative">
                  <AtSign className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="@dinhsithuy hoặc link kênh YouTube"
                    value={channelInput}
                    onChange={(e) => setChannelInput(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#222] border border-white/10 text-sm text-white placeholder-white/40 focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={!channelInput.trim() || isLoading}
                className="w-full py-3 px-4 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg transition-all disabled:opacity-50 cursor-pointer"
              >
                <FolderSync className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                <span>{isLoading ? 'Đang quét danh sách phát...' : 'Quét & Đồng bộ Playlist từ Kênh'}</span>
              </button>
            </form>
          )}

          {/* TAB 3: Nhập qua Link Playlist */}
          {activeTab === 'link' && (
            <form onSubmit={handleSyncLink} className="space-y-4">
              <div className="p-4 rounded-2xl bg-[#1f1f1f] border border-white/5 space-y-2">
                <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Music2 className="w-4 h-4 text-red-500" />
                  <span>Nhập danh sách phát qua Liên kết</span>
                </h4>
                <p className="text-xs text-white/60 leading-relaxed">
                  Dán đường dẫn danh sách phát bất kỳ từ YouTube hoặc YouTube Music (ví dụ:{' '}
                  <code className="text-red-400 bg-black/40 px-1 py-0.5 rounded break-all">
                    https://www.youtube.com/playlist?list=PL...
                  </code>
                  ). Toàn bộ bài hát sẽ được trích xuất và nhập trực tiếp vào Thư viện của bạn.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1.5">
                  Đường dẫn Playlist YouTube
                </label>
                <div className="relative">
                  <LinkIcon className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="https://www.youtube.com/playlist?list=..."
                    value={playlistUrlInput}
                    onChange={(e) => setPlaylistUrlInput(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#222] border border-white/10 text-sm text-white placeholder-white/40 focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={!playlistUrlInput.trim() || isLoading}
                className="w-full py-3 px-4 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg transition-all disabled:opacity-50 cursor-pointer"
              >
                <LinkIcon className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                <span>{isLoading ? 'Đang nhập bài hát...' : 'Nhập Playlist vào Thư viện'}</span>
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#101010] border-t border-[#222] flex items-center justify-between text-xs text-white/40">
          <span>Dữ liệu được lưu trữ tự động trên Cloud Firestore</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
