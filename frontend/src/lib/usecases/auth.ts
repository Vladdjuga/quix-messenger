import { NextResponse } from 'next/server';
import { HttpClient } from '../http-client';
import { safeParseJSON } from '../utils';
import {RegisterUserDto} from "@/lib/dto/RegisterUserDto";

export class AuthUseCases {
  /**
   * Handle login - returns token and manages cookies
   */
  static async login(req: Request, body: { identity: string; password: string }): Promise<NextResponse> {
    try {
      const response = await HttpClient.makeRequest('/Auth/login', {
        method: 'POST',
        body,
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await safeParseJSON(response);
        return NextResponse.json(errorData, { status: response.status });
      }

      // Backend returns the access token as a raw string
      let accessToken = (await response.text()).trim();
      if (accessToken.startsWith('"') && accessToken.endsWith('"')) {
        accessToken = accessToken.slice(1, -1);
      }

      // Forward cookies from backend to client
      const nextResponse = NextResponse.json({ accessToken });
      const setCookieHeader = response.headers.get('set-cookie');
      if (setCookieHeader) {
        nextResponse.headers.set('Set-Cookie', setCookieHeader);
      }

      return nextResponse;
    } catch (error) {
      console.error('Error in login:', error);
      return HttpClient.createErrorResponse('Server error');
    }
  }

  /**
   * Handle registration - no auth required
   */
  static async register(req: Request, body: RegisterUserDto): Promise<NextResponse> {
    try {
      const response = await HttpClient.makeRequest('/Auth/register', {
        method: 'POST',
        body,
      });

      return HttpClient.handleStandardResponse(response);
    } catch (error) {
      console.error('Error in register:', error);
      return HttpClient.createErrorResponse('Server error');
    }
  }

  /**
   * Handle logout - requires auth
   */
  static async logout(req: Request): Promise<NextResponse> {
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
      const response = await HttpClient.makeRequest('/Auth/logout', {
        method: 'POST',
        body: {},
        headers: {
          'Authorization': authHeader,
        },
      });

      return HttpClient.handleStandardResponse(response);
    } catch (error) {
      console.error('Error in logout:', error);
      return HttpClient.createErrorResponse('Server error');
    }
  }

  /**
   * Handle token refresh - uses cookies, returns new token
   */
  static async refresh(req: Request): Promise<NextResponse> {
    try {
      const cookieHeader = req.headers.get('cookie');
      
      const response = await HttpClient.makeRequest('/Auth/refresh', {
        method: 'POST',
        headers: cookieHeader ? { 'Cookie': cookieHeader } : {},
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await safeParseJSON(response);
        return NextResponse.json(errorData, { status: response.status });
      }

      // Backend returns the access token as a raw string
      let accessToken = (await response.text()).trim();
      if (accessToken.startsWith('"') && accessToken.endsWith('"')) {
        accessToken = accessToken.slice(1, -1);
      }
      // Validate JWT format (should have 3 parts separated by dots)
      const tokenParts = accessToken.split('.');
      if (tokenParts.length !== 3) {
        console.error('Invalid JWT format - expected 3 parts, got:', tokenParts.length);
        return NextResponse.json({ message: 'Invalid token format received from server' }, { status: 500 });
      }

      // Forward cookies from backend to client
      const nextResponse = NextResponse.json({ accessToken });
      const setCookieHeader = response.headers.get('set-cookie');
      if (setCookieHeader) {
        nextResponse.headers.set('Set-Cookie', setCookieHeader);
      }

      return nextResponse;
    } catch (error) {
      console.error('Refresh token error:', error);
      return HttpClient.createErrorResponse('Server error');
    }
  }
}
