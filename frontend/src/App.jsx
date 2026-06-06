import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { StateProvider, useAppState } from './context/StateContext';

import Login from './pages/Login';
import Registration from './pages/Registration';
import Dashboard from './pages/Dashboard';
import Vendors from './pages/Vendors';
import CreateRFQ from './pages/CreateRFQ';
import SubmitQuotation from './pages/SubmitQuotation';
import QuotationComparison from './pages/QuotationComparison';
import ApprovalWorkflow from './pages/ApprovalWorkflow';
import PurchaseOrders from './pages/PurchaseOrders';
import Reports from './pages/Reports';
import ActivityLogs from './pages/ActivityLogs';
import AdminUserManagement from './pages/AdminUserManagement';

// Full-screen loading spinner while auth state is being resolved
const LoadingScreen = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#f9f9ff' }}>
    <div style={{ textAlign: 'center' }}>
      <div style={{ width: 40, height: 40, border: '4px solid #c2c6d4', borderTopColor: '#0053a6', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
      <p style={{ color: '#424752', fontSize: 14 }}>Loading VendorBridge...</p>
    </div>
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

// Redirect unauthenticated users to login
const ProtectedRoute = ({ children }) => {
  const { user, isLoading } = useAppState();
  if (isLoading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

// Block a route for roles not in `allowedRoles`; redirects to their home
const RoleRoute = ({ children, allowedRoles }) => {
  const { user, isLoading } = useAppState();
  if (isLoading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to={user.role === 'vendor' ? '/submit-quotation' : '/dashboard'} replace />;
  }
  return children;
};

function AppRoutes() {
  const { user, isLoading } = useAppState();

  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Registration />} />

      {/* Dashboard — not for vendors */}
      <Route path="/dashboard" element={
        <RoleRoute allowedRoles={['admin', 'officer', 'manager']}>
          <Dashboard />
        </RoleRoute>
      } />

      {/* Vendors — not for vendor role */}
      <Route path="/vendors" element={
        <RoleRoute allowedRoles={['admin', 'officer', 'manager']}>
          <Vendors />
        </RoleRoute>
      } />

      {/* Create RFQ — officer only (admin views via read-only) */}
      <Route path="/create-rfq" element={
        <RoleRoute allowedRoles={['admin', 'officer']}>
          <CreateRFQ />
        </RoleRoute>
      } />

      {/* Admin: User Management */}
      <Route path="/admin/users" element={
        <RoleRoute allowedRoles={['admin']}>
          <AdminUserManagement />
        </RoleRoute>
      } />

      {/* Submit Quotation — vendor primary, others view-only (handled inside page) */}
      <Route path="/submit-quotation" element={
        <ProtectedRoute>
          <SubmitQuotation />
        </ProtectedRoute>
      } />

      {/* Quotation Comparison — officer + manager only */}
      <Route path="/quotation-comparison" element={
        <RoleRoute allowedRoles={['officer', 'manager']}>
          <QuotationComparison />
        </RoleRoute>
      } />

      {/* Approvals — officer + manager only (admin approves via User Management) */}
      <Route path="/approvals" element={
        <RoleRoute allowedRoles={['officer', 'manager']}>
          <ApprovalWorkflow />
        </RoleRoute>
      } />

      {/* Purchase Orders — vendor can view their own (handled inside page) */}
      <Route path="/purchase-orders" element={
        <ProtectedRoute>
          <PurchaseOrders />
        </ProtectedRoute>
      } />

      {/* Reports — not for vendor */}
      <Route path="/reports" element={
        <RoleRoute allowedRoles={['admin', 'officer', 'manager']}>
          <Reports />
        </RoleRoute>
      } />

      {/* Activity Logs — not for vendor */}
      <Route path="/activity-logs" element={
        <RoleRoute allowedRoles={['admin', 'officer', 'manager']}>
          <ActivityLogs />
        </RoleRoute>
      } />

      {/* Fallback — send to correct home based on role */}
      <Route path="*" element={
        isLoading
          ? <LoadingScreen />
          : user
            ? <Navigate to={user.role === 'vendor' ? '/submit-quotation' : '/dashboard'} replace />
            : <Navigate to="/login" replace />
      } />
    </Routes>
  );
}

function App() {
  return (
    <StateProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </StateProvider>
  );
}

export default App;
