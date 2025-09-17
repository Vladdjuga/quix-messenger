import { BackendApiClient } from '@/lib/backend-api';

export async function GET(req: Request) {
  // Proxy to user-service ChatController.getChats
  return BackendApiClient.request(req, '/Chat/getChats', { method: 'GET' });
}
