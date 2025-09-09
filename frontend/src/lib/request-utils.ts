import { NextResponse } from 'next/server';

export class RequestUtils {
  static async extractBody<T = unknown>(req: Request): Promise<{ success: true; data: T } | { success: false; response: NextResponse }> {
    try {
      const data = await req.json();
      return { success: true, data };
    } catch {
      return { success: false, response: NextResponse.json({ message: 'Invalid JSON body' }, { status: 400 }) };
    }
  }

  static extractQueryParams(req: Request): URLSearchParams {
    return new URL(req.url).searchParams;
  }

  static validateRequiredFields(body: unknown, fields: string[]): { isValid: boolean; missingFields: string[] } {
    const missing = fields.filter(field => {
      const value = (body as Record<string, unknown>)?.[field];
      return !value || (typeof value === 'string' && !value.trim());
    });
    return { isValid: missing.length === 0, missingFields: missing };
  }

  static validatePaginationParams(params: URLSearchParams) {
    const query = params.get('query') || '';
    const pageSize = parseInt(params.get('pageSize') || '10');
    const lastCreatedAt = params.get('lastCreatedAt');

    if (isNaN(pageSize) || pageSize <= 0) {
      return { pageSize: 10, isValid: false, error: 'A valid pageSize (number > 0) is required' };
    }
    if (lastCreatedAt && isNaN(Date.parse(lastCreatedAt))) {
      return { pageSize, isValid: false, error: 'Invalid lastCreatedAt date format' };
    }
    return { pageSize, lastCreatedAt: lastCreatedAt || undefined, query, isValid: true };
  }

  static validationError(message: string, status = 400): NextResponse {
    return NextResponse.json({ message }, { status });
  }
}
