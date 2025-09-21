import { proxy } from '@/lib/proxy';

export async function GET(req: Request) {
  // Proxy to user-service ChatController.getChats
  return proxy(req, process.env.NEXT_PUBLIC_USER_SERVICE_URL!, '/Chat/getChats', { method: 'GET' });
}
