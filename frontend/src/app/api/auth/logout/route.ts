import { NextResponse } from 'next/server'
import { safeParseJSON } from '@/lib/utils'

const BASE_URL = process.env.NEXT_PUBLIC_USER_SERVICE_URL;

export async function POST(req: Request) {
    try {
        const authorizationHeader = req.headers.get('authorization');
        if (!authorizationHeader) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const response = await fetch(`${BASE_URL}/Auth/logout`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': authorizationHeader, // Include the JWT token in the Authorization header
            },
            // credentials: 'include', // Uncomment if you need to send cookies with the request. For now, It doesn't send cookies for authorization.
            body: JSON.stringify({}),
        });

        if (!response.ok) {
            const errorData = await safeParseJSON(response);
            return NextResponse.json(errorData, { status: response.status });
        }
        // Optionally clear client-side JWT storage
        // localStorage.removeItem('jwt'); // Uncomment if using localStorage

        return NextResponse.json({ message: 'Logout successful' });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ message: 'Server error', status: 500 });
    }
} 