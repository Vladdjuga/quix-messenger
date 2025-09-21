import { z } from 'zod';
import { proxy } from '@/lib/proxy';

const qSchema = z.object({
  chatId: z.string().min(1),
  lastCreatedAt: z.string().datetime().optional(),
  pageSize: z.coerce.number().int().positive().max(200).default(50),
});

export async function GET(req: Request) {
  const url = new URL(req.url);
  const parsed = qSchema.safeParse(Object.fromEntries(url.searchParams.entries()));
  if (!parsed.success) {
    return Response.json({ message: 'Invalid query', details: parsed.error.flatten() }, { status: 400 });
  }
  const { chatId, lastCreatedAt, pageSize } = parsed.data;
  return proxy(req, process.env.NEXT_PUBLIC_USER_SERVICE_URL!, '/Messages/paginated', {
    method: 'GET',
    query: { chatId, lastCreatedAt, pageSize },
  });
}
