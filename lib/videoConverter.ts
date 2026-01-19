'use client';

import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

let ffmpeg: FFmpeg | null = null;
let isLoaded = false;

// FFmpeg 인스턴스 초기화 (싱글톤 패턴)
async function getFFmpeg(): Promise<FFmpeg> {
  if (ffmpeg && isLoaded) {
    return ffmpeg;
  }

  ffmpeg = new FFmpeg();

  const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm';

  await ffmpeg.load({
    coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
    wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
  });

  isLoaded = true;
  return ffmpeg;
}

export interface ConversionProgress {
  progress: number; // 0-100
  message: string;
}

export interface ConversionResult {
  webpBlob: Blob;
  webpUrl: string;
  originalSize: number;
  convertedSize: number;
}

/**
 * MP4 동영상을 Animated WebP로 변환
 * 클라이언트 사이드에서 실행됨 (서버 비용 0원)
 *
 * @param file - 변환할 MP4 파일
 * @param onProgress - 진행률 콜백 함수
 * @param options - 변환 옵션
 */
export async function convertVideoToWebP(
  file: File,
  onProgress?: (progress: ConversionProgress) => void,
  options: {
    fps?: number;      // 프레임 레이트 (기본: 12)
    width?: number;    // 너비 (기본: 640px, 높이는 자동)
    quality?: number;  // 퀄리티 0-100 (기본: 50)
  } = {}
): Promise<ConversionResult> {
  const { fps = 12, width = 640, quality = 50 } = options;

  onProgress?.({ progress: 0, message: 'FFmpeg 로딩 중...' });

  const ffmpegInstance = await getFFmpeg();

  onProgress?.({ progress: 10, message: '파일 준비 중...' });

  // 1. 파일을 FFmpeg 가상 파일시스템에 작성
  const inputFileName = 'input.mp4';
  const outputFileName = 'output.webp';

  await ffmpegInstance.writeFile(inputFileName, await fetchFile(file));

  onProgress?.({ progress: 20, message: '동영상 변환 중...' });

  // 진행률 추적
  ffmpegInstance.on('progress', ({ progress }) => {
    const percent = Math.round(20 + progress * 70); // 20-90%
    onProgress?.({ progress: percent, message: '동영상 변환 중...' });
  });

  // 2. 변환 명령어 실행
  // -vf "fps=12,scale=640:-1:flags=lanczos" -> 12프레임, 가로 640px, 세로 자동조절
  // -q:v 50 -> 퀄리티 50%
  // -loop 0 -> 무한 반복
  // -an -> 오디오 제거 (미리보기용은 소리 불필요)
  await ffmpegInstance.exec([
    '-i', inputFileName,
    '-vf', `fps=${fps},scale=${width}:-1:flags=lanczos`,
    '-vcodec', 'libwebp',
    '-lossless', '0',
    '-compression_level', '6',
    '-q:v', quality.toString(),
    '-loop', '0',
    '-preset', 'default',
    '-an',
    outputFileName
  ]);

  onProgress?.({ progress: 90, message: '파일 생성 중...' });

  // 3. 결과물 읽기
  const data = await ffmpegInstance.readFile(outputFileName);
  // Uint8Array를 새로운 Uint8Array로 복사하여 Blob 생성 (SharedArrayBuffer 호환)
  const uint8Array = new Uint8Array(data as Uint8Array);
  const webpBlob = new Blob([uint8Array], { type: 'image/webp' });
  const webpUrl = URL.createObjectURL(webpBlob);

  // 4. 임시 파일 정리
  await ffmpegInstance.deleteFile(inputFileName);
  await ffmpegInstance.deleteFile(outputFileName);

  onProgress?.({ progress: 100, message: '변환 완료!' });

  return {
    webpBlob,
    webpUrl,
    originalSize: file.size,
    convertedSize: webpBlob.size,
  };
}

/**
 * 파일 크기를 읽기 쉬운 포맷으로 변환
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Blob을 File 객체로 변환 (업로드용)
 */
export function blobToFile(blob: Blob, fileName: string): File {
  return new File([blob], fileName, { type: blob.type });
}
