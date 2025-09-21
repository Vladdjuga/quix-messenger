import { z } from 'zod';
import { proxy } from '@/lib/proxy';

const qSchema = z.object({
    query: z.string().trim().default(''),
    pageSize: z.coerce.number().int().positive().max(100).optional(),
    lastCreatedAt: z.string().datetime().optional(),
});

export async function GET(req: Request) {
    const url = new URL(req.url);
    const parsed = qSchema.safeParse(Object.fromEntries(url.searchParams.entries()));
    if (!parsed.success) {
        return Response.json({ message: 'Invalid query', details: parsed.error.flatten() }, { status: 400 });
    }
    const { query, pageSize, lastCreatedAt } = parsed.data;
    return proxy(req, process.env.NEXT_PUBLIC_USER_SERVICE_URL!, '/Friendship/searchFriendships', {
        query: { query, pageSize, lastCreatedAt },
    });
}
