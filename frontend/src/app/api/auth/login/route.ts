import { NextResponse } from 'next/server';
import { BackendApiClient } from '@/lib/backend-api';

export async function POST(req: Request) {
    try {
        const bodyResult = await BackendApiClient.extractBody(req);
        if (!bodyResult.success) {
            return bodyResult.response;
        }

        const { identity, password } = bodyResult.data as { identity: string; password: string };
        
        // Validate required fields
        const validation = BackendApiClient.validateRequiredFields({ identity, password }, ['identity', 'password']);
        if (!validation.isValid) {
            return BackendApiClient.validationError(`Missing required fields: ${validation.missingFields.join(', ')}`);
        }

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