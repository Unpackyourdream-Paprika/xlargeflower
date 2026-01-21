import { NextRequest, NextResponse } from 'next/server';

// Gemini 2.5 Flash Image Preview 모델 사용 (nanobanana와 동일)
const MODEL = 'gemini-2.0-flash-exp-image-generation';
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: '프롬프트를 입력해주세요.' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GOOGLE_AI_API_KEY;
    if (!apiKey) {
      console.error('GOOGLE_AI_API_KEY is not set');
      return NextResponse.json(
        { error: 'API 키가 설정되지 않았습니다.' },
        { status: 500 }
      );
    }

    // 프롬프트 강화: 3면도 캐릭터 시트 형태로 생성 (연습생 프로필 컨셉) - 정사각형 비율
    const enhancedPrompt = `Generate a square image (1:1 aspect ratio): Professional model portfolio character sheet, split screen showing three views of the same person: front view, 45 degree angle view, and side profile view, arranged horizontally in one square image. ${prompt}, Korean model, high-end fashion aesthetic, elegant and sophisticated, professional studio lighting, clean dark background, photorealistic, high quality, detailed facial features, consistent face across all three angles, model agency composite card style`;

    // Gemini API 요청 (nanobanana와 동일한 방식)
    const payload = {
      contents: [
        {
          parts: [
            {
              text: enhancedPrompt,
            },
          ],
        },
      ],
      generationConfig: {
        responseModalities: ['Text', 'Image'],
      },
    };

    const response = await fetch(`${ENDPOINT}?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Gemini API error:', response.status, errorData);

      // 특정 에러 메시지 처리
      if (response.status === 400) {
        return NextResponse.json(
          { error: '이미지 생성 요청이 거부되었습니다. 다른 스타일을 시도해주세요.' },
          { status: 400 }
        );
      }

      if (response.status === 429) {
        return NextResponse.json(
          { error: 'API 요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.' },
          { status: 429 }
        );
      }

      return NextResponse.json(
        { error: '이미지 생성에 실패했습니다. 잠시 후 다시 시도해주세요.' },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Gemini 응답에서 이미지 추출
    const candidates = data.candidates;
    if (!candidates || candidates.length === 0) {
      return NextResponse.json(
        { error: '이미지가 생성되지 않았습니다.' },
        { status: 500 }
      );
    }

    // parts에서 이미지 데이터 찾기
    const parts = candidates[0]?.content?.parts;
    if (!parts || parts.length === 0) {
      return NextResponse.json(
        { error: '이미지 데이터를 찾을 수 없습니다.' },
        { status: 500 }
      );
    }

    // inlineData에서 base64 이미지 추출
    const imagePart = parts.find((part: { inlineData?: { mimeType: string; data: string } }) => part.inlineData);
    if (!imagePart || !imagePart.inlineData) {
      return NextResponse.json(
        { error: '이미지 데이터를 찾을 수 없습니다.' },
        { status: 500 }
      );
    }

    const { mimeType, data: imageBase64 } = imagePart.inlineData;
    const imageUrl = `data:${mimeType || 'image/png'};base64,${imageBase64}`;

    return NextResponse.json({
      success: true,
      imageUrl,
      prompt: enhancedPrompt,
    });
  } catch (error) {
    console.error('Generate model error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' },
      { status: 500 }
    );
  }
}
