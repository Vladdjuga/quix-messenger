import { z } from 'zod';
import { proxy } from '@/lib/proxy';

const qSchema = z.object({
  chatId: z.string().min(1),
  count: z.coerce.number().int().positive().default(50),
});

export async function GET(req: Request) {
  const url = new URL(req.url);
  const parsed = qSchema.safeParse(Object.fromEntries(url.searchParams.entries()));
  if (!parsed.success) {
    return Response.json({ message: 'Invalid query', details: parsed.error.flatten() }, { status: 400 });
  }
  const { chatId, count } = parsed.data;
  return proxy(req, process.env.NEXT_PUBLIC_USER_SERVICE_URL!, '/Messages/last', {
    method: 'GET',
    query: { chatId, count },
  });
}
