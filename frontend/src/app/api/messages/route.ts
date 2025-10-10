import { proxy } from '@/lib/proxy';

export async function POST(req: Request) {
  // Accept FormData with text, chatId, and optional attachments
  // Forward to backend which will create message + upload attachments atomically
  return proxy(
    req,
    process.env.NEXT_PUBLIC_USER_SERVICE_URL!,
    '/Messages',
    {
      method: 'POST',
    }
  );
}
