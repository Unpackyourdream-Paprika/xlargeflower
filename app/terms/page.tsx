'use client';

import Link from 'next/link';

export default function TermsPage() {
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
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">서비스 이용약관</h1>
        <p className="text-white/50 text-sm mb-12">최종 수정일: 2025년 1월 19일</p>

        <div className="space-y-10 text-white/70 leading-relaxed">
          {/* 제1조 */}
          <section>
            <h2 className="text-xl font-bold text-white mb-4">제1조 (목적)</h2>
            <p>
              본 약관은 파프리카 주식회사(이하 &quot;회사&quot;)가 제공하는 AI 영상 제작 서비스 및 관련 제반 서비스(이하 &quot;서비스&quot;)의
              이용과 관련하여 회사와 회원의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.
            </p>
          </section>

          {/* 제2조 */}
          <section>
            <h2 className="text-xl font-bold text-white mb-4">제2조 (용어의 정의)</h2>
            <ul className="list-decimal list-inside space-y-3">
              <li>
                <span className="text-white font-medium">&quot;XLARGE FLOWER&quot;</span>란 회사가 AI 기술을 활용하여 제공하는 가상 모델 광고 제작 서비스를 의미합니다.
              </li>
              <li>
                <span className="text-white font-medium">&quot;회원&quot;</span>이란 본 약관에 동의하고 회사와 이용 계약을 체결한 자를 말합니다.
              </li>
              <li>
                <span className="text-white font-medium">&quot;콘텐츠&quot;</span>란 서비스를 통해 제작되는 모든 영상, 이미지, 텍스트 등의 결과물을 말합니다.
              </li>
            </ul>
          </section>

          {/* 제3조 */}
          <section>
            <h2 className="text-xl font-bold text-white mb-4">제3조 (약관의 효력 및 변경)</h2>
            <ul className="list-decimal list-inside space-y-3">
              <li>본 약관은 서비스 화면에 게시하거나 기타의 방법으로 이용자에게 공지함으로써 효력이 발생합니다.</li>
              <li>회사는 합리적인 사유가 발생할 경우 관련 법령에 위배되지 않는 범위에서 본 약관을 변경할 수 있습니다.</li>
              <li>변경된 약관은 공지 후 7일이 경과한 날부터 효력이 발생합니다.</li>
            </ul>
          </section>

          {/* 제4조 */}
          <section>
            <h2 className="text-xl font-bold text-white mb-4">제4조 (서비스의 제공)</h2>
            <p className="mb-4">회사는 다음과 같은 서비스를 제공합니다.</p>
            <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6">
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-3">
                  <span className="text-[#00F5A0] mt-0.5">•</span>
                  <span>AI 기반 광고 영상 제작 서비스</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#00F5A0] mt-0.5">•</span>
                  <span>광고 소재 컨설팅 및 크리에이티브 기획</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#00F5A0] mt-0.5">•</span>
                  <span>영상 소재 수정 및 바리에이션 제작</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#00F5A0] mt-0.5">•</span>
                  <span>기타 회사가 정하는 서비스</span>
                </li>
              </ul>
            </div>
          </section>

          {/* 제5조 */}
          <section>
            <h2 className="text-xl font-bold text-white mb-4">제3조 (서비스의 내용 및 요금)</h2>
            <ul className="list-decimal list-inside space-y-3">
              <li>회사는 AI 모델 생성, 영상 편집, 광고 운영 대행 등의 서비스를 제공합니다.</li>
              <li>서비스 이용 요금은 홈페이지에 공시된 가격 정책을 따르며, 카드 결제와 현금(세금계산서) 결제 간의 프로모션 정책이 적용될 수 있습니다.</li>
              <li>결제는 신용카드, 계좌이체, 법인카드 등 회사가 정한 방법으로 가능합니다.</li>
              <li>세금계산서는 결제 완료 후 요청 시 발행됩니다.</li>
            </ul>
          </section>

          {/* 제6조 */}
          <section>
            <h2 className="text-xl font-bold text-white mb-4">제4조 (환불 및 계약 해지)</h2>
            <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6 space-y-4">
              <div>
                <h3 className="text-white font-medium mb-2">전액 환불</h3>
                <p className="text-sm">작업 시작 전 취소 시 전액 환불</p>
              </div>
              <div>
                <h3 className="text-white font-medium mb-2">부분 환불 불가</h3>
                <p className="text-sm">디지털 콘텐츠(영상 등)의 특성상 제작이 착수된 이후(작업 공정률 10% 이상)에는 단순 변심에 의한 전액 환불이 불가합니다.</p>
              </div>
              <div>
                <h3 className="text-white font-medium mb-2">회사 귀책사유</h3>
                <p className="text-sm">회사의 귀책사유로 인해 서비스가 정상적으로 제공되지 못한 경우, 회사는 이용대금을 환불하거나 계약 기간을 연장합니다.</p>
              </div>
            </div>
          </section>

          {/* 제7조 */}
          <section>
            <h2 className="text-xl font-bold text-white mb-4">제5조 (저작권의 귀속)</h2>
            <ul className="list-decimal list-inside space-y-3">
              <li>
                회사가 제작한 결과물(영상)에 대한 저작권은 대금 결제가 완료된 시점부터 회원에게 귀속됩니다. 단, 영상 생성에 사용된 AI 모델의 원천 기술 및 베이스 소스에 대한 권리는 회사에 있습니다.
              </li>
              <li>
                회사는 제작된 결과물을 회사의 포트폴리오로 활용할 수 있습니다. (원치 않을 경우 별도 요청)
              </li>
              <li>
                <span className="text-white font-medium">STARTER 팩:</span> 비독점 라이선스가 부여되며 (1년), 동일 콘텐츠가 다른 이용자에게 제공될 수 있습니다.
              </li>
              <li>
                <span className="text-white font-medium">GROWTH/PERFORMANCE 팩:</span> 납품된 콘텐츠에 대해 영구 소장 라이선스가 부여됩니다.
              </li>
            </ul>
          </section>

          {/* 제8조 */}
          <section>
            <h2 className="text-xl font-bold text-white mb-4">제8조 (이용자의 의무)</h2>
            <p className="mb-4">이용자는 다음 행위를 하여서는 안 됩니다.</p>
            <ul className="list-disc list-inside space-y-2">
              <li>타인의 정보를 도용하거나 허위 정보를 제공하는 행위</li>
              <li>서비스를 이용하여 불법적인 콘텐츠를 제작하는 행위</li>
              <li>회사의 저작권 또는 지식재산권을 침해하는 행위</li>
              <li>서비스의 정상적인 운영을 방해하는 행위</li>
              <li>기타 관련 법령에 위반되는 행위</li>
            </ul>
          </section>

          {/* 제9조 */}
          <section>
            <h2 className="text-xl font-bold text-white mb-4">제9조 (회사의 의무)</h2>
            <ul className="list-decimal list-inside space-y-3">
              <li>회사는 관련 법령과 본 약관이 금지하거나 미풍양속에 반하는 행위를 하지 않습니다.</li>
              <li>회사는 이용자가 안전하게 서비스를 이용할 수 있도록 보안 시스템을 갖추기 위해 노력합니다.</li>
              <li>회사는 이용자의 개인정보를 보호하기 위해 개인정보처리방침을 수립하고 준수합니다.</li>
            </ul>
          </section>

          {/* 제10조 */}
          <section>
            <h2 className="text-xl font-bold text-white mb-4">제10조 (면책조항)</h2>
            <ul className="list-decimal list-inside space-y-3">
              <li>회사는 천재지변, 전쟁, 기간통신사업자의 서비스 중지 등 불가항력으로 인해 서비스를 제공할 수 없는 경우 책임이 면제됩니다.</li>
              <li>회사는 이용자의 귀책사유로 인한 서비스 이용 장애에 대해 책임지지 않습니다.</li>
              <li>회사는 이용자가 서비스를 통해 제작한 콘텐츠의 활용 결과에 대해 책임지지 않습니다.</li>
            </ul>
          </section>

          {/* 제11조 */}
          <section>
            <h2 className="text-xl font-bold text-white mb-4">제11조 (분쟁 해결)</h2>
            <ul className="list-decimal list-inside space-y-3">
              <li>회사와 이용자 간에 발생한 분쟁에 대해서는 상호 협의하여 해결합니다.</li>
              <li>협의가 이루어지지 않을 경우, 대한민국 법률에 따라 서울중앙지방법원을 관할 법원으로 합니다.</li>
            </ul>
          </section>

          {/* 부칙 */}
          <section>
            <h2 className="text-xl font-bold text-white mb-4">부칙</h2>
            <p className="mb-4">본 약관은 2025년 1월 19일부터 시행합니다.</p>
            <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6">
              <ul className="space-y-2 text-sm">
                <li><span className="text-white/50">상호명:</span> <span className="text-white">파프리카 주식회사</span></li>
                <li><span className="text-white/50">대표자:</span> <span className="text-white">정재훈</span></li>
                <li><span className="text-white/50">사업자번호:</span> <span className="text-white">774-88-01296</span></li>
                <li><span className="text-white/50">주소:</span> <span className="text-white">서울특별시 마포구 성암로 179, 14층</span></li>
              </ul>
            </div>
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
