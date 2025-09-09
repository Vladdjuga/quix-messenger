import { LoginRequest, RegisterRequest, ApiResponse, User } from '@/types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

// Simple HTTP client - no classes, just functions
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const token = localStorage.getItem('authToken');
    
    const response = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.message || 'Request failed',
      };
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
    };
  }
}

// Auth API functions
export async function login(credentials: LoginRequest) {
  const response = await apiRequest<{ accessToken: string }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });

  if (response.success && response.data) {
    localStorage.setItem('authToken', response.data.accessToken);
  }

  return response;
}

export async function register(userData: RegisterRequest) {
  return apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  });
}

export async function logout() {
  const response = await apiRequest('/auth/logout', {
    method: 'POST',
  });

  if (response.success) {
    localStorage.removeItem('authToken');
  }

  return response;
}

export async function getCurrentUser() {
  return apiRequest<User>('/auth/me');
}

export async function refreshToken() {
  return apiRequest<{ accessToken: string }>('/auth/refresh', {
    method: 'POST',
  });
}
