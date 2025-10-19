const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://portfolio-generator-fbbp.onrender.com";

export class ApiClient {
  static async fetch(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      credentials: 'include', // Important: include cookies
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    // If unauthorized, redirect to login
    if (response.status === 401) {
      // Store the current page to redirect back after login
      if (typeof window !== 'undefined') {
        const currentPath = window.location.pathname;
        sessionStorage.setItem('redirectAfterLogin', currentPath);
        window.location.href = `${API_BASE}/auth/login?returnUrl=${encodeURIComponent(currentPath)}`;
      }
      throw new Error('Unauthorized');
    }

    // Handle other errors
    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch {
        try {
          errorMessage = await response.text();
        } catch {
          // Keep default error message
        }
      }
      throw new Error(errorMessage);
    }

    return response;
  }

  static async get(endpoint: string) {
    const response = await this.fetch(endpoint, { method: 'GET' });
    return response.json();
  }

  static async post(endpoint: string, data: any) {
    const response = await this.fetch(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.json();
  }

  static async put(endpoint: string, data: any) {
    const response = await this.fetch(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.json();
  }

  static async delete(endpoint: string) {
    const response = await this.fetch(endpoint, { method: 'DELETE' });
    return response.json();
  }

  static getBaseUrl() {
    return API_BASE;
  }
}

// Export helper for login redirect
export function redirectToLogin(returnUrl?: string) {
  if (typeof window !== 'undefined') {
    const url = returnUrl || window.location.pathname;
    sessionStorage.setItem('redirectAfterLogin', url);
    window.location.href = `${API_BASE}/auth/login?returnUrl=${encodeURIComponent(url)}`;
  }
}