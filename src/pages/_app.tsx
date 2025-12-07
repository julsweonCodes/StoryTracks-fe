import Layout from "@/components/layout";
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import {
  QueryClient,
  QueryClientConfig,
  QueryClientProvider,
} from "react-query";
import { AuthProvider } from "@/providers/auth-provider";
import { useEffect } from "react";
import { setupAxiosInterceptor } from "@/lib/axios-config";

if (
  process.env.NODE_ENV === "development" &&
  process.env.NEXT_PUBLIC_USE_MOCKS === "true"
) {
  require("../mocks");
}

const queryClientConfig: QueryClientConfig = {
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
};

const queryClient = new QueryClient(queryClientConfig);

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    // Setup axios interceptor on app mount
    setupAxiosInterceptor();
  }, []);

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </QueryClientProvider>
    </AuthProvider>
  );
}
