import { NextResponse } from 'next/server';
import { HttpClient, HttpRequestOptions } from '../http-client';

export type StandardApiOptions = Omit<HttpRequestOptions, 'headers'>

export class StandardApiUseCase {
  static async execute(req: Request, endpoint: string, options: StandardApiOptions = {}): Promise<NextResponse> {
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
      const response = await HttpClient.makeRequest(endpoint, {
        ...options,
        headers: {
          'Authorization': authHeader,
        },
      });

      return HttpClient.handleStandardResponse(response);
    } catch (error) {
      console.error(`Error in ${options.method || 'GET'} ${endpoint}:`, error);
      return HttpClient.createErrorResponse('Server error');
    }
  }
}
