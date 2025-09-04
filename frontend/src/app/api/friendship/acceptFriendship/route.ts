import { BackendApiClient } from '@/lib/backend-api';

export async function POST(req: Request) {
    const bodyResult = await BackendApiClient.extractBody(req);
    if (!bodyResult.success) return bodyResult.response;
    
    const validation = BackendApiClient.validateRequiredFields(bodyResult.data, ['friendshipId']);
    if (!validation.isValid) {
        return BackendApiClient.validationError(`Missing required fields: ${validation.missingFields.join(', ')}`);
    }

    const { friendshipId } = bodyResult.data as { friendshipId: string };
    
    return BackendApiClient.request(
        req,
        `/Friendship/acceptFriendship/${encodeURIComponent(friendshipId)}`,
        { method: 'POST' }
    );
}
