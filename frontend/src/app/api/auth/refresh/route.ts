import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        // Get cookies from the incoming request
        const cookieHeader = req.headers.get('cookie');
        
        const USER_SERVICE_URL = process.env.NEXT_PUBLIC_USER_SERVICE_URL;
        const response = await fetch(`${USER_SERVICE_URL}/Auth/refresh`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(cookieHeader && { 'Cookie': cookieHeader })
            },
            credentials: 'include',
        });

        if (!response.ok) {
            const errorText = await response.text();
            let errorData;
            try {
                errorData = JSON.parse(errorText);
            } catch {
                errorData = { message: errorText || 'Token refresh failed' };
            }
            return NextResponse.json(errorData, { status: response.status });
        }

        // Backend returns the access token as a raw string
        const rawToken = await response.text();
        let accessToken = rawToken.trim();
        
        // Remove surrounding quotes if any and accidental Bearer prefix
        if (accessToken.startsWith('"') && accessToken.endsWith('"')) {
            accessToken = accessToken.slice(1, -1);
        }
        if (accessToken.toLowerCase().startsWith('bearer ')) {
            accessToken = accessToken.slice(7).trim();
        }
        
        // Validate JWT format (should have 3 parts separated by dots)
        const tokenParts = accessToken.split('.');
        if (tokenParts.length !== 3) {
            console.error('Invalid JWT format - expected 3 parts, got:', tokenParts.length);
            return NextResponse.json({ message: 'Invalid token format received from server' }, { status: 500 });
        }
        
        // Create response with the new access token
        const nextResponse = NextResponse.json({ accessToken });
        
        // Forward any set-cookie headers from the backend
        const setCookieHeader = response.headers.get('set-cookie');
        if (setCookieHeader) {
            nextResponse.headers.set('set-cookie', setCookieHeader);
        }

        return nextResponse;
    } catch (error) {
        console.error('Refresh token error:', error);
        return NextResponse.json({ message: 'Server error' }, { status: 500 });
    }
}