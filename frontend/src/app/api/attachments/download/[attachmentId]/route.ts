import { proxy } from '@/lib/proxy';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ attachmentId: string }> }
) {
  const { attachmentId } = await params;

  // Proxy the download request - the backend will return the file stream
  // with appropriate headers (Content-Type, Content-Disposition, etc.)
  // The proxy function automatically streams the response body
  return proxy(req, process.env.NEXT_PUBLIC_USER_SERVICE_URL!, `/Attachment/download/${attachmentId}`, {
    method: 'GET',
  });
}
