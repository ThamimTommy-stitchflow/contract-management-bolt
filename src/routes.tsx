import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { AppManagement } from './features/apps/AppManagement';
import { useCompany } from './contexts/CompanyContext';

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useCompany();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/apps"
        element={
          <RequireAuth>
            <AppManagement />
          </RequireAuth>
        }
      />
      <Route path="/" element={<Navigate to="/apps" replace />} />
    </Routes>
  );
} 