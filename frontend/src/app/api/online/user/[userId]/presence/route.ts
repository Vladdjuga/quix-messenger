import { proxy } from '@/lib/proxy';

export async function GET(req: Request, context: { params: Promise<{ userId: string }> }) {
  const { userId } = await context.params;
  if (!userId) {
    return new Response(JSON.stringify({ message: 'userId is required' }), { status: 400 });
  }
  // Realtime service exposes route at: /user/:userId/presence
  return proxy(req, process.env.NEXT_PUBLIC_REALTIME_URL!, `/user/${encodeURIComponent(userId)}/presence`, { method: 'GET' });
}