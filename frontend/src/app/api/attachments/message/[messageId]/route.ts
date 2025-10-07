import { z } from 'zod';
import { proxy } from '@/lib/proxy';

const messageIdSchema = z.string().uuid();

export async function GET(
  req: Request,
  { params }: { params: Promise<{ messageId: string }> }
) {
  const { messageId } = await params;
  const parsed = messageIdSchema.safeParse(messageId);
  if (!parsed.success) {
    return Response.json({ message: 'Invalid messageId format' }, { status: 400 });
  }

  return proxy(req, process.env.NEXT_PUBLIC_USER_SERVICE_URL!, `/Attachment/message/${parsed.data}`, {
    method: 'GET',
  });
}
