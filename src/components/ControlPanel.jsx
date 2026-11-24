import { TextInput } from '@astryxdesign/core'
import './ControlPanel.css'

function ControlPanel() {
  return (
    <div className="control-panel">
      {/* Play/Pause controls */}
      <div className="playback-controls">
        <button className="playback-btn" disabled title="Play/Pause (Mock)">
          <span className="btn-text">▶ Play</span>
        </button>
        <button className="skip-btn" disabled title="Skip Back (Mock)">
          <span className="btn-icon">⏮</span>
        </button>
        <button className="skip-btn" disabled title="Skip Forward (Mock)">
          <span className="btn-icon">⏭</span>
        </button>
      </div>

      {/* Search area - Mock */}
      <div className="search-area">
        <TextInput 
          placeholder="Search songs, artists, albums..." 
          disabled
          classNames={{ root: 'search-input' }}
        />
        <span className="badge-badge">Mock</span>
      </div>

      {/* Platform selector */}
      <div className="platform-selector">
        <h3 className="selector-title">Platform</h3>
        <div className="platform-group">
          <button className="platform-btn youtube" disabled>
            YouTube
          </button>
          <button className="platform-btn soundcloud" disabled>
            SoundCloud
          </button>
        </div>
      </div>

      {/* Playlist - Mock */}
      <div className="playlist-area">
        <h3 className="playlist-title">Playlist (Mock)</h3>
        <div className="playlist-placeholder">
          <div>
            <strong className="track-title">Song Title</strong>
            <span className="placeholder-text">Artist - Album (03:45)</span>
          </div>
          <div>
            <strong className="track-title">Song Title 2</strong>
            <span className="placeholder-text">Artist - Album (04:12)</span>
          </div>
          <div>
            <strong className="track-title">Song Title 3</strong>
            <span className="placeholder-text">Artist - Album (02:58)</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ControlPanel