'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { getOrders, XLargeFlowerOrder } from '@/lib/supabase';

function OrdersContent() {
  const searchParams = useSearchParams();
  const statusFilter = searchParams.get('status');

  const [orders, setOrders] = useState<XLargeFlowerOrder[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<XLargeFlowerOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string>(statusFilter || 'all');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await getOrders();
        setOrders(data);
      } catch (error) {
        console.error('Failed to fetch orders:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, []);

  useEffect(() => {
    if (activeFilter === 'all') {
      setFilteredOrders(orders);
    } else {
      setFilteredOrders(orders.filter(o => o.status === activeFilter));
    }
  }, [orders, activeFilter]);

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
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filters = [
    { key: 'all', label: '전체', count: orders.length },
    { key: 'pending', label: '접수대기', count: orders.filter(o => o.status === 'pending').length },
    { key: 'confirmed', label: '입금확인', count: orders.filter(o => o.status === 'confirmed').length },
    { key: 'in_progress', label: '작업중', count: orders.filter(o => o.status === 'in_progress').length },
    { key: 'completed', label: '납품완료', count: orders.filter(o => o.status === 'completed').length },
  ];

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
            <Link href="/" className="text-gray-500 hover:text-white text-sm transition-colors">
              사이트 보기
            </Link>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-[#0A0A0A] border-b border-[#222] overflow-x-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-4 sm:gap-6 min-w-max items-center">
            <Link
              href="/admin"
              className="py-4 border-b-2 border-transparent text-gray-500 hover:text-white font-medium text-sm transition-colors whitespace-nowrap"
            >
              대시보드
            </Link>
            <Link
              href="/admin/orders"
              className="py-4 border-b-2 border-[#00F5A0] text-[#00F5A0] font-medium text-sm whitespace-nowrap"
            >
              주문 관리
            </Link>
            <Link
              href="/admin/hero"
              className="py-4 border-b-2 border-transparent text-gray-500 hover:text-white font-medium text-sm transition-colors whitespace-nowrap"
            >
              히어로
            </Link>
            <Link
              href="/admin/showcase"
              className="py-4 border-b-2 border-transparent text-gray-500 hover:text-white font-medium text-sm transition-colors whitespace-nowrap"
            >
              쇼케이스
            </Link>
            <Link
              href="/admin/before-after"
              className="py-4 border-b-2 border-transparent text-gray-500 hover:text-white font-medium text-sm transition-colors whitespace-nowrap"
            >
              Before/After
            </Link>
            <Link
              href="/admin/landing-portfolio"
              className="py-4 border-b-2 border-transparent text-gray-500 hover:text-white font-medium text-sm transition-colors whitespace-nowrap"
            >
              랜딩 포트폴리오
            </Link>
            <Link
              href="/admin/portfolio"
              className="py-4 border-b-2 border-transparent text-gray-500 hover:text-white font-medium text-sm transition-colors whitespace-nowrap"
            >
              포트폴리오
            </Link>
            <span className="text-gray-600 text-sm">|</span>
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
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white">주문 관리</h2>
          <p className="text-gray-500 mt-1">고객 주문을 확인하고 상태를 관리하세요.</p>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {filters.map((filter) => (
            <button
              key={filter.key}
              onClick={() => setActiveFilter(filter.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                activeFilter === filter.key
                  ? 'bg-gradient-to-r from-[#00F5A0] to-[#00D9F5] text-black'
                  : 'bg-[#111] border border-[#333] text-gray-400 hover:border-[#00F5A0]/50 hover:text-white'
              }`}
            >
              {filter.label} ({filter.count})
            </button>
          ))}
        </div>

        {/* Orders - Mobile Cards */}
        <div className="block sm:hidden space-y-3">
          {filteredOrders.length === 0 ? (
            <div className="bg-[#0A0A0A] border border-[#222] rounded-xl p-8 text-center text-gray-500">
              {activeFilter === 'all' ? '아직 주문이 없습니다.' : '해당 상태의 주문이 없습니다.'}
            </div>
          ) : (
            filteredOrders.map((order) => (
              <Link
                key={order.id}
                href={`/admin/orders/${order.id}`}
                className="block bg-[#0A0A0A] border border-[#222] rounded-xl p-4 hover:border-[#00F5A0]/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <p className="font-medium text-white">{order.customer_name || '이름 없음'}</p>
                    <p className="text-xs text-gray-500">{order.customer_phone}</p>
                  </div>
                  {getStatusBadge(order.status || 'pending')}
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div>
                    <p className="text-gray-400">{order.order_summary?.product || order.order_summary?.category || '-'}</p>
                    <p className="text-[#00F5A0] text-xs">{order.order_summary?.recommended_pack}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-medium">
                      {order.order_summary?.estimated_price
                        ? new Intl.NumberFormat('ko-KR').format(order.order_summary.estimated_price) + '원'
                        : '-'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {order.created_at && formatDate(order.created_at)}
                    </p>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>

        {/* Orders Table - Desktop */}
        <div className="hidden sm:block bg-[#0A0A0A] border border-[#222] rounded-xl overflow-hidden">
          {filteredOrders.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              {activeFilter === 'all' ? '아직 주문이 없습니다.' : '해당 상태의 주문이 없습니다.'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#111] border-b border-[#222]">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      고객
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      상품 정보
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      상태
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      예상 금액
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      주문일
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      액션
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#222]">
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-[#111] transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <p className="font-medium text-white">
                            {order.customer_name || '이름 없음'}
                          </p>
                          <p className="text-sm text-gray-500">{order.customer_phone}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-white">
                            {order.order_summary?.product || order.order_summary?.category || '-'}
                          </p>
                          <p className="text-sm text-[#00F5A0]">
                            {order.order_summary?.recommended_pack} 팩
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(order.status || 'pending')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-white">
                        {order.order_summary?.estimated_price
                          ? new Intl.NumberFormat('ko-KR').format(order.order_summary.estimated_price) + '원'
                          : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {order.created_at && formatDate(order.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="text-[#00F5A0] hover:text-[#00D9F5] font-medium text-sm transition-colors"
                        >
                          상세 보기 →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function AdminOrdersPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-400">
          <div className="w-5 h-5 border-2 border-[#00F5A0] border-t-transparent rounded-full animate-spin" />
          로딩 중...
        </div>
      </div>
    }>
      <OrdersContent />
    </Suspense>
  );
}
