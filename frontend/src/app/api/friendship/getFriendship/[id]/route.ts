import { proxy } from '@/lib/proxy';

export async function GET(
    req: Request, 
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    if (!id) {
        return Response.json({ message: 'Friendship ID is required' }, { status: 400 });
    }
    return proxy(req, process.env.NEXT_PUBLIC_USER_SERVICE_URL!, `/Friendship/getFriendship/${encodeURIComponent(id)}`);
}
