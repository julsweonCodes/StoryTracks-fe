import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* PWA 관련 메타 태그 */}
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="theme-color" content="#161616" />
      </Head>
      <body className="antialiased">
        <Main />
        <NextScript />
        {/* Service Worker 등록 */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                navigator.serviceWorker
                  .register('/service-worker.js')
                  .then((reg) => console.log('Service Worker registered:', reg))
                  .catch((err) => console.error('Service Worker registration failed:', err));
              }
            `,
          }}
        />
      </body>
    </Html>
  );
}
