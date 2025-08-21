import { NextResponse } from 'next/server'

const BASE_URL = process.env.NEXT_PUBLIC_USER_SERVICE_URL;

export async function GET(req: Request) {
    const authorizationHeader = req.headers.get('authorization');
    if (!authorizationHeader) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    try {
        const response = await fetch(`${BASE_URL}/User/getMeInfo`, {
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
        console.error('Error fetching current user:', error);
        return NextResponse.json({ message: 'Server error' }, { status: 500 });
    }
} 