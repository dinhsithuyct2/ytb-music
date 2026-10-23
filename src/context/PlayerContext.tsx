import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { Track, RepeatMode, PlayerMode, Playlist, UserProfile } from '../types/music';
import {
  CURATED_TRACKS,
  findPlayableAlternative,
  importYouTubePlaylist,
  importChannelPlaylists,
} from '../services/youtube';
import {
  fetchFirestorePlaylists,
  savePlaylistToFirestore,
  deletePlaylistFromFirestore,
  addTrackToFirestorePlaylist,
  removeTrackFromFirestorePlaylist,
  fetchFirestoreFavorites,
  saveFavoriteToFirestore,
  removeFavoriteFromFirestore,
  addTrackToFirestoreHistory,
  syncUserProfile,
  getLocalFavorites,
  getLocalPlaylists,
  saveLocalPlaylists,
  saveLocalPlaylist,
  saveLocalFavorites,
} from '../services/firestoreService';

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

interface PlayerContextType {
  currentTrack: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isShuffle: boolean;
  repeatMode: RepeatMode;
  playerMode: PlayerMode;
  queue: Track[];
  queueIndex: number;
  isExpanded: boolean;
  isQueueOpen: boolean;
  isLyricsOpen: boolean;
  isPlayerReady: boolean;
  playTrack: (track: Track, newQueue?: Track[], index?: number) => void;
  togglePlayPause: () => void;
  playNext: () => void;
  playPrevious: () => void;
  seek: (seconds: number) => void;
  setVolume: (vol: number) => void;
  toggleMute: () => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  togglePlayerMode: () => void;
  addToQueue: (track: Track) => void;
  removeFromQueue: (index: number) => void;
  clearQueue: () => void;
  setIsExpanded: (expanded: boolean) => void;
  setIsQueueOpen: (open: boolean) => void;
  setIsLyricsOpen: (open: boolean) => void;

