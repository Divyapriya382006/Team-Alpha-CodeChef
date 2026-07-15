// Normalized shape every failed request throws, whether it came from axios or the mock backend,
// so callers never need to know which one answered.
export class ApiError extends Error {
  status: number;
  errors?: Record<string, string>;

  constructor(message: string, status: number, errors?: Record<string, string>) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
  }
}
