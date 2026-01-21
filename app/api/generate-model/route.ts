import { NextRequest, NextResponse } from 'next/server';

// Gemini 2.5 Flash Preview 모델 사용
const MODEL = 'gemini-2.5-flash-preview-04-17';
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

// 디폴트 프롬프트 (리얼리스틱 패션 모델 포트레이트)
const DEFAULT_PROMPT = `Create a realistic fashion model portrait photograph.

SUBJECT
One female fashion model in a single full-body photograph.
She should look like a real person photographed by a professional photographer.
Natural, authentic appearance - not overly perfect or artificial.

ETHNICITY
Randomly Asian or non-Asian per generation.

AGE
Young adult, 20-25 years old appearance.
Natural, youthful look.

FACE
- Natural, photogenic face
- Clear skin with natural texture
- Subtle natural makeup or no makeup
- Calm, confident expression
- Natural eye contact with camera

BODY
- Slim, model-like proportions
- Natural standing pose
- Relaxed, confident posture

HAIR
Natural hairstyle, can vary:
- Straight, wavy, or slightly textured
- Any natural hair color
- Neatly styled but not overly done

CLOTHING
Simple, minimal outfit:
- Plain white or black t-shirt
- Dark jeans or simple pants
- Clean, casual style

SETTING
- Professional photo studio
- Clean white or light gray seamless background
- Soft, even studio lighting
- No harsh shadows

CAMERA & QUALITY
- Full-body shot, head to toe visible
- Eye-level camera angle
- Professional DSLR quality
- Sharp focus on face and body
- Natural color grading

IMPORTANT
- Must look like a REAL photograph of a REAL person
- No uncanny valley effects
- No distorted features
- No multiple views or split images
- Single person, single pose, single photograph
- Photorealistic quality only`;

export async function POST(request: NextRequest) {
  try {
    const { prompt, gender, referenceImages } = await request.json();

    const apiKey = process.env.GOOGLE_AI_API_KEY;
    if (!apiKey) {
      console.error('GOOGLE_AI_API_KEY is not set');
      return NextResponse.json(
        { error: 'API 키가 설정되지 않았습니다.' },
        { status: 500 }
      );
    }

    // 성별에 따른 프롬프트 조정
    const genderText = gender === 'male' ? 'male' : 'female';

    // 최종 프롬프트 구성: 사용자 프롬프트를 최상단에 배치
    let finalPrompt = '';

    // 1. 사용자 프롬프트가 있으면 최상단에 배치
    if (prompt && prompt.trim()) {
      finalPrompt = `USER REQUEST (HIGHEST PRIORITY):
${prompt.trim()}

---

`;
    }

    // 2. 성별 조정 (male인 경우)
    let basePrompt = DEFAULT_PROMPT;
    if (gender === 'male') {
      basePrompt = basePrompt
        .replace(/female/g, 'male')
        .replace(/She must/g, 'He must')
        .replace(/her /g, 'his ');
    }

    // 3. 디폴트 프롬프트 추가
    finalPrompt += basePrompt;

    // Gemini API 요청 - parts 배열 구성
    const parts: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }> = [];

    // 레퍼런스 이미지가 있으면 먼저 추가 (최대 2장)
    if (referenceImages && Array.isArray(referenceImages) && referenceImages.length > 0) {
      const validImages = referenceImages.slice(0, 2); // 최대 2장

      for (const img of validImages) {
        if (img && img.base64 && img.mimeType) {
          parts.push({
            inlineData: {
              mimeType: img.mimeType,
              data: img.base64
            }
          });
        }
      }

      // 레퍼런스 이미지가 있으면 프롬프트에 안내 추가
      if (parts.length > 0) {
        finalPrompt = `REFERENCE IMAGES PROVIDED: Use the attached ${parts.length} image(s) as style/appearance reference. The generated model should have similar features, style, or mood as shown in the reference images.

---

${finalPrompt}`;
      }
    }

    // 텍스트 프롬프트 추가
    parts.push({ text: finalPrompt });

    const payload = {
      contents: [
        {
          parts: parts,
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

    // responseParts에서 이미지 데이터 찾기
    const responseParts = candidates[0]?.content?.parts;
    if (!responseParts || responseParts.length === 0) {
      return NextResponse.json(
        { error: '이미지 데이터를 찾을 수 없습니다.' },
        { status: 500 }
      );
    }

    // inlineData에서 base64 이미지 추출
    const imagePart = responseParts.find((part: { inlineData?: { mimeType: string; data: string } }) => part.inlineData);
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
      prompt: finalPrompt,
    });
  } catch (error) {
    console.error('Generate model error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' },
      { status: 500 }
    );
  }
}