  // Liked tracks & Playlists state & methods
  user: UserProfile | null;
  setUser: (user: UserProfile | null) => void;
  likedTracks: Track[];
  isLiked: (trackId: string) => boolean;
  toggleLike: (track: Track) => Promise<void>;
  userPlaylists: Playlist[];
  setUserPlaylists: React.Dispatch<React.SetStateAction<Playlist[]>>;
  createPlaylist: (title: string, description?: string) => Promise<Playlist>;
  deletePlaylist: (playlistId: string) => Promise<void>;
  addTrackToPlaylist: (playlistId: string, track: Track) => Promise<void>;
  removeTrackFromPlaylist: (playlistId: string, trackId: string) => Promise<void>;
  isSyncing: boolean;
  syncUserData: (userProfile: UserProfile | null) => Promise<void>;
  syncYouTubeData: (data: {
    playlists: Playlist[];
    likedTracks: Track[];
  }) => Promise<{ newPlaylistsCount: number; newLikedCount: number }>;
  importPlaylistFromYouTube: (urlOrId: string) => Promise<Playlist>;
  importPlaylistsFromChannel: (handle: string) => Promise<number>;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(CURATED_TRACKS[0]);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(324);
  const [volume, setVolumeState] = useState<number>(85);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isShuffle, setIsShuffle] = useState<boolean>(false);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('all');
  const [playerMode, setPlayerMode] = useState<PlayerMode>('audio');
  const [queue, setQueue] = useState<Track[]>(CURATED_TRACKS);
  const [queueIndex, setQueueIndex] = useState<number>(0);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [isQueueOpen, setIsQueueOpen] = useState<boolean>(false);
  const [isLyricsOpen, setIsLyricsOpen] = useState<boolean>(false);
  const [isPlayerReady, setIsPlayerReady] = useState<boolean>(false);

  // User Profile & Cloud Firestore State
  const [user, setUser] = useState<UserProfile | null>(null);
  const [likedTracks, setLikedTracks] = useState<Track[]>(() => getLocalFavorites());
  const [userPlaylists, setUserPlaylists] = useState<Playlist[]>(() => getLocalPlaylists());
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  const playerRef = useRef<any>(null);
  const timeUpdateIntervalRef = useRef<any>(null);
  const currentTrackRef = useRef<Track | null>(currentTrack);
  const queueRef = useRef<Track[]>(queue);
  const queueIndexRef = useRef<number>(queueIndex);
  const repeatModeRef = useRef<RepeatMode>(repeatMode);
  const isShuffleRef = useRef<boolean>(isShuffle);
  const isPlayingRef = useRef<boolean>(isPlaying);
  const userRef = useRef<UserProfile | null>(user);

  currentTrackRef.current = currentTrack;
  queueRef.current = queue;
  queueIndexRef.current = queueIndex;
  repeatModeRef.current = repeatMode;
  isShuffleRef.current = isShuffle;
  isPlayingRef.current = isPlaying;
  userRef.current = user;

  // Sync Data with Cloud Firestore
  const syncUserData = useCallback(async (userProfile: UserProfile | null) => {
    setIsSyncing(true);
    try {
      if (userProfile && userProfile.uid) {
        // Sync profile document
        await syncUserProfile(userProfile);
        // Fetch favorites and playlists from Firestore
        const [firestoreFavs, firestorePlaylists] = await Promise.all([
          fetchFirestoreFavorites(userProfile.uid),
          fetchFirestorePlaylists(userProfile.uid),
        ]);
        setLikedTracks(firestoreFavs);
        setUserPlaylists(firestorePlaylists);
      } else {
        // Load local cache for guests
        setLikedTracks(getLocalFavorites());
        setUserPlaylists(getLocalPlaylists());
      }
    } catch (err) {
      console.error('Error syncing with Firestore:', err);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  // Helper to test if a track is liked
  const isLiked = useCallback(
    (trackId: string): boolean => {
      if (!trackId) return false;
      return likedTracks.some((t) => t.id === trackId || t.videoId === trackId);
    },
    [likedTracks]
  );

  // Toggle favorite / like track
  const toggleLike = useCallback(
    async (track: Track) => {
      const trackId = track.id || track.videoId;
      if (!trackId) return;

      const alreadyLiked = likedTracks.some((t) => t.id === trackId || t.videoId === trackId);
      const uid = userRef.current?.uid || '';

      if (alreadyLiked) {
        // Optimistic update
        setLikedTracks((prev) => prev.filter((t) => t.id !== trackId && t.videoId !== trackId));
        await removeFavoriteFromFirestore(uid, trackId);
      } else {
        // Optimistic update
        setLikedTracks((prev) => [track, ...prev]);
        await saveFavoriteToFirestore(uid, track);
      }
    },
    [likedTracks]
  );

  // Create new playlist
  const createPlaylist = useCallback(
    async (title: string, description: string = ''): Promise<Playlist> => {
      const newPlaylist: Playlist = {
        id: `pl_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        title: title.trim() || 'Danh sách phát mới',
        description: description.trim(),
        thumbnail:
          'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&auto=format&fit=crop&q=60',
        itemCount: 0,
        author: userRef.current?.displayName || 'Bạn',
        isOwner: true,
        tracks: [],
      };

      setUserPlaylists((prev) => [newPlaylist, ...prev]);
      await savePlaylistToFirestore(userRef.current?.uid || '', newPlaylist);
      return newPlaylist;
    },
    []
  );

  // Delete playlist
  const deletePlaylist = useCallback(async (playlistId: string) => {
    setUserPlaylists((prev) => prev.filter((p) => p.id !== playlistId));
    await deletePlaylistFromFirestore(userRef.current?.uid || '', playlistId);
  }, []);

  // Add track to playlist
  const addTrackToPlaylist = useCallback(async (playlistId: string, track: Track) => {
    const updated = await addTrackToFirestorePlaylist(
      userRef.current?.uid || '',
      playlistId,
      track
    );
    if (updated) {
      setUserPlaylists((prev) => prev.map((p) => (p.id === playlistId ? updated : p)));
    }
  }, []);

  // Remove track from playlist
  const removeTrackFromPlaylist = useCallback(async (playlistId: string, trackId: string) => {
    const updated = await removeTrackFromFirestorePlaylist(
      userRef.current?.uid || '',
      playlistId,
      trackId
    );
    if (updated) {
      setUserPlaylists((prev) => prev.map((p) => (p.id === playlistId ? updated : p)));
    }
  }, []);

  // Bulk sync playlists & liked tracks from YouTube into Firestore and state
  const syncYouTubeData = useCallback(
    async (data: { playlists: Playlist[]; likedTracks: Track[] }) => {
      setIsSyncing(true);
      try {
        const uid = userRef.current?.uid || '';
        let newPlaylistsCount = 0;
        let newLikedCount = 0;

        // 1. Sync Playlists
        if (data.playlists && data.playlists.length > 0) {
          const currentPlaylists = [...userPlaylists];
          for (const newPl of data.playlists) {
            const existingIdx = currentPlaylists.findIndex((p) => p.id === newPl.id);
            if (existingIdx >= 0) {
              currentPlaylists[existingIdx] = newPl;
            } else {
              currentPlaylists.unshift(newPl);
              newPlaylistsCount++;
            }
            if (uid) {
              await savePlaylistToFirestore(uid, newPl);
            } else {
              saveLocalPlaylist(newPl);
            }
          }
          setUserPlaylists([...currentPlaylists]);
          saveLocalPlaylists(currentPlaylists);
        }

        // 2. Sync Liked tracks
        if (data.likedTracks && data.likedTracks.length > 0) {
          const currentLikes = [...likedTracks];
          for (const t of data.likedTracks) {
            const tid = t.id || t.videoId;
            if (!currentLikes.some((item) => (item.id || item.videoId) === tid)) {
              currentLikes.unshift(t);
              newLikedCount++;
              if (uid) {
                await saveFavoriteToFirestore(uid, t);
              }
            }
          }
          setLikedTracks([...currentLikes]);
          saveLocalFavorites(currentLikes);
        }

        return { newPlaylistsCount, newLikedCount };
      } finally {
        setIsSyncing(false);
      }
    },
    [userPlaylists, likedTracks]
  );

  // Import single YouTube playlist by URL or ID
  const importPlaylistFromYouTube = useCallback(
    async (urlOrId: string): Promise<Playlist> => {
      setIsSyncing(true);
      try {
        const { playlist, tracks } = await importYouTubePlaylist(urlOrId);
        const fullPlaylist: Playlist = {
          ...playlist,
          tracks,
          itemCount: tracks.length,
          author: playlist.author || userRef.current?.displayName || 'YouTube',
          isOwner: true,
        };

        const uid = userRef.current?.uid || '';
        setUserPlaylists((prev) => {
          const filtered = prev.filter((p) => p.id !== fullPlaylist.id);
          const next = [fullPlaylist, ...filtered];
          saveLocalPlaylists(next);
          return next;
        });

        if (uid) {
          await savePlaylistToFirestore(uid, fullPlaylist);
        } else {
          saveLocalPlaylist(fullPlaylist);
        }

        return fullPlaylist;
      } finally {
        setIsSyncing(false);
      }
    },
    []
  );

  // Import all playlists from a YouTube Channel (@handle)
  const importPlaylistsFromChannel = useCallback(
    async (handle: string): Promise<number> => {
      setIsSyncing(true);
      try {
        const channelPlaylists = await importChannelPlaylists(handle);
        if (!channelPlaylists || channelPlaylists.length === 0) {
          return 0;
        }

        const uid = userRef.current?.uid || '';
        const currentPlaylists = [...userPlaylists];
        let imported = 0;

        for (const pl of channelPlaylists) {
          const idx = currentPlaylists.findIndex((p) => p.id === pl.id);
          if (idx >= 0) {
            currentPlaylists[idx] = pl;
          } else {
            currentPlaylists.unshift(pl);
            imported++;
          }
          if (uid) {
            await savePlaylistToFirestore(uid, pl);
          } else {
            saveLocalPlaylist(pl);
          }
        }

        setUserPlaylists([...currentPlaylists]);
        saveLocalPlaylists(currentPlaylists);
        return imported;
      } finally {
        setIsSyncing(false);
      }
    },
    [userPlaylists]
  );


  // Sync MediaSession for background browser playback & lock-screen / keyboard controls
  const updateMediaSession = useCallback((track: Track | null) => {
    if (!('mediaSession' in navigator) || !track) return;

    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: track.title,
        artist: track.artist || track.channelTitle || 'YouTube Music',
        album: track.albumTitle || 'YouTube Music Web',
        artwork: [
          { src: track.thumbnail, sizes: '96x96', type: 'image/jpeg' },
          { src: track.thumbnail, sizes: '128x128', type: 'image/jpeg' },
          { src: track.thumbnail, sizes: '192x192', type: 'image/jpeg' },
          { src: track.thumbnail, sizes: '256x256', type: 'image/jpeg' },
          { src: track.thumbnail, sizes: '384x384', type: 'image/jpeg' },
          { src: track.thumbnail, sizes: '512x512', type: 'image/jpeg' },
        ],
      });
    } catch (e) {
      console.warn('MediaSession metadata error:', e);
    }
  }, []);

  // Play next track in queue
  const playNext = useCallback(() => {
    const q = queueRef.current;
    if (q.length === 0) return;

    if (repeatModeRef.current === 'one' && currentTrackRef.current) {
      if (playerRef.current && typeof playerRef.current.seekTo === 'function') {
        playerRef.current.seekTo(0, true);
        playerRef.current.playVideo();
        setIsPlaying(true);
        return;
      }
    }

    let nextIndex = queueIndexRef.current + 1;
    if (isShuffleRef.current && q.length > 1) {
      let rand = Math.floor(Math.random() * q.length);
      if (rand === queueIndexRef.current) {
        rand = (rand + 1) % q.length;
      }
      nextIndex = rand;
    } else if (nextIndex >= q.length) {
      if (repeatModeRef.current === 'all') {
        nextIndex = 0;
      } else {
        setIsPlaying(false);
        return;
      }
    }

    const nextTrack = q[nextIndex];
    if (nextTrack) {
      setQueueIndex(nextIndex);
      setCurrentTrack(nextTrack);
      updateMediaSession(nextTrack);
      addTrackToFirestoreHistory(userRef.current?.uid || '', nextTrack);
      if (playerRef.current && typeof playerRef.current.loadVideoById === 'function') {
        playerRef.current.loadVideoById(nextTrack.videoId);
        playerRef.current.playVideo();
        setIsPlaying(true);
      }
    }
  }, [updateMediaSession]);

  // Play previous track in queue
  const playPrevious = useCallback(() => {
    const q = queueRef.current;
    if (q.length === 0) return;

    if (currentTime > 3 && playerRef.current && typeof playerRef.current.seekTo === 'function') {
      playerRef.current.seekTo(0, true);
      return;
    }

    let prevIndex = queueIndexRef.current - 1;
    if (prevIndex < 0) {
      prevIndex = q.length - 1;
    }

    const prevTrack = q[prevIndex];
    if (prevTrack) {
      setQueueIndex(prevIndex);
      setCurrentTrack(prevTrack);
      updateMediaSession(prevTrack);
      addTrackToFirestoreHistory(userRef.current?.uid || '', prevTrack);
      if (playerRef.current && typeof playerRef.current.loadVideoById === 'function') {
        playerRef.current.loadVideoById(prevTrack.videoId);
        playerRef.current.playVideo();
        setIsPlaying(true);
      }
    }
  }, [currentTime, updateMediaSession]);

  // Play / Pause toggle
  const togglePlayPause = useCallback(() => {
    if (!playerRef.current) return;
    try {
      const state = playerRef.current.getPlayerState();
      if (state === 1) {
        playerRef.current.pauseVideo();
        setIsPlaying(false);
      } else {
        playerRef.current.playVideo();
        setIsPlaying(true);
      }
    } catch (e) {
      console.warn('togglePlayPause error:', e);
    }
  }, []);

  // Seek to target time
  const seek = useCallback((seconds: number) => {
    if (playerRef.current && typeof playerRef.current.seekTo === 'function') {
      playerRef.current.seekTo(seconds, true);
      setCurrentTime(seconds);
    }
  }, []);

  // Set volume
  const setVolume = useCallback((vol: number) => {
    const clamped = Math.max(0, Math.min(100, vol));
    setVolumeState(clamped);
    if (playerRef.current && typeof playerRef.current.setVolume === 'function') {
      playerRef.current.setVolume(clamped);
      if (clamped > 0 && isMuted) {
        playerRef.current.unMute();
        setIsMuted(false);
      }
    }
  }, [isMuted]);

  // Toggle mute
  const toggleMute = useCallback(() => {
    if (!playerRef.current) return;
    if (isMuted) {
      playerRef.current.unMute();
      setIsMuted(false);
    } else {
      playerRef.current.mute();
      setIsMuted(true);
    }
  }, [isMuted]);

  // Toggle shuffle
  const toggleShuffle = useCallback(() => {
    setIsShuffle((prev) => !prev);
  }, []);

  // Toggle repeat
  const toggleRepeat = useCallback(() => {
    setRepeatMode((prev) => {
      if (prev === 'off') return 'all';
      if (prev === 'all') return 'one';
      return 'off';
    });
  }, []);

  // Toggle audio / video display mode
  const togglePlayerMode = useCallback(() => {
    setPlayerMode((prev) => (prev === 'audio' ? 'video' : 'audio'));
  }, []);

  // Play specific track with optional replacement queue
  const playTrack = useCallback(
    (track: Track, newQueue?: Track[], index?: number) => {
      if (newQueue && newQueue.length > 0) {
        setQueue(newQueue);
        const idx =
          index !== undefined
            ? index
            : newQueue.findIndex((t) => t.id === track.id || t.videoId === track.videoId);
        setQueueIndex(idx >= 0 ? idx : 0);
      } else {
        const existingIdx = queueRef.current.findIndex(
          (t) => t.id === track.id || t.videoId === track.videoId
        );
        if (existingIdx >= 0) {
          setQueueIndex(existingIdx);
        } else {
          setQueue((prev) => [track, ...prev]);
          setQueueIndex(0);
        }
      }

      setCurrentTrack(track);
      updateMediaSession(track);
      setIsPlaying(true);
      addTrackToFirestoreHistory(userRef.current?.uid || '', track);

      if (playerRef.current && typeof playerRef.current.loadVideoById === 'function') {
        try {
          playerRef.current.loadVideoById(track.videoId);
          playerRef.current.playVideo();
        } catch (e) {
          console.warn('loadVideoById error:', e);
        }
      }
    },
    [updateMediaSession]
  );

  const addToQueue = useCallback((track: Track) => {
    setQueue((prev) => [...prev, track]);
  }, []);

  const removeFromQueue = useCallback((index: number) => {
    setQueue((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const clearQueue = useCallback(() => {
    if (currentTrack) {
      setQueue([currentTrack]);
      setQueueIndex(0);
    } else {
      setQueue([]);
      setQueueIndex(0);
    }
  }, [currentTrack]);

  // MediaSession action handlers
  useEffect(() => {
    if (!('mediaSession' in navigator)) return;

    try {
      navigator.mediaSession.setActionHandler('play', () => {
        if (playerRef.current) {
          playerRef.current.playVideo();
          setIsPlaying(true);
        }
      });
      navigator.mediaSession.setActionHandler('pause', () => {
        if (playerRef.current) {
          playerRef.current.pauseVideo();
          setIsPlaying(false);
        }
      });
      navigator.mediaSession.setActionHandler('previoustrack', playPrevious);
      navigator.mediaSession.setActionHandler('nexttrack', playNext);
      navigator.mediaSession.setActionHandler('seekto', (details) => {
        if (details.seekTime !== undefined && details.seekTime !== null) {
          seek(details.seekTime);
        }
      });
    } catch (e) {
      console.warn('MediaSession handler warning:', e);
    }
  }, [playNext, playPrevious, seek]);

  // Initialize YouTube IFrame Player
  useEffect(() => {
    const initYT = () => {
      if (!window.YT || !window.YT.Player) return;

      const playerContainer = document.getElementById('youtube-persistent-player');
      if (!playerContainer) return;

      playerRef.current = new window.YT.Player('youtube-persistent-player', {
        height: '100%',
        width: '100%',
        videoId: currentTrackRef.current?.videoId || 'abPmFUquq78',
        playerVars: {
          autoplay: 0,
          controls: 0,
          modestbranding: 1,
          rel: 0,
          showinfo: 0,
          playsinline: 1,
          fs: 0,
          iv_load_policy: 3,
        },
        events: {
          onReady: (event: any) => {
            setIsPlayerReady(true);
            event.target.setVolume(volume);
            if (currentTrackRef.current) {
              updateMediaSession(currentTrackRef.current);
            }
            if (isPlayingRef.current && currentTrackRef.current) {
              event.target.loadVideoById(currentTrackRef.current.videoId);
              event.target.playVideo();
            }
          },
          onStateChange: (event: any) => {
            if (event.data === 1) {
              setIsPlaying(true);
              if ('mediaSession' in navigator) {
                navigator.mediaSession.playbackState = 'playing';
              }
            } else if (event.data === 2) {
              setIsPlaying(false);
              if ('mediaSession' in navigator) {
                navigator.mediaSession.playbackState = 'paused';
              }
            } else if (event.data === 0) {
              playNext();
            }
          },
          onError: async (event: any) => {
            console.warn(
              'YouTube Player error code:',
              event.data,
              'for:',
              currentTrackRef.current?.title
            );

            // Handle embedding restriction (codes 101, 150) or unavailable video (100)
            if (currentTrackRef.current) {
              try {
                const alt = await findPlayableAlternative(currentTrackRef.current);
                if (alt && alt.videoId && alt.videoId !== currentTrackRef.current.videoId) {
                  console.log('Auto-recovering with playable track:', alt.title, alt.videoId);
                  const recovered = {
                    ...currentTrackRef.current,
                    videoId: alt.videoId,
                    id: alt.videoId,
                  };
                  setCurrentTrack(recovered);
                  currentTrackRef.current = recovered;
                  if (playerRef.current && typeof playerRef.current.loadVideoById === 'function') {
                    playerRef.current.loadVideoById(alt.videoId);
                    playerRef.current.playVideo();
                    setIsPlaying(true);
                    return;
                  }
                }
              } catch (e) {
                console.warn('Auto recovery failed:', e);
              }
            }

            // Fallback to next song if recovery fails
            setTimeout(() => {
              playNext();
            }, 1200);
          },
        },
      });
    };

    if (window.YT && window.YT.Player) {
      initYT();
    } else {
      window.onYouTubeIframeAPIReady = initYT;
    }

    return () => {
      if (playerRef.current && typeof playerRef.current.destroy === 'function') {
        playerRef.current.destroy();
      }
    };
  }, [playNext, updateMediaSession, volume]);

  // Time & Duration polling interval
  useEffect(() => {
    timeUpdateIntervalRef.current = setInterval(() => {
      if (playerRef.current && typeof playerRef.current.getCurrentTime === 'function') {
        try {
          const cur = playerRef.current.getCurrentTime();
          const dur = playerRef.current.getDuration();
          if (cur !== undefined && !isNaN(cur)) setCurrentTime(cur);
          if (dur !== undefined && !isNaN(dur) && dur > 0) setDuration(dur);
        } catch {
          // ignore
        }
      }
    }, 500);

    return () => {
      if (timeUpdateIntervalRef.current) clearInterval(timeUpdateIntervalRef.current);
    };
  }, []);

  return (
    <PlayerContext.Provider
      value={{
        currentTrack,
        isPlaying,
        currentTime,
        duration,
        volume,
        isMuted,
        isShuffle,
        repeatMode,
        playerMode,
        queue,
        queueIndex,
        isExpanded,
        isQueueOpen,
        isLyricsOpen,
        isPlayerReady,
        playTrack,
        togglePlayPause,
        playNext,
        playPrevious,
        seek,
        setVolume,
        toggleMute,
        toggleShuffle,
        toggleRepeat,
        togglePlayerMode,
        addToQueue,
        removeFromQueue,
        clearQueue,
        setIsExpanded,
        setIsQueueOpen,
        setIsLyricsOpen,

        // Liked tracks & Playlists state & methods
        user,
        setUser,
        likedTracks,
        isLiked,
        toggleLike,
        userPlaylists,
        setUserPlaylists,
        createPlaylist,
        deletePlaylist,
        addTrackToPlaylist,
        removeTrackFromPlaylist,
        isSyncing,
        syncUserData,
        syncYouTubeData,
        importPlaylistFromYouTube,
        importPlaylistsFromChannel,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = (): PlayerContextType => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
};
