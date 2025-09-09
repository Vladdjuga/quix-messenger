import {RequestUtils} from "@/lib/request-utils";
import {StandardApiUseCase} from "@/lib/usecases";

export async function DELETE(req: Request, context: { params: Promise<{ friendshipId: string }> }) {
    const { friendshipId } = await context.params;
    
    if (!friendshipId) {
        return RequestUtils.validationError('Friendship ID is required');
    }

    return StandardApiUseCase.execute(req, `/Friendship/rejectFriendRequest/${friendshipId}`, {
        method: 'DELETE' 
    });
}
