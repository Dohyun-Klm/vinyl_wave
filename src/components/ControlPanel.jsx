import { useState, useEffect, useCallback } from 'react';
import { TextInput } from '@astryxdesign/core';
import { usePlatformSearch } from '../hooks/usePlatformSearch';
import SearchResults from './SearchResults';
import './ControlPanel.css';

/**
 * ControlPanel - 검색 및 재생 컨트롤 영역
 * YouTube와 SoundCloud 통합 검색 지원
 * @param {Object} props
 * @param {Object|null} props.currentTrack - 현재 선택된 트랙
 * @param {Function} props.onTrackSelect - 트랙 선택 콜백
 */
function ControlPanel({ currentTrack, onTrackSelect }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activePlatform, setActivePlatform] = useState('all');
  
  const {
    results,
    isLoading,
    error,
    total,
    search,
    searchYouTube,
    searchSoundCloud,
    clearResults,
  } = usePlatformSearch();

  // 검색어 변경 시 자동 검색 (디바운스 포함)
  useEffect(() => {
    const trimmedQuery = searchQuery.trim();
    if (!trimmedQuery) {
      clearResults();
      return;
    }

    const debounce = setTimeout(() => {
      if (activePlatform === 'all') {
        search(trimmedQuery);
      } else if (activePlatform === 'youtube') {
        searchYouTube(trimmedQuery, 10);
      } else {
        searchSoundCloud(trimmedQuery, 10);
      }
    }, 300); // 300ms 디바운스

    return () => clearTimeout(debounce);
  }, [searchQuery, activePlatform, search, searchYouTube, searchSoundCloud, clearResults]);

  /**
   * 트랙 선택 처리
   */
  const handleTrackSelect = useCallback((track) => {
    onTrackSelect?.(track);
  }, [onTrackSelect]);

  /**
   * 플랫폼 버튼 클릭 시 검색 필터 변경
   */
  const handlePlatformChange = (platform) => {
    setActivePlatform(platform);
    // 새 플랫폼 선택 시 현재 검색어로 재검색
    if (searchQuery.trim()) {
      // 디바운스 처리를 위해 useEffect가 자동으로 재검색
    } else {
      clearResults();
    }
  };

  /**
   * 검색어 초기화
   */
  const handleClearSearch = () => {
    setSearchQuery('');
    clearResults();
  };

  // 플랫폼별 결과 카운트
  const youtubeCount = results.filter(r => r.platform === 'youtube').length;
  const soundcloudCount = results.filter(r => r.platform === 'soundcloud').length;

  // 현재 선택된 트랙 하이라이트
  const isTrackSelected = (track) => {
    return currentTrack?.trackId === track.trackId && currentTrack?.platform === track.platform;
  };

  return (
    <div className="control-panel">
      {/* Play/Pause controls - 활성화된 상태로 전환 */}
      <div className="playback-controls">
        <button 
          className={`playback-btn ${currentTrack ? 'active' : ''}`}
          onClick={() => {
            // 향후 실제 재생 로직 구현 시 처리
            console.log('Play/Pause:', currentTrack);
          }}
          title={currentTrack ? 'Pause' : 'Play (Demo)'}
          aria-label="Play/Pause"
        >
          <span className="btn-text">▶ {currentTrack ? 'Pause' : 'Play'}</span>
          {currentTrack && <span className="btn-badge">Ready</span>}
        </button>
        <button 
          className="skip-btn" 
          disabled={!currentTrack}
          title="Skip Back (Demo)"
          aria-label="Skip Backward"
        >
          <span className="btn-icon">⏮</span>
        </button>
        <button 
          className="skip-btn" 
          disabled={!currentTrack}
          title="Skip Forward (Demo)"
          aria-label="Skip Forward"
        >
          <span className="btn-icon">⏭</span>
        </button>
      </div>

      {/* Current track indicator */}
      {currentTrack && (
        <div className="current-track-indicator">
          <span className="indicator-text">
            Now: {currentTrack.title || 'Unknown Track'}
          </span>
          <button 
            className="clear-track-btn"
            onClick={() => onTrackSelect(null)}
            title="Clear track"
          >
            ✕
          </button>
        </div>
      )}

      {/* Search area - 실제 검색 기능으로 전환 */}
      <div className="search-area">
        <TextInput 
          placeholder="Search songs, artists, albums..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          classNames={{ root: 'search-input' }}
        />
        {searchQuery && (
          <button 
            className="clear-btn" 
            onClick={handleClearSearch}
            title="Clear search"
            aria-label="Clear search"
          >
            ✕
          </button>
        )}
        {isLoading && <span className="badge-badge">검색</span>}
        {!isLoading && total > 0 && (
          <span className="badge-badge">{total}개</span>
        )}
      </div>

      {/* Platform selector - 활성화된 상태로 전환 */}
      <div className="platform-selector">
        <h3 className="selector-title">Platform</h3>
        <div className="platform-group">
          <button 
            className={`platform-btn youtube ${activePlatform === 'youtube' ? 'active' : ''}`}
            onClick={() => handlePlatformChange('youtube')}
            title="Search YouTube"
          >
            YouTube
            {activePlatform !== 'youtube' && <span className="btn-badge">Demo</span>}
          </button>
          <button 
            className={`platform-btn soundcloud ${activePlatform === 'soundcloud' ? 'active' : ''}`}
            onClick={() => handlePlatformChange('soundcloud')}
            title="Search SoundCloud"
          >
            SoundCloud
            {activePlatform !== 'soundcloud' && <span className="btn-badge">Demo</span>}
          </button>
          <button 
            className={`platform-btn all ${activePlatform === 'all' ? 'active' : ''}`}
            onClick={() => handlePlatformChange('all')}
            title="Search All Platforms"
          >
            All
            {activePlatform !== 'all' && <span className="btn-badge">Demo</span>}
          </button>
        </div>
        {activePlatform !== 'all' && (
          <span className="platform-hint">
            {activePlatform === 'youtube' ? 'YouTube' : 'SoundCloud'} 검색 (API 키 필요)
          </span>
        )}
      </div>

      {/* Platform results summary */}
      {activePlatform === 'all' && results.length > 0 && (
        <div className="platform-summary">
          <span className="summary-item">
            <span className="summary-label">YouTube:</span> {youtubeCount}개
          </span>
          <span className="summary-item">
            <span className="summary-label">SoundCloud:</span> {soundcloudCount}개
          </span>
        </div>
      )}

      {/* Search Results */}
      <SearchResults 
        platform={activePlatform}
        searchState={{ results, isLoading, error, total }}
        onTrackSelect={handleTrackSelect}
      />

      {/* Playlist area - 검색된 트랙 표시 */}
      <div className="playlist-area">
        <h3 className="playlist-title">Playlist</h3>
        <div className="playlist-placeholder">
          {error && (
            <div className="error-message">
              ⚠️ {error}
            </div>
          )}
          
          {!error && results.length > 0 && results.map((track, index) => (
            <div 
              key={`${track.platform}:${track.trackId}`}
              className="playlist-track"
              onClick={() => handleTrackSelect(track)}
            >
              <div className="track-artwork">
                {track.artworkUrl ? (
                  <img src={track.artworkUrl} alt={`${track.title} 아트워크`} />
                ) : (
                  <span className="track-artwork-text">
                    {track.title?.charAt(0)}
                  </span>
                )}
              </div>
              <div className="track-info">
                <strong className="track-title">{track.title || '제목 없음'}</strong>
                <span className="placeholder-text">
                  {track.artist || '아티스트 미정'}
                  {track.duration && ` • ${formatDuration(track.duration)}`}
                  <span className={`track-platform ${track.platform}`}>
                    [{track.platform}]
                  </span>
                </span>
              </div>
            </div>
          ))}
          
          {!error && results.length === 0 && !isLoading && searchQuery && (
            <div className="empty-state">
              <h4 className="empty-title">검색된 트랙이 없습니다</h4>
              <p className="empty-description">다른 키워드로 검색해보세요</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * 초 단위를 mm:ss 형식으로 변환
 */
function formatDuration(seconds) {
  if (!seconds || seconds < 0) return '';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export default ControlPanel;