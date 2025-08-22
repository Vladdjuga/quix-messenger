import {NextResponse} from "next/server";
import {safeParseJSON} from "@/lib/utils";

const BASE_URL = process.env.NEXT_PUBLIC_USER_SERVICE_URL;

export async function GET(req: Request) {
    const authorizationHeader = req.headers.get('authorization');
    if (!authorizationHeader) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        const url = new URL(req.url);
        const query = url.searchParams.get('query') || '';
        const pageSize = parseInt(url.searchParams.get('pageSize') || '10');
        const lastCreatedAt = url.searchParams.get('lastCreatedAt');

        // Validation
        if (isNaN(pageSize) || pageSize <= 0) {
            return NextResponse.json({ message: 'A valid pageSize (number > 0) is required' }, { status: 400 });
        }
        if (lastCreatedAt && isNaN(Date.parse(lastCreatedAt))) {
            return NextResponse.json({ message: 'Invalid lastCreatedAt date format' }, { status: 400 });
        }

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