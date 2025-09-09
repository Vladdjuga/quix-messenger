import {StandardApiUseCase} from "@/lib/usecases";
import {RequestUtils} from "@/lib/request-utils";

export async function GET(req: Request) {
    const searchParams = RequestUtils.extractQueryParams(req);
    const paginationValidation = RequestUtils.validatePaginationParams(searchParams);
    
    if (!paginationValidation.isValid) {
        return RequestUtils.validationError(paginationValidation.error!);
    }

    const queryParams: Record<string, string | number> = {
        query: paginationValidation.query!,
        pageSize: paginationValidation.pageSize
    };

    if (paginationValidation.lastCreatedAt) {
        queryParams.lastCreatedAt = paginationValidation.lastCreatedAt;
    }

    return StandardApiUseCase.execute(req, '/Friendship/getFriendRequests', { queryParams });
}
