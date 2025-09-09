import {RequestUtils} from "@/lib/request-utils";
import {StandardApiUseCase} from "@/lib/usecases";

export async function GET(
    req: Request, 
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const resolvedParams = await params;
        const { id } = resolvedParams;
        
        if (!id) {
            return RequestUtils.validationError('Friendship ID is required');
        }

        return StandardApiUseCase.execute(
            req,
            `/Friendship/getFriendship/${encodeURIComponent(id)}`
        );
    } catch {
        return RequestUtils.validationError('Invalid request parameters');
    }
}
