/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  // output: 'export', // 정적 사이트로 변환 - API Routes와 호환되지 않음
  images: {
    unoptimized: true, // 이미지 최적화 비활성화
  },
  env: {
    BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
  },
};

export default nextConfig;
