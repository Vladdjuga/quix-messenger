import { NextResponse } from 'next/server'
import { safeParseJSON } from '@/lib/utils'

const BASE_URL = process.env.NEXT_PUBLIC_USER_SERVICE_URL;

export async function POST(req: Request) {
    try {
        // Get cookies from the incoming request
        const cookieHeader = req.headers.get('cookie');
        
        const response = await fetch(`${BASE_URL}/Auth/refresh`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(cookieHeader && { 'Cookie': cookieHeader })
            },
            credentials: 'include',
        });

        if (!response.ok) {
            const errorData = await safeParseJSON(response);
            return NextResponse.json(errorData, { status: response.status });
        }

        // Backend returns the access token as a raw string
        const rawToken = await response.text();
        const accessToken = rawToken.trim();
        
        // Validate JWT format (should have 3 parts separated by dots)
        const tokenParts = accessToken.split('.');
        if (tokenParts.length !== 3) {
            console.error('Invalid JWT format - expected 3 parts, got:', tokenParts.length);
            console.error('Raw token:', JSON.stringify(rawToken));
            console.error('Trimmed token:', JSON.stringify(accessToken));
            return NextResponse.json({ message: 'Invalid token format received from server' }, { status: 500 });
        }
        
        // Log for debugging (remove in production)
        console.log('Received access token length:', accessToken.length);
        console.log('Received access token preview:', accessToken.substring(0, 50) + '...');
        console.log('Token parts lengths:', tokenParts.map(part => part.length));
        
        // Wrap it in an object for consistent frontend API
        const nextResponse = NextResponse.json({ accessToken });
        const setCookieHeader = response.headers.get('set-cookie');
        if (setCookieHeader) {
            nextResponse.headers.set('set-cookie', setCookieHeader);
        }

        return nextResponse;

    } catch (err) {
        console.error('Refresh token error:', err);
        return NextResponse.json({ message: 'Server error' }, { status: 500 });
    }
}