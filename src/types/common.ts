/** Every real backend response is wrapped in this envelope — services must unwrap `.data`. */
export interface ApiResponse<T> {
  success: boolean;
  message?: string | null;
  data: T;
  errors?: string[] | null;
}

/** Normalized shape http.client produces for every rejected request (mirrors web's axiosClient). */
export interface ApiError {
  status: number;
  message: string;
  errors?: string[];
}
