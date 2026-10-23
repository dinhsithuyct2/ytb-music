import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  updateDoc,
  serverTimestamp,
  query,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db } from './auth';
import { Playlist, Track, UserProfile } from '../types/music';

const LOCAL_STORAGE_PLAYLISTS_KEY = 'yt_music_local_playlists';
const LOCAL_STORAGE_FAVORITES_KEY = 'yt_music_local_favorites';
const LOCAL_STORAGE_HISTORY_KEY = 'yt_music_local_history';

// ----------------------------------------------------
// 1. User Profile Management
// ----------------------------------------------------
export const syncUserProfile = async (user: UserProfile): Promise<void> => {
  if (!user.uid) return;
  try {
    const userRef = doc(db, 'users', user.uid);
    await setDoc(
      userRef,
      {
        uid: user.uid,
        displayName: user.displayName || 'Người dùng',
        email: user.email || '',
        photoURL: user.photoURL || '',
        lastLoginAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (error) {
    console.error('Error syncing user profile to Firestore:', error);
  }
};

// ----------------------------------------------------
// 2. Playlists Management in Firestore
// ----------------------------------------------------
export const fetchFirestorePlaylists = async (userId: string): Promise<Playlist[]> => {
  if (!userId) return getLocalPlaylists();
  try {
    const playlistsRef = collection(db, 'users', userId, 'playlists');
    const q = query(playlistsRef, orderBy('updatedAt', 'desc'));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      // If Firestore is empty, check if we have local playlists to upload
      const local = getLocalPlaylists();
      if (local.length > 0) {
        await Promise.all(local.map((p) => savePlaylistToFirestore(userId, p)));
        return local;
      }
      return [];
    }

    const playlists: Playlist[] = snapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        title: data.title || 'Danh sách phát',
        description: data.description || '',
        thumbnail:
          data.thumbnail ||
          data.tracks?.[0]?.thumbnail ||
          'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&auto=format&fit=crop&q=60',
        itemCount: data.tracks ? data.tracks.length : data.itemCount || 0,
        author: data.author || 'Bạn',
        isOwner: true,
        tracks: data.tracks || [],
      };
    });

    saveLocalPlaylists(playlists);
    return playlists;
  } catch (error) {
    console.error('Error loading playlists from Firestore, falling back to local:', error);
    return getLocalPlaylists();
  }
};

