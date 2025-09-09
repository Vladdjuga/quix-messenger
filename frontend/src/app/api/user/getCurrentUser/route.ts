import {StandardApiUseCase} from "@/lib/usecases";

export async function GET(req: Request) {
    return StandardApiUseCase.execute(req, '/User/getMeInfo');
} 