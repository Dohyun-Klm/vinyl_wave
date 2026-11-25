# Vinyl Wave - 플랫폼 API 분석 보고서

## 2026년 11월 24일

---

## 1. YouTube Data API v3

### 1.1 기본 정보

| 항목 | 값 |
|------|-----|
| Base URL | `https://www.googleapis.com/youtube/v3` |
| 인증 방식 | API Key (Query Parameter) |
| 요구사항 | Google Cloud Console에서 YouTube Data API v3 활성화 필요 |
| 일일 할당량 | 10,000 units (검색 100 units/회) |

### 1.2 검색 API (`search.list`)

**엔드포인트:** `GET https://www.googleapis.com/youtube/v3/search`

**필수 파라미터:**
- `part`: `snippet`

**권장 파라미터:**
- `q`: 검색어
- `maxResults`: 0-50 (기본 5)
- `type`: `video`
- `videoEmbeddable`: `true` (임베드 가능 영상)
- `videoCategoryId`: `10` (Music 카테고리)
- `order`: `relevance | title | viewCount | date`

**응답 구조:**
```json
{
  "kind": "youtube#searchListResponse",
  "items": [
    {
      "id": { "videoId": "string" },
      "snippet": {
        "title": "string",
        "channelTitle": "string",
        "thumbnails": {
          "medium": { "url": "string" },
          "high": { "url": "string" }
        }
      }
    }
  ]
}
```

### 1.3 IFrame Player API

**스크립트 URL:** `https://www.youtube.com/iframe_api`

**주요 기능:**
- `YT.Player`: 플레이어 인스턴스 생성
- `playVideo()`, `pauseVideo()`, `stopVideo()`: 재생 제어
- `seekTo(seconds, allowSeekAhead)`: 이동
- `getDuration()`: 길이 조회 (초)
- `onStateChange`: 재생 상태 이벤트

**플레이어 파라미터:**
- `playsinline`: 1 (모바일 인라인 재생)
- `rel`: 0 (검색 결과 숨기기)
- `modestbranding`: 1 (브랜딩 최소화)
- `enablejsapi`: 1 (JS 제어 활성화)

### 1.4 비즈니스 제한사항

- **광고**: YouTube 자체 광고 표시 (플러그인/프록시로 우회 불가)
- **콘텐츠 라이선스**: 저작권 보호 콘텐츠는 재생 제한
- **임베드 제한**: `videoEmbeddable=true` 필수
- **국가별**: `regionCode` 파라미터로 지역 제한 가능

---

## 2. SoundCloud API

### 2.1 기본 정보

| 항목 | 값 |
|------|-----|
| Base URL | `https://api.soundcloud.com` |
| 인증 URL | `https://secure.soundcloud.com` |
| 인증 방식 | OAuth 2.1 (PKCE 필수) |
| 토큰 만료 | 약 1시간 |

### 2.2 인증 방식

#### Client Credentials Flow (비사용자 인증)
검색 및 공개 트랙 스트리밍에 사용 가능:

```
POST https://secure.soundcloud.com/oauth/token
Authorization: Basic base64(client_id:client_secret)
Content-Type: application/x-www-form-urlencoded

grant_type=client_credentials
```

**요제수 제한:**
- 12시간당 50개 토큰 (앱당)
- 1시간당 30개 토큰 (IP당)

#### Authorization Code Flow (사용자 인증)
사용자 리소스 접근 시 필요:
1. 사용자를 인가 URL로 리다이렉트
2. 콜백에서 authorization code 수신
3. 토큰 교환

### 2.3 검색 API (`GET /tracks`)

**엔드포인트:** `GET https://api.soundcloud.com/tracks`

**파라미터:**
- `q`: 검색어
- `limit`: 0-50 (기본 50)
- `linked_partitioning`: `true` (페이징)
- `access`: `playable` (재생 가능한 트랙)

**CORS 정책:**
- 브라우저에서 직접 호출 시 `Authorization` 헤더 필요
- 프론트엔드에서는 백엔드 프록시 또는 사전 토큰 조회 필요

### 2.4 트랙 리소스

**응답 구조:**
```json
{
  "id": 123456789,
  "title": "Track Title",
  "duration": 240000,  // ms 단위
  "artwork_url": "https://...",
  "user": { "username": "Artist Name" },
  "stream_url": "https://...",
  "permalink_url": "https://soundcloud.com/..."
}
```

### 2.5 스트리밍 및 위젯

#### Widget API
```
https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/{id}
```

**필수 크기:** 200px 이상 (권장: 480x270)

#### 스트리밍 URL
- `stream_url`에서 제공하는 AAC 스트림 사용
- 사용자 인증 필요 (`Authorization: OAuth ACCESS_TOKEN`)

### 2.6 비즈니스 제한사항

- **광고**: 위젯에 광고 표시 (무료 플랜)
- **스트리밍 품질**: 고화질 AAC (transcoded)
- **접근 제한**: `access` 필드로 표시 (`playable`, `preview`, `blocked`)
- **저작권**: 저작권 보호 콘텐츠는 `stream_url` 미제공

