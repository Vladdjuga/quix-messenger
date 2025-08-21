import { NextResponse } from 'next/server'

const BASE_URL = process.env.NEXT_PUBLIC_USER_SERVICE_URL;

export async function POST(req: Request) {
    const authorizationHeader = req.headers.get('authorization');
    if (!authorizationHeader) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { query, pageSize, lastCreatedAt } = await req.json();

        if (!query || query.trim() === '') {
            return NextResponse.json({ message: 'A non-empty search query is required' }, { status: 400 });
        }

        const params = new URLSearchParams({
            query,
            pageSize: pageSize.toString(),
        });
        if (lastCreatedAt) params.append('lastCreatedAt', lastCreatedAt);

        const backendUrl = `${BASE_URL}/Contact/searchContacts?${params.toString()}`;

        const response = await fetch(backendUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': authorizationHeader,
            },
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() =>
                ({ message: response.statusText }));
            return NextResponse.json(errorData, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data);

    } catch (error) {
        console.error('Error searching contacts:', error);
        return NextResponse.json({ message: 'Server error' }, { status: 500 });
    }
}