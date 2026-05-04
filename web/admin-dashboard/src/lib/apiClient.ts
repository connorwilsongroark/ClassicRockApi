const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export function apiGet<T>(path: string): Promise<T> {
  return apiRequest<T>(path);
}

export function apiPost<TResponse, TBody>(
  path: string,
  body: TBody,
): Promise<TResponse> {
  return apiRequest<TResponse>(path, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function apiPut<TResponse, TBody>(
  path: string,
  body: TBody,
): Promise<TResponse> {
  return apiRequest<TResponse>(path, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

export function apiDelete<TResponse = void>(path: string): Promise<TResponse> {
  return apiRequest<TResponse>(path, {
    method: "DELETE",
  });
}