export const savePlaylistToFirestore = async (
  userId: string,
  playlist: Playlist
): Promise<void> => {
  if (!userId) {
    saveLocalPlaylist(playlist);
    return;
  }

  try {
    const playlistRef = doc(db, 'users', userId, 'playlists', playlist.id);
    await setDoc(
      playlistRef,
      {
        id: playlist.id,
        title: playlist.title,
        description: playlist.description || '',
        thumbnail: playlist.thumbnail || '',
        itemCount: playlist.tracks?.length || playlist.itemCount || 0,
        author: playlist.author || 'Bạn',
        tracks: playlist.tracks || [],
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    saveLocalPlaylist(playlist);
  } catch (error) {
    console.error('Error saving playlist to Firestore:', error);
    saveLocalPlaylist(playlist);
  }
};

export const deletePlaylistFromFirestore = async (
  userId: string,
  playlistId: string
): Promise<void> => {
  deleteLocalPlaylist(playlistId);
  if (!userId) return;

  try {
    const playlistRef = doc(db, 'users', userId, 'playlists', playlistId);
    await deleteDoc(playlistRef);
  } catch (error) {
    console.error('Error deleting playlist from Firestore:', error);
  }
};

export const addTrackToFirestorePlaylist = async (
  userId: string,
  playlistId: string,
  track: Track
): Promise<Playlist | null> => {
  // Update local copy
  const localPlaylists = getLocalPlaylists();
  const index = localPlaylists.findIndex((p) => p.id === playlistId);
  if (index === -1) return null;

  const playlist = { ...localPlaylists[index] };
  const existingTracks = playlist.tracks ? [...playlist.tracks] : [];

  // Avoid duplicates
  if (!existingTracks.some((t) => t.id === track.id || t.videoId === track.videoId)) {
    existingTracks.push(track);
  }

  playlist.tracks = existingTracks;
  playlist.itemCount = existingTracks.length;
  if (!playlist.thumbnail || playlist.thumbnail.includes('unsplash')) {
    playlist.thumbnail = track.thumbnail;
  }

  localPlaylists[index] = playlist;
  saveLocalPlaylists(localPlaylists);

  if (userId) {
    try {
      const playlistRef = doc(db, 'users', userId, 'playlists', playlistId);
      await updateDoc(playlistRef, {
        tracks: playlist.tracks,
        itemCount: playlist.itemCount,
        thumbnail: playlist.thumbnail,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating playlist in Firestore:', error);
    }
  }

  return playlist;
};

export const removeTrackFromFirestorePlaylist = async (
  userId: string,
  playlistId: string,
  trackId: string
): Promise<Playlist | null> => {
  const localPlaylists = getLocalPlaylists();
  const index = localPlaylists.findIndex((p) => p.id === playlistId);
  if (index === -1) return null;

  const playlist = { ...localPlaylists[index] };
  const updatedTracks = (playlist.tracks || []).filter(
    (t) => t.id !== trackId && t.videoId !== trackId
  );

  playlist.tracks = updatedTracks;
  playlist.itemCount = updatedTracks.length;
  if (updatedTracks.length > 0 && updatedTracks[0].thumbnail) {
    playlist.thumbnail = updatedTracks[0].thumbnail;
  }

  localPlaylists[index] = playlist;
  saveLocalPlaylists(localPlaylists);

  if (userId) {
    try {
      const playlistRef = doc(db, 'users', userId, 'playlists', playlistId);
      await updateDoc(playlistRef, {
        tracks: playlist.tracks,
        itemCount: playlist.itemCount,
        thumbnail: playlist.thumbnail,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error removing track from Firestore playlist:', error);
    }
  }

  return playlist;
};

// ----------------------------------------------------
// 3. Favorites / Liked Songs Management
// ----------------------------------------------------
export const fetchFirestoreFavorites = async (userId: string): Promise<Track[]> => {
  if (!userId) return getLocalFavorites();
  try {
    const favoritesRef = collection(db, 'users', userId, 'favorites');
    const q = query(favoritesRef, orderBy('likedAt', 'desc'), limit(200));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      const local = getLocalFavorites();
      if (local.length > 0) {
        // Upload local favorites to Firestore
        await Promise.all(local.map((t) => saveFavoriteToFirestore(userId, t)));
        return local;
      }
      return [];
    }

    const tracks: Track[] = snapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        videoId: data.videoId || docSnap.id,
        title: data.title,
        artist: data.artist,
        channelTitle: data.channelTitle,
        thumbnail: data.thumbnail,
        duration: data.duration,
        durationSeconds: data.durationSeconds,
      };
    });

    saveLocalFavorites(tracks);
    return tracks;
  } catch (error) {
    console.error('Error fetching favorites from Firestore:', error);
    return getLocalFavorites();
  }
};

export const saveFavoriteToFirestore = async (userId: string, track: Track): Promise<void> => {
  const trackId = track.id || track.videoId;
  if (!trackId) return;

  // Update local favorites
  const local = getLocalFavorites();
  if (!local.some((t) => (t.id || t.videoId) === trackId)) {
    local.unshift(track);
    saveLocalFavorites(local);
  }

  if (!userId) return;

  try {
    const favRef = doc(db, 'users', userId, 'favorites', trackId);
    await setDoc(favRef, {
      ...track,
      videoId: track.videoId || track.id,
      likedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error saving favorite to Firestore:', error);
  }
};

export const removeFavoriteFromFirestore = async (
  userId: string,
  trackId: string
): Promise<void> => {
  // Update local
  const local = getLocalFavorites().filter((t) => (t.id || t.videoId) !== trackId);
  saveLocalFavorites(local);

  if (!userId) return;

  try {
    const favRef = doc(db, 'users', userId, 'favorites', trackId);
    await deleteDoc(favRef);
  } catch (error) {
    console.error('Error removing favorite from Firestore:', error);
  }
};

// ----------------------------------------------------
// 4. Listening History Management
// ----------------------------------------------------
export const addTrackToFirestoreHistory = async (userId: string, track: Track): Promise<void> => {
  const trackId = track.id || track.videoId;
  if (!trackId) return;

  const history = getLocalHistory();
  const filtered = history.filter((t) => (t.id || t.videoId) !== trackId);
  filtered.unshift(track);
  saveLocalHistory(filtered.slice(0, 50));

  if (!userId) return;

  try {
    const historyRef = doc(db, 'users', userId, 'history', trackId);
    await setDoc(historyRef, {
      ...track,
      videoId: track.videoId || track.id,
      playedAt: serverTimestamp(),
    });
  } catch (error) {
    console.warn('Error saving to history in Firestore:', error);
  }
};

// ----------------------------------------------------
// 5. Local Storage Helpers (Offline & Guest Support)
// ----------------------------------------------------
export const getLocalPlaylists = (): Playlist[] => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_PLAYLISTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const saveLocalPlaylists = (playlists: Playlist[]): void => {
  try {
    localStorage.setItem(LOCAL_STORAGE_PLAYLISTS_KEY, JSON.stringify(playlists));
  } catch (e) {
    console.warn('Could not write playlists to localStorage', e);
  }
};

export const saveLocalPlaylist = (playlist: Playlist): void => {
  const current = getLocalPlaylists();
  const index = current.findIndex((p) => p.id === playlist.id);
  if (index >= 0) {
    current[index] = playlist;
  } else {
    current.unshift(playlist);
  }
  saveLocalPlaylists(current);
};

export const deleteLocalPlaylist = (playlistId: string): void => {
  const current = getLocalPlaylists().filter((p) => p.id !== playlistId);
  saveLocalPlaylists(current);
};

export const getLocalFavorites = (): Track[] => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_FAVORITES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const saveLocalFavorites = (tracks: Track[]): void => {
  try {
    localStorage.setItem(LOCAL_STORAGE_FAVORITES_KEY, JSON.stringify(tracks));
  } catch (e) {
    console.warn('Could not write favorites to localStorage', e);
  }
};

export const getLocalHistory = (): Track[] => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const saveLocalHistory = (tracks: Track[]): void => {
  try {
    localStorage.setItem(LOCAL_STORAGE_HISTORY_KEY, JSON.stringify(tracks));
  } catch (e) {
    console.warn('Could not write history to localStorage', e);
  }
};
