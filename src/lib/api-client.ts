// lib/api-client.ts
class ApiClientClass {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:10000';
  }

  getBaseUrl(): string {
    return this.baseUrl;
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'GET',
    });
  }

  async post<T>(endpoint: string, body: Record<string, any>): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  private async request<T>(endpoint: string, options: RequestInit): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    try {
      const response = await fetch(url, {
        ...options,
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      // Handle 401 - redirect to backend login endpoint
      if (response.status === 401) {
        // Don't try to parse the response, just redirect
        window.location.href = `${this.baseUrl}/auth/login`;
        // Return a promise that never resolves - the page is redirecting
        return new Promise(() => {});
      }

      // Handle other error statuses
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorData || response.statusText}`);
      }

      // Parse successful response
      const data = await response.json();
      return data as T;
    } catch (error) {
      // If it's a network error or parsing error, re-throw
      throw error;
    }
  }
}

export const ApiClient = new ApiClientClass();