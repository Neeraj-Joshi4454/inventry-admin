// Mirrors the backend's single response envelope exactly
// (backend/src/utils/apiResponse.ts + error.middleware.ts) — every endpoint
// returns one of these two shapes, success or error, never anything else.

export interface ApiSuccess<T> {
  success: true;
  message: string;
  data: T;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiPaginated<T> {
  success: true;
  message: string;
  data: T[];
  meta: PaginationMeta;
}

export interface ApiFieldError {
  field?: string;
  message: string;
}

export interface ApiErrorBody {
  success: false;
  message: string;
  errors: ApiFieldError[];
}
