# Vinyl Wave 시각 에셋 사양

## 프로젝트 개요

React + Vite + Astryx 프로젝트의 아날로그 턴테이블 감성 음악 플레이어입니다.

## 에셋 구조

```
src/assets/
├── turntable/           # 턴테이블 본체 레이어
│   ├── turntable-base.png     (터블테이블 본체, 투명 배경)
│   └── turntable-base.svg     (벡터 버전 - 스케일 가능)
├── record/              # LP 디스크 레이어
│   ├── lp-record.png        (회전 가능한 LP, 중심점 정규화됨)
│   └── lp-label.png         (LP 레이블, 중심점과 일치)
├── tonearm/             # 톤암 레이어
│   ├── tonearm-arm.png      (톤암 팔, 회전 중심점 명시)
│   └── tonearm-head.png     (톤암 머리, 선택적)
└── icons/               # 아이콘
    └── soundcloud-icon.svg
```

## 에셋 사양

### 1. 턴테이블 본체 (turntable-base)

- **크기**: 500x500px (정사각형)
- **포맷**: PNG (투명 배경) 또는 SVG
- **중심점**: (250, 250) - CSS 중심 기준
- **회전 축**: 중심점을 기준으로 전체 원형 레이아웃
- **스타일링**: 
  - 다크 브ラ운/다크 그레이 색조
  - 금속 질감 (그레이스케일 + 반짝임)
  - 가장자리 라인: 6px 테두리 (#0f0f0f)
  - 그림자: inset 0 0 40px rgba(0,0,0,0.6)

### 2. LP 디스크 (lp-record)

- **크기**: 400x400px (터블테이블 내 70%)
- **포맷**: PNG (투명 배경)
- **중심점**: (200, 200) - 턴테이블 중심과 일치
- **애니메이션 고려사항**:
  - 중심 구멍 (12x12px 핀 자리)과 일치
  - 가장자리 라운드: 턴테이블 테두리와 일치
  - 스크롤/터치 피드백 없이 부드러운 회전
- **색상**: #1a1a1a (다크 블랙)

### 3. 앨범 레이블 (lp-label)

- **크기**: 280x280px (LP 위에 중앙 배치)
- **포맷**: PNG (투명 배경)
- **중심점**: (140, 140)
- **색상**: #3a3a3a (다크 그레이)
- **기능**: 자체 이미지 또는 플레이스홀더 교체

### 4. 톤암 (tonearm)

- **크기**: 80x72px (팔 부분)
- **포맷**: PNG 또는 CSS 구현 (현재 CSS 사용)
- **회전 중심점**: (40, 6) - 팔 끝에서 측면으로 향함
- **CSS 구현**: 
  - 팔: width 80px, height 12px, background: var(--vinyl-tonearm)
  - 머리: width 20px, height 12px, background: var(--vinyl-dark)
  - 기본 위치: bottom: -30px, left: 50%, transform: translateX(-50%)

## CSS 기준 좌표계

터블테이블 컨테이너는 `position: relative`이며:
- 중심점: `top: 50%, left: 50%` → `transform: translate(-50%, -50%)`
- 모든 자식 요소는 이 중심을 기준으로 배치

## 다크 모드/라이트 모드 고려사항

- `--vinyl-ivory`: #f5f1e6 (배경)
- `--vinyl-cream`: #e8e0d1 (보조 배경)
- `--vinyl-brown`: #8b5a2b (아이템 강조)
- `--vinyl-dark`: #2c2416 (다크 테마)
- `--vinyl-record`: #1a1a1a (레코드)
- `--vinyl-label`: #3a3a3a (레이블)
- `--vinyl-tonearm`: #5a4d3d (톤암)

## 권장 이미지 포맷

| 용도 | 포맷 | 이유 |
|------|------|------|
| 레코드/톤암 | PNG | 투명 배경, 회전 애니메이션 |
| 앨범아트 | JPEG 또는 WebP | 파일 크기 최적화 |
| 아이콘 | SVG | 스케일 가능, 색상 변경 용이 |
| 로고 | SVG | 해상도 독립 |

## 구현 필요 사항 (이미지 생성 완료 후)

1. [ ] `src/assets/turntable/turntable-base.png` 생성
2. [ ] `src/assets/record/lp-record.png` 생성
3. [ ] `src/assets/record/lp-label.png` 생성 (기본 레이블)
4. [ ] CSS에 `background-image` 추가 또는 `<img>` 태그 사용
5. [ ] 회전 애니메이션 테스트

## 참고: 현재 CSS 구현

```css
.turntable {
  position: relative;
  width: 100%;
  max-width: 400px;
  aspect-ratio: 1;
  background: var(--vinyl-record); /* 레코드 색상 */
  border-radius: 50%;
  border: 6px solid var(--vinyl-edge);
}

.record-label {
  position: absolute;
  top: 50%; left: 50%;
  width: 70%; height: 70%;
  background: var(--vinyl-label);
  transform: translate(-50%, -50%);
  border-radius: 50%;
}

.center-pin {
  position: absolute;
  top: 50%; left: 50%;
  width: 12px; height: 12px;
  background: var(--vinyl-tonearm);
  transform: translate(-50%, -50%);
  border-radius: 50%;
}

.tonearm {
  position: absolute;
  bottom: -30px;
  left: 50%;
  width: 80px;
  height: 12px;
  background: var(--vinyl-tonearm);
  transform: translateX(-50%);
}
```

## 에셋 없을 때 대체

이미지가 생성되지 않은 경우, CSS 변수와 가상 요소로 구현된 현재 스타일을 유지합니다. 프로젝트는 완전한 CSS 기반 구현으로도 동작합니다.