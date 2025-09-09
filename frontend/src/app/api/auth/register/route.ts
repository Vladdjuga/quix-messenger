import { AuthUseCases } from '@/lib/usecases/auth';
import { RequestUtils } from '@/lib/request-utils';
import {RegisterUserDto} from "@/lib/dto/RegisterUserDto";

export async function POST(req: Request) {
    const bodyResult = await RequestUtils.extractBody(req);
    if (!bodyResult.success) return bodyResult.response;

    const dto = bodyResult.data as RegisterUserDto;

    return AuthUseCases.register(req, dto);
} 