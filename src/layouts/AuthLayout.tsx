import React from 'react';
import { Outlet } from 'react-router-dom';
import { Link } from 'react-router-dom';

export const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      <div className="flex min-h-screen">
        {/* Left side - Branding */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-purple-600 to-blue-600 relative">
          <div className="absolute inset-0 bg-black opacity-20"></div>
          <div className="relative z-10 flex flex-col justify-center items-center text-white p-12">
            <Link to="/" className="mb-8">
              <div className="flex items-center space-x-3">
                <div className="h-12 w-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <span className="text-white font-bold text-xl">RA</span>
                </div>
                <span className="text-3xl font-bold">RealAssist</span>
              </div>
            </Link>
            
            <div className="text-center max-w-md">
              <h2 className="text-4xl font-bold mb-4">AI-Powered Real Estate</h2>
              <p className="text-xl text-purple-100 mb-8">
                Streamline your property investments with intelligent automation and real-time insights.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="h-2 w-2 bg-white rounded-full"></div>
                  <span>Smart lead management</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="h-2 w-2 bg-white rounded-full"></div>
                  <span>Automated payment tracking</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="h-2 w-2 bg-white rounded-full"></div>
                  <span>Real-time project updates</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Form */}
        <div className="flex-1 flex flex-col justify-center px-4 py-12 sm:px-6 lg:px-20 xl:px-24">
          <div className="mx-auto w-full max-w-sm lg:w-96">
            <div className="lg:hidden mb-8 text-center">
              <Link to="/" className="inline-flex items-center space-x-2">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center">
                  <span className="text-white font-bold">RA</span>
                </div>
                <span className="text-2xl font-bold gradient-text">RealAssist</span>
              </Link>
            </div>
            
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};
