import { NextResponse } from 'next/server'
import { safeParseJSON } from '@/lib/utils'

const BASE_URL = process.env.NEXT_PUBLIC_USER_SERVICE_URL;

export async function POST(req: Request) {
    const authorizationHeader = req.headers.get('authorization');
    if (!authorizationHeader) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { query, pageSize, lastCreatedAt } = await req.json();

        // Validation
        if (!query || typeof query !== 'string' || query.trim() === '') {
            return NextResponse.json({ message: 'A non-empty search query is required' }, { status: 400 });
        }
        if (typeof pageSize !== 'number' || isNaN(pageSize) || pageSize <= 0) {
            return NextResponse.json({ message: 'A valid pageSize (number > 0) is required' }, { status: 400 });
        }
        if (lastCreatedAt && isNaN(Date.parse(lastCreatedAt))) {
            return NextResponse.json({ message: 'Invalid lastCreatedAt date format' }, { status: 400 });
        }

        const params = new URLSearchParams({
            query,
            pageSize: pageSize.toString(),
        });
        if (lastCreatedAt) params.append('lastCreatedAt', lastCreatedAt);

        const backendUrl = `${BASE_URL}/Contact/searchContacts?${params.toString()}`;

        // Log request params for debugging
        console.log('Contact search request params:', { query, pageSize, lastCreatedAt });
        console.log('Backend URL:', backendUrl);

        const response = await fetch(backendUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': authorizationHeader,
            },
        });

        if (!response.ok) {
            const errorData = await safeParseJSON(response);
            console.error('Backend error response:', errorData);
            return NextResponse.json(errorData, { status: response.status });
        }
        const data = await safeParseJSON(response);
        return NextResponse.json(data);

    } catch (error) {
        console.error('Error searching contacts:', error);
        return NextResponse.json({ message: 'Server error' }, { status: 500 });
    }
}