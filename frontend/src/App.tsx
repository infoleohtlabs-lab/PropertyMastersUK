import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout, AuthLayout, ErrorLayout } from './components/layout';
import { LandingPage, Properties } from './pages';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import AdminLogin from './pages/auth/AdminLogin';
import AgentLogin from './pages/auth/AgentLogin';
import BuyerLogin from './pages/auth/BuyerLogin';
import LandlordLogin from './pages/auth/LandlordLogin';
import SolicitorLogin from './pages/auth/SolicitorLogin';
import TenantLogin from './pages/auth/TenantLogin';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { useAuthStore } from './stores/authStore';
import { UserRole } from './types';
import AgentDashboard from './pages/dashboards/AgentDashboard';
import BuyerDashboard from './pages/dashboards/BuyerDashboard';
import LandlordDashboard from './pages/dashboards/LandlordDashboard';
import TenantDashboard from './pages/dashboards/TenantDashboard';
import AdminDashboard from './pages/dashboards/AdminDashboard';
import SolicitorDashboard from './pages/dashboards/SolicitorDashboard';
import VrViewer from './components/VrViewer';
import VideoPlayer from './components/VideoPlayer';
import MarketAnalysis from './components/MarketAnalysis';
import BookingManagement from './pages/BookingManagement';
import CommunicationCenter from './pages/CommunicationCenter';
import Maintenance from './pages/Maintenance';
import Finances from './pages/Finances';
import PropertySearch from './components/PropertySearch';
import PropertyDetail from './pages/PropertyDetail';
import PropertyManagement from './pages/PropertyManagement';
import PropertyListing from './pages/PropertyListing';
import UserManagement from './pages/UserManagement';
import DocumentManagement from './pages/DocumentManagement';
import FinancialManagement from './components/FinancialManagement';
import TenantPortal from './pages/TenantPortal';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Notifications from './pages/Notifications';
import ReportsAnalytics from './pages/ReportsAnalytics';
import Search from './pages/Search';
import MarketAnalysisPage from './pages/MarketAnalysisPage';
import CRM from './pages/CRM';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import VirtualTours from './pages/VirtualTours';
import GDPRCompliance from './pages/GDPRCompliance';
import PropertyValuation from './pages/PropertyValuation';
import TenantReferencing from './pages/TenantReferencing';
import ContractorManagement from './pages/ContractorManagement';
import InvoiceGeneration from './pages/InvoiceGeneration';
import LegalDocumentManagement from './pages/LegalDocumentManagement';
import BookingCalendar from './pages/BookingCalendar';
import AdvancedSearch from './pages/AdvancedSearch';
import './App.css';

// Role-based route access definitions
const ROUTE_PERMISSIONS = {
  // Admin only routes
  '/user-management': ['admin'],
  '/dashboard/admin': ['admin'],
  
  // Agent routes
  '/property-management': ['admin', 'agent'],
  '/property-listing': ['admin', 'agent'],
  '/crm': ['admin', 'agent'],
  '/dashboard/agent': ['agent'],
  
  // Landlord routes
  '/dashboard/landlord': ['landlord'],
  
  // Tenant routes
  '/tenant-portal': ['admin', 'agent', 'tenant'],
  '/dashboard/tenant': ['tenant'],
  
  // Buyer routes
  '/dashboard/buyer': ['buyer'],
  
  // Solicitor routes
  '/dashboard/solicitor': ['solicitor'],
  
  // Multi-role routes
  '/market-analysis': ['admin', 'agent', 'landlord', 'buyer'],
  '/reports': ['admin', 'agent', 'landlord'],
  '/finances': ['admin', 'agent', 'landlord', 'tenant'],
  '/bookings': ['admin', 'agent', 'buyer', 'tenant'],
  '/communications': ['admin', 'agent', 'landlord', 'tenant', 'buyer', 'solicitor'],
  '/maintenance': ['admin', 'agent', 'landlord', 'tenant'],
  '/documents': ['admin', 'agent', 'landlord', 'tenant', 'solicitor']
} as const;

