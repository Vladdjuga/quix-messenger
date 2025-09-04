import { BackendApiClient } from '@/lib/backend-api';

export async function GET(req: Request) {
    const searchParams = BackendApiClient.extractQueryParams(req);
    
    const query = searchParams.get('query') || '';
    const pageSize = parseInt(searchParams.get('pageSize') || '20');
    const lastCreatedAt = searchParams.get('lastCreatedAt');

    // Validation
    if (!query.trim()) {
        return BackendApiClient.validationError('Search query is required');
    }
    if (isNaN(pageSize) || pageSize <= 0 || pageSize > 100) {
        return BackendApiClient.validationError('Page size must be between 1 and 100');
    }
    if (lastCreatedAt && isNaN(Date.parse(lastCreatedAt))) {
        return BackendApiClient.validationError('Invalid lastCreatedAt date format');
    }

    const queryParams: Record<string, string | number> = {
        query: query.trim(),
        pageSize: pageSize
    };

    if (lastCreatedAt) {
        queryParams.lastCreatedAt = lastCreatedAt;
    }

    return BackendApiClient.request(req, '/User/search', { queryParams });
}
