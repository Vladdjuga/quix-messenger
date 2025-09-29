import { NextResponse } from 'next/server';
import { updateUserSchema } from '@/lib/schemas/updateUserSchema';

export async function PATCH(req: Request) {
  try {
    let body: unknown;
    try { body = await req.json(); } catch { return NextResponse.json({ message: 'Invalid JSON body' }, { status: 400 }); }
    const parsed = updateUserSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ message: 'Invalid body', details: parsed.error.flatten() }, { status: 400 });
    }

    const { username, email, password, firstName, lastName, dateOfBirth } = parsed.data as {
      username?: string;
      email?: string;
      password?: string;
      confirmPassword?: string;
      firstName?: string;
      lastName?: string;
      dateOfBirth?: Date;
    };
    const payload: Record<string, unknown> = {};
    if (username !== undefined) payload.Username = username;
    if (email !== undefined) payload.Email = email;
    if (password !== undefined && password !== '') payload.Password = password;
    if (firstName !== undefined) payload.FirstName = firstName;
    if (lastName !== undefined) payload.LastName = lastName;
    if (dateOfBirth !== undefined) payload.DateOfBirth = new Date(dateOfBirth).toISOString();

    const USER_SERVICE_URL = process.env.NEXT_PUBLIC_USER_SERVICE_URL;
    const response = await fetch(`${USER_SERVICE_URL}/User/updateUserInfo`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        // Forward Authorization header if present
        'Authorization': req.headers.get('authorization') ?? '',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      try { errorData = JSON.parse(errorText); } catch { errorData = { message: errorText || 'Update failed' }; }
      return NextResponse.json(errorData, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('User update error:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
