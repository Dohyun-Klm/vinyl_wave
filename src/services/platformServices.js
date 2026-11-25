/**
 * Platform Services - YouTube & SoundCloud API 통합
 * 
 * 공통 데이터 모델:
 * {
 *   trackId,      // 플랫폼 고유 ID
 *   title,        // 트랙 제목
 *   artist,       // 아티스트명
 *   artworkUrl,   // 앨범아트 URL
 *   platform,     // 'youtube' | 'soundcloud'
 *   playbackId,   // YouTube: videoId, SoundCloud: trackId 문자열
 *   playbackUrl,  // 임베드 URL
 *   duration,     // 초 단위 (없는 경우 null)
 *   isPlayable    // 재생 가능 여부
 * }
 */

// YouTube API 설정
const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;
const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3';
const YOUTUBE_IFRAME_API = 'https://www.youtube.com/iframe_api';

// SoundCloud API 설정  
const SOUNDCLOUD_CLIENT_ID = import.meta.env.VITE_SOUNDCLOUD_CLIENT_ID;
const SOUNDCLOUD_CLIENT_SECRET = import.meta.env.VITE_SOUNDCLOUD_CLIENT_SECRET;
const SOUNDCLOUD_API_BASE = 'https://api.soundcloud.com';

// ============================================================================
// YouTube Services
// ============================================================================

/**
 * YouTube 데이터 검색
 * @param {string} query - 검색어
 * @param {number} maxResults - 최대 결과 수 (기본 10, 최대 50)
 * @returns {Promise<Array>} 공통 형태의 트랙 배열
 */
export async function searchYouTube(query, maxResults = 10) {
  if (!YOUTUBE_API_KEY) {
    throw new Error('YouTube API Key가 설정되지 않음. .env.example을 참고하세요.');
  }

  const params = new URLSearchParams({
    part: 'snippet',
    q: query,
    maxResults: Math.min(maxResults, 50),
    type: 'video',
    videoEmbeddable: 'true',  // 임베드 가능한 영상만
    videoCategoryId: '10',    // Music 카테고리
  });

  const response = await fetch(
    `${YOUTUBE_API_BASE}/search?${params}`,
    { headers: { 'Accept': 'application/json' } }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(`YouTube API 오류: ${response.status} ${error.error?.message || ''}`);
  }

  const data = await response.json();
  
  return data.items.map(item => ({
    trackId: item.id.videoId,
    title: item.snippet.title,
    artist: item.snippet.channelTitle,
    artworkUrl: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url,
    platform: 'youtube',
    playbackId: item.id.videoId,
    playbackUrl: `https://www.youtube.com/embed/${item.id.videoId}`,
    duration: null,  // 검색 결과에는 duration이 없음 (별도 요청 필요)
    isPlayable: true,
    rawData: item,  // 원본 데이터 보존
  }));
}

/**
 * YouTube 비디오 상세 정보 조회 (duration 포함)
 * @param {string} videoId - YouTube Video ID
 * @returns {Promise<Object>} 비디오 상세 정보
 */
export async function getYouTubeVideoDetails(videoId) {
  if (!YOUTUBE_API_KEY) {
    throw new Error('YouTube API Key가 설정되지 않음.');
  }

  const params = new URLSearchParams({
    part: 'snippet,contentDetails',
    id: videoId,
  });

  const response = await fetch(
    `${YOUTUBE_API_BASE}/videos?${params}`,
    { headers: { 'Accept': 'application/json' } }
  );

  if (!response.ok) {
    throw new Error(`YouTube 비디오 상세 조회 실패: ${response.status}`);
  }

  const data = await response.json();
  const item = data.items?.[0];
  
  if (!item) return null;

  // ISO 8601 duration 파싱 (PT1H2M3S 형식)
  const durationIso = item.contentDetails.duration;
  const durationSeconds = parseISO8601Duration(durationIso);

  return {
    trackId: videoId,
    title: item.snippet.title,
    artist: item.snippet.channelTitle,
    artworkUrl: item.snippet.thumbnails.medium?.url,
    platform: 'youtube',
    playbackId: videoId,
    playbackUrl: `https://www.youtube.com/embed/${videoId}`,
    duration: durationSeconds,
    isPlayable: item.contentDetails.licensedTransfer,
    rawData: item,
  };
}

/**
 * ISO 8601 Duration 파싱 (PT1H2M3S -> 초)
 */
function parseISO8601Duration(isoString) {
  const match = isoString.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  const hours = parseInt(match[1] || 0, 10);
  const minutes = parseInt(match[2] || 0, 10);
  const seconds = parseInt(match[3] || 0, 10);
  return hours * 3600 + minutes * 60 + seconds;
}

// ============================================================================
// SoundCloud Services
// ============================================================================

/**
 * SoundCloud 클라이언트 인증 토큰 조회 (Client Credentials Flow)
 * 브라우저에서는 CORS 이슈로 직접 호출 불가 → 프록시 또는 사전 토큰 필요
 */
