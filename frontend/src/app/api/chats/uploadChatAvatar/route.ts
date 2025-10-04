import { proxy } from '@/lib/proxy';

// POST /api/chats/uploadChatAvatar
export async function POST(req: Request) {
  const formData = await req.formData();
  
  // Proxy to user-service ChatController/uploadChatAvatar
  return proxy(req, process.env.NEXT_PUBLIC_USER_SERVICE_URL!, '/Chat/uploadChatAvatar', {
    method: 'POST',
    body: formData,
  });
}
