import { BackendApiClient } from '@/lib/backend-api';

export async function GET(req: Request) {
    const searchParams = BackendApiClient.extractQueryParams(req);
    
    const queryParams: Record<string, string | number | undefined> = {
        query: searchParams.get('query') ?? '',
        pageSize: searchParams.get('pageSize') || undefined,
        lastCreatedAt: searchParams.get('lastCreatedAt') || undefined
    };

    return BackendApiClient.request(req, '/Friendship/searchFriendships', { queryParams });
}
