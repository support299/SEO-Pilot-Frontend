/** Matches common/exceptions.py's error envelope on the backend exactly. */
export type ApiErrorBody = {
  error: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
};

/** A normalized shape every caller can rely on, regardless of what Axios/DRF actually returned. */
export class ApiError extends Error {
  code: string;
  status: number;
  details?: Record<string, string[]>;

  constructor(status: number, body: Partial<ApiErrorBody["error"]> | undefined) {
    super(body?.message || "Something went wrong.");
    this.name = "ApiError";
    this.status = status;
    this.code = body?.code || "error";
    this.details = body?.details;
  }
}
