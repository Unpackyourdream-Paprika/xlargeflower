# XLARGE Discord 사용자 행동 추적 시스템 전달서

## 개요

XLARGE 랜딩페이지에서는 사용자의 행동을 실시간으로 Discord 웹훅을 통해 추적합니다.
두 가지 독립적인 추적 시스템이 운영되고 있습니다.

---

## 1. 사용자 행동 추적 시스템 (User Tracking)

### 파일 위치
- `lib/userTracking.ts` - 핵심 추적 로직
- `components/TrackingProvider.tsx` - React Provider 컴포넌트

### Discord 웹훅 URL
```
https://discord.com/api/webhooks/1464463734020771860/O_naBeXiE5w7U5ySsGTwpf6vyGmdByPAz4PebsElKneSAiWBB9pi-teVP64Bqy9A-2Fl
```

### 추적 대상 섹션
| Selector | 섹션 이름 |
|----------|-----------|
| `[data-section="hero"]` | Hero |
| `[data-section="video-showcase"]` | Video Showcase |
| `[data-section="artist-lineup"]` | Artist Lineup |
| `[data-section="how-it-works"]` | How It Works |
| `[data-section="portfolio"]` | Portfolio |
| `#why-ai` | Why AI |
| `[data-section="our-position"]` | Our Position |
| `[data-section="pricing"]` | Pricing |
| `[data-section="social-proof"]` | Social Proof |
| `[data-section="final-cta"]` | Final CTA |

### 추적 이벤트 종류

#### 1.1 클릭 이벤트 (Click Event)
- **트리거 조건**: 버튼, 링크, 카드 등 중요 요소 클릭 시
- **수집 데이터**:
  - `element`: 클릭한 요소 타입 (button, a 등)
  - `text`: 요소의 텍스트 (최대 50자)
  - `section`: 클릭한 섹션 이름
  - `position`: 클릭 좌표 (x, y)

#### 1.2 섹션 뷰 이벤트 (Section View Event)
- **트리거 조건**: 사용자가 특정 섹션을 3초 이상 본 후 이탈 시
- **수집 데이터**:
  - `section`: 섹션 이름
  - `viewDuration`: 체류 시간 (초)
  - `scrollDepthInSection`: 섹션 내 스크롤 깊이 (%)

#### 1.3 페이지 뷰 이벤트 (Page View Event)
- **트리거 조건**: 페이지 최초 로드 시 (1회만)
- **수집 데이터**:
  - `path`: URL 경로
  - `title`: 페이지 제목

#### 1.4 세션 요약 이벤트 (Session Summary Event)
- **트리거 조건**:
  - 페이지 이탈 시 (`beforeunload`)
  - 탭 비활성화 시 (`visibilitychange`)
- **수집 데이터**:
  - `totalDuration`: 총 체류 시간 (초)
  - `sectionsViewed`: 섹션별 체류 시간 배열
  - `clickCount`: 총 클릭 수
  - `maxScrollDepth`: 최대 스크롤 깊이 (%)
  - `interactedElements`: 상호작용한 요소 목록

### 사용자 정보 수집
- `userId`: 세션 기반 고유 ID (sessionStorage)
- `userAgent`: 브라우저 정보
- `language`: 브라우저 언어
- `referrer`: 유입 경로
- `screenSize`: 화면 크기
- `timestamp`: 이벤트 발생 시간
- `timezone`: 타임존

### 전송 방식
- **배치 전송**: 이벤트를 버퍼에 모아서 10초마다 또는 10개 이상 시 전송
- **즉시 전송**: 세션 종료 시 `navigator.sendBeacon()` 사용 (페이지 이탈 시에도 전송 보장)
- **주기적 flush**: 30초마다 버퍼 강제 전송

### Discord Embed 형식
```json
{
  "embeds": [
    {
      "title": "👤 사용자 정보",
      "color": 0x00F5A0,
      "fields": [
        { "name": "🆔 User ID", "value": "user_xxxxx", "inline": true },
        { "name": "📱 Device", "value": "1920x1080", "inline": true },
        { "name": "🌐 Language", "value": "ko-KR", "inline": true }
      ]
    },
    {
      "title": "🖱️ 클릭 이벤트 (N회)",
      "color": 0x00D9F5,
      "description": "• Hero: 무료 상담 받기\n• Pricing: GROWTH 선택"
    },
    {
      "title": "👁️ 섹션별 체류 시간",
      "color": 0xFFD700,
      "description": "• Hero: 15초 (스크롤 100%)\n• Pricing: 45초 (스크롤 80%)"
    },
    {
      "title": "📊 세션 요약",
      "color": 0xFF6B6B,
      "fields": [
        { "name": "⏱️ 총 체류 시간", "value": "180초", "inline": true },
        { "name": "🖱️ 총 클릭 수", "value": "5회", "inline": true },
        { "name": "📜 최대 스크롤", "value": "95%", "inline": true }
      ]
    }
  ]
}
```

---

## 2. 주문 프로세스 추적 시스템 (Order Tracking)

### 파일 위치
- `components/OrderBottomSheet.tsx`

### Discord 웹훅 URL
```
https://discord.com/api/webhooks/1464450994913153228/uw35o_5VS8jZdAKmlA3NjIzOnaXkGrZvcFm-IQDrfgO6HPiLhU5Z8a6hPqp1k7FRb__H
```

### 추적 이벤트 종류

