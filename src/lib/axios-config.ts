import axios from "axios";

/**
 * Configure axios with global JWT interceptor
 * Automatically attaches JWT token from localStorage to all API requests
 */
export const setupAxiosInterceptor = () => {
  // Set default headers
  axios.defaults.headers.common["Content-Type"] = "application/json";

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

      // Ensure Content-Type is set for JSON requests
      if (
        config.data &&
        typeof config.data === "object" &&
        !(config.data instanceof FormData)
      ) {
        config.headers["Content-Type"] = "application/json";
      }

      console.log(
        "[AXIOS Request] Headers:",
        Object.keys(config.headers).reduce((acc: any, key) => {
          acc[key] = config.headers[key];
          return acc;
        }, {}),
      );
      console.log(
        "[AXIOS Request] Data:",
        JSON.stringify(config.data).substring(0, 200),
      );

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
