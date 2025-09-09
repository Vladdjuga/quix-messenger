import {RequestUtils} from "@/lib/request-utils";
import {StandardApiUseCase} from "@/lib/usecases";

export async function GET(req: Request) {
    const searchParams = RequestUtils.extractQueryParams(req);
    
    const queryParams: Record<string, string | number | undefined> = {
        pageSize: searchParams.get('pageSize') || undefined,
        lastCreatedAt: searchParams.get('lastCreatedAt') || undefined
    };

    return StandardApiUseCase.execute(req, '/Friendship/getFriendships', { queryParams });
}
