import {NextResponse} from "next/server";

// POST /api/chats/uploadChatAvatar
export async function POST(req: Request) {
  const USER_SERVICE_URL = process.env.NEXT_PUBLIC_USER_SERVICE_URL;

  try {
    if (!USER_SERVICE_URL) {
      return NextResponse.json({ message: 'Service URL is not configured' }, { status: 500 });
    }

    // Stream the original multipart body directly to the backend
    const headers = new Headers();
    const auth = req.headers.get('authorization');
    const contentType = req.headers.get('content-type');
    if (auth) headers.set('authorization', auth);
    if (contentType) headers.set('content-type', contentType);

    const res = await fetch(`${USER_SERVICE_URL}/Chat/uploadChatAvatar`, {
      method: 'POST',
      headers,
      body: req.body,
      // Required by undici when streaming a request body
      duplex: 'half',
    } as RequestInit & { duplex: 'half' });

    if (!res.ok) {
      const errorText = await res.text();
      console.error('Backend response error:', res.status, errorText);
      return NextResponse.json(
          { message: 'Avatar upload failed' },
          { status: res.status }
      );
    }

    // Backend returns a plain string (avatar URL). Forward as JSON string.
    const text = await res.text();
    let avatarUrl = text.trim();
    if (avatarUrl.startsWith('"') && avatarUrl.endsWith('"')) {
      avatarUrl = avatarUrl.slice(1, -1);
    }
    return NextResponse.json({ avatarUrl });
  } catch (error) {
    console.error('Avatar upload proxy error:', error);
    return NextResponse.json(
        { message: 'Failed to process avatar upload' },
        { status: 500 }
    );
  }
}
