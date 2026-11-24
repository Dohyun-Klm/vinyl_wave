import { useState } from 'react'
import './Turntable.css'

function Turntable({ isPlaying = false, albumCover, trackTitle, artist }) {
  const [isPlayingState, setIsPlayingState] = useState(false)

  return (
    <div className="player-canvas">
      <div className={`turntable ${isPlayingState ? 'playing' : ''}`}>
        {/* LP 레코드와 앨범 커버 */}
        <div className="record-label">
          {albumCover ? (
            <img 
              src={albumCover} 
              alt={`${trackTitle || 'Album'} album cover`} 
              className="album-cover"
            />
          ) : (
            <div className="album-cover">
              <span className="placeholder-text">
                {trackTitle || 'Album Cover'}
                <br />
                {artist || 'Artist'}
              </span>
            </div>
          )}
        </div>
        
        {/* 중앙 핀 */}
        <div className="center-pin" />
        
        {/* 톤암 */}
        <div className="tonearm" />
      </div>
      
      {/* 재생/일시정지 버튼 - 목업 상태 */}
      {!isPlayingState && (
        <div className="play-indicator">
          <button 
            className="playback-btn"
            disabled
            title="Play/Pause (Mock)"
          >
            <span className="btn-text">▶ Play</span>
          </button>
          <span className="status">Demo Mode - Playback not implemented</span>
        </div>
      )}
    </div>
  )
}

export default Turntable