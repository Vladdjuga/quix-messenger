import { NextResponse } from 'next/server';
import { z } from 'zod';

export async function POST(req: Request) {
    try {
        const schema = z.object({ identity: z.string().min(1), password: z.string().min(1) });
        let body: unknown;
        try { body = await req.json(); } catch { return NextResponse.json({ message: 'Invalid JSON body' }, { status: 400 }); }
        const parsed = schema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json({ message: 'Invalid body', details: parsed.error.flatten() }, { status: 400 });
        }
        const { identity, password } = parsed.data;

        // Login endpoint doesn't need authorization, so we handle it manually
        const USER_SERVICE_URL = process.env.NEXT_PUBLIC_USER_SERVICE_URL;
        const response = await fetch(`${USER_SERVICE_URL}/Auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ identity, password }),
            credentials: 'include',
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            let errorData;
            try {
                errorData = JSON.parse(errorText);
            } catch {
                errorData = { message: errorText || 'Login failed' };
            }
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
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json({ message: 'Server error' }, { status: 500 });
    }
} 