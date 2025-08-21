import { NextResponse } from 'next/server'
import { safeParseJSON } from '@/lib/utils'

const BASE_URL = process.env.NEXT_PUBLIC_USER_SERVICE_URL;

export async function POST(req: Request) {
    const authorizationHeader = req.headers.get('authorization');
    if (!authorizationHeader) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { username } = await req.json();
    if (!username || typeof username !== 'string')
        return NextResponse.json({ message: 'username is required' }, { status: 400 });

    try {
        const response = await fetch(`${BASE_URL}/Contact/requestFriendship/${encodeURIComponent(username)}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': authorizationHeader,
            },
        });

    const data = await safeParseJSON(response);
    return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error('Error requesting friendship:', error);
        return NextResponse.json({ message: 'Server error' }, { status: 500 });
    }
}


