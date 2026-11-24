import Header from './components/Header'
import Turntable from './components/Turntable'
import ControlPanel from './components/ControlPanel'
import './styles/vinyl-player.css'

function App() {
  return (
    <div id="app-root">
      {/* 상단 로고 */}
      <Header />

      {/* 중앙 턴테이블 */}
      <Turntable 
        isPlaying={false}
        albumCover={null}
        trackTitle={null}
        artist={null}
      />

      {/* 재생 컨트롤 영역 */}
      <ControlPanel />
    </div>
  )
}

export default App