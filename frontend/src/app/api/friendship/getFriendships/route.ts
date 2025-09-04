import { BackendApiClient } from '@/lib/backend-api';

export async function GET(req: Request) {
    const searchParams = BackendApiClient.extractQueryParams(req);
    
    const queryParams: Record<string, string | number | undefined> = {
        pageSize: searchParams.get('pageSize') || undefined,
        lastCreatedAt: searchParams.get('lastCreatedAt') || undefined
    };

    return BackendApiClient.request(req, '/Friendship/getFriendships', { queryParams });
}
