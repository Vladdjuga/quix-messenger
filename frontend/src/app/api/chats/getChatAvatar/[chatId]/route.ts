import { proxy } from '@/lib/proxy';

// GET /api/chats/getChatAvatar/:chatId
export async function GET(req: Request, { params }: { params: Promise<{ chatId: string }> }) {
  const { chatId } = await params;
  // Proxy to user-service ChatController/getChatAvatar
  return proxy(
    req,
    process.env.NEXT_PUBLIC_USER_SERVICE_URL!,
    `/Chat/getChatAvatar/${chatId}`,
    { method: 'GET' }
  );
}
