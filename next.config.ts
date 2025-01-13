/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  output: 'export', // 정적 사이트로 변환
  images: {
    unoptimized: true, // 이미지 최적화 비활성화
  },
};

export default nextConfig;