import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for database tables
export interface XLargeFlowerContact {
  id?: string;
  created_at?: string;
  name: string;
  company: string | null;
  email: string;
  phone: string | null;
  budget: string | null;
  product_interest: string | null;
  message: string;
  status?: 'new' | 'contacted' | 'converted' | 'closed';
}

export type PortfolioType = 'MODEL' | 'CASE';

export interface XLargeFlowerPortfolio {
  id?: string;
  created_at?: string;
  title: string;
  category: string;
  thumbnail_url: string;
  video_url: string | null;
  duration: string;
  format: string;
  description: string;
  production_time: string;
  cost: string;
  is_active?: boolean;
  order_index?: number;
  // 새로 추가된 필드들
  portfolio_type?: PortfolioType;  // 'MODEL' = AI 모델, 'CASE' = 고객사 성공 사례
  client_name?: string;            // 고객사명 (예: "뷰티 D사")
  client_logo_url?: string;        // 고객사 로고 URL
  metric_1_value?: string;         // 성과 지표 1 값 (예: "+312%")
  metric_1_label?: string;         // 성과 지표 1 라벨 (예: "ROAS 상승")
  metric_2_value?: string;         // 성과 지표 2 값 (예: "₩4,200")
  metric_2_label?: string;         // 성과 지표 2 라벨 (예: "CPA 달성")
  is_featured?: boolean;           // 메인 페이지 노출 여부
  campaign_date?: string;          // 캠페인 날짜 (예: "2024.12 캠페인")
  category_color?: string;         // 업종 태그 색상
}

// Database functions
export async function submitContact(data: Omit<XLargeFlowerContact, 'id' | 'created_at' | 'status'>) {
  const { error } = await supabase
    .from('xlarge_flower_contacts')
    .insert([data]);

  if (error) throw error;
  return true;
}

export async function getPortfolioItems(type?: PortfolioType) {
  let query = supabase
    .from('xlarge_flower_portfolio')
    .select('*')
    .eq('is_active', true);

  if (type) {
    query = query.eq('portfolio_type', type);
  }

  const { data, error } = await query.order('order_index', { ascending: true });

  if (error) throw error;
  return data as XLargeFlowerPortfolio[];
}

// 메인 페이지 Real Portfolio 섹션용 - CASE 타입이면서 is_featured=true인 항목만
export async function getFeaturedCaseStudies() {
  const { data, error } = await supabase
    .from('xlarge_flower_portfolio')
    .select('*')
    .eq('is_active', true)
    .eq('portfolio_type', 'CASE')
    .eq('is_featured', true)
    .order('order_index', { ascending: true });

  if (error) throw error;
  return data as XLargeFlowerPortfolio[];
}

// 주문 관련 타입 및 함수
export interface XLargeFlowerOrder {
  id?: string;
  created_at?: string;
  updated_at?: string;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  customer_company?: string;
  chat_log: Array<{ role: string; content: string }>;
  order_summary?: {
    category?: string;
    product?: string;
    target_audience?: string;
    vibe?: string;
    platform?: string;
    recommended_pack?: string;
    estimated_price?: number;
  };
  status?: 'pending' | 'confirmed' | 'in_progress' | 'review' | 'revision' | 'completed' | 'cancelled';
  selected_pack?: 'READY' | 'FAST' | 'EXCLUSIVE';
  final_price?: number;
  final_video_urls?: string[];
  delivery_note?: string;
  delivered_at?: string;
  admin_note?: string;
}

export interface OrderSummaryInput {
  category?: string;
  product?: string;
  target_audience?: string;
  vibe?: string;
  platform?: string;
  recommended_pack?: string;
  estimated_price?: number;
  [key: string]: unknown;
}

export async function createOrder(data: {
  chat_log: Array<{ role: string; content: string }>;
  order_summary: OrderSummaryInput;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
}) {
  const { data: order, error } = await supabase
    .from('xlarge_flower_orders')
    .insert([{
      chat_log: data.chat_log,
      order_summary: data.order_summary,
      customer_name: data.customer_name || null,
      customer_email: data.customer_email || null,
      customer_phone: data.customer_phone || null,
      status: 'pending'
    }])
    .select()
    .single();

  if (error) throw error;
  return order;
}

export async function getOrders(status?: string) {
  let query = supabase
    .from('xlarge_flower_orders')
    .select('*')
    .order('created_at', { ascending: false });

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as XLargeFlowerOrder[];
}

