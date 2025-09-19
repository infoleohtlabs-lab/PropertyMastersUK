import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import { useAuthStore } from './stores/authStore';
import { UserRole } from './types/auth';
import ProtectedRoute from './components/ProtectedRoute';

// Import layouts
import { Layout, DashboardLayout } from './components/layout/Layout';

// Public pages
import LandingPage from './pages/LandingPage';
import Properties from './pages/Properties';
import PropertyDetail from './pages/PropertyDetail';
import Search from './pages/Search';
import AdvancedSearch from './pages/AdvancedSearch';
import VirtualTours from './pages/VirtualTours';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import Unauthorized from './pages/Unauthorized';

// Auth components
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import AdminLogin from './pages/auth/AdminLogin';
import AgentLogin from './pages/auth/AgentLogin';
import BuyerLogin from './pages/auth/BuyerLogin';
import LandlordLogin from './pages/auth/LandlordLogin';
import TenantLogin from './pages/auth/TenantLogin';
import SolicitorLogin from './pages/auth/SolicitorLogin';

// Dashboard components
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/dashboards/AdminDashboard';
import AgentDashboard from './pages/dashboards/AgentDashboard';
import BuyerDashboard from './pages/dashboards/BuyerDashboard';
import LandlordDashboard from './pages/dashboards/LandlordDashboard';
import TenantDashboard from './pages/dashboards/TenantDashboard';
import SolicitorDashboard from './pages/dashboards/SolicitorDashboard';

// Protected pages
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Notifications from './pages/Notifications';
import PropertyManagement from './pages/PropertyManagement';
import PropertyListing from './pages/PropertyListing';
import PropertyValuation from './pages/PropertyValuation';
import BookingCalendar from './pages/BookingCalendar';
import BookingManagement from './pages/BookingManagement';
import Finances from './pages/Finances';
import InvoiceGeneration from './pages/InvoiceGeneration';
import MarketAnalysis from './pages/MarketAnalysis';
import CommunicationCenter from './pages/CommunicationCenter';
import Communications from './pages/Communications';
import Maintenance from './pages/Maintenance';
import ContractorManagement from './pages/ContractorManagement';
import DocumentManagement from './pages/DocumentManagement';
import LegalDocumentManagement from './pages/LegalDocumentManagement';
import UserManagement from './pages/UserManagement';
import ReportsAnalytics from './pages/ReportsAnalytics';
import TenantPortal from './pages/TenantPortal';
import TenantReferencing from './pages/TenantReferencing';
import GDPRCompliance from './pages/GDPRCompliance';
import CRM from './pages/CRM';

// Buyer pages
import SavedProperties from './pages/buyer/SavedProperties';
import MyViewings from './pages/buyer/MyViewings';
import PropertyOffers from './pages/buyer/PropertyOffers';
import MortgageApplications from './pages/buyer/MortgageApplications';
import SavedSearches from './pages/buyer/SavedSearches';

// Solicitor pages
import LegalCases from './pages/solicitor/LegalCases';
import Conveyancing from './pages/solicitor/Conveyancing';
import ContractManagement from './pages/solicitor/ContractManagement';

// Dashboard nested pages
import DashboardProperties from './pages/dashboards/DashboardProperties';
import DashboardBookings from './pages/dashboards/DashboardBookings';
import DashboardFinancials from './pages/dashboards/DashboardFinancials';
import DashboardAnalytics from './pages/dashboards/DashboardAnalytics';
import DashboardCommunications from './pages/dashboards/DashboardCommunications';
import DashboardMaintenance from './pages/dashboards/DashboardMaintenance';

