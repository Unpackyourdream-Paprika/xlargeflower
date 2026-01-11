-- XLARGE FLOWER 주문 관리 테이블
-- 이 SQL을 Supabase SQL Editor에서 실행하세요

-- 1. 주문 테이블 생성
CREATE TABLE xlarge_flower_orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- 고객 정보
  customer_name VARCHAR(100),
  customer_email VARCHAR(255),
  customer_phone VARCHAR(20),
  customer_company VARCHAR(200),

  -- AI 상담 데이터
  chat_log JSONB NOT NULL DEFAULT '[]',  -- 전체 대화 내역
  order_summary JSONB,  -- AI가 요약한 주문 정보
  -- order_summary 예시:
  -- {
  --   "category": "뷰티",
  --   "product": "립스틱",
  --   "target_audience": "20대 여성",
  --   "vibe": "힙한",
  --   "platform": "인스타그램 릴스",
  --   "reference": "뉴진스 느낌",
  --   "recommended_pack": "FAST",
  --   "estimated_price": 1980000
  -- }

  -- 주문 상태
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN (
    'pending',      -- 접수대기
    'confirmed',    -- 입금확인
    'in_progress',  -- 작업중
    'review',       -- 검토중
    'revision',     -- 수정요청
    'completed',    -- 납품완료
    'cancelled'     -- 취소
  )),

  -- 상품 정보
  selected_pack VARCHAR(20) CHECK (selected_pack IN ('READY', 'FAST', 'EXCLUSIVE')),
  final_price INTEGER,  -- 최종 확정 가격 (원)

  -- 납품 정보
  final_video_urls JSONB DEFAULT '[]',  -- 납품 영상 URL 배열
  delivery_note TEXT,  -- 납품 메모
  delivered_at TIMESTAMP WITH TIME ZONE,

  -- 관리자 메모
  admin_note TEXT
);

-- 2. 인덱스 생성
CREATE INDEX idx_xlarge_flower_orders_status ON xlarge_flower_orders(status);
CREATE INDEX idx_xlarge_flower_orders_created_at ON xlarge_flower_orders(created_at DESC);
CREATE INDEX idx_xlarge_flower_orders_customer_email ON xlarge_flower_orders(customer_email);

-- 3. updated_at 자동 업데이트 트리거
CREATE OR REPLACE FUNCTION update_xlarge_flower_orders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_xlarge_flower_orders_updated_at
  BEFORE UPDATE ON xlarge_flower_orders
  FOR EACH ROW
  EXECUTE FUNCTION update_xlarge_flower_orders_updated_at();

-- 4. RLS (Row Level Security) 정책
ALTER TABLE xlarge_flower_orders ENABLE ROW LEVEL SECURITY;

-- 서비스 역할은 모든 접근 허용 (어드민용)
CREATE POLICY "Service role has full access to orders"
  ON xlarge_flower_orders
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- 익명 사용자는 INSERT만 가능 (새 주문 생성)
CREATE POLICY "Anonymous users can insert orders"
  ON xlarge_flower_orders
  FOR INSERT
  WITH CHECK (true);

-- 5. 포트폴리오 테이블에 추가 컬럼 (기존 테이블 수정)
-- 이미 xlarge_flower_portfolio 테이블이 있다면 아래 실행
-- ALTER TABLE xlarge_flower_portfolio ADD COLUMN IF NOT EXISTS tags TEXT[];
-- ALTER TABLE xlarge_flower_portfolio ADD COLUMN IF NOT EXISTS client_name VARCHAR(100);
-- ALTER TABLE xlarge_flower_portfolio ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;
