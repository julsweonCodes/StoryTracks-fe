// Local
export const BASE_URL = "http://localhost:8080/api";

// Production
//export const BASE_URL = "/api";

export interface DefaultResponse<T> {
  success: boolean;
  code: string;
  message: string;
  data: T;
}
