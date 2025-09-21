import {NextResponse} from 'next/server';
import {safeParseJSON} from '@/lib/utils';

const USER_SERVICE_URL = process.env.NEXT_PUBLIC_USER_SERVICE_URL;

export interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
  queryParams?: Record<string, string | number | undefined | null>;
}

export class BackendApiClient {
  static async request(req: Request, endpoint: string, options: ApiOptions = {}): Promise<NextResponse> {
    const { method = 'GET', body, queryParams } = options;
    
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
      let url = `${USER_SERVICE_URL}${endpoint}`;
      
      if (queryParams) {
        const params = new URLSearchParams();
        Object.entries(queryParams).forEach(([key, value]) => {
          if (value != null) params.append(key, value.toString());
        });
        if (params.toString()) url += `?${params.toString()}`;
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeader,
        },
        body: body && (method === 'POST' || method === 'PUT') ? JSON.stringify(body) : undefined,
      });

      if (response.status === 204 || response.headers.get('content-length') === '0') {
        return new NextResponse(null, { status: response.status });
      }

      const data = await safeParseJSON(response);
      return NextResponse.json(data, { status: response.status });
    } catch (error) {
      console.error(`Error in ${method} ${endpoint}:`, error);
      return NextResponse.json({ message: 'Server error' }, { status: 500 });
    }
  }

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

  static validationError(message: string, status = 400): NextResponse {
    return NextResponse.json({ message }, { status });
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
}