// Role-based Dashboard Router
const Dashboard: React.FC = () => {
  const { user } = useAuthStore();
  
  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }
  
  switch (user.role) {
    case UserRole.AGENT:
      return <AgentDashboard />;
    case UserRole.BUYER:
      return <BuyerDashboard />;
    case UserRole.LANDLORD:
      return <LandlordDashboard />;
    case UserRole.TENANT:
      return <TenantDashboard />;
    case UserRole.ADMIN:
      return <AdminDashboard />;
    case UserRole.SOLICITOR:
      return <SolicitorDashboard />;
    default:
      return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Welcome to your Dashboard, {user?.firstName}!
            </h1>
            <p className="text-gray-600 mb-6">
              Role: {user?.role}
            </p>
            <div className="text-center py-8">
              <p className="text-gray-500">Dashboard not configured for your role.</p>
            </div>
          </div>
        </div>
      );
  }
};

// Property Detail Component is now imported from pages

// 404 Not Found component
const NotFound: React.FC = () => {
  return (
    <div className="text-center py-12">
      <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
      <h2 className="text-2xl font-semibold text-gray-700 mb-4">
        Page Not Found
      </h2>
      <p className="text-gray-600 mb-8">
        The page you're looking for doesn't exist.
      </p>
      <a
        href="/"
        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
      >
        Go Home
      </a>
    </div>
  );
};

