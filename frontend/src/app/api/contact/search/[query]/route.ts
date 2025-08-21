import { NextResponse } from 'next/server'

const BASE_URL = process.env.NEXT_PUBLIC_USER_SERVICE_URL;

export async function GET(req: Request, context: { params: { query: string } }) {
    const authorizationHeader = req.headers.get('authorization');
    if (!authorizationHeader) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const query = context.params.query ?? '';
    const { searchParams } = new URL(req.url);
    const pageSize = Number(searchParams.get('pageSize') ?? '20');
    const lastCreatedAt = searchParams.get('lastCreatedAt');

    try {
        const params = new URLSearchParams();
        params.set('pageSize', String(pageSize));
        if (lastCreatedAt) params.set('lastCreatedAt', lastCreatedAt);
        const url = `${BASE_URL}/Contact/getContacts?${params.toString()}`;
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': authorizationHeader,
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            return NextResponse.json(errorData, { status: response.status });
        }

        const data = await response.json();
        const contacts = Array.isArray(data) ? data : [];
        const filtered = query
            ? contacts.filter((c: any) => typeof c.username === 'string' &&
                c.username.toLowerCase().includes(query.toLowerCase()))
            : contacts;
        return NextResponse.json(filtered);
    } catch (error) {
        console.error('Error searching contacts (cursor):', error);
        return NextResponse.json({ message: 'Server error' }, { status: 500 });
    }
}


