import { NextResponse } from 'next/server'

const BASE_URL = process.env.NEXT_PUBLIC_USER_SERVICE_URL;

export async function POST(req: Request, context: { params: { contactId: string } }) {
    const authorizationHeader = req.headers.get('authorization');
    if (!authorizationHeader) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { contactId } = context.params;
    if (!contactId)
        return NextResponse.json({ message: 'contactId is required' }, { status: 400 });

    try {
        const response = await fetch(`${BASE_URL}/Contact/acceptFriendship/${encodeURIComponent(contactId)}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': authorizationHeader,
            },
        });

        const data = await response.json();
        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error('Error accepting friendship:', error);
        return NextResponse.json({ message: 'Server error' }, { status: 500 });
    }
}


