import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        // Check for authorization header
        const authorizationHeader = req.headers.get('authorization');
        if (!authorizationHeader) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        // Make request to backend logout endpoint
        const USER_SERVICE_URL = process.env.NEXT_PUBLIC_USER_SERVICE_URL;
        const response = await fetch(`${USER_SERVICE_URL}/Auth/logout`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': authorizationHeader,
            },
            body: JSON.stringify({}),
        });

        if (!response.ok) {
            const errorText = await response.text();
            let errorData;
            try {
                errorData = JSON.parse(errorText);
            } catch {
                errorData = { message: errorText || 'Logout failed' };
            }
            return NextResponse.json(errorData, { status: response.status });
        }

        return NextResponse.json({ message: 'Logout successful' });
    } catch (error) {
        console.error('Logout error:', error);
        return NextResponse.json({ message: 'Server error' }, { status: 500 });
    }
} 