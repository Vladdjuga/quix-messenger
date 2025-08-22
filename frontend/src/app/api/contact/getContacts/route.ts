import { NextResponse } from 'next/server'

const BASE_URL = process.env.NEXT_PUBLIC_USER_SERVICE_URL;

export async function GET(req: Request) {
    let authorizationHeader = req.headers.get('authorization');
    if (!authorizationHeader) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Normalize Authorization header
    const value = authorizationHeader.trim();
    if (value.toLowerCase().startsWith('bearer ')) {
        let token = value.slice(7).trim();
        if (token.startsWith('"') && token.endsWith('"')) token = token.slice(1, -1);
        if (token.toLowerCase().startsWith('bearer ')) token = token.slice(7).trim();
        authorizationHeader = `Bearer ${token}`;
    }

    try {
        const url = new URL(req.url);
        const pageSize = url.searchParams.get('pageSize');
        const lastCreatedAt = url.searchParams.get('lastCreatedAt');

        const params = new URLSearchParams();
        if (pageSize) params.set('pageSize', pageSize);
        if (lastCreatedAt) params.set('lastCreatedAt', lastCreatedAt);

        const backendUrl = `${BASE_URL}/Contact/getContacts${params.toString() ? `?${params.toString()}` : ''}`;

        const response = await fetch(backendUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': authorizationHeader,
            },
        });

        if (!response.ok) {
            let errorData;
            try {
                const text = await response.text();
                errorData = text ? JSON.parse(text) : { message: 'Unknown error' };
            } catch {
                errorData = { message: 'Invalid error response' };
            }
            return NextResponse.json(errorData, { status: response.status });
        }

        let data;
        try {
            const text = await response.text();
            data = text ? JSON.parse(text) : {};
        } catch {
            data = { message: 'Invalid JSON response' };
        }
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error fetching contacts:', error);
        return NextResponse.json({ message: 'Server error' }, { status: 500 });
    }
}
