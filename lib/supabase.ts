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
}

// Database functions
export async function submitContact(data: Omit<XLargeFlowerContact, 'id' | 'created_at' | 'status'>) {
  const { error } = await supabase
    .from('xlarge_flower_contacts')
    .insert([data]);

  if (error) throw error;
  return true;
}

export async function getPortfolioItems() {
  const { data, error } = await supabase
    .from('xlarge_flower_portfolio')
    .select('*')
    .eq('is_active', true)
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
