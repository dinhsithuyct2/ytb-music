import { Playlist, Track } from '../types/music';

// Helper to parse ISO 8601 duration (e.g. PT3M45S -> 225s / "3:45")
export function parseDuration(isoDuration: string): { seconds: number; formatted: string } {
  if (!isoDuration) return { seconds: 0, formatted: '0:00' };
  const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return { seconds: 0, formatted: '0:00' };

  const hours = parseInt(match[1] || '0', 10);
  const minutes = parseInt(match[2] || '0', 10);
  const seconds = parseInt(match[3] || '0', 10);

  const totalSeconds = hours * 3600 + minutes * 60 + seconds;
  const formatted =
    hours > 0
      ? `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      : `${minutes}:${seconds.toString().padStart(2, '0')}`;

  return { seconds: totalSeconds, formatted };
}

export function formatSeconds(sec: number): string {
  if (!sec || isNaN(sec) || sec < 0) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

// Fallback curated default tracks in case offline
export const CURATED_TRACKS: Track[] = [
  {
    id: 'abPmFUquq78',
    videoId: 'abPmFUquq78',
    title: 'Đừng Làm Trái Tim Anh Đau',
    artist: 'Sơn Tùng M-TP',
    channelTitle: 'Sơn Tùng M-TP Official',
    thumbnail: 'https://i.ytimg.com/vi/abPmFUquq78/hqdefault.jpg',
    duration: '5:24',
    durationSeconds: 324,
    albumTitle: 'Đừng Làm Trái Tim Anh Đau (Single)',
  },
  {
    id: 'ekr2nIex040',
    videoId: 'ekr2nIex040',
    title: 'APT.',
    artist: 'ROSÉ & Bruno Mars',
    channelTitle: 'ROSÉ',
    thumbnail: 'https://i.ytimg.com/vi/ekr2nIex040/hqdefault.jpg',
    duration: '2:53',
    durationSeconds: 173,
    albumTitle: 'rosie',
  },
  {
    id: 'kPa7bsKwL-8',
    videoId: 'kPa7bsKwL-8',
    title: 'Die With A Smile',
    artist: 'Lady Gaga, Bruno Mars',
    channelTitle: 'Lady Gaga',
    thumbnail: 'https://i.ytimg.com/vi/kPa7bsKwL-8/hqdefault.jpg',
    duration: '4:12',
    durationSeconds: 252,
    albumTitle: 'Die With A Smile (Single)',
  },
  {
    id: 'L1vfn3gP8V4',
    videoId: 'L1vfn3gP8V4',
    title: 'Bước Qua Mùa Cô Đơn',
    artist: 'Vũ.',
    channelTitle: 'Vũ. Official',
    thumbnail: 'https://i.ytimg.com/vi/L1vfn3gP8V4/hqdefault.jpg',
    duration: '4:40',
    durationSeconds: 280,
    albumTitle: 'Một Vạn Năm',
  },
  {
    id: 'ci6R3bviqGQ',
    videoId: 'ci6R3bviqGQ',
    title: 'Nấu Ăn Cho Em',
    artist: 'Đen ft. PiaLinh',
    channelTitle: 'Đen Vâu Official',
    thumbnail: 'https://i.ytimg.com/vi/ci6R3bviqGQ/hqdefault.jpg',
    duration: '4:15',
    durationSeconds: 255,
    albumTitle: 'Nấu Ăn Cho Em',
  },
  {
    id: 'LevIdp-kX04',
    videoId: 'LevIdp-kX04',
    title: 'Espresso',
    artist: 'Sabrina Carpenter',
    channelTitle: 'Sabrina Carpenter',
    thumbnail: 'https://i.ytimg.com/vi/LevIdp-kX04/hqdefault.jpg',
    duration: '3:20',
    durationSeconds: 200,
    albumTitle: 'Short n Sweet',
  },
  {
    id: 'd5gf9dXCSCA',
    videoId: 'd5gf9dXCSCA',
    title: 'BIRDS OF A FEATHER',
    artist: 'Billie Eilish',
    channelTitle: 'Billie Eilish',
    thumbnail: 'https://i.ytimg.com/vi/d5gf9dXCSCA/hqdefault.jpg',
    duration: '3:15',
    durationSeconds: 195,
    albumTitle: 'HIT ME HARD AND SOFT',
  },
  {
    id: 'u_48Z3d6Zhs',
    videoId: 'u_48Z3d6Zhs',
    title: 'nếu lúc đó',
    artist: 'tlinh ft. 2pillz',
    channelTitle: 'tlinh',
    thumbnail: 'https://i.ytimg.com/vi/u_48Z3d6Zhs/hqdefault.jpg',
    duration: '4:21',
    durationSeconds: 261,
    albumTitle: 'Ái',
  },
];

// Curated playlists
export const CURATED_PLAYLISTS: Playlist[] = [
  {
    id: 'curated_vpop',
    title: 'V-Pop Thịnh Hành 2025',
    description: 'Tuyển tập những bản hit V-Pop dẫn đầu các bảng xếp hạng và lan tỏa khắp mạng xã hội.',
    thumbnail: 'https://i.ytimg.com/vi/abPmFUquq78/hqdefault.jpg',
    itemCount: 8,
    author: 'YouTube Music Biên Tập',
    tracks: CURATED_TRACKS,
  },
  {
    id: 'curated_global',
    title: 'Global Billboard Hot 50',
    description: 'Các ca khúc thống trị làng nhạc quốc tế với giai điệu bắt tai nhất hiện nay.',
    thumbnail: 'https://i.ytimg.com/vi/ekr2nIex040/hqdefault.jpg',
    itemCount: 8,
    author: 'YouTube Music Charts',
    tracks: CURATED_TRACKS,
  },
  {
    id: 'curated_lofi',
    title: 'Lofi Chill & Thư Giãn Đêm Khuya',
    description: 'Âm thanh êm dịu, ấm áp đồng hành cùng bạn khi làm việc, học tập hoặc nghỉ ngơi.',
    thumbnail: 'https://i.ytimg.com/vi/jfKfPfyJRdk/hqdefault.jpg',
    itemCount: 8,
    author: 'Lofi Girl & Chillhop',
    tracks: CURATED_TRACKS,
  },
  {
    id: 'curated_workout',
    title: 'Năng Lượng Đột Phá (EDM & Remix)',
    description: 'Bùng nổ năng lượng với nhịp bass mạnh mẽ tiếp sức cho mỗi bước chạy và hiệp tập.',
    thumbnail: 'https://i.ytimg.com/vi/LevIdp-kX04/hqdefault.jpg',
    itemCount: 8,
    author: 'YouTube Music Fitness',
    tracks: CURATED_TRACKS,
  },
];

// LIVE SEARCH: Searches real YouTube videos in real time
export async function searchYouTube(query: string, accessToken?: string | null): Promise<Track[]> {
  if (!query || query.trim().length === 0) return [];

  try {
    const res = await fetch(`/api/youtube/search?q=${encodeURIComponent(query)}`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
    }
  } catch (error) {
    console.warn('Backend search API failed, trying fallback...', error);
  }

  // Fallback search in curated list if network fails
  const queryLower = query.toLowerCase().trim();
  const matchedCurated = CURATED_TRACKS.filter(
    (t) =>
      t.title.toLowerCase().includes(queryLower) ||
      (t.artist && t.artist.toLowerCase().includes(queryLower))
  );

  return matchedCurated.length > 0 ? matchedCurated : CURATED_TRACKS;
}

// LIVE TRENDING: Fetches real dynamic trending tracks from YouTube
export async function fetchTrendingTracks(category: string = 'all'): Promise<Track[]> {
  try {
    const res = await fetch(`/api/youtube/trending?category=${encodeURIComponent(category)}`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
    }
  } catch (error) {
    console.warn('Fetch trending error, using fallback:', error);
  }
  return CURATED_TRACKS;
}

// LIVE AUTOCOMPLETE: Fetches search suggestions
export async function fetchSuggestions(query: string): Promise<string[]> {
  if (!query || query.trim().length === 0) return [];
  try {
    const res = await fetch(`/api/youtube/suggestions?q=${encodeURIComponent(query)}`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) return data;
    }
  } catch (e) {
    // ignore
  }
  return [];
}

// ALTERNATIVE VIDEO RECOVERY: Find playable version if a video is blocked from embedding
export async function findPlayableAlternative(track: Track): Promise<Track | null> {
  try {
    const res = await fetch(
      `/api/youtube/find-playable?title=${encodeURIComponent(track.title)}&artist=${encodeURIComponent(
        track.artist || track.channelTitle || ''
      )}`
    );
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        // Return first match that is not the same videoId
        const match = data.find((t) => t.videoId !== track.videoId) || data[0];
        return match;
      }
    }
  } catch (e) {
    console.warn('findPlayableAlternative error:', e);
  }
  return null;
}

// Fetch logged-in user playlists from YouTube Data API (Google OAuth)
export async function fetchMyPlaylists(accessToken: string): Promise<Playlist[]> {
  try {
    const res = await fetch(
      'https://www.googleapis.com/youtube/v3/playlists?part=snippet,contentDetails&mine=true&maxResults=50',
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json',
        },
      }
    );

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      console.warn('YouTube playlists fetch error:', res.status, errData);
      throw new Error(errData.error?.message || `Lỗi tải danh sách phát (${res.status})`);
    }

    const data = await res.json();
    if (!data.items) return [];

    return data.items.map((item: any) => ({
      id: item.id,
      title: item.snippet?.title || 'Danh sách phát không tên',
      description: item.snippet?.description || '',
      thumbnail:
        item.snippet?.thumbnails?.high?.url ||
        item.snippet?.thumbnails?.medium?.url ||
        item.snippet?.thumbnails?.default?.url ||
        'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=60',
      itemCount: item.contentDetails?.itemCount || 0,
      author: item.snippet?.channelTitle || 'Bạn',
      channelId: item.snippet?.channelId,
      isOwner: true,
    }));
  } catch (error) {
    console.error('fetchMyPlaylists error:', error);
    throw error;
  }
}

// Fetch tracks inside a specific playlist
export async function fetchPlaylistTracks(
  playlistId: string,
  accessToken?: string | null
): Promise<Track[]> {
  // If it's a curated playlist ID, fetch dynamic category or return tracks
  if (playlistId === 'curated_vpop') {
    return fetchTrendingTracks('vpop');
  }
  if (playlistId === 'curated_global') {
    return fetchTrendingTracks('usuk');
  }
  if (playlistId === 'curated_lofi') {
    return fetchTrendingTracks('lofi');
  }
  if (playlistId === 'curated_workout') {
    return fetchTrendingTracks('energy');
  }

  if (!accessToken) {
    return CURATED_TRACKS;
  }

  try {
    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&playlistId=${playlistId}&maxResults=50`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json',
        },
      }
    );

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      console.warn('fetchPlaylistTracks error:', res.status, errData);
      throw new Error(errData.error?.message || `Lỗi tải bài hát trong playlist (${res.status})`);
    }

    const data = await res.json();
    if (!data.items) return [];

    return data.items
      .filter((item: any) => item.snippet?.title !== 'Private video' && item.snippet?.title !== 'Deleted video')
      .map((item: any) => {
        const videoId = item.contentDetails?.videoId || item.snippet?.resourceId?.videoId;
        return {
          id: item.id || videoId,
          videoId: videoId,
          title: item.snippet?.title || 'Bài hát',
          artist: item.snippet?.videoOwnerChannelTitle || item.snippet?.channelTitle || 'Nghệ sĩ',
          channelTitle: item.snippet?.channelTitle,
          thumbnail:
            item.snippet?.thumbnails?.high?.url ||
            item.snippet?.thumbnails?.medium?.url ||
            item.snippet?.thumbnails?.default?.url ||
            `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
          duration: '3:30',
          playlistId: playlistId,
        };
      });
  } catch (error) {
    console.error('fetchPlaylistTracks error:', error);
    return CURATED_TRACKS;
  }
}

// Fetch user's liked videos (Playlist ID 'LL')
export async function fetchLikedVideos(accessToken: string): Promise<Track[]> {
  try {
    const res = await fetch(
      'https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&playlistId=LL&maxResults=50',
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json',
        },
      }
    );

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      console.warn('fetchLikedVideos error:', res.status, errData);
      throw new Error(errData.error?.message || `Lỗi tải bài hát đã thích (${res.status})`);
    }

    const data = await res.json();
    if (!data.items) return [];

    return data.items
      .filter((item: any) => item.snippet?.title !== 'Private video' && item.snippet?.title !== 'Deleted video')
      .map((item: any) => {
        const videoId = item.contentDetails?.videoId || item.snippet?.resourceId?.videoId;
        return {
          id: item.id || videoId,
          videoId: videoId,
          title: item.snippet?.title || 'Bài hát đã thích',
          artist: item.snippet?.videoOwnerChannelTitle || item.snippet?.channelTitle || 'Nghệ sĩ',
          channelTitle: item.snippet?.channelTitle,
          thumbnail:
            item.snippet?.thumbnails?.high?.url ||
            item.snippet?.thumbnails?.medium?.url ||
            `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
          duration: '3:45',
        };
      });
  } catch (error) {
    console.error('fetchLikedVideos error:', error);
    throw error;
  }
}

