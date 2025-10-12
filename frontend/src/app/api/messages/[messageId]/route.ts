import { proxy } from '@/lib/proxy';
import { z } from 'zod';

const paramsSchema = z.object({ messageId: z.string().uuid() });
type ParamsType = z.infer<typeof paramsSchema>;

const bodySchema = z.object({ text: z.string().uuid() });

export async function PATCH(req: Request, { params }: { params: Promise<ParamsType> }) {
  const resolved = await params;
  const parsed = paramsSchema.safeParse(resolved);
  if (!parsed.success) {
    return Response.json({ message: 'Invalid message id', details: parsed.error.flatten() }, { status: 400 });
  }
  const { messageId } = parsed.data;

  // Check body for persistence
  const parsedBody = bodySchema.safeParse(resolved);
  if(!parsedBody.success) {
    return Response.json("Body is not correct.",{
      status: 400,
    });
  }

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
