import { proxy } from '@/lib/proxy';
import { z } from 'zod';

const paramsSchema = z.object({ messageId: z.string().uuid() });
type ParamsType = z.infer<typeof paramsSchema>;

export async function PATCH(req: Request, { params }: { params: Promise<ParamsType> }) {
  const resolved = await params;
  const parsed = paramsSchema.safeParse(resolved);
  if (!parsed.success) {
    return Response.json({ message: 'Invalid message id', details: parsed.error.flatten() }, { status: 400 });
  }
  const { messageId } = parsed.data;

  return proxy(req, process.env.NEXT_PUBLIC_USER_SERVICE_URL!, `/Messages/${messageId}`, { method: 'PATCH' });
}

export async function DELETE(req: Request, { params }: { params: Promise<ParamsType> }) {
  const resolved = await params;
  const parsed = paramsSchema.safeParse(resolved);
  if (!parsed.success) {
    return Response.json({ message: 'Invalid message id', details: parsed.error.flatten() }, { status: 400 });
  }
  const { messageId } = parsed.data;
  return proxy(req, process.env.NEXT_PUBLIC_USER_SERVICE_URL!, `/Messages/${messageId}`, { method: 'DELETE' });
}