export async function getOrderById(id: string) {
  const { data, error } = await supabase
    .from('xlarge_flower_orders')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as XLargeFlowerOrder;
}

export async function updateOrderStatus(id: string, status: string, adminNote?: string) {
  const updateData: Record<string, unknown> = { status };
  if (adminNote !== undefined) {
    updateData.admin_note = adminNote;
  }
  if (status === 'completed') {
    updateData.delivered_at = new Date().toISOString();
  }

  const { error } = await supabase
    .from('xlarge_flower_orders')
    .update(updateData)
    .eq('id', id);

  if (error) throw error;
  return true;
}

export async function updateOrderDelivery(id: string, videoUrls: string[], deliveryNote?: string) {
  const { error } = await supabase
    .from('xlarge_flower_orders')
    .update({
      final_video_urls: videoUrls,
      delivery_note: deliveryNote || null,
      status: 'completed',
      delivered_at: new Date().toISOString()
    })
    .eq('id', id);

  if (error) throw error;
  return true;
}

// 쇼케이스 비디오 관련
export interface ShowcaseVideo {
  id?: string;
  created_at?: string;
  video_url: string;
  thumbnail_url?: string;
  thumbnail_webp_url?: string;  // Animated WebP 미리보기 (저용량)
  title?: string;
  is_active?: boolean;
  sort_order?: number;
}

export async function getShowcaseVideos() {
  const { data, error } = await supabase
    .from('xlarge_flower_showcase_videos')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (error) throw error;
  return data as ShowcaseVideo[];
}

export async function getAllShowcaseVideos() {
  const { data, error } = await supabase
    .from('xlarge_flower_showcase_videos')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) throw error;
  return data as ShowcaseVideo[];
}

export async function createShowcaseVideo(data: Omit<ShowcaseVideo, 'id' | 'created_at'>) {
  const { data: video, error } = await supabase
    .from('xlarge_flower_showcase_videos')
    .insert([data])
    .select()
    .single();

  if (error) throw error;
  return video as ShowcaseVideo;
}

export async function updateShowcaseVideo(id: string, data: Partial<ShowcaseVideo>) {
  const { error } = await supabase
    .from('xlarge_flower_showcase_videos')
    .update(data)
    .eq('id', id);

  if (error) throw error;
  return true;
}

export async function deleteShowcaseVideo(id: string) {
  const { error } = await supabase
    .from('xlarge_flower_showcase_videos')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return true;
}

export async function uploadShowcaseVideo(file: File) {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
  const filePath = `showcase/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('videos')
    .upload(filePath, file);

  if (uploadError) throw uploadError;

  const { data: { publicUrl } } = supabase.storage
    .from('videos')
    .getPublicUrl(filePath);

  return publicUrl;
}

// WebP 썸네일 업로드 (Animated WebP)
export async function uploadShowcaseWebPThumbnail(file: File | Blob, originalFileName: string) {
  const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}_preview.webp`;
  const filePath = `showcase/thumbnails/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('videos')
    .upload(filePath, file, {
      contentType: 'image/webp'
    });

  if (uploadError) throw uploadError;

  const { data: { publicUrl } } = supabase.storage
    .from('videos')
    .getPublicUrl(filePath);

  return publicUrl;
}

// AI 아티스트 모델 관련 타입 및 함수
export type ArtistCategory = 'ALL' | 'FASHION' | 'BEAUTY' | 'F&B' | 'TECH' | 'LIFESTYLE';

export interface ArtistModel {
  id?: string;
  created_at?: string;
  name: string;
  name_ko?: string;
  category: ArtistCategory;
  thumbnail_url: string;
  hover_video_url?: string;
  description: string;
  tags?: string[];
  is_active?: boolean;
  sort_order?: number;
}

export async function getArtistModels() {
  const { data, error } = await supabase
    .from('xlarge_flower_artists')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (error) throw error;
  return data as ArtistModel[];
}

export async function getAllArtistModels() {
  const { data, error } = await supabase
    .from('xlarge_flower_artists')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) throw error;
  return data as ArtistModel[];
}

export async function createArtistModel(data: Omit<ArtistModel, 'id' | 'created_at'>) {
  const { data: artist, error } = await supabase
    .from('xlarge_flower_artists')
    .insert([data])
    .select()
    .single();

  if (error) throw error;
  return artist as ArtistModel;
}

export async function updateArtistModel(id: string, data: Partial<ArtistModel>) {
  const { error } = await supabase
    .from('xlarge_flower_artists')
    .update(data)
    .eq('id', id);

  if (error) throw error;
  return true;
}

export async function deleteArtistModel(id: string) {
  const { error } = await supabase
    .from('xlarge_flower_artists')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return true;
}

export async function uploadArtistImage(file: File, type: 'thumbnail' | 'video' = 'thumbnail') {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
  const filePath = `artists/${type}/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('images')
    .upload(filePath, file);

  if (uploadError) throw uploadError;

  const { data: { publicUrl } } = supabase.storage
    .from('images')
    .getPublicUrl(filePath);

  return publicUrl;
}

