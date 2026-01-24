'use client';

import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#050505]">
      {/* Header */}
      <header className="border-b border-white/10">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <Link href="/" className="text-white font-bold text-xl tracking-tight hover:text-[#00F5A0] transition-colors">
            XLARGE FLOWER
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-12 md:py-20">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">개인정보처리방침</h1>
        <p className="text-white/50 text-sm mb-12">최종 수정일: 2025년 1월 19일</p>

        <div className="space-y-10 text-white/70 leading-relaxed">
          {/* 1. 개요 */}
          <section>
            <h2 className="text-xl font-bold text-white mb-4">제1조 (총칙)</h2>
            <p>
              파프리카 주식회사(이하 &quot;회사&quot;)는 정보통신망 이용촉진 및 정보보호 등에 관한 법률,
              개인정보 보호법 등 관련 법령을 준수하며, 회원의 개인정보를 보호하기 위해 최선을 다하고 있습니다.
              본 개인정보처리방침은 회사가 제공하는 XLARGE FLOWER 서비스(이하 &quot;서비스&quot;)에 적용됩니다.
            </p>
          </section>

          {/* 2. 수집하는 개인정보 */}
          <section>
            <h2 className="text-xl font-bold text-white mb-4">제2조 (수집하는 개인정보의 항목)</h2>
            <p className="mb-4">회사는 상담, 서비스 신청, 결제 등을 위해 아래와 같은 개인정보를 수집하고 있습니다.</p>

            <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6 space-y-4">
              <div>
                <h3 className="text-white font-medium mb-2">필수 수집 항목</h3>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>회사명, 담당자명, 연락처(휴대전화), 이메일</li>
                  <li>결제정보 (카드사명, 계좌번호 등)</li>
                </ul>
              </div>
              <div>
                <h3 className="text-white font-medium mb-2">자동 수집 항목</h3>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>서비스 이용기록, 접속 로그, 쿠키, 접속 IP 정보</li>
                </ul>
              </div>
              <div>
                <h3 className="text-white font-medium mb-2">선택 수집 항목</h3>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>예산 범위, 관심 상품</li>
                  <li>마케팅 수신 동의 여부</li>
                </ul>
              </div>
            </div>
          </section>

          {/* 3. 개인정보의 수집 및 이용 목적 */}
          <section>
            <h2 className="text-xl font-bold text-white mb-4">제3조 (개인정보의 수집 및 이용목적)</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>서비스 제공에 관한 계약 이행 및 요금 정산</li>
              <li>회원 관리: 본인 확인, 불량 회원의 부정 이용 방지</li>
              <li>고객 상담 및 문의 응대</li>
              <li>서비스 개선 및 신규 서비스 개발</li>
              <li>마케팅 및 광고: 신규 서비스 개발, 접속 빈도 파악, 타겟 마케팅 (네이버 광고 등 리타겟팅 활용 포함)</li>
            </ul>
          </section>

          {/* 4. 개인정보의 보유 및 이용 기간 */}
          <section>
            <h2 className="text-xl font-bold text-white mb-4">제4조 (개인정보의 보유 및 이용기간)</h2>
            <p className="mb-4">
              원칙적으로 개인정보 수집 및 이용목적이 달성된 후에는 해당 정보를 지체 없이 파기합니다.
              단, 관계법령의 규정에 의하여 보존할 필요가 있는 경우 일정 기간 보관합니다.
            </p>
            <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6">
              <ul className="space-y-3 text-sm">
                <li className="flex flex-col sm:flex-row sm:justify-between gap-1">
                  <span>계약 또는 청약철회에 관한 기록</span>
                  <span className="text-[#00F5A0] font-medium">5년</span>
                </li>
                <li className="flex flex-col sm:flex-row sm:justify-between gap-1">
                  <span>대금결제 및 재화 등의 공급에 관한 기록</span>
                  <span className="text-[#00F5A0] font-medium">5년</span>
                </li>
                <li className="flex flex-col sm:flex-row sm:justify-between gap-1">
                  <span>소비자 불만 또는 분쟁처리에 관한 기록</span>
                  <span className="text-[#00F5A0] font-medium">3년</span>
                </li>
                <li className="flex flex-col sm:flex-row sm:justify-between gap-1">
                  <span>웹사이트 방문기록</span>
                  <span className="text-[#00F5A0] font-medium">3개월</span>
                </li>
              </ul>
            </div>
          </section>

          {/* 5. 개인정보의 제3자 제공 */}
          <section>
            <h2 className="text-xl font-bold text-white mb-4">5. 개인정보의 제3자 제공</h2>
            <p>
              회사는 이용자의 개인정보를 원칙적으로 외부에 제공하지 않습니다.
              다만, 아래의 경우에는 예외로 합니다.
            </p>
            <ul className="list-disc list-inside space-y-2 mt-4">
              <li>이용자가 사전에 동의한 경우</li>
              <li>법령의 규정에 의거하거나, 수사 목적으로 법령에 정해진 절차와 방법에 따라 수사기관의 요구가 있는 경우</li>
            </ul>
          </section>

          {/* 6. 개인정보의 파기 절차 및 방법 */}
          <section>
            <h2 className="text-xl font-bold text-white mb-4">6. 개인정보의 파기 절차 및 방법</h2>
            <p>
              회사는 개인정보 보유기간의 경과, 처리목적 달성 등 개인정보가 불필요하게 되었을 때에는
              지체 없이 해당 개인정보를 파기합니다.
            </p>
            <ul className="list-disc list-inside space-y-2 mt-4">
              <li><span className="text-white font-medium">전자적 파일:</span> 복구가 불가능한 방법으로 영구 삭제</li>
              <li><span className="text-white font-medium">종이 문서:</span> 분쇄기로 분쇄하거나 소각</li>
            </ul>
          </section>

          {/* 7. 이용자의 권리 */}
          <section>
            <h2 className="text-xl font-bold text-white mb-4">7. 이용자의 권리</h2>
            <p className="mb-4">이용자는 언제든지 다음의 권리를 행사할 수 있습니다.</p>
            <ul className="list-disc list-inside space-y-2">
              <li>개인정보 열람 요구</li>
              <li>오류 등이 있을 경우 정정 요구</li>
              <li>삭제 요구</li>
              <li>처리정지 요구</li>
            </ul>
            <p className="mt-4 text-sm">
              권리 행사는 이메일(contact@xlargeflower.com)을 통해 요청할 수 있으며,
              회사는 이에 대해 지체 없이 조치하겠습니다.
            </p>
          </section>

          {/* 8. 개인정보 보호책임자 */}
          <section>
            <h2 className="text-xl font-bold text-white mb-4">제5조 (개인정보 보호책임자)</h2>
            <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6">
              <ul className="space-y-2 text-sm">
                <li><span className="text-white/50">성명:</span> <span className="text-white">정재훈</span></li>
                <li><span className="text-white/50">소속/직위:</span> <span className="text-white">대표이사</span></li>
                <li><span className="text-white/50">이메일:</span> <span className="text-white">contact@xlargeflower.com</span></li>
              </ul>
            </div>
          </section>

          {/* 9. 정책 변경 */}
          <section>
            <h2 className="text-xl font-bold text-white mb-4">9. 개인정보처리방침의 변경</h2>
            <p>
              본 개인정보처리방침은 법령, 정책 또는 보안기술의 변경에 따라 내용이 추가, 삭제 및 수정될 수 있습니다.
              변경 시에는 시행일 최소 7일 전부터 웹사이트 공지사항을 통해 고지합니다.
            </p>
          </section>
        </div>

        {/* Back Button */}
        <div className="mt-16 pt-8 border-t border-white/10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-white/60 hover:text-[#00F5A0] transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            홈으로 돌아가기
          </Link>
        </div>
      </main>
    </div>
  );
}
