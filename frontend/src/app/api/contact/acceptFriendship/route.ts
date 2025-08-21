import {NextResponse} from 'next/server'
import { safeParseJSON } from '@/lib/utils'

const BASE_URL = process.env.NEXT_PUBLIC_USER_SERVICE_URL;

export async function POST(req: Request) {
    const authorizationHeader = req.headers.get('authorization');
    if (!authorizationHeader) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { contactId } = await req.json();

        if (!contactId) {
            return NextResponse.json({ message: 'contactId is required in the body' }, { status: 400 });
        }

        const response = await fetch(
            `${BASE_URL}/Contact/acceptFriendship/${encodeURIComponent(contactId)}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': authorizationHeader,
                },
            }
        );

        if (response.status === 204 || response.headers.get('content-length') === '0') {
            return new NextResponse(null, { status: response.status });
        }

    const data = await safeParseJSON(response);
    return NextResponse.json(data, { status: response.status });

    } catch (error) {
        console.error('Error accepting friendship:', error);
        return NextResponse.json({ message: 'Server error' }, { status: 500 });
    }
}

