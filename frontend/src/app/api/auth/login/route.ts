import { NextResponse } from 'next/server'

const BASE_URL = 'http://user-service:7001/api/Auth';

export async function POST(req: Request){
    const { identity, password } = await req.json();
    const response = await fetch(`${BASE_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identity, password }),
    });
    const data = await response.json();

    if (!response.ok) {
        return NextResponse.json(data, { status: response.status });
    }
    return NextResponse.json({ token: data });
} 