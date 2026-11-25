import { usePlatformSearch } from '../hooks/usePlatformSearch';
import './SearchResults.css';

/**
 * 검색 결과 표시 컴포넌트
 * @param {Object} props
 * @param {string} props.platform - 'youtube' | 'soundcloud' | 'all'
 * @param {Object} props.searchState - usePlatformSearch의 반환값
 */
function SearchResults({ platform, searchState, onTrackSelect }) {
  const { results, isLoading, error, total } = searchState;
  
  // 플랫폼 필터링
  const displayResults = platform === 'all' 
    ? results 
    : results.filter(r => r.platform === platform);
  
  if (isLoading) {
    return (
      <div className="search-results">
        <div className="loading-indicator">
          <div className="loading-spinner" />
          <span>검색 중...</span>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="error-message">
        ⚠️ {error}
      </div>
    );
  }
  
  if (total === 0) {
    return (
      <div className="empty-state">
        <h4 className="empty-title">검색 결과가 없습니다</h4>
        <p className="empty-description">다른 키워드로 검색해보세요</p>
      </div>
    );
  }
  
  return (
    <div className="search-results">
      {displayResults.map(result => (
        <div 
          key={`${result.platform}:${result.trackId}`}
          className="search-result-item"
          onClick={() => onTrackSelect && onTrackSelect(result)}
        >
          {result.artworkUrl ? (
            <img 
              src={result.artworkUrl} 
              alt={`${result.title} 아트워크`}
              className="search-result-artwork"
            />
          ) : (
            <div className="search-result-placeholder">
              {result.title?.charAt(0)}
            </div>
          )}
          
          <div className="search-result-info">
            <div className="search-result-title" title={result.title}>
              {result.title || '제목 없음'}
            </div>
            <div className="search-result-artist" title={result.artist}>
              {result.artist || '아티스트 미정'}
            </div>
          </div>
          
          <span className={`search-result-platform ${result.platform}`}>
            {result.platform}
          </span>
        </div>
      ))}
    </div>
  );
}

export default SearchResults;