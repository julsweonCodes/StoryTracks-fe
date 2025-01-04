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
    },
  },
  plugins: [],
} satisfies Config;
