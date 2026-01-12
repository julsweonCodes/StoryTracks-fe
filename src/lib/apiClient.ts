// apiClient.ts
// Centralized Axios instance for idempotent API calls.
// This instance includes JWT token handling but does NOT auto-generate idempotency keys.
// Idempotency keys are managed per-operation in api.ts using IdempotencyKeyManager.

import axios from "axios";

const apiClient = axios.create({
  timeout: 30000, // 30s timeout for longer operations like file uploads
});

// Request interceptor: Attach JWT token from localStorage
apiClient.interceptors.request.use(
  (config) => {
    // Only run in browser
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    // Handle Content-Type for FormData vs JSON
    if (config.data instanceof FormData) {
      // Let browser set Content-Type with boundary for multipart
      delete config.headers["Content-Type"];
    } else if (config.data && typeof config.data === "object") {
      config.headers["Content-Type"] = "application/json";
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Handle 401 unauthorized
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default apiClient;
