const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export function apiGet<T>(path: string, options?: RequestInit): Promise<T> {
  return apiRequest<T>(path, options);
}

export function apiPost<TResponse, TBody>(
  path: string,
  body: TBody,
  options?: RequestInit,
): Promise<TResponse> {
  return apiRequest<TResponse>(path, {
    ...options,
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function apiPut<TResponse, TBody>(
  path: string,
  body: TBody,
  options?: RequestInit,
): Promise<TResponse> {
  return apiRequest<TResponse>(path, {
    ...options,
    method: "PUT",
    body: JSON.stringify(body),
  });
}

export function apiDelete<TResponse = void>(
  path: string,
  options?: RequestInit,
): Promise<TResponse> {
  return apiRequest<TResponse>(path, {
    ...options,
    method: "DELETE",
  });
}