function App() {
  const { initializeAuth } = useAuthStore();

  useEffect(() => {
    // Initialize auth state on app startup
    initializeAuth();
  }, [initializeAuth]);

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={
            <Layout>
              <LandingPage />
            </Layout>
          } />
          
          <Route path="/properties" element={
            <Layout>
              <Properties />
            </Layout>
          } />
          
          <Route path="/terms" element={
            <Layout>
              <Terms />
            </Layout>
          } />
          
          <Route path="/privacy" element={
            <Layout>
              <Privacy />
            </Layout>
          } />
          
          <Route path="/property-valuation" element={
            <Layout>
              <PropertyValuation />
            </Layout>
          } />
          
          <Route path="/advanced-search" element={
            <Layout>
              <AdvancedSearch />
            </Layout>
          } />
          
          {/* Auth Routes */}
          <Route path="/auth/login" element={
            <ProtectedRoute requireAuth={false}>
              <AuthLayout>
                <Login />
              </AuthLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/auth/agent-login" element={
            <ProtectedRoute requireAuth={false}>
              <AgentLogin />
            </ProtectedRoute>
          } />
          
          <Route path="/auth/buyer-login" element={
            <ProtectedRoute requireAuth={false}>
              <BuyerLogin />
            </ProtectedRoute>
          } />
          
          <Route path="/auth/landlord-login" element={
            <ProtectedRoute requireAuth={false}>
              <LandlordLogin />
            </ProtectedRoute>
          } />
          
          <Route path="/auth/solicitor-login" element={
            <ProtectedRoute requireAuth={false}>
              <SolicitorLogin />
            </ProtectedRoute>
          } />
          
          <Route path="/auth/tenant-login" element={
            <ProtectedRoute requireAuth={false}>
              <TenantLogin />
            </ProtectedRoute>
          } />
          
          <Route path="/auth/admin-login" element={
            <ProtectedRoute requireAuth={false}>
              <AdminLogin />
            </ProtectedRoute>
          } />
          
          <Route path="/auth/register" element={
            <ProtectedRoute requireAuth={false}>
              <AuthLayout>
                <Register />
              </AuthLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/auth/forgot-password" element={
            <ProtectedRoute requireAuth={false}>
              <AuthLayout>
                <ForgotPassword />
              </AuthLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/auth/reset-password" element={
            <ProtectedRoute requireAuth={false}>
              <AuthLayout>
                <ResetPassword />
              </AuthLayout>
            </ProtectedRoute>
          } />
          
          {/* Protected Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          } />
          
          {/* Property Routes */}
          <Route path="/property/:id" element={
            <Layout>
              <PropertyDetail />
            </Layout>
          } />
          
          <Route path="/property/:id/vr" element={
            <Layout>
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <VrViewer 
                  propertyId="sample-property" 
                  propertyTitle="Sample Property VR Tour"
                  images={[
                    'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20living%20room%20interior&image_size=landscape_4_3',
                    'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20kitchen%20interior&image_size=landscape_4_3'
                  ]}
                />
              </div>
            </Layout>
          } />
          
          <Route path="/property/:id/video" element={
            <Layout>
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <VideoPlayer 
                  propertyId="sample-property" 
                  propertyTitle="Sample Property Video Tour"
                  videos={[
                    {
                      id: 'walkthrough',
                      title: 'Property Walkthrough',
                      url: '#',
                      thumbnail: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=property%20video%20thumbnail&image_size=landscape_16_9',
                      duration: 180,
                      type: 'walkthrough',
                      quality: [{ label: 'HD', value: '720p', url: '#' }]
                    }
                  ]}
                />
              </div>
            </Layout>
          } />
          
          {/* Search and Analysis Routes */}
          <Route path="/search" element={
            <Layout>
              <Search />
            </Layout>
          } />
          
          <Route path="/property-search" element={
            <Layout>
              <PropertySearch />
            </Layout>
          } />
          
          <Route path="/market-analysis" element={
            <ProtectedRoute requiredRoles={[UserRole.ADMIN, UserRole.AGENT, UserRole.LANDLORD, UserRole.BUYER]}>
              <Layout>
                <MarketAnalysisPage />
              </Layout>
            </ProtectedRoute>
          } />
          
          {/* Property Management Routes */}
          <Route path="/property-management" element={
            <ProtectedRoute requiredRoles={[UserRole.ADMIN, UserRole.AGENT]}>
              <Layout>
                <PropertyManagement />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/property-listing" element={
            <ProtectedRoute requiredRoles={[UserRole.ADMIN, UserRole.AGENT]}>
              <Layout>
                <PropertyListing />
              </Layout>
            </ProtectedRoute>
          } />
          
          {/* User Management Routes */}
          <Route path="/user-management" element={
            <ProtectedRoute requiredRoles={[UserRole.ADMIN]}>
              <Layout>
                <UserManagement />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/tenant-referencing" element={
            <ProtectedRoute requiredRoles={[UserRole.ADMIN, UserRole.AGENT, UserRole.LANDLORD]}>
              <Layout>
                <TenantReferencing />
              </Layout>
            </ProtectedRoute>
          } />
          
          {/* Document Management Routes */}
          <Route path="/documents" element={
            <ProtectedRoute requiredRoles={[UserRole.ADMIN, UserRole.AGENT, UserRole.LANDLORD, UserRole.TENANT, UserRole.SOLICITOR]}>
              <Layout>
                <DocumentManagement />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/financial" element={<FinancialManagement />} />
           <Route path="/gdpr" element={<GDPRCompliance />} />
          
          <Route path="/legal-documents" element={
            <ProtectedRoute requiredRoles={[UserRole.ADMIN, UserRole.SOLICITOR, UserRole.AGENT, UserRole.LANDLORD]}>
              <Layout>
                <LegalDocumentManagement />
              </Layout>
            </ProtectedRoute>
          } />

          {/* Tenant Portal Routes */}
          <Route path="/tenant-portal" element={
            <ProtectedRoute requiredRoles={[UserRole.ADMIN, UserRole.AGENT, UserRole.TENANT]}>
              <Layout>
                <TenantPortal />
              </Layout>
            </ProtectedRoute>
          } />

          {/* Profile and Settings Routes */}
          <Route path="/profile" element={
            <ProtectedRoute>
              <Layout>
                <Profile />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/settings" element={
            <ProtectedRoute>
              <Layout>
                <Settings />
              </Layout>
            </ProtectedRoute>
          } />
          
          {/* Notifications Routes */}
          <Route path="/notifications" element={
            <ProtectedRoute>
              <Layout>
                <Notifications />
              </Layout>
            </ProtectedRoute>
          } />
          
          {/* Reports and Analytics Routes */}
          <Route path="/reports" element={
            <ProtectedRoute requiredRoles={[UserRole.ADMIN, UserRole.AGENT, UserRole.LANDLORD]}>
              <Layout>
                <ReportsAnalytics />
              </Layout>
            </ProtectedRoute>
          } />
          
          {/* Booking Management Routes */}
          <Route path="/bookings" element={
            <ProtectedRoute requiredRoles={[UserRole.ADMIN, UserRole.AGENT, UserRole.BUYER, UserRole.TENANT]}>
              <Layout>
                <BookingManagement />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/booking-calendar" element={
            <ProtectedRoute requiredRoles={[UserRole.ADMIN, UserRole.AGENT, UserRole.BUYER, UserRole.TENANT]}>
              <Layout>
                <BookingCalendar />
              </Layout>
            </ProtectedRoute>
          } />
          
          {/* Communication Routes */}
          <Route path="/communications" element={
            <ProtectedRoute requiredRoles={[UserRole.ADMIN, UserRole.AGENT, UserRole.LANDLORD, UserRole.TENANT, UserRole.BUYER, UserRole.SOLICITOR]}>
              <Layout>
                <CommunicationCenter />
              </Layout>
            </ProtectedRoute>
          } />
          
          {/* Maintenance Routes */}
          <Route path="/maintenance" element={
            <ProtectedRoute requiredRoles={[UserRole.ADMIN, UserRole.AGENT, UserRole.LANDLORD, UserRole.TENANT]}>
              <Layout>
                <Maintenance />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/contractor-management" element={
            <ProtectedRoute requiredRoles={[UserRole.ADMIN, UserRole.AGENT, UserRole.LANDLORD]}>
              <Layout>
                <ContractorManagement />
              </Layout>
            </ProtectedRoute>
          } />
          
          {/* Finance Routes */}
          <Route path="/finances" element={
            <ProtectedRoute requiredRoles={[UserRole.ADMIN, UserRole.AGENT, UserRole.LANDLORD, UserRole.TENANT]}>
              <Layout>
                <Finances />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/invoice-generation" element={
            <ProtectedRoute requiredRoles={[UserRole.ADMIN, UserRole.AGENT, UserRole.LANDLORD]}>
              <Layout>
                <InvoiceGeneration />
              </Layout>
            </ProtectedRoute>
          } />
          
          {/* CRM Routes */}
          <Route path="/crm" element={
            <ProtectedRoute requiredRoles={[UserRole.ADMIN, UserRole.AGENT]}>
              <Layout>
                <CRM />
              </Layout>
            </ProtectedRoute>
          } />
          
          {/* Virtual Tours Routes */}
          <Route path="/virtual-tours" element={
            <ProtectedRoute requiredRoles={[UserRole.ADMIN, UserRole.AGENT, UserRole.LANDLORD, UserRole.BUYER]}>
              <Layout>
                <VirtualTours />
              </Layout>
            </ProtectedRoute>
          } />
          
          {/* GDPR Compliance Routes */}
          <Route path="/gdpr" element={
            <ProtectedRoute requiredRoles={[UserRole.ADMIN]}>
              <Layout>
                <GDPRCompliance />
              </Layout>
            </ProtectedRoute>
          } />
          
          {/* Role-specific Dashboard Routes */}
          <Route path="/dashboard/agent" element={
            <ProtectedRoute>
              <Layout>
                <AgentDashboard />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/dashboard/buyer" element={
            <ProtectedRoute>
              <Layout>
                <BuyerDashboard />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/dashboard/landlord" element={
            <ProtectedRoute>
              <Layout>
                <LandlordDashboard />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/dashboard/tenant" element={
            <ProtectedRoute>
              <Layout>
                <TenantDashboard />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/dashboard/admin" element={
            <ProtectedRoute>
              <Layout>
                <AdminDashboard />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/dashboard/solicitor" element={
            <ProtectedRoute>
              <Layout>
                <SolicitorDashboard />
              </Layout>
            </ProtectedRoute>
          } />
          
          {/* Catch all route - 404 */}
          <Route path="*" element={
            <ErrorLayout>
              <NotFound />
            </ErrorLayout>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;