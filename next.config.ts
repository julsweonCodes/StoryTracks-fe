/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  output: 'export', // 정적 사이트로 변환
  images: {
    unoptimized: true, // 이미지 최적화 비활성화
  },
  env: {
      BASE_URL: process.env.REACT_APP_BASE_URL || "http://localhost:8080/api",
    },
};

export default nextConfig;