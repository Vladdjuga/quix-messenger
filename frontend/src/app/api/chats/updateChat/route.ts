import { proxy } from '@/lib/proxy';

// PATCH /api/chats/updateChat
export async function PATCH(req: Request) {
  const body = await req.json();
  // Proxy to user-service ChatController/updateChat
  return proxy(req, process.env.NEXT_PUBLIC_USER_SERVICE_URL!, '/Chat/updateChat', {
    method: 'PATCH',
    body,
  });
}
