import { NextResponse } from 'next/server';
import { z } from 'zod';

export async function POST(req: Request) {
    try {
                const schema = z.object({
                    username: z.string().min(3),
                    email: z.string().email(),
                    password: z.string().min(6),
                });
                let body: unknown;
                try { body = await req.json(); } catch { return NextResponse.json({ message: 'Invalid JSON body' }, { status: 400 }); }
                const parsed = schema.safeParse(body);
                if (!parsed.success) {
                    return NextResponse.json({ message: 'Invalid body', details: parsed.error.flatten() }, { status: 400 });
                }

        // Registration doesn't need authorization, so we handle it manually
        const USER_SERVICE_URL = process.env.NEXT_PUBLIC_USER_SERVICE_URL;
        const response = await fetch(`${USER_SERVICE_URL}/Auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(parsed.data),
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