async function getSoundCloudToken() {
  if (!SOUNDCLOUD_CLIENT_ID || !SOUNDCLOUD_CLIENT_SECRET) {
    throw new Error('SoundCloud API Key가 설정되지 않음. .env.example을 참고하세요.');
  }

  // 환경변수에서 직접 호출 (서버 사이드에서는 OK, 브라우저에서는 제한)
  // 프론트엔드에서는 사전에 토큰을 받아오거나, 백엔드 프록시 필요
  const credentials = btoa(`${SOUNDCLOUD_CLIENT_ID}:${SOUNDCLOUD_CLIENT_SECRET}`);
  
  const response = await fetch('https://secure.soundcloud.com/oauth/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${credentials}`,
    },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(`SoundCloud 인증 실패: ${response.status} ${error.error_description || ''}`);
  }

  const data = await response.json();
  return data.access_token;
}

/**
 * SoundCloud 트랙 검색
 * @param {string} query - 검색어
 * @param {number} limit - 결과 수 (기본 10, 최대 50)
 * @returns {Promise<Array>} 공통 형태의 트랙 배열
 */
export async function searchSoundCloud(query, limit = 10) {
  // 프론트엔드에서는 직접 CORS 호출이 제한될 수 있음
  // 개발 모드: 임시 Mock 데이터 반환 (실제 구현 시 백엔드 프록시 필요)
  
  if (!SOUNDCLOUD_CLIENT_ID) {
    // 목업 모드 - 실제 API키가 없을 때
    return getSoundCloudMockResults(query, limit);
  }

  try {
    const token = await getSoundCloudToken();
    const params = new URLSearchParams({
      q: query,
      limit: Math.min(limit, 50).toString(),
      linked_partitioning: 'true',
      access: 'playable',  // 재생 가능한 트랙만
    });

    const response = await fetch(
      `${SOUNDCLOUD_API_BASE}/tracks?${params}`,
      {
        headers: {
          'Accept': 'application/json; charset=utf-8',
          'Authorization': `OAuth ${token}`,
        },
      }
    );

    if (response.status === 401) {
      // 토큰 만료 또는 인증 실패 - Mock 반환
      return getSoundCloudMockResults(query, limit);
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(`SoundCloud API 오류: ${response.status} ${error.message || ''}`);
    }

    const tracks = await response.json();
    
    return tracks.map(track => ({
      trackId: track.id.toString(),
      title: track.title,
      artist: track.artist || track.user?.username || 'Unknown Artist',
      artworkUrl: track.artwork_url || track.user?.avatar_url,
      platform: 'soundcloud',
      playbackId: track.id.toString(),
      playbackUrl: `https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/${track.id}&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&visual=false`,
      duration: track.duration ? Math.floor(track.duration / 1000) : null, // ms -> 초
      isPlayable: track.stream_url !== null && track.access !== 'blocked',
      rawData: track,
    }));
  } catch (error) {
    console.warn('SoundCloud API 호출 실패, Mock 데이터 사용:', error.message);
    return getSoundCloudMockResults(query, limit);
  }
}

/**
 * SoundCloud Mock 검색 결과 (개발용)
 */
function getSoundCloudMockResults(query, limit) {
  // 실제 프로덕션에서는 Mock 데이터를 반환하지 않음
  // 대신 빈 배열 또는 에러를 반환
  console.warn('SoundCloud: API 키 미설정 또는 CORS 차단. 실제 구현을 위해 백엔드 프록시가 필요합니다.');
  
  return [
    {
      trackId: 'mock-sc-1',
      title: `${query} - SoundCloud Track 1 (Demo)`,
      artist: 'Demo Artist',
      artworkUrl: null,
      platform: 'soundcloud',
      playbackId: 'mock-sc-1',
      playbackUrl: `#`,
      duration: 180,
      isPlayable: false,
      rawData: { mock: true },
    },
  ];
}

// ============================================================================
// 통합 검색 함수
// ============================================================================

/**
 * YouTube와 SoundCloud 통합 검색
 * @param {string} query - 검색어
 * @param {Object} options - { YouTube: n, SoundCloud: m }
 * @returns {Promise<Object>} { all: [], youtube: [], soundcloud: [], total: 0 }
 */
export async function searchAllPlatforms(query, options = {}) {
  const { YouTube = 10, SoundCloud = 10 } = options;
  
  const [youtubeResults, soundcloudResults] = await Promise.allSettled([
    searchYouTube(query, YouTube),
    searchSoundCloud(query, SoundCloud),
  ]);

  const results = {
    all: [],
    youtube: youtubeResults.status === 'fulfilled' ? youtubeResults.value : [],
    soundcloud: soundcloudResults.status === 'fulfilled' ? soundcloudResults.value : [],
    total: 0,
  };

  // 플랫폼별 결과 합치기 (중복 제거)
  const seenIds = new Set();
  results.all = [...results.youtube, ...results.soundcloud].filter(item => {
    const key = `${item.platform}:${item.trackId}`;
    if (seenIds.has(key)) return false;
    seenIds.add(key);
    return true;
  });

  results.total = results.all.length;
  return results;
}