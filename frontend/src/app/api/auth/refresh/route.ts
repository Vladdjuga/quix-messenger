import { AuthUseCases } from '@/lib/usecases/auth';

export async function POST(req: Request) {
    return AuthUseCases.refresh(req);
}