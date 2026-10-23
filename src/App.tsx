/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { PlayerProvider, usePlayer } from './context/PlayerContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { PlayerBar } from './components/PlayerBar';
import { ExpandedPlayer } from './components/ExpandedPlayer';
import { BackgroundPlayerHost } from './components/BackgroundPlayerHost';
import { BackgroundListeningToast } from './components/BackgroundListeningToast';
import { HomeView } from './components/HomeView';
import { ExploreView } from './components/ExploreView';
import { LibraryView } from './components/LibraryView';
import { PlaylistDetailView } from './components/PlaylistDetailView';
import { SearchView } from './components/SearchView';
import { MobileBottomNav } from './components/MobileBottomNav';
import { AddToPlaylistModal } from './components/AddToPlaylistModal';
import { YouTubeSyncModal } from './components/YouTubeSyncModal';

import {
  Track,
  Playlist,
  ViewType,
  UserProfile,
} from './types/music';

import {
  initAuth,
  googleSignIn,
  logout,
} from './services/auth';

import {
  CURATED_TRACKS,
  CURATED_PLAYLISTS,
  fetchPlaylistTracks,
  searchYouTube,
  fetchTrendingTracks,
} from './services/youtube';

const MainApp: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewType>('home');

  // Player Context state & handlers
  const {
    user,
    setUser,
    userPlaylists,
    likedTracks,
    isSyncing,
    syncUserData,
    togglePlayPause,
  } = usePlayer();

  // Playlists and tracks state
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
  const [playlistTracks, setPlaylistTracks] = useState<Track[]>([]);
  const [isLoadingPlaylistTracks, setIsLoadingPlaylistTracks] = useState<boolean>(false);

  // Add to playlist modal state
  const [addToPlaylistTrack, setAddToPlaylistTrack] = useState<Track | null>(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<Track[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);

  // Live trending tracks
  const [trendingTracks, setTrendingTracks] = useState<Track[]>(CURATED_TRACKS);

  // Global YouTube Sync Modal state
  const [showGlobalSyncModal, setShowGlobalSyncModal] = useState<boolean>(false);

  // Load live trending tracks on startup
  useEffect(() => {
    fetchTrendingTracks('all').then((live) => {
      if (live && live.length > 0) {
        setTrendingTracks(live);
      }
    });
  }, []);

  // Listen to Auth State
  useEffect(() => {
    const unsubscribe = initAuth(
      (firebaseUser) => {
        const profile: UserProfile = {
          uid: firebaseUser.uid,
          displayName: firebaseUser.displayName,
          email: firebaseUser.email,
          photoURL: firebaseUser.photoURL,
        };
        setUser(profile);
        syncUserData(profile);
      },
      () => {
        setUser(null);
        syncUserData(null);
      }
    );

    return () => unsubscribe();
  }, [setUser, syncUserData]);

  // Google Login flow (Clean standard sign-in, no sensitive OAuth scope blocker)
  const handleLogin = async () => {
    try {
      const result = await googleSignIn();
      if (result) {
        const profile: UserProfile = {
          uid: result.user.uid,
          displayName: result.user.displayName,
          email: result.user.email,
          photoURL: result.user.photoURL,
        };
        setUser(profile);
        await syncUserData(profile);
      }
    } catch (err: any) {
      console.error('Login error:', err);
    }
  };

  // Logout flow
  const handleLogout = async () => {
    await logout();
    setUser(null);
    syncUserData(null);
    if (selectedPlaylist?.isOwner) {
      setSelectedPlaylist(null);
      setCurrentView('home');
    }
  };

  // Re-sync with Firestore
  const handleRefresh = async () => {
    if (user) {
      await syncUserData(user);
    } else {
      await handleLogin();
    }
  };

  // Select Playlist to view details
  const handleSelectPlaylist = async (playlist: Playlist) => {
    setSelectedPlaylist(playlist);
    setCurrentView('playlist');

    // If it's a user-created or local playlist with stored tracks
    if (playlist.tracks && playlist.tracks.length > 0) {
      setPlaylistTracks(playlist.tracks);
      return;
    }

    // If it's an external YouTube playlist
    setIsLoadingPlaylistTracks(true);
    try {
      const tracks = await fetchPlaylistTracks(playlist.id);
      setPlaylistTracks(tracks && tracks.length > 0 ? tracks : CURATED_TRACKS);
    } catch (err) {
      console.error('Error fetching playlist tracks:', err);
      setPlaylistTracks(playlist.tracks || CURATED_TRACKS);
    } finally {
      setIsLoadingPlaylistTracks(false);
    }
  };

  // Keep selected playlist in sync if modified
  useEffect(() => {
    if (selectedPlaylist && selectedPlaylist.id !== 'liked_videos') {
      const updated = userPlaylists.find((p) => p.id === selectedPlaylist.id);
      if (updated) {
        setSelectedPlaylist(updated);
        if (updated.tracks) {
          setPlaylistTracks(updated.tracks);
        }
      }
    }
  }, [userPlaylists, selectedPlaylist?.id]);

  // Select Liked Songs
  const handleSelectLikedSongs = () => {
    const likedPlaylist: Playlist = {
      id: 'liked_videos',
      title: 'Bài hát đã thích',
      description: 'Danh sách các bài hát bạn đã bấm Thích và đồng bộ qua Cloud Firestore.',
      thumbnail:
        likedTracks[0]?.thumbnail ||
        'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=60',
      itemCount: likedTracks.length,
      author: user?.displayName || 'Bạn',
      isOwner: true,
      tracks: likedTracks.length > 0 ? likedTracks : CURATED_TRACKS,
    };

    setSelectedPlaylist(likedPlaylist);
    setPlaylistTracks(likedTracks.length > 0 ? likedTracks : CURATED_TRACKS);
    setCurrentView('playlist');
  };

  // Keep liked tracks playlist view in sync when toggled
  useEffect(() => {
    if (selectedPlaylist?.id === 'liked_videos') {
      setPlaylistTracks(likedTracks.length > 0 ? likedTracks : CURATED_TRACKS);
    }
  }, [likedTracks, selectedPlaylist?.id]);

  // Search handler
  const handleSearchSubmit = async (query: string) => {
    if (!query.trim()) return;
    setCurrentView('search');
    setIsSearching(true);
    try {
      const results = await searchYouTube(query);
      setSearchResults(results);
    } catch (err) {
      console.error('Search error:', err);
      setSearchResults(CURATED_TRACKS);
    } finally {
      setIsSearching(false);
    }
  };

  // Global spacebar to play/pause when not in an input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        e.code === 'Space' &&
        target.tagName !== 'INPUT' &&
        target.tagName !== 'TEXTAREA' &&
        !target.isContentEditable
      ) {
        e.preventDefault();
        togglePlayPause();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlayPause]);

  // Dynamic screen height calculation for mobile to eliminate blank bottom gaps
  useEffect(() => {
    const updateAppHeight = () => {
      // In iOS standalone PWA, use full viewport height (innerHeight) to avoid blank space at bottom
      const fullHeight = Math.max(
        window.innerHeight,
        document.documentElement.clientHeight || 0
      );
      document.documentElement.style.setProperty('--app-height', `${fullHeight}px`);
    };

    updateAppHeight();
    window.addEventListener('resize', updateAppHeight);
    window.addEventListener('orientationchange', updateAppHeight);

    return () => {
      window.removeEventListener('resize', updateAppHeight);
      window.removeEventListener('orientationchange', updateAppHeight);
    };
  }, []);

  return (
    <div
      className="fixed inset-0 top-0 bottom-0 left-0 right-0 flex flex-col w-full h-full h-[100dvh] min-h-[100dvh] max-h-[100dvh] overflow-hidden bg-[#030303] text-white select-none"
    >
      {/* Top Header */}
      <Header
        currentView={currentView}
        setCurrentView={setCurrentView}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onSearchSubmit={handleSearchSubmit}
        user={user}
        onLogin={handleLogin}
        onLogout={handleLogout}
        onRefreshYouTube={handleRefresh}
        onOpenYouTubeSync={() => setShowGlobalSyncModal(true)}
        isSyncing={isSyncing}
      />

      {/* Main Body with Sidebar + Dynamic View */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          currentView={currentView}
          setCurrentView={setCurrentView}
          userPlaylists={userPlaylists}
          curatedPlaylists={CURATED_PLAYLISTS}
          selectedPlaylistId={selectedPlaylist?.id || null}
          onSelectPlaylist={handleSelectPlaylist}
          onSelectLikedSongs={handleSelectLikedSongs}
          user={user}
          onLogin={handleLogin}
          onRefreshPlaylists={handleRefresh}
          onOpenYouTubeSync={() => setShowGlobalSyncModal(true)}
          isSyncing={isSyncing}
        />

        <main className="flex-1 flex flex-col min-w-0 bg-[#030303] relative overflow-hidden">
          {currentView === 'home' && (
            <HomeView
              user={user}
              userPlaylists={userPlaylists}
              curatedPlaylists={CURATED_PLAYLISTS}
              trendingTracks={trendingTracks}
              onSelectPlaylist={handleSelectPlaylist}
              onSelectLikedSongs={handleSelectLikedSongs}
              onExploreClick={() => setCurrentView('explore')}
              onLogin={handleLogin}
            />
          )}

          {currentView === 'explore' && (
            <ExploreView
              trendingTracks={trendingTracks}
              curatedPlaylists={CURATED_PLAYLISTS}
              onSelectPlaylist={handleSelectPlaylist}
              onSearchCategory={(genre) => handleSearchSubmit(genre)}
            />
          )}

          {currentView === 'library' && (
            <LibraryView
              user={user}
              userPlaylists={userPlaylists}
              likedTracks={likedTracks}
              onSelectPlaylist={handleSelectPlaylist}
              onSelectLikedSongs={handleSelectLikedSongs}
              onLogin={handleLogin}
              onRefresh={handleRefresh}
              isSyncing={isSyncing}
            />
          )}

          {currentView === 'playlist' && selectedPlaylist && (
            <PlaylistDetailView
              playlist={selectedPlaylist}
              tracks={playlistTracks}
              onBack={() => setCurrentView('home')}
              isLoading={isLoadingPlaylistTracks}
            />
          )}

          {currentView === 'search' && (
            <SearchView
              query={searchQuery}
              results={searchResults}
              isSearching={isSearching}
              onBack={() => setCurrentView('home')}
              onSearchAgain={handleSearchSubmit}
            />
          )}
        </main>
      </div>

      {/* Persistent Bottom Player Bar (Desktop Bar + Mobile Mini-Player) */}
      <PlayerBar />

      {/* Mobile Native Bottom Navigation Bar */}
      <MobileBottomNav
        currentView={currentView}
        setCurrentView={setCurrentView}
        onOpenSearch={() => setCurrentView('search')}
      />

      {/* Fullscreen Expanded Player */}
      <ExpandedPlayer />

      {/* Persistent YouTube Iframe Host Container */}
      <BackgroundPlayerHost />

      {/* Background Playback Notice Toast */}
      <BackgroundListeningToast />

      {/* Add To Playlist Modal */}
      <AddToPlaylistModal
        isOpen={!!addToPlaylistTrack}
        onClose={() => setAddToPlaylistTrack(null)}
        track={addToPlaylistTrack}
      />

      {/* Global YouTube Sync Modal */}
      <YouTubeSyncModal
        isOpen={showGlobalSyncModal}
        onClose={() => setShowGlobalSyncModal(false)}
        user={user}
        onLogin={handleLogin}
        onPlaylistImported={(playlist) => {
          handleSelectPlaylist(playlist);
        }}
      />
    </div>
  );
};

export default function App() {
  return (
    <PlayerProvider>
      <MainApp />
    </PlayerProvider>
  );
}
