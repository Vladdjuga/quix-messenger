import { NextResponse } from 'next/server'
import { safeParseJSON } from '@/lib/utils'

const BASE_URL = process.env.NEXT_PUBLIC_USER_SERVICE_URL;

export async function POST(req: Request) {
    console.log('Register API route called');
    try {
        const body = await req.json();
        console.log('Request body:', body);

        
        console.log('Making request to:', `${BASE_URL}/register`);
        const response = await fetch(`${BASE_URL}/Auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
        
        console.log('Response status:', response.status);
        const data = await safeParseJSON(response);
        console.log('Response data:', data);
        
        if (!response.ok) {
            console.log('Request failed with status:', response.status);
            return NextResponse.json(data, { status: response.status });
        }
        
        console.log('Request successful');
        return NextResponse.json(data);
    } catch (err) {
        console.error('Error in register route:', err);
        return NextResponse.json({ message: 'Server error' }, { status: 500 });
    }
} 