import { proxy } from '@/lib/proxy';
import { z } from 'zod';

const paramsSchema = z.object({ messageId: z.string().uuid() });

export async function DELETE(req: Request, { params }: { params: Promise<{ messageId: string }> }) {
  const parsed = paramsSchema.safeParse(params);
  if (!parsed.success) {
    return Response.json({ message: 'Invalid message id', details: parsed.error.flatten() }, { status: 400 });
  }
  const { messageId } = parsed.data;
  return proxy(req, process.env.NEXT_PUBLIC_USER_SERVICE_URL!, `/Messages/${messageId}`, { method: 'DELETE' });
}
