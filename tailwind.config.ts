import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        black: {
          primary: "#161616",
          secondary: "#333333",
          tertiary: "#B0B0B0",
        },
        white: {
          primary: "#ffffff",
        },
        key: {
          primary: "#A099FF",
        },
      },
      typography: {
        DEFAULT: {
          css: {
            color: "#e5e7eb", // 기본 글자색 (다크 모드)
            h1: {
              color: "#f3f4f6",
            },
            h2: {
              color: "#e5e7eb",
            },
            h3: {
              color: "#d1d5db",
            },
            a: {
              color: "#60a5fa", // 링크 색상 (밝은 파란색)
              "&:hover": {
                color: "#3b82f6", // 호버 시 색상
              },
            },
            strong: {
              color: "#f3f4f6",
            },
            blockquote: {
              color: "#9ca3af",
              borderLeftColor: "#4b5563", // 인용문 좌측 라인 색상
            },
          },
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
} satisfies Config;
