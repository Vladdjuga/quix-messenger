import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const USER_SERVICE_URL = process.env.NEXT_PUBLIC_USER_SERVICE_URL;

  try {
    // Forward only required headers and stream the body. Node fetch requires duplex: 'half' for streaming bodies.
  const initialHeaders = new Headers();
  const initialAuth = req.headers.get('authorization');
  if (initialAuth) initialHeaders.set('authorization', initialAuth);
  const contentType = req.headers.get('content-type');
  if (contentType) initialHeaders.set('content-type', contentType);

    // Parse incoming multipart form and rebuild to ensure correct boundary and field names
    const inForm = await req.formData();
    const file = inForm.get('avatar');
    if (!(file instanceof Blob)) {
      return NextResponse.json({ message: 'No file provided' }, { status: 400 });
    }

    const outForm = new FormData();
    const filename = file instanceof File && file.name.trim() !== ''
      ? file.name
      : 'avatar';
    outForm.append('avatar', file, filename);

    // Forward only Authorization; let undici set multipart content-type with boundary
  const headers = new Headers();
  const auth = req.headers.get('authorization');
  if (auth) headers.set('authorization', auth);

    const init: RequestInit & { duplex?: 'half' } = {
      method: 'POST',
      headers,
      body: outForm,
    };
    const res = await fetch(`${USER_SERVICE_URL}/User/uploadAvatar`, init);
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