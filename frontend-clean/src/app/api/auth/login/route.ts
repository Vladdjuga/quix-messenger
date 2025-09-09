import { NextRequest, NextResponse } from 'next/server';

const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://localhost:5001';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Forward request to user service
    const response = await fetch(`${USER_SERVICE_URL}/api/Auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.text();

    if (!response.ok) {
      return NextResponse.json(
        { message: 'Login failed', error: data },
        { status: response.status }
      );
    }

    // Create response with the access token
    const result = NextResponse.json({ accessToken: data });
    
    // Forward any cookies from the backend
    const setCookieHeader = response.headers.get('set-cookie');
    if (setCookieHeader) {
      result.headers.set('Set-Cookie', setCookieHeader);
    }

    return result;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
