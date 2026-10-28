/** The backend's standard error envelope — common/exceptions.py produces this automatically for any *raised* exception (ValidationError, NotFound, PermissionDenied, ...). */
export type ApiErrorBody = {
  error?: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
  /**
   * Several views (search_console, analytics, wordpress) return business-logic
   * errors as a plain `Response({"detail": "..."})` instead of raising an
   * exception — that bypasses the exception handler, so it never gets wrapped
   * in `error`. ApiError falls back to this field so those messages still
   * reach the UI instead of silently becoming "Something went wrong."
   */
  detail?: string;
};

/** A normalized shape every caller can rely on, regardless of which of the two shapes above the backend actually returned. */
export class ApiError extends Error {
  code: string;
  status: number;
  details?: Record<string, string[]>;

  constructor(status: number, body: ApiErrorBody | undefined) {
    super(body?.error?.message || body?.detail || "Something went wrong.");
    this.name = "ApiError";
    this.status = status;
    this.code = body?.error?.code || "error";
    this.details = body?.error?.details;
  }
}
