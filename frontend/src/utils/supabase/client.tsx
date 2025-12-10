import { projectId, publicAnonKey } from './info';

const baseUrl = `https://${projectId}.supabase.co/functions/v1/make-server-26b9a347`;

interface FetchOptions {
  method?: string;
  body?: any;
  token?: string;
}

async function fetchApi(endpoint: string, options: FetchOptions = {}) {
  const { method = 'GET', body, token } = options;
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token || publicAnonKey}`,
  };

  const config: RequestInit = {
    method,
    headers,
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${baseUrl}${endpoint}`, config);
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || `HTTP ${response.status}: ${data.details || 'Request failed'}`);
    }

    return data;
  } catch (error) {
    console.error(`API Error [${method} ${endpoint}]:`, error);
    throw error;
  }
}

// ============= PRODUCTS API =============
export const productsApi = {
  // Get all products (supports ?active=true query)
  getAll: (activeOnly = false) => 
    fetchApi(`/products${activeOnly ? '?active=true' : ''}`),
  
  // Get single product by ID
  getById: (id: string) => 
    fetchApi(`/products/${id}`),
  
  // Create new product
  create: (product: any) => 
    fetchApi('/products', { method: 'POST', body: product }),
  
  // Update existing product
  update: (id: string, product: any) => 
    fetchApi(`/products/${id}`, { method: 'PUT', body: product }),
  
  // Delete product (soft delete)
  delete: (id: string) => 
    fetchApi(`/products/${id}`, { method: 'DELETE' }),
  
  // Update product stock
  updateStock: (id: string, quantity: number, reason: string) =>
    fetchApi(`/products/${id}/stock`, { 
      method: 'PATCH', 
      body: { quantity, reason } 
    }),
  
  // Increment view count
  incrementViewCount: (id: string) =>
    fetchApi(`/products/${id}/views`, { method: 'PATCH' }),
  
  // Increment sales count
  incrementSalesCount: (id: string, quantity: number) =>
    fetchApi(`/products/${id}/sales`, { 
      method: 'PATCH', 
      body: { quantity } 
    }),
};

// ============= ORDERS API =============
export const ordersApi = {
  // Get all orders (supports ?status=pending query)
  getAll: (status?: string) => 
    fetchApi(`/orders${status ? `?status=${status}` : ''}`),
  
  // Get single order by ID
  getById: (id: string) => 
    fetchApi(`/orders/${id}`),
  
  // Create new order
  create: (order: any) => 
    fetchApi('/orders', { method: 'POST', body: order }),
  
  // Update order
  update: (id: string, updates: any) =>
    fetchApi(`/orders/${id}`, { method: 'PUT', body: updates }),
  
  // Update order status
  updateStatus: (id: string, status: string, notes?: string) =>
    fetchApi(`/orders/${id}/status`, { 
      method: 'PATCH', 
      body: { status, notes } 
    }),
  
  // Get all customers
  getCustomers: () =>
    fetchApi('/customers'),
  
  // Update customer
  updateCustomer: (id: string, updates: any) =>
    fetchApi(`/customers/${id}`, { method: 'PUT', body: updates }),
};

// ============= CATEGORIES API =============
export const categoriesApi = {
  // Get all categories
  getAll: () => 
    fetchApi('/categories'),
  
  // Update categories
  update: (categories: any[]) => 
    fetchApi('/categories', { method: 'PUT', body: { categories } }),
};

// ============= SETTINGS API =============
export const settingsApi = {
  // Get store settings
  get: () => 
    fetchApi('/settings'),
  
  // Update store settings
  update: (settings: any) => 
    fetchApi('/settings', { method: 'PUT', body: settings }),
};

// ============= ANALYTICS API =============
export const analyticsApi = {
  // Get dashboard statistics
  getDashboard: () => 
    fetchApi('/analytics/dashboard'),
};

// ============= AUTH API =============
export const authApi = {
  // Sign up new user
  signup: (email: string, password: string, name: string) =>
    fetchApi('/auth/signup', { 
      method: 'POST', 
      body: { email, password, name } 
    }),
  
  // Get current user profile
  getProfile: (token: string) =>
    fetchApi('/auth/profile', { token }),
};

// ============= SYSTEM API =============
export const systemApi = {
  // Health check
  health: () => 
    fetchApi('/health'),
  
  // Initialize demo data
  init: () => 
    fetchApi('/init', { method: 'POST' }),
  
  // Reset all data (use with caution!)
  reset: () => 
    fetchApi('/reset', { method: 'POST' }),
};

// Export convenience function for custom queries
export { fetchApi };