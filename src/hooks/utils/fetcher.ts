//export const BASE_URL = "http://localhost:8080";
// export const BASE_URL = "http://35.93.65.240:8080";
export const BASE_URL = "/api";

export interface DefaultResponse<T> {
  success: boolean;
  code: string;
  message: string;
  data: T;
}
