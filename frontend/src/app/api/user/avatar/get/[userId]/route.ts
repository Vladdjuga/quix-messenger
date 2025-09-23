export const runtime = 'nodejs';

export async function GET(req: Request, context: { params: Promise<{ userId: string }> }) {
  const { userId } = await context.params;
  const USER_SERVICE_URL = process.env.NEXT_PUBLIC_USER_SERVICE_URL;
  if (!USER_SERVICE_URL) {
    return new Response(JSON.stringify({ message: 'Service URL is not configured' }), { status: 500 });
  }

  const headers = new Headers();
  const auth = req.headers.get('authorization');
  if (auth) headers.set('authorization', auth);

  const res = await fetch(`${USER_SERVICE_URL}/User/getAvatar/${encodeURIComponent(userId)}`, {
    method: 'GET',
    headers,
  });

  if (!res.ok) {
    return new Response(null, { status: res.status });
  }

  const contentType = res.headers.get('content-type') ?? 'application/octet-stream';
  return new Response(res.body, { status: 200, headers: { 'content-type': contentType } });
}
