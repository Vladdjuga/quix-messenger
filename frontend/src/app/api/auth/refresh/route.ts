import { NextResponse } from 'next/server'
import {cookies} from "next/headers";

const BASE_URL = process.env.NEXT_PUBLIC_USER_SERVICE_URL;

export async function POST(req: Request) { // req здесь больше не нужен для cookie
    try {
        const authorizationHeader = req.headers.get('authorization');
        if (!authorizationHeader) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const cookieStore = await cookies();
        const refreshTokenCookie = cookieStore.get('refreshToken');

        const response = await fetch(`${BASE_URL}/Auth/refresh`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': authorizationHeader,
                'Cookie': refreshTokenCookie ? `${refreshTokenCookie.name}=${refreshTokenCookie.value}` : ''
            },
            body: JSON.stringify({}),
        });

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json(data, { status: response.status });
        }

        const responseHeaders = new Headers();
        const newCookies = response.headers.get('set-cookie');

        if (newCookies) {
            responseHeaders.set('set-cookie', newCookies);
        }

        return NextResponse.json({ token: data }, { headers: responseHeaders });

    } catch (err) {
        console.error(err);
        return NextResponse.json({ message: 'Server error' }, { status: 500 });
    }
}