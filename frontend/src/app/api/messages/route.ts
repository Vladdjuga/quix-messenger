import { BackendApiClient } from '@/lib/backend-api';

export async function POST(req: Request) {
  const extract = await BackendApiClient.extractBody<{ text?: string; chatId?: string; sentAt?: string }>(req);
  if (!extract.success) return extract.response;
  const body = extract.data;

  const { isValid, missingFields } = BackendApiClient.validateRequiredFields(body, ['text', 'chatId']);
  if (!isValid) {
    return BackendApiClient.validationError(`Missing required fields: ${missingFields.join(', ')}`);
  }

  return BackendApiClient.request(req, '/Messages', {
    method: 'POST',
    body: {
      text: body.text,
      chatId: body.chatId,
      sentAt: body.sentAt ?? new Date().toISOString(),
    },
  });
}
