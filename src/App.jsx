import Header from './components/Header'
import Turntable from './components/Turntable'
import ControlPanel from './components/ControlPanel'
import './styles/vinyl-player.css'
import { useState } from 'react'

function App() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTrack, setCurrentTrack] = useState(null)

  const handlePlayToggle = () => {
    setIsPlaying(prev => !prev)
  }

  const handleTrackSelect = (track) => {
    setCurrentTrack(track)
    setIsPlaying(false) // 새 트랙 선택 시 정지
  }

  return (
    <div id="app-root">
      {/* 상단 로고 */}
      <Header />

      {/* 중앙 턴테이블 */}
      <Turntable 
        isPlaying={isPlaying}
        albumCover={currentTrack?.artworkUrl}
        trackTitle={currentTrack?.title}
        artist={currentTrack?.artist}
        onPlayToggle={handlePlayToggle}
      />

      {/* 재생 컨트롤 영역 */}
      <ControlPanel 
        currentTrack={currentTrack}
        onTrackSelect={handleTrackSelect}
      />
    </div>
  )
}

export default App