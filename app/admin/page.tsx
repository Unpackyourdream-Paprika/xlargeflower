'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getOrders, XLargeFlowerOrder } from '@/lib/supabase';

interface DashboardStats {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  todayOrders: number;
}

export default function AdminDashboard() {
  const [orders, setOrders] = useState<XLargeFlowerOrder[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    total: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
    todayOrders: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');

  const ADMIN_PASSWORD = 'xlarge2024';

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      localStorage.setItem('adminAuth', 'true');
    } else {
      alert('비밀번호가 틀렸습니다.');
    }
  };

  useEffect(() => {
    const authStatus = localStorage.getItem('adminAuth');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchData = async () => {
      try {
        const ordersData = await getOrders();
        setOrders(ordersData);

        const today = new Date().toDateString();
        const todayOrders = ordersData.filter(
          o => new Date(o.created_at || '').toDateString() === today
        ).length;

        setStats({
          total: ordersData.length,
          pending: ordersData.filter(o => o.status === 'pending').length,
          inProgress: ordersData.filter(o => o.status === 'in_progress' || o.status === 'confirmed').length,
          completed: ordersData.filter(o => o.status === 'completed').length,
          todayOrders
        });
      } catch (error) {
        console.error('Failed to fetch orders:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated]);

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { border: string; text: string; label: string }> = {
      pending: { border: 'border-gray-500', text: 'text-gray-400', label: '접수대기' },
      confirmed: { border: 'border-blue-500', text: 'text-blue-400', label: '입금확인' },
      in_progress: { border: 'border-[#00F5A0]', text: 'text-[#00F5A0]', label: '작업중' },
      review: { border: 'border-orange-500', text: 'text-orange-400', label: '검토중' },
      revision: { border: 'border-red-500', text: 'text-red-400', label: '수정요청' },
      completed: { border: 'border-[#00D9F5]', text: 'text-[#00D9F5]', label: '납품완료' },
      cancelled: { border: 'border-gray-600', text: 'text-gray-500', label: '취소' }
    };
    const badge = badges[status] || badges.pending;
    return (
      <span className={`px-2 py-1 rounded border ${badge.border} ${badge.text} text-xs font-medium`}>
        {badge.label}
      </span>
    );
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Dark Login Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4">
        <div className="bg-[#0A0A0A] border border-[#222] rounded-2xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-[#00F5A0] to-[#00D9F5] rounded-lg flex items-center justify-center">
                <span className="text-black font-bold text-sm">XL</span>
              </div>
              <h1 className="text-xl font-bold text-white">XLARGE FLOWER</h1>
            </div>
            <p className="text-gray-500">관리자 로그인</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                비밀번호
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-[#111] border border-[#333] rounded-xl focus:border-[#00F5A0] focus:outline-none text-white placeholder-gray-600"
                placeholder="관리자 비밀번호 입력"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-[#00F5A0] to-[#00D9F5] text-black font-bold rounded-xl hover:shadow-lg hover:shadow-[#00F5A0]/20 transition-all"
            >
              로그인
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-400">
          <div className="w-5 h-5 border-2 border-[#00F5A0] border-t-transparent rounded-full animate-spin" />
          로딩 중...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505]">
      {/* Header */}
      <header className="bg-[#0A0A0A] border-b border-[#222]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-[#00F5A0] to-[#00D9F5] rounded-lg flex items-center justify-center">
                <span className="text-black font-bold text-sm">XL</span>
              </div>
              <h1 className="text-lg font-bold text-white">XLARGE FLOWER</h1>
              <span className="px-2 py-0.5 bg-[#111] border border-[#333] rounded text-xs text-gray-400">Admin</span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/" className="text-gray-500 hover:text-white text-sm transition-colors">
                사이트 보기
              </Link>
              <button
                onClick={() => {
                  localStorage.removeItem('adminAuth');
                  setIsAuthenticated(false);
                }}
                className="text-gray-500 hover:text-red-400 text-sm transition-colors"
              >
                로그아웃
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-[#0A0A0A] border-b border-[#222] overflow-x-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-4 sm:gap-6 min-w-max">
            <Link
              href="/admin"
              className="py-4 border-b-2 border-[#00F5A0] text-[#00F5A0] font-medium text-sm whitespace-nowrap"
            >
              대시보드
            </Link>
            <Link
              href="/admin/orders"
              className="py-4 border-b-2 border-transparent text-gray-500 hover:text-white font-medium text-sm transition-colors whitespace-nowrap"
            >
              주문 관리
            </Link>
            <Link
              href="/admin/portfolio"
              className="py-4 border-b-2 border-transparent text-gray-500 hover:text-white font-medium text-sm transition-colors whitespace-nowrap"
            >
              포트폴리오
            </Link>
            <Link
              href="/admin/showcase"
              className="py-4 border-b-2 border-transparent text-gray-500 hover:text-white font-medium text-sm transition-colors whitespace-nowrap"
            >
              쇼케이스
            </Link>
            <Link
              href="/admin/hero"
              className="py-4 border-b-2 border-transparent text-gray-500 hover:text-white font-medium text-sm transition-colors whitespace-nowrap"
            >
              히어로 관리
            </Link>
            <Link
              href="/admin/artists"
              className="py-4 border-b-2 border-transparent text-gray-500 hover:text-white font-medium text-sm transition-colors whitespace-nowrap"
            >
              아티스트
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-8">
          <div className="bg-[#0A0A0A] border border-[#222] rounded-xl p-4 sm:p-6">
            <p className="text-xs sm:text-sm text-gray-500">오늘 주문</p>
            <p className="text-2xl sm:text-3xl font-bold text-white mt-1">{stats.todayOrders}</p>
          </div>
          <div className="bg-[#0A0A0A] border border-[#222] rounded-xl p-4 sm:p-6">
            <p className="text-xs sm:text-sm text-gray-500">전체 주문</p>
            <p className="text-2xl sm:text-3xl font-bold text-white mt-1">{stats.total}</p>
          </div>
          <div className="bg-[#0A0A0A] border border-[#222] rounded-xl p-4 sm:p-6 border-l-4 border-l-yellow-500">
            <p className="text-xs sm:text-sm text-gray-500">접수 대기</p>
            <p className="text-2xl sm:text-3xl font-bold text-yellow-400 mt-1">{stats.pending}</p>
          </div>
          <div className="bg-[#0A0A0A] border border-[#222] rounded-xl p-4 sm:p-6 border-l-4 border-l-[#00F5A0]">
            <p className="text-xs sm:text-sm text-gray-500">작업 중</p>
            <p className="text-2xl sm:text-3xl font-bold text-[#00F5A0] mt-1">{stats.inProgress}</p>
          </div>
          <div className="bg-[#0A0A0A] border border-[#222] rounded-xl p-4 sm:p-6 border-l-4 border-l-[#00D9F5] col-span-2 sm:col-span-1">
            <p className="text-xs sm:text-sm text-gray-500">납품 완료</p>
            <p className="text-2xl sm:text-3xl font-bold text-[#00D9F5] mt-1">{stats.completed}</p>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-[#0A0A0A] border border-[#222] rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-[#222] flex items-center justify-between">
            <h2 className="font-semibold text-white">최근 주문</h2>
            <Link href="/admin/orders" className="text-sm text-[#00F5A0] hover:text-[#00D9F5] transition-colors">
              전체 보기 →
            </Link>
          </div>

          {orders.length === 0 ? (
            <div className="p-8 sm:p-12 text-center text-gray-500">
              아직 주문이 없습니다.
            </div>
          ) : (
            <div className="divide-y divide-[#222]">
              {orders.slice(0, 10).map((order) => (
                <Link
                  key={order.id}
                  href={`/admin/orders/${order.id}`}
                  className="px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 hover:bg-[#111] transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                      <span className="font-medium text-white text-sm sm:text-base">
                        {order.customer_name || '이름 없음'}
                      </span>
                      {getStatusBadge(order.status || 'pending')}
                    </div>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1 truncate">
                      {order.order_summary?.product || order.order_summary?.category || '상품 정보 없음'}
                      {order.order_summary?.recommended_pack && (
                        <span className="ml-2 text-[#00F5A0]">
                          • {order.order_summary.recommended_pack}
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center justify-between sm:block sm:text-right">
                    <p className="text-xs sm:text-sm text-gray-500">
                      {order.created_at && formatDate(order.created_at)}
                    </p>
                    {order.order_summary?.estimated_price && (
                      <p className="text-sm font-medium text-white">
                        {new Intl.NumberFormat('ko-KR').format(order.order_summary.estimated_price)}원
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#0A0A0A] border border-[#222] rounded-xl p-6 hover:border-yellow-500/50 transition-colors">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-yellow-500/10 rounded-lg flex items-center justify-center">
                <span className="text-yellow-400 text-xl">⚡</span>
              </div>
              <h3 className="font-semibold text-white">긴급 처리 필요</h3>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              {stats.pending}건의 주문이 접수 대기 중입니다.
            </p>
            <Link
              href="/admin/orders?status=pending"
              className="inline-block px-4 py-2 bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 rounded-lg text-sm font-medium hover:bg-yellow-500/20 transition-colors"
            >
              바로 확인하기
            </Link>
          </div>

          <div className="bg-[#0A0A0A] border border-[#222] rounded-xl p-6 hover:border-[#00F5A0]/50 transition-colors">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-[#00F5A0]/10 rounded-lg flex items-center justify-center">
                <span className="text-[#00F5A0] text-xl">📊</span>
              </div>
              <h3 className="font-semibold text-white">포트폴리오 관리</h3>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              새 작업물을 포트폴리오에 추가하세요.
            </p>
            <Link
              href="/admin/portfolio"
              className="inline-block px-4 py-2 bg-[#00F5A0]/10 border border-[#00F5A0]/30 text-[#00F5A0] rounded-lg text-sm font-medium hover:bg-[#00F5A0]/20 transition-colors"
            >
              포트폴리오 관리
            </Link>
          </div>

          <div className="bg-[#0A0A0A] border border-[#222] rounded-xl p-6 hover:border-[#00D9F5]/50 transition-colors">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-[#00D9F5]/10 rounded-lg flex items-center justify-center">
                <span className="text-[#00D9F5] text-xl">💬</span>
              </div>
              <h3 className="font-semibold text-white">문의 확인</h3>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              고객 문의 내역을 확인하세요.
            </p>
            <Link
              href="/admin/contacts"
              className="inline-block px-4 py-2 bg-[#00D9F5]/10 border border-[#00D9F5]/30 text-[#00D9F5] rounded-lg text-sm font-medium hover:bg-[#00D9F5]/20 transition-colors"
            >
              문의 목록
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
