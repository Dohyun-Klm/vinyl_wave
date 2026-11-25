import { useState, useCallback } from 'react';
import { searchAllPlatforms, searchYouTube, searchSoundCloud } from '../services/platformServices';

/**
 * 플랫폼 검색을 위한 커스텀 훅
 * 로딩, 빈 결과, 오류 상태를 모두 처리
 */
export function usePlatformSearch() {
  const [state, setState] = useState({
    results: [],
    isLoading: false,
    error: null,
    total: 0,
    platformBreakdown: { youtube: 0, soundcloud: 0 },
  });

  /**
   * 통합 검색
   */
  const search = useCallback(async (query, options = {}) => {
    if (!query?.trim()) {
      setState({
        results: [],
        isLoading: false,
        error: null,
        total: 0,
        platformBreakdown: { youtube: 0, soundcloud: 0 },
      });
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const results = await searchAllPlatforms(query, options);
      
      setState({
        results: results.all,
        isLoading: false,
        error: null,
        total: results.total,
        platformBreakdown: {
          youtube: results.youtube.length,
          soundcloud: results.soundcloud.length,
        },
      });
    } catch (error) {
      console.error('검색 오류:', error);
      setState({
        results: [],
        isLoading: false,
        error: error.message || '검색 중 오류가 발생했습니다.',
        total: 0,
        platformBreakdown: { youtube: 0, soundcloud: 0 },
      });
    }
  }, []);

  /**
   * YouTube 전용 검색
   */
  const searchYouTubeOnly = useCallback(async (query, maxResults = 10) => {
    if (!query?.trim()) {
      setState({
        results: [],
        isLoading: false,
        error: null,
        total: 0,
        platformBreakdown: { youtube: 0, soundcloud: 0 },
      });
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const results = await searchYouTube(query, maxResults);
      setState({
        results: results,
        isLoading: false,
        error: null,
        total: results.length,
        platformBreakdown: { youtube: results.length, soundcloud: 0 },
      });
    } catch (error) {
      setState({
        results: [],
        isLoading: false,
        error: error.message || 'YouTube 검색 중 오류가 발생했습니다.',
        total: 0,
        platformBreakdown: { youtube: 0, soundcloud: 0 },
      });
    }
  }, []);

  /**
   * SoundCloud 전용 검색
   */
  const searchSoundCloudOnly = useCallback(async (query, limit = 10) => {
    if (!query?.trim()) {
      setState({
        results: [],
        isLoading: false,
        error: null,
        total: 0,
        platformBreakdown: { youtube: 0, soundcloud: 0 },
      });
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const results = await searchSoundCloud(query, limit);
      setState({
        results: results,
        isLoading: false,
        error: null,
        total: results.length,
        platformBreakdown: { youtube: 0, soundcloud: results.length },
      });
    } catch (error) {
      setState({
        results: [],
        isLoading: false,
        error: error.message || 'SoundCloud 검색 중 오류가 발생했습니다.',
        total: 0,
        platformBreakdown: { youtube: 0, soundcloud: 0 },
      });
    }
  }, []);

  /**
   * 검색 결과 초기화
   */
  const clearResults = useCallback(() => {
    setState({
      results: [],
      isLoading: false,
      error: null,
      total: 0,
      platformBreakdown: { youtube: 0, soundcloud: 0 },
    });
  }, []);

  return {
    ...state,
    search,
    searchYouTube: searchYouTubeOnly,
    searchSoundCloud: searchSoundCloudOnly,
    clearResults,
  };
}

/**
 * 플랫폼 선택 검색 훅
 */
export function usePlatformSearchByPlatform() {
  const [state, setState] = useState({
    results: [],
    isLoading: false,
    error: null,
    total: 0,
  });

  const search = useCallback(async (platform, query, limit = 10) => {
    if (!query?.trim()) {
      setState({ results: [], isLoading: false, error: null, total: 0 });
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      let results;
      if (platform === 'youtube') {
        results = await searchYouTube(query, limit);
      } else if (platform === 'soundcloud') {
        results = await searchSoundCloud(query, limit);
      } else {
        throw new Error(`지원하지 않는 플랫폼: ${platform}`);
      }

      setState({
        results,
        isLoading: false,
        error: null,
        total: results.length,
      });
    } catch (error) {
      setState({
        results: [],
        isLoading: false,
        error: error.message,
        total: 0,
      });
    }
  }, []);

  return { ...state, search, setState };
}