import { NextResponse } from 'next/server';
import { StandardApiUseCase } from './usecases/standard-api';
import { RequestUtils } from './request-utils';

export interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
  queryParams?: Record<string, string | number | undefined | null>;
  service?: 'user' | 'message';
}

/**
 * @deprecated Use specific use cases instead (StandardApiUseCase, AuthUseCases, etc.)
 * This class is kept for backward compatibility
 */
export class BackendApiClient {
  static async request(req: Request, endpoint: string, options: ApiOptions = {}): Promise<NextResponse> {
    return StandardApiUseCase.execute(req, endpoint, options);
  }

  static async extractBody<T = unknown>(req: Request): Promise<{ success: true; data: T } | { success: false; response: NextResponse }> {
    return RequestUtils.extractBody<T>(req);
  }

  static extractQueryParams(req: Request): URLSearchParams {
    return RequestUtils.extractQueryParams(req);
  }

  static validateRequiredFields(body: unknown, fields: string[]): { isValid: boolean; missingFields: string[] } {
    return RequestUtils.validateRequiredFields(body, fields);
  }

  static validationError(message: string, status = 400): NextResponse {
    return RequestUtils.validationError(message, status);
  }

  static validatePaginationParams(params: URLSearchParams) {
    return RequestUtils.validatePaginationParams(params);
  }
}