import { BackendApiClient } from '@/lib/backend-api';

export async function GET(req: Request) {
  const params = BackendApiClient.extractQueryParams(req);
  const chatId = params.get('chatId');
  const count = params.get('count') ?? '50';
  if (!chatId) return BackendApiClient.validationError('chatId is required');

  return BackendApiClient.request(req, '/Messages/last', {
    method: 'GET',
    queryParams: { chatId, count },
    service: 'user',
  });
}
