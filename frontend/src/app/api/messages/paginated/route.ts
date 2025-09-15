import { BackendApiClient } from '@/lib/backend-api';

export async function GET(req: Request) {
  const params = BackendApiClient.extractQueryParams(req);
  const chatId = params.get('chatId');
  const lastCreatedAt = params.get('lastCreatedAt');
  const pageSize = params.get('pageSize') ?? '50';

  if (!chatId) return BackendApiClient.validationError('chatId is required');
  if (lastCreatedAt && isNaN(Date.parse(lastCreatedAt))) {
    return BackendApiClient.validationError('Invalid lastCreatedAt date format');
  }

  return BackendApiClient.request(req, '/Messages/paginated', {
    method: 'GET',
    queryParams: { chatId, lastCreatedAt: lastCreatedAt ?? undefined, pageSize },
    service: 'user',
  });
}
