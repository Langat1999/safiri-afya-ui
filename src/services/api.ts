const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Helper function to get auth token
const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

// Helper function to make authenticated requests
const authFetch = async (url: string, options: RequestInit = {}) => {
  const token = getAuthToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }

  return response.json();
};

// ============= AUTHENTICATION =============

export const authAPI = {
  register: async (data: { email: string; password: string; name: string }) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Registration failed');
    }

    const result = await response.json();
    localStorage.setItem('authToken', result.token);
    localStorage.setItem('user', JSON.stringify(result.user));
    return result;
  },

  login: async (data: { email: string; password: string }) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Login failed');
    }

    const result = await response.json();
    localStorage.setItem('authToken', result.token);
    localStorage.setItem('user', JSON.stringify(result.user));
    return result;
  },

  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  },

  getProfile: async () => {
    return authFetch(`${API_BASE_URL}/user/profile`);
  },

  isAuthenticated: () => {
    return !!getAuthToken();
  },

  getUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  refreshToken: async () => {
    return authFetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
    });
  },

  forgotPassword: async (email: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to request password reset');
    }

    return response.json();
  },

  verifyResetCode: async (email: string, code: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/verify-reset-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Invalid reset code');
    }

    return response.json();
  },

  resetPassword: async (email: string, code: string, newPassword: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code, newPassword }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to reset password');
    }

    return response.json();
  },
};

// ============= CLINICS =============

export const clinicsAPI = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/clinics`);
    if (!response.ok) throw new Error('Failed to fetch clinics');
    return response.json();
  },

  getById: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/clinics/${id}`);
    if (!response.ok) throw new Error('Failed to fetch clinic');
    return response.json();
  },

  search: async (location: string) => {
    const response = await fetch(`${API_BASE_URL}/clinics/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ location }),
    });
    if (!response.ok) throw new Error('Failed to search clinics');
    return response.json();
  },

  getNearby: async (lat: number, lng: number, maxDistance?: number) => {
    const response = await fetch(`${API_BASE_URL}/clinics/nearby`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lat, lng, maxDistance }),
    });
    if (!response.ok) throw new Error('Failed to fetch nearby clinics');
    return response.json();
  },
};

// ============= DOCTORS =============

export const doctorsAPI = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/doctors`);
    if (!response.ok) throw new Error('Failed to fetch doctors');
    return response.json();
  },

  getById: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/doctors/${id}`);
    if (!response.ok) throw new Error('Failed to fetch doctor');
    return response.json();
  },

  getAvailability: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/doctors/${id}/availability`);
    if (!response.ok) throw new Error('Failed to fetch availability');
    return response.json();
  },
};

// ============= APPOINTMENTS =============

export const appointmentsAPI = {
  create: async (data: {
    doctorId: string;
    date: string;
    time: string;
    reason: string;
    name: string;
    email: string;
    phone: string;
  }) => {
    return authFetch(`${API_BASE_URL}/appointments`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getAll: async () => {
    return authFetch(`${API_BASE_URL}/appointments`);
  },

  getById: async (id: string) => {
    return authFetch(`${API_BASE_URL}/appointments/${id}`);
  },

  update: async (id: string, data: { date?: string; time?: string; reason?: string; status?: string }) => {
    return authFetch(`${API_BASE_URL}/appointments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  cancel: async (id: string) => {
    return authFetch(`${API_BASE_URL}/appointments/${id}`, {
      method: 'DELETE',
    });
  },
};

// ============= SYMPTOMS =============

export const symptomsAPI = {
  analyze: async (symptoms: string, userId?: string, ageRange?: string, gender?: string) => {
    const response = await fetch(`${API_BASE_URL}/symptoms/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ symptoms, userId, ageRange, gender }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Analysis failed');
    }

    return response.json();
  },

  getHistory: async () => {
    return authFetch(`${API_BASE_URL}/symptoms/history`);
  },
};

// ============= BOOKINGS =============

export const bookingsAPI = {
  create: async (data: {
    facilityId: string;
    patientName: string;
    patientPhone: string;
    appointmentDate: string;
    appointmentTime: string;
    symptoms: string;
  }) => {
    const response = await fetch(`${API_BASE_URL}/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create booking');
    return response.json();
  },

  getById: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/bookings/${id}`);
    if (!response.ok) throw new Error('Failed to fetch booking');
    return response.json();
  },
};

// ============= PAYMENTS =============

export const paymentsAPI = {
  initiate: async (data: { bookingId: string; phoneNumber: string }) => {
    const response = await fetch(`${API_BASE_URL}/payments/initiate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to initiate payment');
    }
    return response.json();
  },

  getStatus: async (paymentId: string) => {
    const response = await fetch(`${API_BASE_URL}/payments/${paymentId}/status`);
    if (!response.ok) throw new Error('Failed to fetch payment status');
    return response.json();
  },

  getByCheckoutRequestId: async (checkoutRequestId: string) => {
    const response = await fetch(`${API_BASE_URL}/payments/checkout/${checkoutRequestId}`);
    if (!response.ok) throw new Error('Failed to fetch payment');
    return response.json();
  },
};

// ============= USER PROFILE =============

export const profileAPI = {
  get: async () => {
    return authFetch(`${API_BASE_URL}/user/profile`);
  },

  update: async (data: {
    name?: string;
    phone?: string;
    dateOfBirth?: string;
    gender?: string;
    location?: string;
    profilePicture?: string;
  }) => {
    return authFetch(`${API_BASE_URL}/user/profile`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  changePassword: async (data: {
    currentPassword: string;
    newPassword: string;
  }) => {
    return authFetch(`${API_BASE_URL}/user/change-password`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
};

// ============= USER SETTINGS =============

export const settingsAPI = {
  get: async () => {
    return authFetch(`${API_BASE_URL}/user/settings`);
  },

  update: async (data: {
    notifications?: any;
    privacy?: any;
    preferences?: any;
  }) => {
    return authFetch(`${API_BASE_URL}/user/settings`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteAccount: async (password: string) => {
    return authFetch(`${API_BASE_URL}/user/account`, {
      method: 'DELETE',
      body: JSON.stringify({ password }),
    });
  },
};

// ============= HEALTH NEWS =============

export const newsAPI = {
  getHealthNews: async () => {
    const response = await fetch(`${API_BASE_URL}/news/health`);
    if (!response.ok) throw new Error('Failed to fetch health news');
    return response.json();
  },
};

// ============= HEALTH CHECK =============

export const healthAPI = {
  check: async () => {
    const response = await fetch(`${API_BASE_URL}/health`);
    if (!response.ok) throw new Error('Health check failed');
    return response.json();
  },
};
