// API Client Configuration and Base Functions

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export class APIError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    public data?: any
  ) {
    super(`API Error ${status}: ${statusText}`);
    this.name = 'APIError';
  }
}

async function fetchWithAuth(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config: RequestInit = {
    ...options,
    credentials: 'include', // Important: include cookies for session
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...options.headers,
    },
  };

  const response = await fetch(url, config);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new APIError(response.status, response.statusText, errorData);
  }
  
  return response;
}

export async function get<T>(endpoint: string): Promise<T> {
  const response = await fetchWithAuth(endpoint);
  return response.json();
}

export async function post<T>(endpoint: string, data?: any): Promise<T> {
  const response = await fetchWithAuth(endpoint, {
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
  });
  
  // Handle 201 Created responses
  if (response.status === 201) {
    return response.json();
  }
  
  // Handle 204 No Content responses
  if (response.status === 204) {
    return undefined as T;
  }
  
  return response.json();
}

export async function put<T>(endpoint: string, data: any): Promise<T> {
  const response = await fetchWithAuth(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  return response.json();
}

export async function del(endpoint: string): Promise<void> {
  await fetchWithAuth(endpoint, {
    method: 'DELETE',
  });
}
