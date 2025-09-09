import { AuthUseCases } from '@/lib/usecases/auth';
import { RequestUtils } from '@/lib/request-utils';

export async function POST(req: Request) {
    const bodyResult = await RequestUtils.extractBody(req);
    if (!bodyResult.success) return bodyResult.response;
    
    const validation = RequestUtils.validateRequiredFields(bodyResult.data, ['identity', 'password']);
    if (!validation.isValid) {
        return RequestUtils.validationError(`Missing required fields: ${validation.missingFields.join(', ')}`);
    }

    return AuthUseCases.login(req, bodyResult.data as { identity: string; password: string });
} 