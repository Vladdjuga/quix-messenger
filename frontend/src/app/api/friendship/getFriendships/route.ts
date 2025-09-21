import { z } from 'zod';
import { proxy } from '@/lib/proxy';

export async function GET(req: Request) {
        const qSchema = z.object({
            pageSize: z.coerce.number().int().positive().max(100).default(20),
            lastCreatedAt: z.string().datetime().optional(),
        });
        const url = new URL(req.url);
        const parsed = qSchema.safeParse(Object.fromEntries(url.searchParams.entries()));
        if (!parsed.success) {
            return Response.json({ message: 'Invalid query', details: parsed.error.flatten() }, { status: 400 });
        }
        const { pageSize, lastCreatedAt } = parsed.data;
        return proxy(req, process.env.NEXT_PUBLIC_USER_SERVICE_URL!, '/Friendship/getFriendships', {
            query: { pageSize, lastCreatedAt },
        });
}
