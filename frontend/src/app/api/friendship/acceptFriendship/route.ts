import {RequestUtils} from "@/lib/request-utils";
import {StandardApiUseCase} from "@/lib/usecases";

export async function POST(req: Request) {
    const bodyResult = await RequestUtils.extractBody(req);
    if (!bodyResult.success) return bodyResult.response;
    
    const validation = RequestUtils.validateRequiredFields(bodyResult.data,
        ['friendshipId']);
    if (!validation.isValid) {
        return RequestUtils.validationError(`Missing required fields: ${validation.missingFields.join(', ')}`);
    }

    const { friendshipId } = bodyResult.data as { friendshipId: string };
    
    return StandardApiUseCase.execute(
        req,
        `/Friendship/acceptFriendship/${encodeURIComponent(friendshipId)}`,
        { method: 'POST' }
    );
}
