import { useState } from 'react';

interface UseAsyncState<T> {
  data: T;
  loading: boolean;
  error: string | null;
}

interface UseAsyncActions<T> {
  setData: (data: T | ((prev: T) => T)) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export function useAsyncState<T>(initialData: T): UseAsyncState<T> & UseAsyncActions<T> {
  const [data, setData] = useState<T>(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setData(initialData);
    setLoading(false);
    setError(null);
  };

  return {
    data,
    loading,
    error,
    setData,
    setLoading,
    setError,
    reset
  };
}
