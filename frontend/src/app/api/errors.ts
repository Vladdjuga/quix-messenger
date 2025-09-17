export interface ApiErrorShape {
  status: number;
  code?: string;
  message: string;
  details?: unknown;
}

export class ApiError extends Error implements ApiErrorShape {
  status: number;
  code?: string;
  details?: unknown;
  constructor(shape: ApiErrorShape) {
    super(shape.message);
    this.status = shape.status;
    this.code = shape.code;
    this.details = shape.details;
  }
}

export function toApiError(err: unknown): ApiError {
  if (err instanceof ApiError) return err;
  const ax = err as { message?: string; response?: { status?: number; data?: { code?: string; error?: string; message?: string; details?: unknown } | unknown } };
  const status = ax.response?.status ?? 0;
  const data = ax.response?.data as ({ code?: string; error?: string; message?: string; details?: unknown } | unknown) | undefined;
  return new ApiError({
    status,
    code: (data as { code?: string; error?: string } | undefined)?.code ?? (data as { code?: string; error?: string } | undefined)?.error,
    message: (data as { message?: string } | undefined)?.message ?? ax.message ?? "Request failed",
    details: (data as { details?: unknown } | undefined)?.details ?? data,
  });
}
