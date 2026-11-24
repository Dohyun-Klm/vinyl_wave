# Vinyl Wave

YouTube와 SoundCloud를 통합한 아날로그 턴테이블 감성의 음악 플레이어

## 기술 스택

- **React 19** + Vite
- **JavaScript** (TypeScript 미사용)
- **Astryx Core** v0.7.17
- **Astryx Neutral Theme** v0.7.17
- **StyleX** (의존성, 현재는 일반 CSS 사용)

## 시작하기

```bash
npm install
npm run dev
```

개발 서버: `http://localhost:5173`

## 프로젝트 구조

```
vinyl-wave/
├── index.html
├── package.json
├── vite.config.js
├── src/
│   ├── main.jsx           # 앱 진입점 (Astryx Theme 적용)
│   ├── App.jsx            # 메인 앱 컴포넌트
│   ├── components/        # React 컴포넌트
│   │   ├── Header.jsx     # 상단 로고 영역
│   │   ├── Turntable.jsx  # 턴테이블 + LP
│   │   └── ControlPanel.jsx # 재생 컨트롤 영역
│   ├── styles/            # 스타일 파일
│   │   ├── vinyl-player.css # 턴테이블 전용 스타일
│   │   └── global.css      # 전역 스타일
│   └── astryx-themes.js   # Astryx 테마 설정
├── public/
└── README.md
```

## UI 특징

- **아날로그 감성**: 아이보리·우드·블랙 계열의 미니멀한 디자인
- **중심 턴테이블**: 화면 중앙에 배치된 플레이어
- **목업 상태**: 재생/검색/플랫폼 선택은 시연용으로 표시됨

## Astryx 테마 적용

```jsx
import { Theme } from '@astryxdesign/core/theme'
import { themes, defaultThemeSlug } from './astryx-themes'

<Theme theme={themes[defaultThemeSlug]}>
  <App />
</Theme>
```

## 주의사항

- YouTube/SoundCloud API 키는 사용하지 않음
- 모든 컨트롤은 목업(Demo) 상태이며 실제 음악 재생은 구현되지 않음
- 반응형 레이아웃 지원 (데스크톱·모바일)

## 다음 단계

1. YouTube API 통합
2. SoundCloud API 통합  
3. 실제 재생/검색 기능 구현
4. 사용자 인증 및 플레이리스트 관리