import React, { useState, useCallback } from "react";

export function useAsyncState<T = any>(initialData?: T) {
  const [data, setData] = useState<T | undefined>(initialData);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(async (promise: Promise<T>) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await promise;
      setData(result);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { data, setData, isLoading, setIsLoading, error, execute };
}

export function Fallback({
  isLoading,
  fallback,
  children,
}: {
  isLoading: boolean;
  fallback: React.ReactNode;
  children: React.ReactNode;
}) {
  if (isLoading) {
    return <>{fallback}</>;
  }
  return <>{children}</>;
}
