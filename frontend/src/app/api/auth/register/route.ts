import { NextResponse } from 'next/server';
import { BackendApiClient } from '@/lib/backend-api';

export async function POST(req: Request) {
    try {
        const bodyResult = await BackendApiClient.extractBody(req);
        if (!bodyResult.success) {
            return bodyResult.response;
        }

        const body = bodyResult.data;
        
        // Validate required fields for registration
        const validation = BackendApiClient.validateRequiredFields(body, ['username', 'email', 'password']);
        if (!validation.isValid) {
            return BackendApiClient.validationError(`Missing required fields: ${validation.missingFields.join(', ')}`);
        }

        // Registration doesn't need authorization, so we handle it manually
        const USER_SERVICE_URL = process.env.NEXT_PUBLIC_USER_SERVICE_URL;
        const response = await fetch(`${USER_SERVICE_URL}/Auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            let errorData;
            try {
                errorData = JSON.parse(errorText);
            } catch {
                errorData = { message: errorText || 'Registration failed' };
            }
            return NextResponse.json(errorData, { status: response.status });
        }
        
        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json({ message: 'Server error' }, { status: 500 });
    }
} 