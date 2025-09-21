import { proxy } from '@/lib/proxy';

export async function GET(req: Request) {
    return proxy(req, process.env.NEXT_PUBLIC_USER_SERVICE_URL!, '/User/getMeInfo');
} 