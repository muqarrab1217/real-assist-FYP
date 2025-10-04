import React from 'react';
import { Outlet } from 'react-router-dom';
import { Chatbot } from '@/components/ui/Chatbot';

export const PublicLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      <Outlet />
      <Chatbot />
    </div>
  );
};
