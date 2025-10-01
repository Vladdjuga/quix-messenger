import { proxy } from '@/lib/proxy';

// GET /api/chats
export async function GET(req: Request) {
  // Proxy to user-service ChatController.getChats
  return proxy(req, process.env.NEXT_PUBLIC_USER_SERVICE_URL!, '/Chat/getChats', { method: 'GET' });
}

// POST /api/chats
export async function POST(req: Request) {
  const body = await req.json();
  // Proxy to user-service ChatController/addChat
  return proxy(req, process.env.NEXT_PUBLIC_USER_SERVICE_URL!, '/Chat/addChat', {
    method: 'POST',
    body,
  });
}
