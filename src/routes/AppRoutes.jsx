import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Layouts
import { OwnerLayout } from '../layouts/OwnerLayout';
import { TenantLayout } from '../layouts/TenantLayout';

// Auth Pages
import { Login } from '../pages/auth/Login';
import { Register, ForgotPassword } from '../pages/auth/RegisterAndForgot';

// Owner Pages
import { Dashboard as OwnerDashboard } from '../pages/owner/Dashboard';
import { Properties } from '../pages/owner/Properties';
import { PropertyDetails } from '../pages/owner/PropertyDetails';
import { Rooms } from '../pages/owner/Rooms';
import { RoomDetails } from '../pages/owner/RoomDetails';
import { Tenants } from '../pages/owner/Tenants';
import { TenantDetails } from '../pages/owner/TenantDetails';
import { RentManagement } from '../pages/owner/RentManagement';
import { Payments } from '../pages/owner/Payments';
import { Problems } from '../pages/owner/Problems';
import { ComplaintDetails } from '../pages/owner/ComplaintDetails';
import { Notifications as OwnerNotifications, Announcements, Reports, Settings } from '../pages/owner/OwnerExtras';

// Tenant Pages
import { TenantDashboard } from '../pages/tenant/Dashboard';
import { RentPayment } from '../pages/tenant/RentPayment';
import { TenantNotifications } from '../pages/tenant/Notifications';
import { TenantProblems, TenantProblemDetails } from '../pages/tenant/Problems';

// Protected Route Guards
const OwnerRoute = ({ children }) => {
  const { isAuthenticated, isOwner } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isOwner) return <Navigate to="/tenant/dashboard" replace />;
  return children;
};

const TenantRoute = ({ children }) => {
  const { isAuthenticated, isTenant } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isTenant) return <Navigate to="/owner/dashboard" replace />;
  return children;
};

const RootRedirect = () => {
  const { isAuthenticated, isOwner } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return isOwner ? <Navigate to="/owner/dashboard" replace /> : <Navigate to="/tenant/dashboard" replace />;
};

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Root */}
      <Route path="/" element={<RootRedirect />} />

      {/* Public Auth Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* Owner Protected Routes */}
      <Route
        path="/owner"
        element={
          <OwnerRoute>
            <OwnerLayout />
          </OwnerRoute>
        }
      >
        <Route index element={<Navigate to="/owner/dashboard" replace />} />
        <Route path="dashboard" element={<OwnerDashboard />} />
        <Route path="properties" element={<Properties />} />
        <Route path="properties/:id" element={<PropertyDetails />} />
        <Route path="rooms" element={<Rooms />} />
        <Route path="rooms/:id" element={<RoomDetails />} />
        <Route path="tenants" element={<Tenants />} />
        <Route path="tenants/:id" element={<TenantDetails />} />
        <Route path="rent" element={<RentManagement />} />
        <Route path="payments" element={<Payments />} />
        <Route path="problems" element={<Problems />} />
        <Route path="problems/:id" element={<ComplaintDetails />} />
        <Route path="notifications" element={<OwnerNotifications />} />
        <Route path="announcements" element={<Announcements />} />
        <Route path="reports" element={<Reports />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      {/* Tenant Protected Routes */}
      <Route
        path="/tenant"
        element={
          <TenantRoute>
            <TenantLayout />
          </TenantRoute>
        }
      >
        <Route index element={<Navigate to="/tenant/dashboard" replace />} />
        <Route path="dashboard" element={<TenantDashboard />} />
        <Route path="rent" element={<RentPayment />} />
        <Route path="notifications" element={<TenantNotifications />} />
        <Route path="problem" element={<TenantProblems />} />
        <Route path="problems/:id" element={<TenantProblemDetails />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
