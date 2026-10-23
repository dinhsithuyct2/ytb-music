import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);
const isProd = process.env.NODE_ENV === 'production';

app.use(express.json());

// In-memory cache for fast responses and reducing redundant YouTube calls
const cacheStore: { [key: string]: { data: any[]; timestamp: number } } = {};
const CACHE_TTL = 15 * 60 * 1000; // 15 minutes

// Helper to convert formatted duration string (e.g. "3:45", "1:15:30") to seconds
function durationToSeconds(durStr: string): number {
  if (!durStr) return 0;
  const parts = durStr.split(':').map((p) => parseInt(p, 10));
  if (parts.length === 3) {
    return (parts[0] || 0) * 3600 + (parts[1] || 0) * 60 + (parts[2] || 0);
  }
  if (parts.length === 2) {
    return (parts[0] || 0) * 60 + (parts[1] || 0);
  }
  return parts[0] || 0;
}

// 1. OFFICIAL YOUTUBE MUSIC CHARTS FETCHER
// Retrieves real, individual ranked tracks from official YouTube Charts (Top 100 Vietnam, Global, etc.)
async function fetchYouTubeMusicChart(browseId: string): Promise<any[]> {
  try {
    const res = await fetch('https://music.youtube.com/youtubei/v1/browse?prettyPrint=false', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Referer: 'https://music.youtube.com/explore',
        Origin: 'https://music.youtube.com',
      },
      body: JSON.stringify({
        context: {
          client: {
            clientName: 'WEB_REMIX',
            clientVersion: '1.20240101.01.00',
            gl: 'VN',
            hl: 'vi',
          },
        },
        browseId: browseId,
      }),
    });

    if (!res.ok) {
      console.warn(`YouTube Music Charts API returned ${res.status}`);
      return [];
    }

    const data = await res.json();
    const secList =
      data.contents?.twoColumnBrowseResultsRenderer?.secondaryContents?.sectionListRenderer?.contents;
    const items = secList?.[0]?.musicPlaylistShelfRenderer?.contents;
    if (!items || !Array.isArray(items)) return [];

    const tracks: any[] = [];
    for (const item of items) {
      const r = item.musicResponsiveListItemRenderer;
      if (!r) continue;

      const title =
        r.flexColumns?.[0]?.musicResponsiveListItemFlexColumnRenderer?.text?.runs?.[0]?.text;
      const author =
        r.flexColumns?.[1]?.musicResponsiveListItemFlexColumnRenderer?.text?.runs?.[0]?.text ||
        'Nghệ sĩ';
      const videoId =
        r.playlistItemData?.videoId ||
        r.overlay?.musicItemThumbnailOverlayRenderer?.content?.musicPlayButtonRenderer
          ?.playNavigationEndpoint?.watchEndpoint?.videoId;
      const duration =
        r.fixedColumns?.[0]?.musicResponsiveListItemFixedColumnRenderer?.text?.runs?.[0]?.text ||
        '3:30';
      const thumb =
        r.thumbnail?.musicThumbnailRenderer?.thumbnail?.thumbnails?.slice(-1)[0]?.url ||
        `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

      if (videoId && title) {
        tracks.push({
          id: videoId,
          videoId: videoId,
          title: title.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&'),
          artist: author,
          channelTitle: author,
          thumbnail: thumb,
          duration: duration,
        });
      }
    }
    return tracks;
  } catch (err) {
    console.error('fetchYouTubeMusicChart error:', err);
    return [];
  }
}

// 2. SEARCH INDIVIDUAL TRACKS (With strict compilation/mixtape filter)
async function searchYouTubeTracks(query: string, filterCompilations: boolean = true): Promise<any[]> {
  try {
    const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}&sp=EgIQAQ%253D%253D`;
    const res = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'vi,en;q=0.9',
      },
    });

    if (!res.ok) {
      console.warn(`YouTube search returned status ${res.status}`);
      return [];
    }

    const html = await res.text();
    const match = html.match(/ytInitialData\s*=\s*({.+?});<\/script>/);
    if (!match) return [];

    const data = JSON.parse(match[1]);
    const contents =
      data.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents;
    if (!contents || !Array.isArray(contents)) return [];

    const tracks: any[] = [];
    const compilationRegex = /(tổng hợp|liên khúc|tuyển tập|playlist|1 hour|2 hour|1 giờ|2 giờ|full album|non-stop|nhạc sống|top \d+ bài hát)/i;

    for (const section of contents) {
      const items = section.itemSectionRenderer?.contents;
      if (!items || !Array.isArray(items)) continue;

      for (const item of items) {
        const v = item.videoRenderer;
        if (v && v.videoId) {
          const title =
            v.title?.runs?.map((r: any) => r.text).join('') || v.title?.simpleText || 'Bài hát';
          const author =
            v.ownerText?.runs?.map((r: any) => r.text).join('') ||
            v.longBylineText?.runs?.map((r: any) => r.text).join('') ||
            'YouTube Music';
          const duration = v.lengthText?.simpleText || '3:30';

          // FILTER OUT COMPILATION VIDEOS when requested:
          if (filterCompilations) {
            const seconds = durationToSeconds(duration);
            // Single songs are rarely over 7 minutes (420 seconds)
            if (seconds > 420) continue;
            // Filter out compilation keywords in title
            if (compilationRegex.test(title)) continue;
          }

          const thumb =
            v.thumbnail?.thumbnails?.slice(-1)[0]?.url ||
            `https://i.ytimg.com/vi/${v.videoId}/hqdefault.jpg`;

          tracks.push({
            id: v.videoId,
            videoId: v.videoId,
            title: title
              .replace(/&quot;/g, '"')
              .replace(/&#39;/g, "'")
              .replace(/&amp;/g, '&'),
            artist: author,
            channelTitle: author,
            thumbnail: thumb,
            duration: duration,
          });
        }
      }
    }
    return tracks;
  } catch (error) {
    console.error('searchYouTubeTracks error:', error);
    return [];
  }
}

