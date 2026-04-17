import React from 'react';
import { Outlet } from 'react-router-dom';

export const AuthLayout: React.FC = () => {
  return (
    <div className="h-screen overflow-hidden" style={{
      background: 'linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%)',
    }}>
      <div className="flex items-center justify-center h-screen px-4 py-6">
        <div className="w-full max-w-lg max-h-full">
          <Outlet />
        </div>
      </div>
    </div>
  );
};
