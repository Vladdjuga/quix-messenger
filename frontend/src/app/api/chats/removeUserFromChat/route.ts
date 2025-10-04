import { proxy } from '@/lib/proxy';

// POST /api/chats/removeUserFromChat
export async function POST(req: Request) {
  const body = await req.json();
  // Proxy to user-service ChatController/removeUserFromChat
  return proxy(req, process.env.NEXT_PUBLIC_USER_SERVICE_URL!, '/Chat/removeUserFromChat', {
    method: 'POST',
    body,
  });
}
