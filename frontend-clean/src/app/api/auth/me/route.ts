import { NextRequest, NextResponse } from 'next/server';

const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://localhost:5001';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader) {
      return NextResponse.json(
        { message: 'Authorization header required' },
        { status: 401 }
      );
    }

    // Forward request to user service to get current user
    const response = await fetch(`${USER_SERVICE_URL}/api/User/me`, {
      headers: {
        'Authorization': authHeader,
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { message: 'Failed to get user' },
        { status: response.status }
      );
    }

    const userData = await response.json();
    return NextResponse.json(userData);
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
