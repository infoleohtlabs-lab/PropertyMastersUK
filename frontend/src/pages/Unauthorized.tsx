import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Shield, ArrowLeft, Home, Mail } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';

const Unauthorized: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();
  
  const state = location.state as {
    from?: string;
    requiredRoles?: string[];
    userRole?: string;
  };

  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  const handleGoHome = () => {
    navigate('/');
  };

  const handleContactSupport = () => {
    window.location.href = 'mailto:support@propertymasters.uk?subject=Access Request';
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
              <Shield className="h-8 w-8 text-red-600" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Access Denied
            </h2>
            
            <p className="text-gray-600 mb-6">
              You don't have permission to access this page.
            </p>
            
            {state?.requiredRoles && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="text-sm font-medium text-gray-900 mb-2">
                  Required Access Level:
                </h3>
                <div className="flex flex-wrap gap-2 justify-center">
                  {state.requiredRoles.map((role) => (
                    <span
                      key={role}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize"
                    >
                      {role.replace('_', ' ')}
                    </span>
                  ))}
                </div>
                
                {user && (
                  <div className="mt-3">
                    <p className="text-sm text-gray-600">
                      Your current role: 
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 capitalize ml-1">
                        {user.role.replace('_', ' ')}
                      </span>
                    </p>
                  </div>
                )}
              </div>
            )}
            
            <div className="space-y-3">
              <button
                onClick={handleGoBack}
                className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Back
              </button>
              
              <button
                onClick={handleGoHome}
                className="w-full flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm bg-blue-600 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Home className="h-4 w-4 mr-2" />
                Go to Homepage
              </button>
              
              <button
                onClick={handleContactSupport}
                className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Mail className="h-4 w-4 mr-2" />
                Contact Support
              </button>
            </div>
            
            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500">
                If you believe this is an error, please contact your administrator or support team.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Additional help section */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-900 mb-2">
            Need Access?
          </h3>
          <p className="text-sm text-blue-700 mb-3">
            If you need access to this feature, you can:
          </p>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Contact your account administrator</li>
            <li>• Request a role upgrade through support</li>
            <li>• Check if you're logged into the correct account</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;