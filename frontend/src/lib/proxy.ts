export type ProxyOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
  query?: Record<string, string | number | undefined | null>;
};

export async function proxy(
  req: Request,
  baseUrl: string,
  path: string,
  opts: ProxyOptions = {}
) {
  const { method = 'GET', body, query } = opts;

  if (!baseUrl) {
    return Response.json({ message: 'Service URL is not configured' }, { status: 500 });
  }

  let url = `${baseUrl}${path}`;
  if (query) {
    const qs = new URLSearchParams();
    Object.entries(query).forEach(([k, v]) => {
      if (v != null) qs.append(k, String(v));
    });
    const q = qs.toString();
    if (q) url += `?${q}`;
  }

  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  const auth = req.headers.get('authorization');
  if (auth) headers['Authorization'] = auth;

  try {
    const res = await fetch(url, {
      method,
      headers,
      body: body && (method === 'POST' || method === 'PUT') ? JSON.stringify(body) : undefined,
    });

    // Stream upstream response as-is
    return new Response(res.body, {
      status: res.status,
      headers: { 'content-type': res.headers.get('content-type') ?? 'application/json' },
    });
  } catch (error) {
    console.error(`Proxy error ${method} ${url}:`, error);
    return Response.json({ message: 'Server error' }, { status: 500 });
  }
}
