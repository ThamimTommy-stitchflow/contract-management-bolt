import api from './api';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
}

export const authService = {
  async login(credentials: LoginCredentials) {
    const formData = new FormData();
    formData.append('username', credentials.email);
    formData.append('password', credentials.password);
    
    const response = await api.post('/auth/login', formData);
    if (response.data.access_token) {
      localStorage.setItem('auth_token', response.data.access_token);
    }
    return response.data;
  },

  async register(data: RegisterData) {
    const response = await api.post('/auth/signup', data);
    return response.data;
  },

  async getCurrentUser() {
    const response = await api.get('/users/me');
    return response.data;
  },

  logout() {
    localStorage.removeItem('auth_token');
  }
};