function App() {
  const { initializeAuth } = useAuthStore();

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Layout><LandingPage /></Layout>} />
          <Route path="/properties" element={<Layout><Properties /></Layout>} />
          <Route path="/property/:id" element={<Layout><PropertyDetail /></Layout>} />
          <Route path="/search" element={<Layout><Search /></Layout>} />
          <Route path="/advanced-search" element={<Layout><AdvancedSearch /></Layout>} />
          <Route path="/virtual-tours" element={<Layout><VirtualTours /></Layout>} />
          <Route path="/privacy" element={<Layout><Privacy /></Layout>} />
          <Route path="/terms" element={<Layout><Terms /></Layout>} />
          <Route path="/unauthorized" element={<Layout><Unauthorized /></Layout>} />
          
          {/* Authentication routes */}
          <Route path="/auth/login" element={
            <ProtectedRoute requireAuth={false}>
              <Layout><Login /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/auth/register" element={
            <ProtectedRoute requireAuth={false}>
              <Layout><Register /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/auth/forgot-password" element={
            <ProtectedRoute requireAuth={false}>
              <Layout><ForgotPassword /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/auth/reset-password" element={
            <ProtectedRoute requireAuth={false}>
              <Layout><ResetPassword /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/auth/admin/login" element={
            <ProtectedRoute requireAuth={false}>
              <AdminLogin />
            </ProtectedRoute>
          } />
          <Route path="/auth/agent/login" element={
            <ProtectedRoute requireAuth={false}>
              <AgentLogin />
            </ProtectedRoute>
          } />
          <Route path="/auth/buyer/login" element={
            <ProtectedRoute requireAuth={false}>
              <BuyerLogin />
            </ProtectedRoute>
          } />
          <Route path="/auth/landlord/login" element={
            <ProtectedRoute requireAuth={false}>
              <LandlordLogin />
            </ProtectedRoute>
          } />
          <Route path="/auth/tenant/login" element={
            <ProtectedRoute requireAuth={false}>
              <TenantLogin />
            </ProtectedRoute>
          } />
          <Route path="/auth/solicitor/login" element={
            <ProtectedRoute requireAuth={false}>
              <SolicitorLogin />
            </ProtectedRoute>
          } />
          
          {/* Dashboard routes - Role-based access */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <DashboardLayout><Dashboard /></DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/dashboard/admin" element={
            <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
              <DashboardLayout><AdminDashboard /></DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/dashboard/agent" element={
            <ProtectedRoute allowedRoles={[UserRole.AGENT]}>
              <DashboardLayout><AgentDashboard /></DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/dashboard/buyer" element={
            <ProtectedRoute allowedRoles={[UserRole.BUYER]}>
              <DashboardLayout><BuyerDashboard /></DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/dashboard/landlord" element={
            <ProtectedRoute allowedRoles={[UserRole.LANDLORD]}>
              <DashboardLayout><LandlordDashboard /></DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/dashboard/tenant" element={
            <ProtectedRoute allowedRoles={[UserRole.TENANT]}>
              <DashboardLayout><TenantDashboard /></DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/dashboard/solicitor" element={
            <ProtectedRoute allowedRoles={[UserRole.SOLICITOR]}>
              <DashboardLayout><SolicitorDashboard /></DashboardLayout>
            </ProtectedRoute>
          } />
          
          {/* Common protected routes */}
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          } />
          <Route path="/notifications" element={
            <ProtectedRoute>
              <Notifications />
            </ProtectedRoute>
          } />
          
          {/* Nested Dashboard Routes */}
          <Route path="/dashboard/properties" element={
            <ProtectedRoute>
              <DashboardLayout><DashboardProperties /></DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/dashboard/bookings" element={
            <ProtectedRoute>
              <DashboardLayout><DashboardBookings /></DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/dashboard/financials" element={
            <ProtectedRoute>
              <DashboardLayout><DashboardFinancials /></DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/dashboard/analytics" element={
            <ProtectedRoute>
              <DashboardLayout><DashboardAnalytics /></DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/dashboard/communications" element={
            <ProtectedRoute>
              <DashboardLayout><DashboardCommunications /></DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/dashboard/maintenance" element={
            <ProtectedRoute>
              <DashboardLayout><DashboardMaintenance /></DashboardLayout>
            </ProtectedRoute>
          } />
          
          {/* Property Management - Admin, Agent, Landlord */}
          <Route path="/property-management" element={
            <ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.AGENT, UserRole.LANDLORD]}>
              <PropertyManagement />
            </ProtectedRoute>
          } />
          <Route path="/property-listing" element={
            <ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.AGENT, UserRole.LANDLORD]}>
              <PropertyListing />
            </ProtectedRoute>
          } />
          <Route path="/property-valuation" element={
            <ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.AGENT, UserRole.LANDLORD]}>
              <PropertyValuation />
            </ProtectedRoute>
          } />
          
          {/* Booking Management - Admin, Agent, Landlord */}
          <Route path="/booking-calendar" element={
            <ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.AGENT, UserRole.LANDLORD]}>
              <BookingCalendar />
            </ProtectedRoute>
          } />
          <Route path="/booking-management" element={
            <ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.AGENT, UserRole.LANDLORD]}>
              <BookingManagement />
            </ProtectedRoute>
          } />
          
          {/* Financial Management - Admin, Agent, Landlord */}
          <Route path="/finances" element={
            <ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.AGENT, UserRole.LANDLORD]}>
              <Finances />
            </ProtectedRoute>
          } />
          <Route path="/invoice-generation" element={
            <ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.AGENT, UserRole.LANDLORD]}>
              <InvoiceGeneration />
            </ProtectedRoute>
          } />
          
          {/* Market Analysis - Admin, Agent */}
          <Route path="/market-analysis" element={
            <ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.AGENT]}>
              <MarketAnalysis />
            </ProtectedRoute>
          } />
          
          {/* Communication Center - All authenticated users */}
          <Route path="/communication-center" element={
            <ProtectedRoute>
              <CommunicationCenter />
            </ProtectedRoute>
          } />
          <Route path="/communications" element={
            <ProtectedRoute>
              <Communications />
            </ProtectedRoute>
          } />
          
          {/* Maintenance Management - Admin, Agent, Landlord, Tenant */}
          <Route path="/maintenance" element={
            <ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.AGENT, UserRole.LANDLORD, UserRole.TENANT]}>
              <Maintenance />
            </ProtectedRoute>
          } />
          <Route path="/contractor-management" element={
            <ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.AGENT, UserRole.LANDLORD]}>
              <ContractorManagement />
            </ProtectedRoute>
          } />
          
          {/* Document Management - All authenticated users */}
          <Route path="/document-management" element={
            <ProtectedRoute>
              <DocumentManagement />
            </ProtectedRoute>
          } />
          
          {/* Legal Document Management - Admin, Agent, Solicitor */}
          <Route path="/legal-documents" element={
            <ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.AGENT, UserRole.SOLICITOR]}>
              <LegalDocumentManagement />
            </ProtectedRoute>
          } />
          
          {/* User Management - Admin only */}
          <Route path="/user-management" element={
            <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
              <UserManagement />
            </ProtectedRoute>
          } />
          
          {/* Reports & Analytics - Admin, Agent */}
          <Route path="/reports-analytics" element={
            <ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.AGENT]}>
              <ReportsAnalytics />
            </ProtectedRoute>
          } />
          
          {/* Tenant Portal - Tenant only */}
          <Route path="/tenant-portal" element={
            <ProtectedRoute allowedRoles={[UserRole.TENANT]}>
              <TenantPortal />
            </ProtectedRoute>
          } />
          
          {/* Tenant Referencing - Admin, Agent, Landlord */}
          <Route path="/tenant-referencing" element={
            <ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.AGENT, UserRole.LANDLORD]}>
              <TenantReferencing />
            </ProtectedRoute>
          } />
          
          {/* GDPR Compliance - All authenticated users */}
          <Route path="/gdpr-compliance" element={
            <ProtectedRoute>
              <GDPRCompliance />
            </ProtectedRoute>
          } />
          
          {/* CRM - Admin, Agent */}
          <Route path="/crm" element={
            <ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.AGENT]}>
              <CRM />
            </ProtectedRoute>
          } />
          
          {/* Buyer Routes - Buyer only */}
          <Route path="/buyer/saved" element={
            <ProtectedRoute allowedRoles={[UserRole.BUYER]}>
              <SavedProperties />
            </ProtectedRoute>
          } />
          <Route path="/buyer/viewings" element={
            <ProtectedRoute allowedRoles={[UserRole.BUYER]}>
              <MyViewings />
            </ProtectedRoute>
          } />
          <Route path="/buyer/offers" element={
            <ProtectedRoute allowedRoles={[UserRole.BUYER]}>
              <PropertyOffers />
            </ProtectedRoute>
          } />
          <Route path="/buyer/mortgage" element={
            <ProtectedRoute allowedRoles={[UserRole.BUYER]}>
              <MortgageApplications />
            </ProtectedRoute>
          } />
          <Route path="/buyer/searches" element={
            <ProtectedRoute allowedRoles={[UserRole.BUYER]}>
              <SavedSearches />
            </ProtectedRoute>
          } />
          
          {/* Solicitor Routes - Solicitor only */}
          <Route path="/solicitor/cases" element={
            <ProtectedRoute allowedRoles={[UserRole.SOLICITOR]}>
              <LegalCases />
            </ProtectedRoute>
          } />
          <Route path="/solicitor/conveyancing" element={
            <ProtectedRoute allowedRoles={[UserRole.SOLICITOR]}>
              <Conveyancing />
            </ProtectedRoute>
          } />
          <Route path="/solicitor/contracts" element={
            <ProtectedRoute allowedRoles={[UserRole.SOLICITOR]}>
              <ContractManagement />
            </ProtectedRoute>
          } />
          
          {/* 404 Error route */}
          <Route path="*" element={
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
          } />
        </Routes>
      </div>
    </Router>
  );
}


export default App;