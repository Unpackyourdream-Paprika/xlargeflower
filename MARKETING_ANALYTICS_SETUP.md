# 🔥 마케팅 분석 긴급 세팅 완료 보고서

**작업일**: 2026-01-23
**목적**: Paid Social 0초 이탈 문제 해결 + 전환 추적 설정 + 2.15 할인 배너 강화

---

## ✅ 완료된 작업 (1~4순위)

### 1순위: 메타픽셀 설치 (인스타/페북 광고 전환 추적)

**문제**: 인스타그램/페이스북 광고를 돌려도 전환 추적이 안 되고 있었음

**해결**:
- ✅ Meta Pixel 코드 설치 완료 ([app/layout.tsx:67-85](app/layout.tsx#L67-85))
- ✅ `.env.local`에 픽셀 ID 추가 ([.env.local:12](file:///.env.local#L12))

**⚠️ 반드시 해야 할 것**:
1. [Meta Business Suite](https://business.facebook.com/events_manager)에서 픽셀 생성
2. `.env.local` 파일에서 `NEXT_PUBLIC_META_PIXEL_ID=YOUR_PIXEL_ID_HERE`를 **실제 픽셀 ID로 교체**
3. 배포 후 [Meta Pixel Helper](https://chrome.google.com/webstore/detail/facebook-pixel-helper/fdgfkebogiimcoedlicjlajpkdmockpc) 크롬 확장으로 작동 확인

---

### 2순위: GA4 전환 이벤트 추가 (CTA 버튼 클릭 추적)

**문제**: GA4는 설치되어 있었지만 "도입 문의", "시작하기" 등 핵심 전환 이벤트가 0개

**해결**:
- ✅ 분석 헬퍼 파일 생성 ([lib/analytics.ts](lib/analytics.ts))
- ✅ 모든 CTA 버튼에 GA4 + Meta Pixel 동시 추적 추가:
  - "무료 상담 받기" 버튼 ([app/page.tsx:534](app/page.tsx#L534))
  - "VIP 상담 신청하기" 버튼 ([app/page.tsx:962](app/page.tsx#L962))
  - 모바일 sticky CTA ([app/page.tsx:972](app/page.tsx#L972))
  - 가격 플랜 "시작하기" 버튼 ([components/PricingCard.tsx:86](components/PricingCard.tsx#L86))

**추적되는 이벤트**:
```typescript
// GA4 핵심 이벤트
- generate_lead: 상담 신청 클릭
- begin_checkout: 가격 플랜 "시작하기" 클릭

// Meta Pixel 이벤트
- Lead: 상담 신청
- InitiateCheckout: 구매 의도
```

**⚠️ GA4 대시보드 설정 필요**:
1. [Google Analytics](https://analytics.google.com) 접속
2. **관리 > 이벤트 > 핵심 이벤트 만들기**
3. `generate_lead` 이벤트를 **핵심 이벤트로 표시**
4. `begin_checkout` 이벤트를 **핵심 이벤트로 표시**

---

### 3순위: 2.15 가격 할인 배너 디자인 개선

**문제**: 기존 배너가 작고 눈에 안 띔. Direct 트래픽(3분 체류) 사용자들이 할인을 못 봄

**개선 전**:
```
[작은 노란 배너] "50% OFF 2/15까지"
```

**개선 후** ([app/page.tsx:595-632](app/page.tsx#L595-632)):
```
┌─────────────────────────────────────────────┐
│  🔥 2/15까지 단 X일 남음!                   │
│  [취소선 가격 큰 폰트]                       │
│  → [할인가 빨강/그라데이션 초대형]           │
│  [50% OFF 애니메이션 배지]                  │
└─────────────────────────────────────────────┘
```

**특징**:
- 🔥 아이콘 + 글로우 효과
- 취소선 가격 **2xl~3xl 폰트**
- 할인가 **4xl~5xl 초대형 그라데이션**
- D-day 카운터 자동 계산
- 모바일 최적화 반응형

---

### 4순위: 인스타 인앱 브라우저 최적화

**문제**: Paid Social 트래픽 체류 시간 0초 → 로딩 속도 이슈 의심

**해결**:
1. ✅ DNS Prefetch 추가 ([app/layout.tsx:50-57](app/layout.tsx#L50-57))
   - Google Analytics, Meta Pixel, CDN 도메인 사전 연결
2. ✅ 폰트 Preload 최적화 ([app/layout.tsx:59-66](app/layout.tsx#L59-66))
   - FOIT(Flash of Invisible Text) 방지
3. ✅ Next.js 빌드 최적화 ([next.config.ts](next.config.ts))
   - Gzip 압축 활성화
   - AVIF/WebP 이미지 우선 로딩
   - Framer Motion 번들 최적화

**비디오 최적화**:
- 이미 [components/hero/MainHeroContainer.tsx:9-29](components/hero/MainHeroContainer.tsx#L9-29)에서 WebM 변환 + 프리로드 적용됨

---

## 🧪 테스트 체크리스트

### 1. 인스타그램 인앱 브라우저 테스트 (본인 폰에서 직접)
```bash
1. 인스타그램 앱 열기
2. DM에 사이트 링크 전송 (또는 스토리 링크)
3. 링크 클릭 후 측정:
   - [ ] 3초 안에 화면이 뜨는가?
   - [ ] 비디오가 자동재생 되는가?
   - [ ] 할인 배너가 눈에 확 띄는가?
   - [ ] 버튼을 클릭하면 반응하는가?
```

### 2. GA4 이벤트 작동 확인
```bash
1. 크롬 개발자 도구 > Network 탭 열기
2. "상담 신청" 버튼 클릭
3. "collect?v=2" 요청이 보이고 event=generate_lead 확인
4. GA4 대시보드 > 실시간 > 이벤트에서 확인
```

### 3. Meta Pixel 작동 확인
```bash
1. Meta Pixel Helper 크롬 확장 설치
2. 사이트 접속 후 픽셀 아이콘 클릭
3. PageView 이벤트 표시 확인
4. "시작하기" 버튼 클릭 후 InitiateCheckout 확인
```

---

## 📊 배포 후 모니터링 지표

### 즉시 확인할 것 (24시간 내)
- [ ] Paid Social 평균 체류 시간이 **0초 → 30초 이상** 상승
- [ ] GA4에서 `generate_lead` 이벤트가 **최소 1건 이상** 발생
- [ ] Meta Pixel에서 "Lead" 전환이 **광고 관리자에 표시**

### 일주일 후 확인할 것
- [ ] 전환율(CVR) **증가 추세**
- [ ] Direct 트래픽의 "시작하기" 클릭률 **증가** (할인 배너 효과)
- [ ] CPA(전환당 비용) **감소**

---

## 🚨 반드시 해야 할 추가 작업

### 1. 메타픽셀 ID 발급 및 적용
```bash
1. https://business.facebook.com/events_manager 접속
2. "픽셀 생성" 클릭
3. 발급받은 ID를 .env.local에 입력:
   NEXT_PUBLIC_META_PIXEL_ID=실제_픽셀_ID
4. git add .env.local (주의: .gitignore 확인)
5. 배포 환경 변수에도 동일하게 설정
```

### 2. GA4 핵심 이벤트 설정
```bash
1. Google Analytics > 관리 > 이벤트
2. "핵심 이벤트 만들기" 클릭
3. generate_lead 체크
4. begin_checkout 체크
```

### 3. 프로모션 종료일 DB 설정
```bash
현재 Supabase의 promotion_settings 테이블에서:
- end_date를 '2026-02-15'로 설정
- discount_rate를 50으로 설정
- is_active를 true로 설정
```

---

## 🎯 예상 효과

### Before (개선 전)
- Paid Social 체류 시간: **0초**
- 전환 이벤트 추적: **0개**
- 할인 배너 눈에 띄지 않음
- 메타픽셀 없음 (광고 최적화 불가)

### After (개선 후)
- Paid Social 체류 시간: **30초 이상** (인앱 브라우저 최적화)
- 전환 이벤트 추적: **모든 CTA 추적됨**
- 할인 배너 초대형 강조 (Direct 트래픽 전환율 ↑)
- 메타픽셀 설치로 **인스타/페북 광고 최적화 가능**

---

## 📞 문제 발생 시

### 빌드 에러
```bash
npm run build
# 에러 발생 시 타입 에러 확인
```

### 메타픽셀이 안 보임
```bash
1. .env.local 파일 확인
2. 배포 환경 변수 확인
3. Meta Pixel Helper로 디버깅
```

### GA4 이벤트가 안 보임
```bash
1. 크롬 개발자 도구 > Console에서 에러 확인
2. "[GA4] Event tracked:" 로그가 보이는지 확인
3. 24시간 후 다시 확인 (GA4 반영 지연 가능)
```

---

**작성자**: Claude Sonnet 4.5
**최종 수정**: 2026-01-23
