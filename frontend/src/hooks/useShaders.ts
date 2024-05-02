import { useState, useEffect, useCallback } from "react";
import { fetchShaders, Shader } from "../lib/api";

interface UseShadersOptions {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  tag?: string;
}

interface UseShadersResult {
  shaders: Shader[];
  total: number;
  totalPages: number;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useShaders(options: UseShadersOptions = {}): UseShadersResult {
  const { page, limit, search, category, tag } = options;
  const [shaders, setShaders] = useState<Shader[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchShaders({ page, limit, search, category, tag });
      setShaders(data.shaders);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load shaders");
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, category, tag]);

  useEffect(() => {
    load();
  }, [load]);

  return { shaders, total, totalPages, loading, error, refetch: load };
}
