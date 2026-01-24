import OpenAI from 'openai';
import { NextRequest, NextResponse } from 'next/server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface TranslationRequest {
  texts: string[];
  targetLanguages: ('en' | 'ja')[];
}

interface TranslationResult {
  original: string;
  en?: string;
  ja?: string;
}

const TRANSLATION_PROMPT = `You are a professional translator specializing in marketing and business content.
Translate the following Korean texts to the requested languages.
Keep the translations natural and appropriate for a business/marketing context.
Maintain any formatting, special characters, or emojis.
For pricing-related terms, keep currency symbols and numbers as-is.

IMPORTANT RULES:
- Keep proper nouns (brand names, product names) in their original form
- For features/benefits lists, maintain concise and impactful phrasing
- Ensure translations are culturally appropriate for the target market
- If the text is already in the target language, return it as-is

Return ONLY a valid JSON array with the translations in this exact format:
[
  {
    "original": "original Korean text",
    "en": "English translation",
    "ja": "Japanese translation"
  }
]`;

export async function POST(request: NextRequest) {
  try {
    const body: TranslationRequest = await request.json();
    const { texts, targetLanguages } = body;

    if (!texts || !Array.isArray(texts) || texts.length === 0) {
      return NextResponse.json(
        { error: 'texts array is required' },
        { status: 400 }
      );
    }

    if (!targetLanguages || !Array.isArray(targetLanguages) || targetLanguages.length === 0) {
      return NextResponse.json(
        { error: 'targetLanguages array is required' },
        { status: 400 }
      );
    }

    // Filter out empty strings
    const validTexts = texts.filter(t => t && t.trim());

    if (validTexts.length === 0) {
      return NextResponse.json({ translations: [] });
    }

    const userMessage = `Translate these Korean texts to ${targetLanguages.join(' and ')}:

${validTexts.map((text, i) => `${i + 1}. "${text}"`).join('\n')}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: TRANSLATION_PROMPT },
        { role: 'user', content: userMessage },
      ],
      max_tokens: 2000,
      temperature: 0.3,
    });

    const content = response.choices[0]?.message?.content || '[]';

    // Parse JSON from response
    let translations: TranslationResult[] = [];
    try {
      // Find JSON array in the response
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        translations = JSON.parse(jsonMatch[0]);
      }
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      return NextResponse.json(
        { error: 'Failed to parse translation response' },
        { status: 500 }
      );
    }

    return NextResponse.json({ translations });
  } catch (error) {
    console.error('Translation API error:', error);
    return NextResponse.json(
      { error: '번역 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
