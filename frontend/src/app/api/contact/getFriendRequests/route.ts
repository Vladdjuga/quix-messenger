import {NextResponse} from "next/server";
import {safeParseJSON} from "@/lib/utils";

const BASE_URL = process.env.NEXT_PUBLIC_USER_SERVICE_URL;

export async function GET(req: Request) {
    const authorizationHeader = req.headers.get('authorization');
    if (!authorizationHeader) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { query, pageSize, lastCreatedAt } = await req.json();

        const params = new URLSearchParams({
            query,
            pageSize: pageSize.toString(),
        });
        if (lastCreatedAt) params.append('lastCreatedAt', lastCreatedAt);

        const backendUrl = `${BASE_URL}/Contact/getFriendRequests?${params.toString()}`;

        const response = await fetch(backendUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': authorizationHeader,
            },
        });

        if (!response.ok) {
            const errorData = await safeParseJSON(response);
            console.error('Backend error response:', errorData);
            return NextResponse.json(errorData, { status: response.status });
        }
        const data = await safeParseJSON(response);
        return NextResponse.json(data);

    } catch (error) {
        console.error('Error searching contacts:', error);
        return NextResponse.json({ message: 'Server error' }, { status: 500 });
    }
}