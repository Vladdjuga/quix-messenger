import { BackendApiClient } from '@/lib/backend-api';

export async function DELETE(req: Request, context: { params: Promise<{ friendshipId: string }> }) {
    const { friendshipId } = await context.params;
    
    if (!friendshipId) {
        return BackendApiClient.validationError('Friendship ID is required');
    }

    return BackendApiClient.request(req, `/Friendship/cancelFriendRequest/${friendshipId}`, { 
        method: 'DELETE' 
    });
}
