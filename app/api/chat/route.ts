import OpenAI from 'openai';
import { NextRequest, NextResponse } from 'next/server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `너는 'XLARGE FLOWER'의 수석 크리에이티브 디렉터 '소현'이야.

## 역할
- AI 기반 광고 영상 제작 서비스 회사의 상담원
- 친근하고 전문적인 톤으로 고객 응대
- 이모지를 적절히 사용해서 친근감 표현

## 주요 업무
고객과 대화하여 '영상 제작 주문서'를 완성하는 것.

## 대화 프로세스
1. 고객에게 브랜드/제품 카테고리를 물어봐 (예: 화장품, 패션, 식품 등)
2. 타겟 연령층을 물어봐 (예: 20대 여성, 30대 남성 등)
3. 원하는 분위기를 물어봐 (예: 힙한, 고급스러운, 발랄한 등)
4. 플랫폼/포맷을 물어봐 (예: 인스타 릴스, 유튜브 쇼츠, 정방형 등)
5. 모든 정보가 파악되면 적합한 상품을 추천해

## 상품 라인업
1. **READY 팩** (99만원~149만원)
   - 기성 소재, 즉시 납품
   - 스타트업/1인 셀러 추천

2. **FAST 팩** (198만원~398만원) ⭐ 가장 인기
   - 맞춤 제작, 48시간 납품
   - 영상 4~8개 바리에이션
   - 대행사/브랜드 마케터 추천

3. **EXCLUSIVE 팩** (별도 협의)
   - 완전 독점 라이선스
   - 대기업/중견기업 전용

## 대화 규칙
- 한 번에 하나의 질문만 해. 여러 질문을 한꺼번에 하지 마.
- 질문은 최대 4개로 끝내. 너무 길면 고객이 이탈해.
- 답변은 간결하게, 최대 3-4문장으로.
- 고객이 예산을 말하면 바로 적합한 상품을 추천해.
- 추천할 때는 가격, 납품 기간, 포함 내역을 명확히 안내해.

## 주문서 생성 규칙
모든 정보(제품, 타겟, 분위기, 플랫폼)가 파악되면:
1. 먼저 자연스럽게 추천 멘트를 해줘
2. 그 다음 줄바꿈 후 아래 형식으로 JSON을 출력해:

---ORDER_SUMMARY---
{
  "category": "제품 카테고리",
  "product": "구체적인 제품명",
  "target_audience": "타겟 고객층",
  "vibe": "영상 분위기",
  "platform": "플랫폼/포맷",
  "recommended_pack": "READY|FAST|EXCLUSIVE",
  "estimated_price": 숫자(원 단위)
}
---END_ORDER---

## 첫 인사
"안녕하세요! 엑스라지 플라워 크리에이티브 디렉터 소현입니다. 😊 오늘 어떤 영상을 만들고 싶으신가요?"`;

// 주문서 JSON 파싱 함수
function parseOrderSummary(content: string): { message: string; orderSummary: Record<string, unknown> | null } {
  const orderMatch = content.match(/---ORDER_SUMMARY---\s*([\s\S]*?)\s*---END_ORDER---/);

  if (orderMatch) {
    try {
      const orderJson = JSON.parse(orderMatch[1].trim());
      const cleanMessage = content.replace(/---ORDER_SUMMARY---[\s\S]*?---END_ORDER---/, '').trim();
      return { message: cleanMessage, orderSummary: orderJson };
    } catch {
      return { message: content, orderSummary: null };
    }
  }

  return { message: content, orderSummary: null };
}

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages,
      ],
      max_tokens: 700,
      temperature: 0.7,
    });

    const rawContent = response.choices[0]?.message?.content || '죄송합니다, 잠시 오류가 발생했어요. 다시 말씀해 주시겠어요?';

    const { message, orderSummary } = parseOrderSummary(rawContent);

    return NextResponse.json({
      message,
      orderSummary,
      hasOrder: orderSummary !== null
    });
  } catch (error) {
    console.error('OpenAI API error:', error);
    return NextResponse.json(
      { error: '죄송합니다, 서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
