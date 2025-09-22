import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const USER_SERVICE_URL = process.env.NEXT_PUBLIC_USER_SERVICE_URL;

  try {
    const res = await fetch(`${USER_SERVICE_URL}/User/uploadAvatar`, {
      method: 'POST',
      headers: req.headers,
      body: req.body,
    });
    if (!res.ok) {
      const errorText = await res.text();
      console.error('Backend response error:', res.status, errorText);
      return NextResponse.json(
        { error: `Backend error: ${res.status}` },
        { status: res.status }
      );
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Avatar upload proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to process avatar upload' },
      { status: 500 }
    );
  }
}