// Complete Full Sync from logged-in YouTube Account via OAuth Access Token
export async function syncYouTubeAccountData(
  accessToken: string,
  onProgress?: (msg: string) => void
): Promise<{ playlists: Playlist[]; likedTracks: Track[] }> {
  onProgress?.('Đang kết nối tài khoản và lấy danh sách phát...');
  const rawPlaylists = await fetchMyPlaylists(accessToken);

  const fullPlaylists: Playlist[] = [];
  const total = rawPlaylists.length;

  for (let i = 0; i < total; i++) {
    const p = rawPlaylists[i];
    onProgress?.(`Đang tải bài hát trong playlist "${p.title}" (${i + 1}/${total})...`);
    try {
      const tracks = await fetchPlaylistTracks(p.id, accessToken);
      fullPlaylists.push({
        ...p,
        tracks: tracks,
        itemCount: tracks.length,
        thumbnail: tracks[0]?.thumbnail || p.thumbnail,
      });
    } catch {
      fullPlaylists.push({
        ...p,
        tracks: [],
      });
    }
  }

  onProgress?.('Đang đồng bộ bài hát đã thích (Liked Videos)...');
  let likedTracks: Track[] = [];
  try {
    likedTracks = await fetchLikedVideos(accessToken);
  } catch (err) {
    console.warn('Could not fetch liked videos:', err);
  }

  onProgress?.('Đã đồng bộ xong dữ liệu YouTube!');
  return {
    playlists: fullPlaylists,
    likedTracks,
  };
}

// Import single YouTube Playlist by URL or ID (Via Backend Scraper - No OAuth Block)
export async function importYouTubePlaylist(
  urlOrId: string
): Promise<{ playlist: Playlist; tracks: Track[] }> {
  const res = await fetch(`/api/youtube/playlist?id=${encodeURIComponent(urlOrId.trim())}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Không thể tải playlist YouTube (${res.status})`);
  }
  const data = await res.json();
  return {
    playlist: {
      ...data.playlist,
      tracks: data.tracks,
    },
    tracks: data.tracks,
  };
}

// Import playlists from a YouTube Channel by @handle (Via Backend Scraper - No OAuth Block)
export async function importChannelPlaylists(handleOrUrl: string): Promise<Playlist[]> {
  const res = await fetch(
    `/api/youtube/channel-playlists?handle=${encodeURIComponent(handleOrUrl.trim())}`
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Không thể tải playlist từ kênh (${res.status})`);
  }
  return await res.json();
}

