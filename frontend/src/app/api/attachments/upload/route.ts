import {NextResponse} from "next/server";

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

    // Forward the FormData to the backend
    const res = await fetch(`${USER_SERVICE_URL}/Attachment/upload`, {
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
          { message: 'Attachment upload failed' },
          { status: res.status }
      );
    }
    // Backend returns a JSON object with attachment URLs. Forward as-is.
    const data = await res.json();
    return NextResponse.json(data, { status: 200 });

  } catch (error) {
    console.error('Error uploading attachments:', error);
    return NextResponse.json({ message: 'Failed to upload attachments' }, { status: 500 });
  }
}
