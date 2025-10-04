import { proxy } from '@/lib/proxy';

// POST /api/chats/addUserToChat
export async function POST(req: Request) {
  const body = await req.json();
  // Proxy to user-service ChatController/addUserToChat
  return proxy(req, process.env.NEXT_PUBLIC_USER_SERVICE_URL!, '/Chat/addUserToChat', {
    method: 'POST',
    body,
  });
}
