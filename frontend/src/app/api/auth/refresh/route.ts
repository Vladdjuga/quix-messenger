import { NextResponse } from 'next/server'

const BASE_URL = 'http://user-service:7001/api/Auth';

export async function POST(req: Request) {
    try {
        const authorizationHeader = req.headers.get('authorization');
        if (!authorizationHeader) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const response = await fetch(`${BASE_URL}/refresh`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': authorizationHeader,
            },
            body: JSON.stringify({}),
        });

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json(data, { status: response.status });
        }

        return NextResponse.json({ token: data }); // new access token
    } catch (err) {
        console.error(err);
        return NextResponse.json({ message: 'Server error' }, { status: 500 });
    }
} 