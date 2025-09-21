import { RealtimeApiClient } from '@/lib/realtime-api';

export async function GET(req: Request, context: { params: Promise<{ userId: string }> }) {
  const { userId } = await context.params;
  if (!userId) {
    return new Response(JSON.stringify({ message: 'userId is required' }), { status: 400 });
  }
  // Realtime service exposes route at root: /online/:userId
  return RealtimeApiClient.request(req, `/online/${encodeURIComponent(userId)}`, { method: 'GET' });
}