// ============================================
// 히어로 섹션 관련 타입 및 함수
// ============================================

export type HeroLayoutType = 'VERTICAL_ROLLING' | 'MOBILE_MOCKUP';

export interface HeroMediaAsset {
  id?: string;
  created_at?: string;
  updated_at?: string;
  title?: string;
  thumbnail_url: string;
  video_url: string;
  thumbnail_webp_url?: string;
  sort_order: number;
  is_active: boolean;
}

export interface HeroConfig {
  layout_type: HeroLayoutType;
  assets: HeroMediaAsset[];
}

// 히어로 레이아웃 타입 조회
export async function getHeroLayoutType(): Promise<HeroLayoutType> {
  const { data, error } = await supabase
    .from('xlarge_flower_settings')
    .select('value')
    .eq('key_name', 'hero_layout_type')
    .single();

  if (error || !data) return 'VERTICAL_ROLLING';
  return data.value as HeroLayoutType;
}

// 히어로 레이아웃 타입 변경
export async function updateHeroLayoutType(type: HeroLayoutType) {
  const { error } = await supabase
    .from('xlarge_flower_settings')
    .upsert({
      key_name: 'hero_layout_type',
      value: type,
      description: 'Hero section layout: VERTICAL_ROLLING or MOBILE_MOCKUP',
      updated_at: new Date().toISOString()
    }, { onConflict: 'key_name' });

  if (error) throw error;
  return true;
}

// 히어로 미디어 에셋 조회
export async function getHeroAssets(activeOnly = true): Promise<HeroMediaAsset[]> {
  let query = supabase
    .from('xlarge_flower_hero_assets')
    .select('*')
    .order('sort_order', { ascending: true });

  if (activeOnly) {
    query = query.eq('is_active', true);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as HeroMediaAsset[];
}

// 히어로 미디어 에셋 생성
export async function createHeroAsset(data: Omit<HeroMediaAsset, 'id' | 'created_at' | 'updated_at'>) {
  const { data: asset, error } = await supabase
    .from('xlarge_flower_hero_assets')
    .insert([data])
    .select()
    .single();

  if (error) throw error;
  return asset as HeroMediaAsset;
}

// 히어로 미디어 에셋 수정
export async function updateHeroAsset(id: string, data: Partial<HeroMediaAsset>) {
  const { error } = await supabase
    .from('xlarge_flower_hero_assets')
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) throw error;
  return true;
}

// 히어로 미디어 에셋 순서 일괄 업데이트
export async function updateHeroAssetOrders(orders: { id: string; sort_order: number }[]) {
  for (const order of orders) {
    await updateHeroAsset(order.id, { sort_order: order.sort_order });
  }
  return true;
}

// 히어로 미디어 에셋 삭제
export async function deleteHeroAsset(id: string) {
  const { error } = await supabase
    .from('xlarge_flower_hero_assets')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return true;
}

// 히어로 설정 전체 조회 (프론트엔드용)
export async function getHeroConfig(): Promise<HeroConfig> {
  const [layoutType, assets] = await Promise.all([
    getHeroLayoutType(),
    getHeroAssets(true)
  ]);

  return {
    layout_type: layoutType,
    assets
  };
}

// ============================================
// Before & After 섹션 관련 타입 및 함수
// ============================================

export interface BeforeAfterAsset {
  id?: string;
  created_at?: string;
  updated_at?: string;
  title?: string;
  before_image_url: string;      // 원본 이미지 (RAW INPUT)
  after_video_url: string;       // 결과 영상 (RENDERED OUTPUT)
  after_video_webp_url?: string; // 영상 WebP 썸네일
  is_active: boolean;
}

