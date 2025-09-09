import { NextRequest, NextResponse } from 'next/server';

const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://localhost:5001';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Forward request to user service
    const response = await fetch(`${USER_SERVICE_URL}/api/Auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { message: 'Registration failed', ...data },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
