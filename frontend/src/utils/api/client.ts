/**
 * API Client for Django Backend
 * Replaces Supabase client
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

// ============================================
// TYPES
// ============================================

interface ApiError {
  error: string;
  details?: any;
}

interface AuthTokens {
  access: string;
  refresh: string;
}

interface LoginResponse {
  user: any;
  tokens: AuthTokens;
}

// ============================================
// TOKEN MANAGEMENT
// ============================================

class TokenManager {
  private static ACCESS_TOKEN_KEY = 'access_token';
  private static REFRESH_TOKEN_KEY = 'refresh_token';

  static getAccessToken(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  static getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  static setTokens(access: string, refresh: string): void {
    localStorage.setItem(this.ACCESS_TOKEN_KEY, access);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, refresh);
  }

  static clearTokens(): void {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
  }

  static async refreshAccessToken(): Promise<string | null> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) return null;

    try {
      const response = await fetch(`${API_BASE_URL}/auth/token/refresh/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh: refreshToken }),
      });

      if (!response.ok) {
        this.clearTokens();
        return null;
      }

      const data = await response.json();
      localStorage.setItem(this.ACCESS_TOKEN_KEY, data.access);
      return data.access;
    } catch (error) {
      this.clearTokens();
      return null;
    }
  }
}

// ============================================
// HTTP CLIENT
// ============================================

interface FetchOptions {
  method?: string;
  body?: any;
  requiresAuth?: boolean;
  headers?: Record<string, string>;
}

async function fetchApi<T = any>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const {
    method = 'GET',
    body,
    requiresAuth = false,
    headers: customHeaders = {},
  } = options;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...customHeaders,
  };

  // Add auth token if required
  if (requiresAuth) {
    const token = TokenManager.getAccessToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const config: RequestInit = {
    method,
    headers,
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  try {
    let response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    // Handle 401 - try to refresh token
    if (response.status === 401 && requiresAuth) {
      const newToken = await TokenManager.refreshAccessToken();
      if (newToken) {
        headers['Authorization'] = `Bearer ${newToken}`;
        response = await fetch(`${API_BASE_URL}${endpoint}`, { ...config, headers });
      }
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || data.detail || `HTTP ${response.status}`);
    }

    return data as T;
  } catch (error) {
    console.error(`API Error [${method} ${endpoint}]:`, error);
    throw error;
  }
}

// ============================================
// AUTH API
// ============================================

export const authApi = {
  async register(email: string, password: string, name: string, phone?: string) {
    const response = await fetchApi<LoginResponse>('/auth/register/', {
      method: 'POST',
      body: { email, password, password_confirm: password, name, phone },
    });
    TokenManager.setTokens(response.tokens.access, response.tokens.refresh);
    return response.user;
  },

  async login(email: string, password: string) {
    const response = await fetchApi<LoginResponse>('/auth/login/', {
      method: 'POST',
      body: { email, password },
    });
    TokenManager.setTokens(response.tokens.access, response.tokens.refresh);
    return response.user;
  },

  async logout() {
    TokenManager.clearTokens();
  },

  async getCurrentUser() {
    return fetchApi('/auth/me/', { requiresAuth: true });
  },

  isAuthenticated(): boolean {
    return TokenManager.getAccessToken() !== null;
  },
};

// ============================================
// PRODUCTS API
// ============================================

export const productsApi = {
  getAll: (params?: { active?: boolean; category?: string; search?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.active !== undefined) queryParams.append('active', String(params.active));
    if (params?.category) queryParams.append('category', params.category);
    if (params?.search) queryParams.append('search', params.search);
    
    const query = queryParams.toString();
    return fetchApi(`/products/${query ? `?${query}` : ''}`);
  },

  getBySlug: (slug: string) => fetchApi(`/products/${slug}/`),

  getFeatured: () => fetchApi('/products/featured/'),

  getRecommended: () => fetchApi('/products/recommended/'),

  search: (query: string) => fetchApi(`/products/search/?q=${encodeURIComponent(query)}`),

  create: (data: any) =>
    fetchApi('/products/', {
      method: 'POST',
      body: data,
      requiresAuth: true,
    }),

  update: (slug: string, data: any) =>
    fetchApi(`/products/${slug}/`, {
      method: 'PUT',
      body: data,
      requiresAuth: true,
    }),

  delete: (slug: string) =>
    fetchApi(`/products/${slug}/`, {
      method: 'DELETE',
      requiresAuth: true,
    }),
};

// ============================================
// CATEGORIES API
// ============================================

export const categoriesApi = {
  getAll: () => fetchApi('/categories/'),

  getBySlug: (slug: string) => fetchApi(`/categories/${slug}/`),

  create: (data: any) =>
    fetchApi('/categories/', {
      method: 'POST',
      body: data,
      requiresAuth: true,
    }),

  update: (slug: string, data: any) =>
    fetchApi(`/categories/${slug}/`, {
      method: 'PUT',
      body: data,
      requiresAuth: true,
    }),

  delete: (slug: string) =>
    fetchApi(`/categories/${slug}/`, {
      method: 'DELETE',
      requiresAuth: true,
    }),
};

// ============================================
// ORDERS API
// ============================================

export const ordersApi = {
  getAll: () => fetchApi('/orders/', { requiresAuth: true }),

  getById: (id: string) => fetchApi(`/orders/${id}/`, { requiresAuth: true }),

  create: (data: any) =>
    fetchApi('/orders/', {
      method: 'POST',
      body: data,
      requiresAuth: false, // Can create as guest
    }),

  updateStatus: (id: string, status: string) =>
    fetchApi(`/orders/${id}/update_status/`, {
      method: 'PATCH',
      body: { status },
      requiresAuth: true,
    }),
};

// ============================================
// CART API
// ============================================

export const cartApi = {
  get: () => fetchApi('/cart/', { requiresAuth: true }),

  addItem: (productId: string, quantity: number = 1) =>
    fetchApi('/cart/add_item/', {
      method: 'POST',
      body: { product_id: productId, quantity },
      requiresAuth: true,
    }),

  updateItem: (itemId: string, quantity: number) =>
    fetchApi('/cart/update_item/', {
      method: 'PATCH',
      body: { item_id: itemId, quantity },
      requiresAuth: true,
    }),

  removeItem: (itemId: string) =>
    fetchApi('/cart/remove_item/', {
      method: 'DELETE',
      body: { item_id: itemId },
      requiresAuth: true,
    }),

  clear: () =>
    fetchApi('/cart/clear/', {
      method: 'POST',
      requiresAuth: true,
    }),
};

// ============================================
// REVIEWS API
// ============================================

export const reviewsApi = {
  getByProduct: (productId: string) =>
    fetchApi(`/reviews/?product=${productId}`),

  create: (data: any) =>
    fetchApi('/reviews/', {
      method: 'POST',
      body: data,
      requiresAuth: true,
    }),

  update: (id: string, data: any) =>
    fetchApi(`/reviews/${id}/`, {
      method: 'PUT',
      body: data,
      requiresAuth: true,
    }),

  delete: (id: string) =>
    fetchApi(`/reviews/${id}/`, {
      method: 'DELETE',
      requiresAuth: true,
    }),
};

// ============================================
// EXPORT DEFAULT CLIENT
// ============================================

export default {
  auth: authApi,
  products: productsApi,
  categories: categoriesApi,
  orders: ordersApi,
  cart: cartApi,
  reviews: reviewsApi,
};