// Before & After 에셋 조회
export async function getBeforeAfterAsset(): Promise<BeforeAfterAsset | null> {
  const { data, error } = await supabase
    .from('xlarge_flower_before_after')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // No rows found
    throw error;
  }
  return data as BeforeAfterAsset;
}

// Before & After 에셋 전체 조회 (어드민용)
export async function getAllBeforeAfterAssets(): Promise<BeforeAfterAsset[]> {
  const { data, error } = await supabase
    .from('xlarge_flower_before_after')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as BeforeAfterAsset[];
}

// Before & After 에셋 생성
export async function createBeforeAfterAsset(data: Omit<BeforeAfterAsset, 'id' | 'created_at' | 'updated_at'>) {
  const { data: asset, error } = await supabase
    .from('xlarge_flower_before_after')
    .insert([data])
    .select()
    .single();

  if (error) throw error;
  return asset as BeforeAfterAsset;
}

// Before & After 에셋 수정
export async function updateBeforeAfterAsset(id: string, data: Partial<BeforeAfterAsset>) {
  const { error } = await supabase
    .from('xlarge_flower_before_after')
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) throw error;
  return true;
}

// Before & After 에셋 삭제
export async function deleteBeforeAfterAsset(id: string) {
  const { error } = await supabase
    .from('xlarge_flower_before_after')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return true;
}

// ============================================
// 랜딩 포트폴리오 3종 (REAL PORTFOLIO 섹션)
// ============================================

export interface LandingPortfolio {
  id?: string;
  created_at?: string;
  updated_at?: string;
  client_name: string;           // 예: "BEAUTY D사"
  category: string;              // 예: "뷰티"
  category_color?: string;       // 예: "#FF69B4"
  campaign_date: string;         // 예: "2024.12 캠페인"
  title: string;                 // 예: "인플루언서 대비 ROAS 3배 달성"
  description?: string;          // 예: "기존 인플루언서 협찬 대비..."
  video_url?: string;            // 영상 URL
  thumbnail_url?: string;        // 썸네일 URL
  metric_1_value?: string;       // 예: "+312%"
  metric_1_label?: string;       // 예: "ROAS 상승"
  metric_2_value?: string;       // 예: "₩4,200"
  metric_2_label?: string;       // 예: "CPA 달성"
  sort_order: number;            // 정렬 순서 (0, 1, 2)
  is_active: boolean;
}

// 랜딩 포트폴리오 조회 (메인 페이지용 - 활성화된 3개)
export async function getLandingPortfolios(): Promise<LandingPortfolio[]> {
  const { data, error } = await supabase
    .from('xlarge_flower_landing_portfolio')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })
    .limit(3);

  if (error) throw error;
  return data as LandingPortfolio[];
}

// 랜딩 포트폴리오 전체 조회 (어드민용)
export async function getAllLandingPortfolios(): Promise<LandingPortfolio[]> {
  const { data, error } = await supabase
    .from('xlarge_flower_landing_portfolio')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) throw error;
  return data as LandingPortfolio[];
}

// 랜딩 포트폴리오 생성
export async function createLandingPortfolio(data: Omit<LandingPortfolio, 'id' | 'created_at' | 'updated_at'>) {
  const { data: portfolio, error } = await supabase
    .from('xlarge_flower_landing_portfolio')
    .insert([data])
    .select()
    .single();

  if (error) throw error;
  return portfolio as LandingPortfolio;
}

// 랜딩 포트폴리오 수정
export async function updateLandingPortfolio(id: string, data: Partial<LandingPortfolio>) {
  const { error } = await supabase
    .from('xlarge_flower_landing_portfolio')
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) throw error;
  return true;
}

// 랜딩 포트폴리오 삭제
export async function deleteLandingPortfolio(id: string) {
  const { error } = await supabase
    .from('xlarge_flower_landing_portfolio')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return true;
}

// 랜딩 포트폴리오 순서 일괄 업데이트
export async function updateLandingPortfolioOrders(orders: { id: string; sort_order: number }[]) {
  for (const order of orders) {
    const { error } = await supabase
      .from('xlarge_flower_landing_portfolio')
      .update({ sort_order: order.sort_order })
      .eq('id', order.id);

    if (error) throw error;
  }
  return true;
}
