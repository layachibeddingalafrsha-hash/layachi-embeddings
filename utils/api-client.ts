// Centralized API client for frontend requests
// Provides consistent headers, error handling, and base URL management

const BASE_URL = typeof window !== 'undefined' ? window.location.origin : '';

interface FetchOptions extends RequestInit {
  params?: Record<string, string | number | boolean>;
}

/**
 * Centralized fetch wrapper with consistent headers and error handling
 */
async function apiFetch<T = any>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const { params, ...fetchOptions } = options;

  // Build URL with query params
  let url = `${BASE_URL}${endpoint}`;
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
  }

  // Default headers
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...fetchOptions.headers,
  };

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error);
    throw error;
  }
}

// ========================================
// PUBLIC API ENDPOINTS
// ========================================

export const publicAPI = {
  // Products
  products: {
    list: (params?: { limit?: number; page?: number; category?: string }) =>
      apiFetch('/api/products', { params }),
    
    getById: (id: string) =>
      apiFetch(`/api/products/${id}`),
    
    getBySlug: (slug: string) =>
      apiFetch(`/api/products/slug/${slug}`),
    
    getBundles: (productId: string) =>
      apiFetch(`/api/products/${productId}/bundles`),
  },

  // Wilayas & Communes
  location: {
    wilayas: () =>
      apiFetch<Array<{ _id: string; code: string; name: string }>>('/api/wilayas'),
    
    communes: (wilayaId: string | number) =>
      apiFetch<string[]>('/api/communes', { params: { wilayaId } }),
  },

  // Shipping
  shipping: {
    getRate: (wilayaCode: string, method: 'to_home' | 'to_desk') =>
      apiFetch<{ price: number }>('/api/shipping-rate', {
        params: { wilaya: wilayaCode, method },
      }),
  },

  // Orders
  orders: {
    create: (orderData: any) =>
      apiFetch('/api/orders', {
        method: 'POST',
        body: JSON.stringify(orderData),
      }),
  },

  // Categories
  categories: {
    list: () =>
      apiFetch('/api/categories'),
  },

  // Contact
  contact: {
    submit: (data: any) =>
      apiFetch('/api/contact', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },
};

// ========================================
// ADMIN API ENDPOINTS
// ========================================

export const adminAPI = {
  // Orders
  orders: {
    list: (params?: {
      page?: number;
      limit?: number;
      search?: string;
      status?: string;
      paymentStatus?: string;
      sortBy?: string;
      sortOrder?: string;
    }) =>
      apiFetch('/api/admin/orders', { params }),
    
    create: (orderData: any) =>
      apiFetch('/api/admin/orders', {
        method: 'POST',
        body: JSON.stringify(orderData),
      }),
    
    update: (id: string, data: any) =>
      apiFetch(`/api/admin/orders/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
  },

  // Products
  products: {
    list: (params?: { page?: number; limit?: number; search?: string }) =>
      apiFetch('/api/admin/products', { params }),
    
    create: (productData: any) =>
      apiFetch('/api/admin/products', {
        method: 'POST',
        body: JSON.stringify(productData),
      }),
    
    update: (id: string, data: any) =>
      apiFetch(`/api/admin/products/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    
    delete: (id: string) =>
      apiFetch(`/api/admin/products/${id}`, { method: 'DELETE' }),
  },

  // Bundles
  bundles: {
    list: () =>
      apiFetch('/api/admin/bundles'),
    
    create: (bundleData: any) =>
      apiFetch('/api/admin/bundles', {
        method: 'POST',
        body: JSON.stringify(bundleData),
      }),
    
    update: (id: string, data: any) =>
      apiFetch(`/api/admin/bundles/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    
    delete: (id: string) =>
      apiFetch(`/api/admin/bundles/${id}`, { method: 'DELETE' }),
  },

  // Shipping
  shipping: {
    list: (search?: string) =>
      apiFetch<{ wilayas: any[] }>('/api/admin/shipping', {
        params: search ? { search } : undefined,
      }),
    
    update: (id: string, data: any) =>
      apiFetch('/api/admin/shipping', {
        method: 'PUT',
        body: JSON.stringify({ id, ...data }),
      }),
  },

  // Stats
  stats: {
    get: () =>
      apiFetch('/api/admin/stats'),
  },

  // Messages
  messages: {
    list: () =>
      apiFetch('/api/admin/messages'),
  },

  // Expedition (Ecom-DZ)
  expedition: {
    sendOrder: (orderId: string) =>
      apiFetch('/api/admin/ecotrack/expedition', {
        method: 'POST',
        body: JSON.stringify({ action: 'send-order', orderId }),
      }),
    
    sendOrders: (orderIds: string[]) =>
      apiFetch('/api/admin/ecotrack/expedition', {
        method: 'POST',
        body: JSON.stringify({ action: 'send-orders', orderIds }),
      }),
    
    getStatus: (tracking: string) =>
      apiFetch('/api/admin/ecotrack/expedition', {
        method: 'POST',
        body: JSON.stringify({ action: 'get-status', tracking }),
      }),
    
    syncOrders: () =>
      apiFetch('/api/admin/ecotrack/expedition', {
        method: 'POST',
        body: JSON.stringify({ action: 'sync-orders' }),
      }),
    
    listExpedited: (params?: {
      page?: number;
      limit?: number;
      status?: string;
      situation?: string;
      startDate?: string;
      endDate?: string;
    }) =>
      apiFetch('/api/admin/ecotrack/expedition', {
        method: 'POST',
        body: JSON.stringify({ action: 'list-expedited', ...params }),
      }),
  },

  // Upload
  upload: {
    image: (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      return fetch(`${BASE_URL}/api/admin/upload`, {
        method: 'POST',
        body: formData,
      }).then(r => r.json());
    },
  },
};

export default apiFetch;
