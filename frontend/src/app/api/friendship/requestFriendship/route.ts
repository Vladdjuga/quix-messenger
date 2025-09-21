import { z } from 'zod';
import { proxy } from '@/lib/proxy';

export async function POST(req: Request) {
    const schema = z.object({ username: z.string().min(1) });
    let body: unknown;
    try { body = await req.json(); } catch { return Response.json({ message: 'Invalid JSON body' }, { status: 400 }); }
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return Response.json({ message: 'Invalid body', details: parsed.error.flatten() }, { status: 400 });
    }
    const { username } = parsed.data;
    return proxy(req, process.env.NEXT_PUBLIC_USER_SERVICE_URL!, `/Friendship/requestFriendship/${encodeURIComponent(username)}`, { method: 'POST' });
}
