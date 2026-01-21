import { NextRequest, NextResponse } from 'next/server';

// Gemini 2.5 Flash Image Preview 모델 사용
const MODEL = 'gemini-2.0-flash-exp-image-generation';
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

// 디폴트 프롬프트 (하이패션 런웨이 모델 캐스팅 보드)
const DEFAULT_PROMPT = `Create a realistic high-fashion runway model casting image.

SUBJECT
One female high-fashion runway model only.
She must clearly read as a professional runway model,
not a civilian, not commercial, not influencer-like.

Ethnicity is RANDOM per generation:
Asian or non-Asian.

AGE & IMPRESSION
Legally adult (18–22),
but visually very young.
Late-teen to early-twenties impression.

FACIAL CHARACTER (CORE)
The face must be striking, sharp, and memorable.

Mandatory facial traits:
– strong bone structure
– defined cheekbones
– sharp or elongated jawline
– narrow or distinctive facial proportions
– subtle asymmetry (fashion-level, not deformity)
– intense, distant eyes
– neutral, serious expression

Prohibited facial traits:
– soft or cute beauty
– friendly smile
– influencer or commercial prettiness
– generic AI symmetry

MODEL BODY TRAITS
– tall, elongated proportions
– long neck and limbs
– narrow frame
– strong vertical silhouette
– clean, upright posture

HAIR (FLEXIBLE BUT CONTROLLED)
Hairstyle may vary freely:
– tied hair (low ponytail, bun, pulled back)
– short hair or bob
– medium-length hair
– long straight or lightly textured hair
– center part or side part

Hair angles, direction, and balance may vary naturally.

Hair must feel:
– fashionable
– believable
– runway-appropriate

Hair must NOT be:
– messy in an ugly way
– extreme, sculptural, or art-hair
– cartoonish or fantasy-styled

HAIR COLOR
Hair color is flexible.
Natural tones are common.
Uncommon or dyed tones are allowed
if they still feel elegant, modern, and high-fashion.
No neon or cosplay colors.

EYES
Eye color may vary naturally or subtly.
Rare eye colors allowed if understated and editorial.

CLOTHING (RUNWAY CASTING UNIFORM)
Plain black fitted T-shirt.
Black straight or slim jeans.
Simple black shoes.
No accessories.
No jewelry.

SCENE & LIGHTING
Neutral studio.
White or very light gray background.
Soft, even, neutral studio lighting.
No mood lighting.
No cinematic drama.

LAYOUT (CASTING BOARD STYLE)
One image with three views:

LEFT
– Full-body front view (head to toe)

RIGHT TOP
– Upper-body portrait
– Neutral, distant runway gaze

RIGHT BOTTOM
– Right-side profile
– Clear jawline, nose, and neck silhouette

All views must show the SAME model.

CAMERA
Eye-level camera.
Natural lens perspective.
No wide-angle distortion.

STYLE & QUALITY
Ultra-realistic photography.
Professional high-fashion runway casting board quality.
Clean, sharp, minimal.
No illustration, no CG, no glamour retouching.

ABSOLUTE FAILURE CONDITIONS
If the model looks:
– like a normal person
– cute or friendly
– influencer-like
– fashion editorial gimmick

the result is INVALID.

FINAL INTENT
A randomly generated but consistently striking
female high-fashion runway model,
very young in appearance,
with a sharp, unconventional face,
flexible but tasteful hairstyle,
presented in a clean professional casting board layout.`;

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
