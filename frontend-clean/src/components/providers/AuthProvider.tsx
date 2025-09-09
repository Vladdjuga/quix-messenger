'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/stores/auth';
import { useSocket } from '@/hooks/useSocket';

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { checkAuth } = useAuthStore();
  
  // Initialize socket connection
  useSocket();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return <>{children}</>;
}
