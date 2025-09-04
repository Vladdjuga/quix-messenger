import { BackendApiClient } from '@/lib/backend-api';

export async function POST(req: Request) {
    const bodyResult = await BackendApiClient.extractBody(req);
    if (!bodyResult.success) return bodyResult.response;
    
    const validation = BackendApiClient.validateRequiredFields(bodyResult.data, ['username']);
    if (!validation.isValid) {
        return BackendApiClient.validationError(`Missing required fields: ${validation.missingFields.join(', ')}`);
    }

    const { username } = bodyResult.data as { username: string };
    
    return BackendApiClient.request(
        req,
        `/Friendship/requestFriendship/${encodeURIComponent(username)}`,
        { method: 'POST' }
    );
}
