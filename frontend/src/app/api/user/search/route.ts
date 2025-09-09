import {RequestUtils} from "@/lib/request-utils";
import {StandardApiUseCase} from "@/lib/usecases";

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

    return StandardApiUseCase.execute(req, '/User/search', { queryParams });
}
