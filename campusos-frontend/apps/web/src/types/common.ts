// FINAL_API_CONTRACT.md Part 1: every response follows one of these two envelopes.
export interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string>;
}

// FINAL_API_CONTRACT.md Part 1: Pagination Format.
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// Only returned by endpoints whose Query Parameters section lists page/limit.
// Do not assume this shape on endpoints that return a plain items[] (e.g. GET /clubs/:id/departments).
export interface PaginatedData<T> {
  items: T[];
  pagination: Pagination;
}

export interface ListQuery {
  page?: number;
  limit?: number;
}