// 1. API: Search YouTube
app.get('/api/youtube/search', async (req, res) => {
  try {
    const q = (req.query.q as string) || '';
    if (!q.trim()) {
      return res.json([]);
    }

    const results = await searchYouTubeTracks(q, false);
    res.json(results);
  } catch (err: any) {
    console.error('API /api/youtube/search error:', err);
    res.status(500).json({ error: err.message || 'Lỗi tìm kiếm YouTube' });
  }
});

// 2. API: Real Trending Charts from official YouTube Charts & YouTube Music
app.get('/api/youtube/trending', async (req, res) => {
  try {
    const category = (req.query.category as string) || 'all';

    // Check memory cache
    const cacheKey = `chart_${category}`;
    const cached = cacheStore[cacheKey];
    if (cached && Date.now() - cached.timestamp < CACHE_TTL && cached.data.length > 0) {
      return res.json(cached.data);
    }

    let results: any[] = [];

    // Official YouTube Charts Playlist IDs:
    if (category === 'all' || category === 'vpop') {
      // Official YouTube Charts: 100 bài hát hàng đầu tại Việt Nam (Top 100 Songs Vietnam)
      results = await fetchYouTubeMusicChart('VLPL4fGSI1pDJn4bRKr6tjRWaGlqRg_zY_is');
    } else if (category === 'usuk' || category === 'global') {
      // Official YouTube Charts: Top 100 Music Videos Global (Billboard / Global Hits)
      results = await fetchYouTubeMusicChart('VLPL4fGSI1pDJn5kI81J1fYWK5eZRl1zJ5kM');
    } else if (category === 'kpop') {
      // Official K-Pop Trending Chart Hits
      results = await fetchYouTubeMusicChart('VLPLOHoVaTp8R7ccrQM3EpCTVDdwHhXrJhXS');
    } else if (category === 'energy' || category === 'workout') {
      // Top EDM & Remix Songs
      results = await fetchYouTubeMusicChart('VLPLRBp0Fe2Gpgn8Y9qI-p0aTxVtw8onBSFj');
    }

    // Fallback or specific genre searches with strict compilation filter:
    if (results.length === 0) {
      let query = 'nhạc trẻ việt nam official music video';
      if (category === 'relax' || category === 'chill') {
        query = 'nhạc chill thư giãn official audio';
      } else if (category === 'focus' || category === 'lofi') {
        query = 'lofi chill beat official';
      } else if (category === 'energy') {
        query = 'edm remix dance official audio';
      } else if (category === 'kpop') {
        query = 'kpop top hits official mv';
      } else if (category === 'usuk') {
        query = 'billboard hot 100 official music video';
      } else if (category === 'rap') {
        query = 'rap việt official music video';
      } else if (category === 'acoustic') {
        query = 'acoustic việt nam official audio';
      } else if (category === 'ballad') {
        query = 'nhạc ballad việt official mv';
      }

      results = await searchYouTubeTracks(query, true);
    }

    // Cache results
    if (results.length > 0) {
      cacheStore[cacheKey] = { data: results, timestamp: Date.now() };
    }

    res.json(results);
  } catch (err: any) {
    console.error('API /api/youtube/trending error:', err);
    res.status(500).json({ error: err.message || 'Lỗi tải bảng xếp hạng' });
  }
});

