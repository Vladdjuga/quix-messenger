import { BackendApiClient } from '@/lib/backend-api';

export async function GET(req: Request) {
    const searchParams = BackendApiClient.extractQueryParams(req);
    const paginationValidation = BackendApiClient.validatePaginationParams(searchParams);
    
    if (!paginationValidation.isValid) {
        return BackendApiClient.validationError(paginationValidation.error!);
    }

    const queryParams: Record<string, string | number> = {
        query: paginationValidation.query!,
        pageSize: paginationValidation.pageSize
    };

    if (paginationValidation.lastCreatedAt) {
        queryParams.lastCreatedAt = paginationValidation.lastCreatedAt;
    }

    return BackendApiClient.request(req, '/Friendship/getSentRequests', { queryParams });
}
