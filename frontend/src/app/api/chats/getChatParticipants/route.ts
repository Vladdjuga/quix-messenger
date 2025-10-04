import { proxy } from '@/lib/proxy';

// GET /api/chats/getChatParticipants
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const chatId = searchParams.get("chatId");
  
  if (!chatId) {
    return new Response(JSON.stringify({ message: "Chat ID is required" }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Proxy to user-service ChatController/getChatParticipants
  return proxy(req, process.env.NEXT_PUBLIC_USER_SERVICE_URL!, `/Chat/getChatParticipants?chatId=${chatId}`, {
    method: 'GET',
  });
}