#### 2.1 주문 모달 열림 (Step 0)
- **트리거**: 주문하기 버튼 클릭 시
- **데이터**: timestamp

#### 2.2 상품 + 모델 선택 완료 (Step 1)
- **트리거**: Step 1에서 "다음" 버튼 클릭 시
- **데이터**:
  - 선택 상품
  - 상품 가격
  - 모델 옵션 (기존 아티스트 / 커스텀 모델 / 모델 없음)
  - 선택된 모델
  - 총 금액

#### 2.3 매체 선택 완료 (Step 2)
- **트리거**: Step 2에서 "다음" 버튼 클릭 시
- **데이터**:
  - 선택 플랫폼 (TikTok, YouTube, Instagram 등)
  - 매체비
  - 타겟층
  - 타겟 지역
  - 랜딩 URL

#### 2.4 정보 입력 완료 (Step 3)
- **트리거**: Step 3에서 폼 제출 시
- **데이터**:
  - 이름
  - 회사명
  - 이메일
  - 연락처
  - 첨부파일 수
  - 총 금액

#### 2.5 결제 방법 선택 (Step 4)
- **무통장입금 선택 시**:
  - 고객명
  - 이메일
  - 총 금액
  - 입금 마감 (30분)

- **카드결제 선택 시**:
  - 고객명
  - 이메일
  - 총 금액

### Discord Embed 형식
```json
{
  "embeds": [{
    "title": "🛒 주문 트래킹 - Step 1",
    "description": "상품 + 모델 선택 완료",
    "color": 0x5865F2,
    "fields": [
      { "name": "선택 상품", "value": "GROWTH", "inline": true },
      { "name": "상품 가격", "value": "₩5,500,000", "inline": true },
      { "name": "모델 옵션", "value": "기존 아티스트", "inline": true },
      { "name": "총 금액", "value": "₩6,050,000", "inline": true }
    ],
    "timestamp": "2025-01-24T12:00:00.000Z"
  }]
}
```

---

## 3. 가시성 판단 기준

### 섹션 가시성 (TrackingProvider)
```javascript
const rect = element.getBoundingClientRect();
const isVisible = rect.top < window.innerHeight * 0.8 && rect.bottom > window.innerHeight * 0.2;
```
- **진입 조건**: 섹션 상단이 뷰포트의 80% 이하이고, 하단이 뷰포트의 20% 이상일 때
- **이탈 조건**: 위 조건을 만족하지 않을 때

### 섹션 내 스크롤 깊이
```javascript
const sectionScrollDepth = Math.round(((window.innerHeight - rect.top) / (rect.height + window.innerHeight)) * 100);
```

---

## 4. 클릭 추적 대상 판단 기준

```javascript
const isTrackable =
  element === 'button' ||
  element === 'a' ||
  target.closest('button') ||
  target.closest('a') ||
  classList.includes('btn') ||
  classList.includes('card') ||
  target.getAttribute('role') === 'button';
```

추적되는 요소:
- `<button>` 태그
- `<a>` 태그 (링크)
- `button` 또는 `a` 태그의 자식 요소
- `.btn` 클래스를 가진 요소
- `.card` 클래스를 가진 요소
- `role="button"` 속성을 가진 요소

---

## 5. 데이터 흐름 요약

```
[사용자 행동]
    │
    ├─ 클릭 ──────────────────┐
    │                         │
    ├─ 스크롤 ────────────────┼─► eventBuffer (배열)
    │                         │         │
    ├─ 섹션 진입/이탈 ────────┘         │
    │                                   ▼
    │                         ┌─────────────────┐
    │                         │ 10초마다 또는    │
    │                         │ 10개 이상 시     │
    │                         │ 배치 전송        │
    │                         └────────┬────────┘
    │                                  │
    └─ 페이지 이탈 ──► sendBeacon ─────┼──► Discord Webhook
                       (즉시 전송)      │
                                       ▼
                               [Discord 채널]
```

---

## 6. 주의사항

1. **개인정보**: 이메일, 전화번호 등 개인정보가 Discord로 전송됩니다. 내부 용도로만 사용해야 합니다.

2. **웹훅 URL 보안**: 웹훅 URL이 클라이언트 코드에 노출되어 있습니다. 악용 방지를 위해 Rate Limiting이 적용되어 있습니다.

3. **성능**: 배치 전송 방식으로 네트워크 요청을 최소화하고 있습니다.

4. **sendBeacon**: 페이지 이탈 시에도 데이터 전송을 보장하기 위해 `navigator.sendBeacon()` API를 사용합니다.

---

## 7. 파일 구조

```
xlargeflwr/
├── lib/
│   └── userTracking.ts        # 사용자 행동 추적 핵심 로직
├── components/
│   ├── TrackingProvider.tsx   # React Provider (섹션/클릭/스크롤 추적)
│   └── OrderBottomSheet.tsx   # 주문 프로세스 추적
└── app/[locale]/
    └── layout.tsx             # TrackingProvider 적용 위치
```

---

## 8. 수정 시 체크리스트

- [ ] 새 섹션 추가 시 `TRACKED_SECTIONS` 배열에 추가
- [ ] Discord Embed 색상 코드 변경 시 16진수 형식 사용 (예: `0x00F5A0`)
- [ ] 버퍼 전송 주기 변경 시 `bufferTimer` 및 `flushInterval` 값 수정
- [ ] 웹훅 URL 변경 시 두 파일 모두 업데이트 필요

---

*마지막 업데이트: 2025-01-24*
