import { useState, useEffect } from 'react'
import './Turntable.css'

function Turntable({ isPlaying = false, albumCover, trackTitle, artist, onPlayToggle }) {
  const [isPlayingState, setIsPlayingState] = useState(false)
  const [rotation, setRotation] = useState(0)

  // isPlaying prop 변경 반영
  useEffect(() => {
    setIsPlayingState(isPlaying)
  }, [isPlaying])

  // 회전 애니메이션 관리
  useEffect(() => {
    if (!isPlayingState) {
      setRotation(0)
      return
    }

    let animationId
    let lastTime = 0
    const rotationSpeed = 90 // 도/초 (360도 = 4초)
    
    const step = (timestamp) => {
      if (!lastTime) lastTime = timestamp
      const elapsed = (timestamp - lastTime) / 1000 // 초 단위
      const delta = elapsed * rotationSpeed
      setRotation(prev => (prev + delta) % 360)
      lastTime = timestamp
      animationId = requestAnimationFrame(step)
    }
    
    animationId = requestAnimationFrame(step)
    
    return () => {
      if (animationId) cancelAnimationFrame(animationId)
    }
  }, [isPlayingState])

  const handlePlayClick = () => {
    if (onPlayToggle) {
      onPlayToggle()
    }
  }

  return (
    <div className="player-canvas">
      {/* 턴테이블 본체 - SVG 에셋 또는 CSS 기본 */}
      <div 
        className="turntable"
        style={{ 
          backgroundImage: 'url(/assets/turntable/turntable-base.svg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {/* 회전 중심점 (핀 위치) */}
        <div className="center-pin" />
        
        {/* LP 디스크 - 회전 애니메이션 */}
        <div 
          className="lp-record"
          style={{ 
            transform: isPlayingState ? `rotate(${rotation}deg)` : 'rotate(0deg)',
            backgroundImage: 'url(/assets/record/lp-record.svg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        >
          {/* 앨범 커버 또는 레이블 */}
          <div className="record-label">
            {albumCover ? (
              <img 
                src={albumCover} 
                alt={`${trackTitle || 'Album'} album cover`} 
                className="album-cover"
              />
            ) : (
              <div className="album-cover album-default">
                <span className="placeholder-text">
                  {trackTitle || 'Album Cover'}
                  <br />
                  {artist || 'Artist'}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* 톤암 */}
      <div 
        className="tonearm"
        style={{
          backgroundImage: 'url(/assets/tonearm/tonearm.svg)',
          backgroundSize: 'contain',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      />
      
      {/* 재생/일시정지 버튼 - 목업 상태 또는 활성화된 상태 */}
      {!isPlayingState && (
        <div className="play-indicator">
          <button 
            className="playback-btn"
            onClick={handlePlayClick}
            disabled={false}
            title="Play/Pause"
          >
            <span className="btn-text">▶ Play</span>
          </button>
          <span className="status">Ready to play</span>
        </div>
      )}
    </div>
  )
}

export default Turntable