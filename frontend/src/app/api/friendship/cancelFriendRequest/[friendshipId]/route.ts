import { proxy } from '@/lib/proxy';

export async function DELETE(req: Request, context: { params: Promise<{ friendshipId: string }> }) {
    const { friendshipId } = await context.params;
    if (!friendshipId) {
        return Response.json({ message: 'Friendship ID is required' }, { status: 400 });
    }
    return proxy(req, process.env.NEXT_PUBLIC_USER_SERVICE_URL!, `/Friendship/cancelFriendRequest/${encodeURIComponent(friendshipId)}`, { method: 'DELETE' });
}
