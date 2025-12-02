import axios from "axios";

/**
 * Configure axios with global JWT interceptor
 * Automatically attaches JWT token from localStorage to all API requests
 */
export const setupAxiosInterceptor = () => {
  // Request interceptor: Attach JWT token to all requests
  axios.interceptors.request.use(
    (config) => {
      // Get token from localStorage
      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;

      console.log("[AXIOS Request] URL:", config.url);
      console.log("[AXIOS Request] Method:", config.method);
      console.log("[AXIOS Request] Token available:", !!token);

      if (token) {
        console.log("[AXIOS Request] Attaching JWT token");
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        console.log("[AXIOS Request] No token found in localStorage");
      }

      // Set Content-Type ONLY for non-FormData requests
      // For FormData, browser will automatically set multipart/form-data with boundary
      if (config.data instanceof FormData) {
        // CRITICAL: Delete Content-Type header to let browser set it automatically
        // Browser will add: Content-Type: multipart/form-data; boundary=...
        delete config.headers["Content-Type"];
        console.log(
          "[AXIOS Request] FormData detected - Content-Type deleted, browser will set multipart/form-data",
        );
      } else if (config.data && typeof config.data === "object") {
        // Set JSON Content-Type for object data
        config.headers["Content-Type"] = "application/json";
      }

      console.log(
        "[AXIOS Request] Headers:",
        Object.keys(config.headers).reduce((acc: any, key) => {
          acc[key] = config.headers[key];
          return acc;
        }, {}),
      );

      if (config.data) {
        if (config.data instanceof FormData) {
          // Don't try to stringify FormData - it will show as {}
          console.log(
            "[AXIOS Request] Data: FormData with",
            config.data.has("files") ? "files attached" : "unknown entries",
          );
        } else {
          try {
            const dataStr = JSON.stringify(config.data);
            console.log("[AXIOS Request] Data:", dataStr.substring(0, 200));
          } catch (err) {
            console.log("[AXIOS Request] Data: [Unable to stringify]");
          }
        }
      } else {
        console.log("[AXIOS Request] Data: No body");
      }

      return config;
    },
    (error) => {
      console.error("[AXIOS] Request interceptor error:", error);
      return Promise.reject(error);
    },
  );

  // Response interceptor: Handle token expiration
  axios.interceptors.response.use(
    (response) => {
      return response;
    },
    (error) => {
      // If 401 Unauthorized, token might be expired
      if (error.response?.status === 401) {
        console.log("[AXIOS] Received 401, clearing token");
        if (typeof window !== "undefined") {
          localStorage.removeItem("token");
        }
        // Optionally redirect to login page
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
      }
      return Promise.reject(error);
    },
  );
};

export default axios;
