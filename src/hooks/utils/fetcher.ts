export interface DefaultResponse<T> {
  success: boolean;
  code: string;
  message: string;
  data: T;
}
