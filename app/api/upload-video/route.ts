import { v2 as cloudinary } from 'cloudinary';
import { NextRequest, NextResponse } from 'next/server';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
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
      // 자동 변환 설정 (720px, 고품질)
      eager: [
        // WebP GIF 형태로 변환 (Animated WebP)
        {
          format: 'webp',
          resource_type: 'video',
          flags: 'animated',
          width: 720,
          crop: 'scale',
          quality: 'auto:good',
        },
        // 포스터 이미지 (첫 프레임)
        {
          format: 'webp',
          resource_type: 'video',
          width: 720,
          crop: 'scale',
          quality: 'auto:good',
          start_offset: '0',
        }
      ],
      eager_async: false, // 동기적으로 변환 완료 대기
    });

    // URL 생성
    const videoUrl = result.secure_url;

    // Animated WebP URL (비디오를 Animated WebP로 변환)
    // Cloudinary video-to-animated-webp 변환
    // 해상도: 480px (품질과 용량 균형)
    const webpUrl = result.secure_url
      .replace('/upload/', '/upload/w_480,q_auto,f_webp,fl_awebp/')
      .replace(/\.[^.]+$/, '.webp');

    // 정적 썸네일 URL (첫 프레임을 webp로)
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
