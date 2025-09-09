import {RequestUtils} from "@/lib/request-utils";
import {StandardApiUseCase} from "@/lib/usecases";

export async function POST(req: Request) {
    const bodyResult = await RequestUtils.extractBody(req);
    if (!bodyResult.success) return bodyResult.response;
    
    const validation = RequestUtils.validateRequiredFields(bodyResult.data, ['username']);
    if (!validation.isValid) {
        return RequestUtils.validationError(`Missing required fields: ${validation.missingFields.join(', ')}`);
    }

    const { username } = bodyResult.data as { username: string };
    
    return StandardApiUseCase.execute(
        req,
        `/Friendship/requestFriendship/${encodeURIComponent(username)}`,
        { method: 'POST' }
    );
}
