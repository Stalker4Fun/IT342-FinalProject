import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { ProtectedRoute, RoleRoute, PublicOnlyRoute } from './components/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DonorDashboard } from './pages/DonorDashboard';
import { RecipientDashboard } from './pages/RecipientDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminRecipientsPage } from './pages/AdminRecipientsPage';
import { UnauthorizedPage } from './pages/UnauthorizedPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { getDashboardPathForRole } from './config/navigation';

const RootRedirect = () => {
  const { user, token, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-9 h-9 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={getDashboardPathForRole(user.role)} replace />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col bg-slate-50">
          <Navbar />
          <main className="flex-1">
            <Routes>
              {/* Root redirect */}
              <Route path="/" element={<RootRedirect />} />

              {/* Public routes (redirect to dashboard if already logged in) */}
              <Route
                path="/login"
                element={
                  <PublicOnlyRoute>
                    <LoginPage />
                  </PublicOnlyRoute>
                }
              />
              <Route
                path="/register"
                element={
                  <PublicOnlyRoute>
                    <RegisterPage />
                  </PublicOnlyRoute>
                }
              />

              {/* Donor routes */}
              <Route
                path="/donor/dashboard"
                element={
                  <RoleRoute allowedRoles="DONOR">
                    <DonorDashboard />
                  </RoleRoute>
                }
              />

              {/* Recipient routes */}
              <Route
                path="/recipient/dashboard"
                element={
                  <RoleRoute allowedRoles="RECIPIENT">
                    <RecipientDashboard />
                  </RoleRoute>
                }
              />

              {/* Admin routes */}
              <Route
                path="/admin/dashboard"
                element={
                  <RoleRoute allowedRoles="ADMIN">
                    <AdminDashboard />
                  </RoleRoute>
                }
              />
              <Route
                path="/admin/recipients"
                element={
                  <RoleRoute allowedRoles="ADMIN">
                    <AdminRecipientsPage />
                  </RoleRoute>
                }
              />

              {/* Access denied & Not found */}
              <Route path="/unauthorized" element={<UnauthorizedPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
