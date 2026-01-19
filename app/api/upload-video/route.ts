import { v2 as cloudinary } from 'cloudinary';
import { NextRequest, NextResponse } from 'next/server';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 서명 생성 API (클라이언트 직접 업로드용)
export async function GET() {
  try {
    const timestamp = Math.round(new Date().getTime() / 1000);

    const signature = cloudinary.utils.api_sign_request(
      {
        timestamp,
        folder: 'xlarge-showcase',
      },
      process.env.CLOUDINARY_API_SECRET!
    );

    return NextResponse.json({
      signature,
      timestamp,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
    });
  } catch (error) {
    console.error('Signature error:', error);
    return NextResponse.json(
      { error: 'Failed to generate signature' },
      { status: 500 }
    );
  }
}

// 기존 서버 업로드 (작은 파일용 - 4MB 이하)
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // 파일 크기 체크 (4MB 제한)
    if (file.size > 4 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File too large. Use client-side upload for files over 4MB.' },
        { status: 413 }
      );
    }

    // File을 Buffer로 변환
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Cloudinary에 업로드 (base64로 변환)
    const base64 = buffer.toString('base64');
    const dataURI = `data:${file.type};base64,${base64}`;

    const result = await cloudinary.uploader.upload(dataURI, {
      resource_type: 'video',
      folder: 'xlarge-showcase',
      eager: [
        {
          format: 'webp',
          resource_type: 'video',
          flags: 'animated',
          width: 720,
          crop: 'scale',
          quality: 'auto:good',
        },
        {
          format: 'webp',
          resource_type: 'video',
          width: 720,
          crop: 'scale',
          quality: 'auto:good',
          start_offset: '0',
        }
      ],
      eager_async: false,
    });

    const videoUrl = result.secure_url;

    const webpUrl = result.secure_url
      .replace('/upload/', '/upload/w_480,q_auto,f_webp,fl_awebp/')
      .replace(/\.[^.]+$/, '.webp');

    const thumbnailUrl = result.secure_url
      .replace('/upload/', '/upload/w_720,q_auto,so_0,f_webp/')
      .replace(/\.[^.]+$/, '.webp');

    return NextResponse.json({
      success: true,
      videoUrl,
      webpUrl,
      thumbnailUrl,
      publicId: result.public_id,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Upload failed', details: String(error) },
      { status: 500 }
    );
  }
}
