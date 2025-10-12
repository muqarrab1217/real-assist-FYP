import React from 'react';
import { Outlet } from 'react-router-dom';

export const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen" style={{
      background: 'linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%)',
    }}>
      <div className="flex items-center justify-center min-h-screen px-4 py-12">
        <div className="w-full max-w-lg">
          <Outlet />
        </div>
      </div>
    </div>
  );
};
