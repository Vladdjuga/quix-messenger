import { z } from 'zod';
import { proxy } from '@/lib/proxy';

const attachmentIdSchema = z.string().uuid();

export async function GET(
  req: Request,
  { params }: { params: Promise<{ attachmentId: string }> }
) {
  const { attachmentId } = await params;
  const parsed = attachmentIdSchema.safeParse(attachmentId);
  if (!parsed.success) {
    return Response.json({ message: 'Invalid attachmentId format' }, { status: 400 });
  }

  // Proxy the download request - the backend will return the file stream
  // with appropriate headers (Content-Type, Content-Disposition, etc.)
  // The proxy function automatically streams the response body
  return proxy(req, process.env.NEXT_PUBLIC_USER_SERVICE_URL!, `/Attachment/download/${parsed.data}`, {
    method: 'GET',
  });
}
