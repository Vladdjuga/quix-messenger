import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');

    if (!file || typeof file === "string") {
      return NextResponse.json({ message: 'File is required' }, { status: 400 });
    }

    const USER_SERVICE_URL = process.env.NEXT_PUBLIC_USER_SERVICE_URL;
    if (!USER_SERVICE_URL) {
      return NextResponse.json({ message: 'USER_SERVICE_URL not set' }, { status: 500 });
    }

    const outgoing = new FormData();
    const filename = file.name || "avatar.jpg";
    outgoing.append('file', file as Blob, filename);

    const res = await fetch(`${USER_SERVICE_URL}/User/uploadAvatar`, {
      method: 'POST',
      headers: {
        Authorization: req.headers.get('authorization') ?? '',
      },
      body: outgoing,
    });

    if (!res.ok) {
      const errorText = await res.text();
      try {
        return NextResponse.json(JSON.parse(errorText), { status: res.status });
      } catch {
        return NextResponse.json({ message: errorText || 'Upload failed' }, { status: res.status });
      }
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (e) {
    console.error('Avatar upload error', e);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}