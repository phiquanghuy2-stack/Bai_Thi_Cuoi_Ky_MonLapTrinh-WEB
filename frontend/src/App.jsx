import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import PublicLayout from './components/layout/PublicLayout';
import TenantLayout from './components/layout/TenantLayout';
import AdminLayout from './components/layout/AdminLayout';
import ProtectedRoute from './components/routing/ProtectedRoute';

// Guest & Auth Pages
import GuestHomePage from './pages/guest/GuestHomePage';
import RoomDetailPage from './pages/guest/RoomDetailPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Tenant Pages
import TenantDashboardPage from './pages/tenant/TenantDashboardPage';
import TenantInvoicesPage from './pages/tenant/TenantInvoicesPage';
import TenantRepairsPage from './pages/tenant/TenantRepairsPage';

// Admin Pages
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminUtilityTablePage from './pages/admin/AdminUtilityTablePage';
import AdminRoomsPage from './pages/admin/AdminRoomsPage';
import AdminContractsPage from './pages/admin/AdminContractsPage';
import AdminRepairsPage from './pages/admin/AdminRepairsPage';
import AdminTenantsPage from './pages/admin/AdminTenantsPage';

// 404 Page
import NotFoundPage from './pages/NotFoundPage';

const App = () => {
  return (
    <Routes>
      {/* Nested Routes cho Khách (Guest) & Xác thực */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<GuestHomePage />} />
        <Route path="/rooms/:id" element={<RoomDetailPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* Nested Routes được bảo vệ cho Người thuê (Tenant) */}
      <Route
        path="/tenant"
        element={
          <ProtectedRoute allowedRoles={['tenant']}>
            <TenantLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<TenantDashboardPage />} />
        <Route path="invoices" element={<TenantInvoicesPage />} />
        <Route path="repairs" element={<TenantRepairsPage />} />
      </Route>

      {/* Nested Routes được bảo vệ cho Chủ trọ (Admin) */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboardPage />} />
        <Route path="utility-sheet" element={<AdminUtilityTablePage />} />
        <Route path="rooms" element={<AdminRoomsPage />} />
        <Route path="contracts" element={<AdminContractsPage />} />
        <Route path="repairs" element={<AdminRepairsPage />} />
        <Route path="tenants" element={<AdminTenantsPage />} />
      </Route>

      {/* Trang 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default App;
