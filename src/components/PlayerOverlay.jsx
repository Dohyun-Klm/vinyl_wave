import { useState, useEffect, useRef } from 'react';
import './PlayerOverlay.css';

/**
 * YouTube IFrame Player Overlay
 * YouTube IFrame API를 사용한 재생 컨트롤
 */
export function YouTubePlayerOverlay({ 
  videoId, 
  onReady, 
  onStateChange, 
  onError,
  className = '',
  ...props 
}) {
  const playerRef = useRef(null);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [currentState, setCurrentState] = useState(-1); // -1: unstarted
  
  useEffect(() => {
    // IFrame API 스크립트 로드
    const script = document.createElement('script');
    script.src = 'https://www.youtube.com/iframe_api';
    script.onload = () => {
      console.log('YouTube IFrame API loaded');
    };
    document.head.appendChild(script);
    
    return () => {
      document.head.removeChild(script);
    };
  }, []);
  
  // YouTube API 콜백 - window 객체에 전역 함수로 등록
  useEffect(() => {
    window.onYouTubeIframeAPIReady = () => {
      if (playerRef.current) {
        window.YT = window.YT || {};
        window.YT.Player('youtube-player', {
          height: '100%',
          width: '100%',
          videoId: videoId,
          playerVars: {
            'playsinline': 1,
            'rel': 0,
            'modestbranding': 1,
            'controls': 1,
            'disablekb': 0,
          },
          events: {
            'onReady': (event) => {
              setIsPlayerReady(true);
              onReady?.(event);
            },
            'onStateChange': (event) => {
              setCurrentState(event.data);
              onStateChange?.(event);
            },
            'onError': (event) => {
              onError?.(event);
            },
          },
        });
      }
    };
  }, [videoId, onReady, onStateChange, onError]);
  
  const play = () => {
    if (window.YT?.Player) return;
    const player = document.querySelector('#youtube-player iframe')?.contentWindow;
    if (player) {
      player.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
    }
  };
  
  const pause = () => {
    const player = document.querySelector('#youtube-player iframe')?.contentWindow;
    if (player) {
      player.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
    }
  };
  
  const stop = () => {
    const player = document.querySelector('#youtube-player iframe')?.contentWindow;
    if (player) {
      player.postMessage('{"event":"command","func":"stopVideo","args":""}', '*');
    }
  };
  
  const seekTo = (seconds) => {
    const player = document.querySelector('#youtube-player iframe')?.contentWindow;
    if (player) {
      player.postMessage(`{"event":"command","func":"seekTo","args":[${seconds},true]}`, '*');
    }
  };
  
  if (!videoId) return null;
  
  return (
    <div 
      id="youtube-player"
      className={`youtube-player-overlay ${className}`}
      {...props}
    >
      <iframe
        title="YouTube Player"
        src={`https://www.youtube.com/embed/${videoId}?enablejsapi=1&playsinline=1&rel=0&modestbranding=1`}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}

export default YouTubePlayerOverlay;