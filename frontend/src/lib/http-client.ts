import { NextResponse } from 'next/server';
import { safeParseJSON } from '@/lib/utils';

const USER_SERVICE_URL = process.env.NEXT_PUBLIC_USER_SERVICE_URL;
const MESSAGE_SERVICE_URL = process.env.NEXT_PUBLIC_MESSAGE_SERVICE_URL;

export interface HttpRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
  queryParams?: Record<string, string | number | undefined | null>;
  service?: 'user' | 'message';
  headers?: Record<string, string>;
  credentials?: RequestCredentials;
}

export class HttpClient {
  static async makeRequest(endpoint: string, options: HttpRequestOptions = {}): Promise<Response> {
    const { 
      method = 'GET', 
      body, 
      queryParams, 
      service = 'user',
      headers = {},
      credentials
    } = options;

    const baseUrl = service === 'user' ? USER_SERVICE_URL : MESSAGE_SERVICE_URL;
    let url = `${baseUrl}${endpoint}`;
    
    if (queryParams) {
      const params = new URLSearchParams();
      Object.entries(queryParams).forEach(([key, value]) => {
        if (value != null) params.append(key, value.toString());
      });
      if (params.toString()) url += `?${params.toString()}`;
    }

    const defaultHeaders = {
      'Content-Type': 'application/json',
      ...headers,
    };

    return fetch(url, {
      method,
      headers: defaultHeaders,
      body: body && (method === 'POST' || method === 'PUT') ? JSON.stringify(body) : undefined,
      credentials,
    });
  }

  static async handleStandardResponse(response: Response): Promise<NextResponse> {
    if (response.status === 204 || response.headers.get('content-length') === '0') {
      return new NextResponse(null, { status: response.status });
    }

    const data = await safeParseJSON(response);
    return NextResponse.json(data, { status: response.status });
  }

  static createErrorResponse(message: string, status = 500): NextResponse {
    return NextResponse.json({ message }, { status });
  }
}
