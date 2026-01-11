# XLARGE FLOWER - Frontend Design System
## Deep Dark & Electric Iris

개발자용 프론트엔드 구축 지침서
Version: 2.0
Last Updated: 2026-01-11

---

## 1. Design Philosophy (디자인 철학)

### Core Principle
- **압도적인 블랙 배경** + **단일 그라디언트 악센트**
- 이모지 절대 금지
- 불필요한 장식 요소 제거
- 텍스트와 영상으로만 승부

### Brand Personality
- High-end, Premium
- Minimal, Clean
- Confident, Bold
- Tech-forward

---

## 2. Color System (컬러 시스템)

### 2.1 Base Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `--bg-primary` | `#050505` | 메인 배경 (완전 블랙에 가까운 딥 차콜) |
| `--bg-surface` | `#0A0A0A` | 카드/섹션 배경 (배경보다 살짝 밝음) |
| `--bg-elevated` | `#111111` | 호버 상태, 강조 영역 |

### 2.2 Text Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `--text-primary` | `#FFFFFF` | 메인 텍스트 |
| `--text-secondary` | `#888888` | 설명 텍스트, 부가 정보 |
| `--text-muted` | `#555555` | 비활성 텍스트, 라벨 |

### 2.3 Border Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `--border-default` | `#222222` | 기본 경계선 |
| `--border-subtle` | `rgba(255,255,255,0.1)` | 희미한 구분선 |
| `--border-hover` | `rgba(255,255,255,0.2)` | 호버 시 경계선 |

### 2.4 Accent Gradient (유일한 포인트 컬러)

```css
--gradient-accent: linear-gradient(90deg, #7C3AED 0%, #3B82F6 100%);
```