// 3. API: Autocomplete suggestions
app.get('/api/youtube/suggestions', async (req, res) => {
  try {
    const q = (req.query.q as string) || '';
    if (!q.trim()) return res.json([]);

    const response = await fetch(
      `https://suggestqueries.google.com/complete/search?client=youtube&ds=yt&client=firefox&q=${encodeURIComponent(
        q
      )}`
    );
    if (!response.ok) return res.json([]);

    const data = await response.json();
    res.json(Array.isArray(data[1]) ? data[1] : []);
  } catch (err) {
    res.json([]);
  }
});

// 4. API: Find alternative playable video for copyright-restricted tracks
app.get('/api/youtube/find-playable', async (req, res) => {
  try {
    const title = (req.query.title as string) || '';
    const artist = (req.query.artist as string) || '';

    const query = `${title} ${artist} audio lyrics`;
    const results = await searchYouTubeTracks(query, true);
    res.json(results.slice(0, 5));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Helper: Extract clean playlist ID from URL or ID string
function extractPlaylistId(input: string): string {
  if (!input) return '';
  const trimmed = input.trim();
  const listMatch = trimmed.match(/[?&]list=([a-zA-Z0-9_-]+)/);
  if (listMatch) return listMatch[1];
  return trimmed;
}

// 5. API: Fetch single YouTube playlist (details + tracks)
app.get('/api/youtube/playlist', async (req, res) => {
  try {
    const rawId = (req.query.id as string) || (req.query.url as string) || '';
    const playlistId = extractPlaylistId(rawId);

    if (!playlistId) {
      return res.status(400).json({ error: 'Thiếu mã hoặc liên kết playlist' });
    }

    // 1. Fetch tracks using YouTube Music internal API
    const browseId = playlistId.startsWith('VL') ? playlistId : `VL${playlistId}`;
    let tracks = await fetchYouTubeMusicChart(browseId);

    // 2. Fetch metadata from YouTube HTML page
    let playlistTitle = 'Danh sách phát YouTube';
    let author = 'YouTube';
    let thumbnail = tracks[0]?.thumbnail || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=60';
    let description = '';

    try {
      const pageRes = await fetch(`https://www.youtube.com/playlist?list=${playlistId}`, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36',
          'Accept-Language': 'vi,en;q=0.9',
        },
      });

      if (pageRes.ok) {
        const html = await pageRes.text();
        const match = html.match(/ytInitialData\s*=\s*({.+?});<\/script>/);
        if (match) {
          const data = JSON.parse(match[1]);
          playlistTitle =
            data.metadata?.playlistMetadataRenderer?.title ||
            data.header?.playlistHeaderRenderer?.title?.simpleText ||
            data.header?.playlistHeaderRenderer?.title?.runs?.[0]?.text ||
            playlistTitle;

          author =
            data.header?.playlistHeaderRenderer?.ownerText?.runs?.[0]?.text ||
            data.header?.playlistHeaderRenderer?.ownerText?.simpleText ||
            author;

          description =
            data.metadata?.playlistMetadataRenderer?.description ||
            data.header?.playlistHeaderRenderer?.descriptionText?.simpleText ||
            '';

          const thumb =
            data.header?.playlistHeaderRenderer?.playlistHeaderBanner?.heroPlaylistThumbnailRenderer?.thumbnail?.thumbnails?.slice(-1)[0]?.url ||
            data.metadata?.playlistMetadataRenderer?.thumbnail?.thumbnails?.slice(-1)[0]?.url;
          if (thumb) thumbnail = thumb;

          // If YouTube Music browse returned no tracks, parse tracks from HTML
          if (tracks.length === 0) {
            const sec = data.contents?.twoColumnBrowseResultsRenderer?.tabs?.[0]?.tabRenderer?.content?.sectionListRenderer?.contents?.[0];
            const items = sec?.itemSectionRenderer?.contents || [];
            for (const item of items) {
              const lockup = item.lockupViewModel;
              if (lockup) {
                const vid = lockup.rendererContext?.commandContext?.onTap?.innertubeCommand?.watchEndpoint?.videoId;
                const label = lockup.rendererContext?.accessibilityContext?.label || '';
                const parts = label.split(' - ');
                const itemArtist = parts.length > 1 ? parts[0] : author;
                const itemTitle = parts.length > 1 ? parts.slice(1).join(' - ') : label || 'Bài hát';
                const itemThumb = lockup.contentImage?.thumbnailViewModel?.image?.sources?.slice(-1)[0]?.url || `https://i.ytimg.com/vi/${vid}/hqdefault.jpg`;
                if (vid) {
                  tracks.push({
                    id: vid,
                    videoId: vid,
                    title: itemTitle.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&'),
                    artist: itemArtist,
                    channelTitle: itemArtist,
                    thumbnail: itemThumb,
                    duration: '3:30',
                  });
                }
              }
            }
          }
        }
      }
    } catch (e) {
      console.warn('Error fetching playlist metadata HTML:', e);
    }

    if (tracks.length > 0 && (!thumbnail || thumbnail.includes('unsplash'))) {
      thumbnail = tracks[0].thumbnail;
    }

    res.json({
      playlist: {
        id: playlistId,
        title: playlistTitle,
        description: description,
        thumbnail: thumbnail,
        itemCount: tracks.length,
        author: author,
        isOwner: true,
      },
      tracks: tracks,
    });
  } catch (err: any) {
    console.error('API /api/youtube/playlist error:', err);
    res.status(500).json({ error: err.message || 'Lỗi tải danh sách phát' });
  }
});

// 6. API: Fetch playlists from a YouTube Channel (@handle or channel ID)
app.get('/api/youtube/channel-playlists', async (req, res) => {
  try {
    const rawHandle = (req.query.handle as string) || (req.query.channel as string) || '';
    if (!rawHandle.trim()) {
      return res.status(400).json({ error: 'Vui lòng cung cấp @handle hoặc liên kết kênh YouTube' });
    }

    let cleanHandle = rawHandle.trim();
    // Support full URLs: https://www.youtube.com/@mychannel
    const urlMatch = cleanHandle.match(/youtube\.com\/(@[a-zA-Z0-9_.-]+)/i);
    if (urlMatch) {
      cleanHandle = urlMatch[1];
    } else if (!cleanHandle.startsWith('@') && !cleanHandle.startsWith('UC')) {
      cleanHandle = `@${cleanHandle}`;
    }

    const channelPlaylistsUrl = `https://www.youtube.com/${cleanHandle}/playlists`;
    const pageRes = await fetch(channelPlaylistsUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'vi,en;q=0.9',
      },
    });

    if (!pageRes.ok) {
      return res.status(pageRes.status).json({
        error: `Không tìm thấy kênh YouTube (${cleanHandle})`,
      });
    }

    const html = await pageRes.text();
    const match = html.match(/ytInitialData\s*=\s*({.+?});<\/script>/);
    if (!match) {
      return res.json([]);
    }

    const data = JSON.parse(match[1]);
    const jsonStr = JSON.stringify(data);
    const plMatches = [...jsonStr.matchAll(/\"playlistId\":\"(PL[a-zA-Z0-9_-]+)\"/g)].map((m) => m[1]);
    const uniquePlIds = [...new Set(plMatches)].slice(0, 10); // Limit to top 10 playlists

    if (uniquePlIds.length === 0) {
      return res.json([]);
    }

    // Channel metadata
    const channelName =
      data.metadata?.channelMetadataRenderer?.title || cleanHandle;

    const playlistsResults = [];
    for (const plId of uniquePlIds) {
      const browseId = `VL${plId}`;
      const tracks = await fetchYouTubeMusicChart(browseId);
      if (tracks.length > 0) {
        playlistsResults.push({
          id: plId,
          title: `Danh sách phát (${plId.slice(2, 8)})`,
          description: `Đồng bộ từ kênh ${channelName}`,
          thumbnail: tracks[0]?.thumbnail || '',
          itemCount: tracks.length,
          author: channelName,
          isOwner: true,
          tracks: tracks,
        });
      }
    }

    res.json(playlistsResults);
  } catch (err: any) {
    console.error('API /api/youtube/channel-playlists error:', err);
    res.status(500).json({ error: err.message || 'Lỗi quét danh sách phát từ kênh YouTube' });
  }
});

// Setup Vite middlewares (dev) or Static build (prod)
async function startServer() {
  if (!isProd) {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`YouTube Music Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
