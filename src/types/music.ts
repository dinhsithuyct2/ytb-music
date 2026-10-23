export interface Track {
  id: string;
  videoId: string;
  title: string;
  artist: string;
  channelTitle?: string;
  thumbnail: string;
  duration?: string | number; // formatted string e.g. "3:45" or seconds
  durationSeconds?: number;
  albumTitle?: string;
  playlistId?: string;
}

export interface Playlist {
  id: string;
  title: string;
  description?: string;
  thumbnail: string;
  itemCount: number;
  author: string;
  channelId?: string;
  isOwner?: boolean;
  tracks?: Track[];
}

export type ViewType = 'home' | 'explore' | 'library' | 'search' | 'playlist';
export type PlayerMode = 'audio' | 'video';
export type RepeatMode = 'off' | 'all' | 'one';

export interface UserProfile {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
}
