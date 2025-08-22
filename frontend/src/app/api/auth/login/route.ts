import { NextResponse } from 'next/server'
import { safeParseJSON } from '@/lib/utils'

const BASE_URL = process.env.NEXT_PUBLIC_USER_SERVICE_URL;

export async function POST(req: Request){
    const { identity, password } = await req.json();
    const response = await fetch(`${BASE_URL}/Auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identity, password }),
        credentials: 'include',
    });
    
    if (!response.ok) {
        const errorData = await safeParseJSON(response);
        return NextResponse.json(errorData, { status: response.status });
    }
    
    // Backend returns the access token as a raw string
    let accessToken = (await response.text()).trim();
    if (accessToken.startsWith('"') && accessToken.endsWith('"')) {
        accessToken = accessToken.slice(1, -1);
    }
    if (accessToken.toLowerCase().startsWith('bearer ')) {
        accessToken = accessToken.slice(7).trim();
    }
    
    // Forward cookies from backend to client
    const nextResponse = NextResponse.json({ accessToken });
    const setCookieHeader = response.headers.get('set-cookie');
    if (setCookieHeader) {
        nextResponse.headers.set('Set-Cookie', setCookieHeader);
    }
    
    return nextResponse;
} 