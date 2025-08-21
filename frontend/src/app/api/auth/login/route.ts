import { NextResponse } from 'next/server'
import { safeParseJSON } from '@/lib/utils'

const BASE_URL = process.env.NEXT_PUBLIC_USER_SERVICE_URL;

export async function POST(req: Request){
    const { identity, password } = await req.json();
    const response = await fetch(`${BASE_URL}/Auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identity, password }),
    });
    const data = await safeParseJSON(response);
    if (!response.ok) {
        return NextResponse.json(data, { status: response.status });
    }
    return NextResponse.json({ token: data });
} 