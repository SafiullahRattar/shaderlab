export interface Shader {
  id: number;
  title: string;
  description: string;
  glslCode: string;
  tags: string;
  category: string;
  author: string;
  thumbnailUrl: string | null;
  starsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ShaderListResponse {
  shaders: Shader[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const BASE_URL = "/api";

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${url}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }

  return res.json();
}

export function fetchShaders(params?: {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  tag?: string;
}): Promise<ShaderListResponse> {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set("page", String(params.page));
  if (params?.limit) searchParams.set("limit", String(params.limit));
  if (params?.search) searchParams.set("search", params.search);
  if (params?.category) searchParams.set("category", params.category);
  if (params?.tag) searchParams.set("tag", params.tag);

  const qs = searchParams.toString();
  return request<ShaderListResponse>(`/shaders${qs ? `?${qs}` : ""}`);
}

export function fetchShader(id: number): Promise<Shader> {
  return request<Shader>(`/shaders/${id}`);
}

export function createShader(data: {
  title: string;
  description?: string;
  glslCode: string;
  tags?: string;
  category?: string;
  author?: string;
}): Promise<Shader> {
  return request<Shader>("/shaders", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateShader(
  id: number,
  data: Partial<{
    title: string;
    description: string;
    glslCode: string;
    tags: string;
    category: string;
    author: string;
  }>
): Promise<Shader> {
  return request<Shader>(`/shaders/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function deleteShader(id: number): Promise<void> {
  return request<void>(`/shaders/${id}`, { method: "DELETE" });
}