---

## 3. 공통 데이터 모델 (Track Model)

### 3.1 표준화된 트랙 구조

| 필드 | 타입 | 설명 | YouTube | SoundCloud |
|------|------|------|---------|------------|
| `trackId` | string | 플랫폼 고유 ID | videoId | track.id |
| `title` | string | 트랙 제목 | snippet.title | title |
| `artist` | string | 아티스트명 | snippet.channelTitle | user.username |
| `artworkUrl` | string | 앨범아트 URL | thumbnails | artwork_url |
| `platform` | enum | 'youtube' \| 'soundcloud' | - | - |
| `playbackId` | string | 재생용 ID | videoId | track.id |
| `playbackUrl` | string | 임베드 URL | embed URL | player URL |
| `duration` | number | 초 단위 | 별도 요청 필요 | duration (ms) |
| `isPlayable` | boolean | 재생 가능 여부 | videoEmbeddable | stream_url 존재 |

### 3.2 정규화 매핑

#### YouTube → Common Track
```javascript
{
  trackId: item.id.videoId,
  title: item.snippet.title,
  artist: item.snippet.channelTitle,
  artworkUrl: item.snippet.thumbnails.medium?.url,
  platform: 'youtube',
  playbackId: item.id.videoId,
  playbackUrl: `https://www.youtube.com/embed/${item.id.videoId}`,
  duration: null,  // 검색에는 없음
  isPlayable: true,  // videoEmbeddable=true로 필터링
  rawData: item,
}
```

#### SoundCloud → Common Track
```javascript
{
  trackId: track.id.toString(),
  title: track.title,
  artist: track.artist || track.user?.username,
  artworkUrl: track.artwork_url || track.user?.avatar_url,
  platform: 'soundcloud',
  playbackId: track.id.toString(),
  playbackUrl: `https://w.soundcloud.com/player/?url=...`,
  duration: track.duration ? Math.floor(track.duration / 1000) : null,
  isPlayable: track.stream_url !== null && track.access !== 'blocked',
  rawData: track,
}
```

---

## 4. 구현 권장사항

### 4.1 환경변수 관리

```bash
# .env.example (리포지토리에 커밋)
VITE_YOUTUBE_API_KEY=your_youtube_api_key_here
VITE_SOUNDCLOUD_CLIENT_ID=your_soundcloud_client_id_here
VITE_SOUNDCLOUD_CLIENT_SECRET=your_soundcloud_client_secret_here

# .env (개발자만 접근 - Git 관리 대상)
```

### 4.2 아키텍처 설계

```
src/
├── services/
│   └── platformServices.js    # API 통합 서비스 (서버/클라이언트)
├── hooks/
│   └── usePlatformSearch.js   # 검색 로직 훅
├── components/
│   ├── SearchResults.jsx      # 결과 리스트
│   └── PlayerOverlay.jsx      # 플레이어 오버레이
```

### 4.3 클라이언트 vs 서버 책임

| 작업 | 위치 | 이유 |
|-----|------|------|
| API Key 사용 | 브라우저 | YouTube: Query Parameter 방식 허용 |
| SoundCloud 토큰 조회 | 서버/프록시 | CORS 및 노출 위험 |
| 검색 요청 | 클라이언트 | 정적 데이터 캐시 가능 |
| 토큰 관리 | 서버 | 보안 및 만료 처리 |

### 4.4 에러 처리 전략

1. **API Key 미설정**: Mock 데이터 반환, UI에 "Demo" 라벨 표시
2. **네트워크 오류**: 재시도 로직 + 사용자 알림
3. **CORS 차단**: 프록시 서버 또는 JSONP 대체
4. **플랫폼 제한**: 해당 플랫폼 결과 0개로 처리

---

## 5. 결론 및 다음 단계

### 5.1 즉시 가능한 작업

1. ✅ `.env.example` 파일 생성
2. ✅ API 서비스 모듈 (`platformServices.js`) 구현
3. ✅ 커스텀 훅 (`usePlatformSearch.js`) 구현
4. ✅ UI 컴포넌트 (`SearchResults.jsx`, `ControlPanel.jsx` 업데이트)
5. ⏳ 시각 에셋 이미지 생성 대기

### 5.2 필요한 리소스

| 리소스 | 확보 방법 |
|--------|-----------|
| YouTube API Key | Google Cloud Console |
| SoundCloud Client ID/Secret | SoundCloud Developer Portal |
| 시각 에셋 | 디자이너 또는 DALL·E/Stable Diffusion |

### 5.3 프로덕션 배포 시 체크리스트

- [ ] 실제 API 키를 `.env`에 설정
- [ ] SoundCloud 프록시 서버 배포 (CORS 문제 해결)
- [ ] 에세지 이미지 생성 및 최적화
- [ ] 사용량 모니터링 설정 (API quota)
- [ ] 친화적인 에러 메시지 로컬라이이션