- Violet-600 (#7C3AED) → Blue-500 (#3B82F6)
- 이 그라디언트 외 다른 유채색(초록, 노랑, 빨강) 사용 **절대 금지**
- 에러 메시지만 예외적으로 `#EF4444` 사용 가능

### 2.5 CSS Variables 정의

```css
:root {
  /* Background */
  --bg-primary: #050505;
  --bg-surface: #0A0A0A;
  --bg-elevated: #111111;

  /* Text */
  --text-primary: #FFFFFF;
  --text-secondary: #888888;
  --text-muted: #555555;

  /* Border */
  --border-default: #222222;
  --border-subtle: rgba(255,255,255,0.1);
  --border-hover: rgba(255,255,255,0.2);

  /* Accent */
  --gradient-accent: linear-gradient(90deg, #7C3AED 0%, #3B82F6 100%);
  --color-accent-start: #7C3AED;
  --color-accent-end: #3B82F6;
}
```

---

## 3. Typography (타이포그래피)

### 3.1 Font Family

```css
font-family: "Pretendard Variable", Pretendard, -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
```

### 3.2 Font Weights

| Weight | Value | Usage |
|--------|-------|-------|
| Regular | 400 | Body text |
| Bold | 700 | Headings, CTA |

**Medium(500), SemiBold(600) 사용 금지** - 대비가 약해짐

### 3.3 Letter Spacing (자간) - 핵심 규칙

```css
/* Global */
body {
  letter-spacing: -0.02em;
}

/* Headings */
h1, h2, h3, h4, h5, h6 {
  letter-spacing: -0.04em;
}
```

### 3.4 Type Scale

| Element | Size | Weight | Line Height |
|---------|------|--------|-------------|
| H1 (Hero) | 80px / 5rem | 700 | 1.0 |
| H2 (Section) | 48px / 3rem | 700 | 1.1 |
| H3 (Card Title) | 32px / 2rem | 700 | 1.2 |
| Body Large | 20px / 1.25rem | 400 | 1.5 |
| Body | 16px / 1rem | 400 | 1.6 |
| Caption | 14px / 0.875rem | 400 | 1.4 |
| Label | 12px / 0.75rem | 700 | 1.0 |

### 3.5 Mobile Type Scale

| Element | Mobile Size |
|---------|-------------|
| H1 | 48px / 3rem |
| H2 | 32px / 2rem |
| H3 | 24px / 1.5rem |

---

## 4. Spacing System (여백 시스템)

### 4.1 Base Unit
- Base: 8px
- 모든 여백은 8의 배수로 설정

### 4.2 Section Spacing

```css
/* 섹션 상하 여백 - 최소 160px */
section {
  padding-top: 160px;    /* py-40 */
  padding-bottom: 160px;
}

/* 모바일 */
@media (max-width: 768px) {
  section {
    padding-top: 80px;   /* py-20 */
    padding-bottom: 80px;
  }
}
```

### 4.3 Container

```css
.container {
  max-width: 1280px;  /* max-w-screen-xl */
  margin: 0 auto;
  padding: 0 24px;
}
```

### 4.4 Grid Gap

```css
/* 카드 그리드 */
.card-grid {
  gap: 32px;  /* gap-8 */
}
```

---

## 5. Components (컴포넌트)

### 5.1 Buttons

#### Primary Button (CTA)
```css
.btn-primary {
  background: var(--gradient-accent);
  color: #FFFFFF;
  font-weight: 700;
  padding: 16px 32px;
  border-radius: 9999px;  /* rounded-full */
  border: none;
  box-shadow: none;
  transition: opacity 0.2s ease;
}

.btn-primary:hover {
  opacity: 0.9;
}
```

#### Secondary Button
```css
.btn-secondary {
  background: transparent;
  color: #FFFFFF;
  font-weight: 700;
  padding: 16px 32px;
  border-radius: 9999px;
  border: 1px solid rgba(255,255,255,0.2);
  transition: border-color 0.2s ease;
}

.btn-secondary:hover {
  border-color: rgba(255,255,255,0.4);
}
```

### 5.2 Cards

```css
.card {
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: 16px;
  padding: 32px;
  box-shadow: none;  /* Shadow 사용 금지 */
}

.card:hover {
  border-color: var(--border-hover);
}

/* Featured Card (FAST 팩 등) */
.card-featured {
  background: var(--bg-surface);
  border: 1px solid transparent;
  border-image: var(--gradient-accent) 1;
  border-radius: 16px;
}
```

### 5.3 Input Fields

```css
.input {
  background: transparent;
  border: none;
  border-bottom: 1px solid rgba(255,255,255,0.2);
  color: #FFFFFF;
  padding: 12px 0;
  font-size: 16px;
  outline: none;
}

.input::placeholder {
  color: var(--text-muted);
}

.input:focus {
  border-bottom-color: var(--color-accent-start);
}
```

### 5.4 List Items (Pricing Features)

```css
/* 체크 아이콘 대신 가운뎃점(·) 사용 */
.feature-list li {
  color: var(--text-secondary);
  font-size: 14px;
  padding-left: 16px;
  position: relative;
}

.feature-list li::before {
  content: "·";
  position: absolute;
  left: 0;
  color: var(--text-muted);
}
```

---

## 6. Page-by-Page Implementation (페이지별 구현)

### 6.1 Hero Section

#### Layout
- 전체 화면 높이 (`min-h-screen`)
- 블랙 배경 (`#050505`)
- 콘텐츠 중앙 정렬

#### Visual Effect
```css
/* 중앙 그라디언트 글로우 효과 */
.hero-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%);
  filter: blur(100px);
  pointer-events: none;
}
```

#### Content Structure
```
[XLARGE FLOWER] - 로고/레이블 (작게, 그라디언트 텍스트)

촬영은 끝났다.     - H1 첫 줄 (회색 #888)
이제 생성이다.     - H1 둘째 줄 (그라디언트 텍스트)

48시간 완성. AI 광고 소재 솔루션.  - 서브텍스트 (회색)

[시작하기]  - Primary Button (그라디언트)
```

#### Code Example
```tsx
<section className="relative min-h-screen bg-[#050505] flex items-center justify-center">
  {/* Glow Effect */}
  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
    <div className="w-[600px] h-[600px] bg-gradient-radial from-violet-600/15 to-transparent blur-[100px]" />
  </div>

  {/* Content */}
  <div className="relative z-10 text-center">
    <p className="text-sm tracking-widest mb-8 bg-gradient-to-r from-violet-500 to-blue-500 bg-clip-text text-transparent">
      XLARGE FLOWER
    </p>

    <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-[-0.04em]">
      <span className="block text-[#888888]">촬영은 끝났다.</span>
      <span className="block bg-gradient-to-r from-violet-500 to-blue-500 bg-clip-text text-transparent">
        이제 생성이다.
      </span>
    </h1>

    <p className="mt-8 text-xl text-[#888888]">
      48시간 완성. AI 광고 소재 솔루션.
    </p>

    <button className="mt-12 px-8 py-4 bg-gradient-to-r from-violet-600 to-blue-600 text-white font-bold rounded-full hover:opacity-90 transition-opacity">
      시작하기
    </button>
  </div>
</section>
```

---

### 6.2 Before & After Section

#### Layout
- 배경: `#050505`
- 중앙 정렬된 비교 프레임

#### UI Elements
| Element | Style |
|---------|-------|
| 왼쪽 (Before) | 흑백 이미지, 라벨: `RAW INPUT` |
| 오른쪽 (After) | 컬러 영상 (자동재생), 라벨: `RENDERED OUTPUT` |
| 구분선 핸들 | 그라디언트 색상 1px 세로선 |

#### Labels
```css
.label {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: var(--text-muted);
  text-transform: uppercase;
}
```

---

### 6.3 Showroom (Portfolio) Section

#### Gallery Rules
- 플레이 버튼 아이콘 제거
- 마우스 호버 시 영상 자동 재생 (`muted`, `loop`)
- 그리드 간격 넓게 유지 (`gap-8` 이상)

#### Thumbnail Style
```css
.portfolio-item {
  position: relative;
  overflow: hidden;
  border-radius: 8px;
}

.portfolio-item video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 영상 하단 정보 */
.portfolio-info {
  position: absolute;
  bottom: 12px;
  left: 12px;
  font-size: 12px;
  color: var(--text-secondary);
  letter-spacing: 0.05em;
}
```

#### Info Format
```
FASHION · 15s
BEAUTY · 30s
FOOD · 6s
```

---

### 6.4 Pricing Section

#### Card Layout (3 Column)
```
[READY]          [FAST]           [EXCLUSIVE]
 99만원           198만~398만원      별도 문의
 기본 카드        Border Gradient    기본 카드
```

#### Featured Card (FAST)
```css
.card-pricing-featured {
  background: var(--bg-surface);
  position: relative;
  border-radius: 16px;
  padding: 40px;
}

/* Gradient Border using pseudo-element */
.card-pricing-featured::before {
  content: "";
  position: absolute;
  inset: 0;
  padding: 1px;
  border-radius: 16px;
  background: var(--gradient-accent);
  -webkit-mask:
    linear-gradient(#fff 0 0) content-box,
    linear-gradient(#fff 0 0);
  mask:
    linear-gradient(#fff 0 0) content-box,
    linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
}
```

#### Feature List Style
```tsx
<ul className="space-y-3 text-sm text-[#888888]">
  <li className="flex items-center gap-3">
    <span className="text-[#555555]">·</span>
    영상 소재 1개
  </li>
  <li className="flex items-center gap-3">
    <span className="text-[#555555]">·</span>
    비독점 라이선스
  </li>
</ul>
```

#### Recommended Badge
```tsx
<span className="absolute -top-3 left-6 px-3 py-1 text-xs font-bold tracking-wide bg-gradient-to-r from-violet-600 to-blue-600 text-white rounded-sm">
  RECOMMENDED
</span>
```

---

### 6.5 Consultation (AI Chat) Section

#### Style: Command Line Aesthetic
- 전체 화면 블랙 배경
- 터미널/CLI 느낌
- 타이프라이터 효과

#### Layout
```
배경: #050505 (풀스크린)

중앙:
  "어떤 영상을 만드시겠습니까?|"  (타이핑 애니메이션 + 깜빡이는 커서)

하단:
  ────────────────────────  (입력 라인)
```

#### Code Example
```tsx
<section className="min-h-screen bg-[#050505] flex flex-col items-center justify-center">
  <div className="text-center">
    <p className="text-2xl md:text-4xl text-white font-bold tracking-tight">
      어떤 영상을 만드시겠습니까?
      <span className="animate-pulse">|</span>
    </p>
  </div>

  <div className="mt-16 w-full max-w-xl">
    <input
      type="text"
      className="w-full bg-transparent border-b border-white/20 text-white text-lg py-3 outline-none focus:border-violet-500 transition-colors"
      placeholder="제품 또는 서비스를 입력하세요..."
    />
  </div>
</section>
```

---

## 7. Animation Guidelines (애니메이션)

### 7.1 Allowed Animations
- Opacity transitions (호버 효과)
- Border color transitions
- Cursor blink (커서 깜빡임)
- Typewriter effect (타이핑)
- Video autoplay on hover

### 7.2 Forbidden Animations
- Bounce effects
- Scale/Zoom effects
- Slide-in animations
- Parallax scrolling
- 과도한 움직임

### 7.3 Transition Timing
```css
transition: all 0.2s ease;
```

---

## 8. Responsive Breakpoints

```css
/* Mobile First */
/* sm: 640px */
/* md: 768px */
/* lg: 1024px */
/* xl: 1280px */

/* Section Padding */
section {
  padding: 80px 24px;  /* Mobile */
}

@media (min-width: 1024px) {
  section {
    padding: 160px 24px;  /* Desktop */
  }
}
```

---

## 9. Forbidden Elements (사용 금지 목록)

### Absolutely Forbidden
- Emoji (모든 이모지)
- Colored icons (초록 체크, 노란 별 등)
- Drop shadows on cards
- Gradient backgrounds on sections (글로우 효과 제외)
- Multiple accent colors
- Rounded corners on images (8px max)
- Play button overlays

### Replace With
| Before | After |
|--------|-------|
| Check icon | Bullet point (·) |
| Star icon | (삭제) |
| Colored tags | Monochrome labels |
| Shadow cards | Border cards |
| Play button | Hover autoplay |

---

## 10. Code Implementation Checklist

### globals.css
```css
@import "tailwindcss";

:root {
  --bg-primary: #050505;
  --bg-surface: #0A0A0A;
  --bg-elevated: #111111;
  --text-primary: #FFFFFF;
  --text-secondary: #888888;
  --text-muted: #555555;
  --border-default: #222222;
  --gradient-accent: linear-gradient(90deg, #7C3AED 0%, #3B82F6 100%);
}

body {
  background: var(--bg-primary);
  color: var(--text-primary);
  font-family: "Pretendard Variable", Pretendard, sans-serif;
  letter-spacing: -0.02em;
}

h1, h2, h3, h4, h5, h6 {
  letter-spacing: -0.04em;
}

/* Gradient Text Utility */
.gradient-text {
  background: var(--gradient-accent);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* No Scrollbar */
::-webkit-scrollbar {
  display: none;
}
```

### tailwind.config.js Extension
```js
module.exports = {
  theme: {
    extend: {
      colors: {
        'bg-primary': '#050505',
        'bg-surface': '#0A0A0A',
        'bg-elevated': '#111111',
        'text-secondary': '#888888',
        'text-muted': '#555555',
      },
      backgroundImage: {
        'gradient-accent': 'linear-gradient(90deg, #7C3AED 0%, #3B82F6 100%)',
      },
    },
  },
}
```

---

## 11. Final Notes for Developer

1. **컬러는 위 정의된 것만 사용** - 임의로 추가하지 말 것
2. **이모지 사용 시 즉시 수정 요청** - 무조건 제거
3. **그림자 효과 금지** - border로 레이어 구분
4. **자간 -0.02em ~ -0.04em 필수** - 이게 고급스러움의 핵심
5. **여백은 넉넉하게** - 좁으면 촌스러움
6. **호버 시 subtle한 변화만** - 과한 애니메이션 금지

---

**Document Version History**
- v2.0 (2026-01-11): Deep Dark & Electric Iris 테마 전면 개편
- v1.0: 초기 버전 (Light theme with gradients)
