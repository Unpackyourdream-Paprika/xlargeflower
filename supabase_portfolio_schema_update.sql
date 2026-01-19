-- Portfolio 테이블 스키마 확장
-- 기존 xlarge_flower_portfolio 테이블에 새 컬럼 추가

-- 1. category를 더 명확하게 구분하기 위한 portfolio_type 컬럼 추가
-- 'MODEL' = AI 모델 라인업 (루비, 제이드 등)
-- 'CASE' = 고객사 성공 사례 (삼성, 현대 등)
ALTER TABLE xlarge_flower_portfolio
ADD COLUMN IF NOT EXISTS portfolio_type VARCHAR(20) DEFAULT 'MODEL';

-- 2. 고객사 정보 컬럼 추가
ALTER TABLE xlarge_flower_portfolio
ADD COLUMN IF NOT EXISTS client_name VARCHAR(100);

ALTER TABLE xlarge_flower_portfolio
ADD COLUMN IF NOT EXISTS client_logo_url TEXT;

-- 3. 성과 지표 컬럼 추가 (2개의 메트릭)
ALTER TABLE xlarge_flower_portfolio
ADD COLUMN IF NOT EXISTS metric_1_value VARCHAR(50);

ALTER TABLE xlarge_flower_portfolio
ADD COLUMN IF NOT EXISTS metric_1_label VARCHAR(100);

ALTER TABLE xlarge_flower_portfolio
ADD COLUMN IF NOT EXISTS metric_2_value VARCHAR(50);

ALTER TABLE xlarge_flower_portfolio
ADD COLUMN IF NOT EXISTS metric_2_label VARCHAR(100);

-- 4. 메인 페이지 featured 여부
ALTER TABLE xlarge_flower_portfolio
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE;

-- 5. 캠페인 날짜 (예: "2024.12 캠페인")
ALTER TABLE xlarge_flower_portfolio
ADD COLUMN IF NOT EXISTS campaign_date VARCHAR(50);

-- 6. 업종 태그 색상 (선택적)
ALTER TABLE xlarge_flower_portfolio
ADD COLUMN IF NOT EXISTS category_color VARCHAR(20);

-- 인덱스 추가 (쿼리 성능 최적화)
CREATE INDEX IF NOT EXISTS idx_portfolio_type ON xlarge_flower_portfolio(portfolio_type);
CREATE INDEX IF NOT EXISTS idx_portfolio_featured ON xlarge_flower_portfolio(is_featured);
CREATE INDEX IF NOT EXISTS idx_portfolio_active_type ON xlarge_flower_portfolio(is_active, portfolio_type);

-- 기존 데이터 마이그레이션: 기존 항목들은 모두 'MODEL' 타입으로 설정
UPDATE xlarge_flower_portfolio
SET portfolio_type = 'MODEL'
WHERE portfolio_type IS NULL;

COMMENT ON COLUMN xlarge_flower_portfolio.portfolio_type IS 'MODEL: AI 모델 라인업, CASE: 고객사 성공 사례';
COMMENT ON COLUMN xlarge_flower_portfolio.is_featured IS '메인 페이지 Real Portfolio 섹션에 표시 여부';
COMMENT ON COLUMN xlarge_flower_portfolio.metric_1_value IS '성과 지표 1 값 (예: +312%, ₩4,200)';
COMMENT ON COLUMN xlarge_flower_portfolio.metric_1_label IS '성과 지표 1 라벨 (예: ROAS 상승, CPA 달성)';
