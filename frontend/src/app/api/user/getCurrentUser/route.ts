import { BackendApiClient } from '@/lib/backend-api';

export async function GET(req: Request) {
    return BackendApiClient.request(req, '/User/getMeInfo');
} 