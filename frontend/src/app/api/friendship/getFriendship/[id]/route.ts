import { BackendApiClient } from '@/lib/backend-api';

export async function GET(
    req: Request, 
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const resolvedParams = await params;
        const { id } = resolvedParams;
        
        if (!id) {
            return BackendApiClient.validationError('Friendship ID is required');
        }

        return BackendApiClient.request(
            req,
            `/Friendship/getFriendship/${encodeURIComponent(id)}`
        );
    } catch {
        return BackendApiClient.validationError('Invalid request parameters');
    }
}
