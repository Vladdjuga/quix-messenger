import {NextResponse} from 'next/server';

const REALTIME_SERVICE_URL = process.env.NEXT_PUBLIC_REALTIME_URL;

export interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
  queryParams?: Record<string, string | number | undefined | null>;
}

export class RealtimeApiClient {
  static async request(req: Request, endpoint: string, options: ApiOptions = {}): Promise<NextResponse> {
    const { method = 'GET', body, queryParams } = options;

    try {
      if (!REALTIME_SERVICE_URL) {
        console.error('Realtime base URL is not set. Please configure NEXT_PUBLIC_SOCKET_URL');
        return NextResponse.json({ message: 'Realtime service URL is not configured' }, { status: 500 });
      }
      let url = `${REALTIME_SERVICE_URL}${endpoint}`;

      if (queryParams) {
        const params = new URLSearchParams();
        Object.entries(queryParams).forEach(([key, value]) => {
          if (value != null) params.append(key, value.toString());
        });
        if (params.toString()) url += `?${params.toString()}`;
      }

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      // Forward Authorization header if present (service may validate it later)
      const authHeader = req.headers.get('authorization');
      if (authHeader) headers['Authorization'] = authHeader;

      const response = await fetch(url, {
        method,
        headers,
        body: body && (method === 'POST' || method === 'PUT') ? JSON.stringify(body) : undefined,
      });

      // Stream the upstream response through without parsing to avoid JSON parse errors
      const contentType = response.headers.get('content-type') || 'application/json';
      return new NextResponse(response.body, {
        status: response.status,
        headers: { 'content-type': contentType },
      });
    } catch (error) {
      console.error(`Error in ${method} ${endpoint}:`, error);
      return NextResponse.json({ message: 'Server error' }, { status: 500 });
    }
  }
}
