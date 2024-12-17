import React from 'react';
import { useAuthStore } from './store/authStore';
import { LoginForm } from './components/auth/LoginForm';
import { AppManagement } from './features/apps/AppManagement';

export default function App() {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);

  return isAuthenticated ? <AppManagement /> : <LoginForm />;
}