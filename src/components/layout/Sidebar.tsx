import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  HomeIcon, 
  CreditCardIcon, 
  DocumentTextIcon, 
  NewspaperIcon,
  UsersIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  UserGroupIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

interface SidebarProps {
  role: 'client' | 'admin';
}

const clientNavigation = [
  { name: 'Dashboard', href: '/client/dashboard', icon: HomeIcon },
  { name: 'Payments', href: '/client/payments', icon: CreditCardIcon },
  { name: 'Ledger', href: '/client/ledger', icon: DocumentTextIcon },
  { name: 'Project Updates', href: '/client/updates', icon: NewspaperIcon },
];

const adminNavigation = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: HomeIcon },
  { name: 'Lead Management', href: '/admin/leads', icon: UsersIcon },
  { name: 'Customer Management', href: '/admin/customers', icon: UserGroupIcon },
  { name: 'Payments & Ledger', href: '/admin/payments', icon: CurrencyDollarIcon },
  { name: 'Analytics', href: '/admin/analytics', icon: ChartBarIcon },
  { name: 'Settings', href: '/admin/settings', icon: Cog6ToothIcon },
];

export const Sidebar: React.FC<SidebarProps> = ({ role }) => {
  const location = useLocation();
  const navigation = role === 'client' ? clientNavigation : adminNavigation;
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div 
      className={cn(
        "flex h-full flex-col bg-white shadow-lg transition-all duration-300 ease-in-out",
        isCollapsed ? "w-16" : "w-64"
      )}
      onMouseEnter={() => setIsCollapsed(false)}
      onMouseLeave={() => setIsCollapsed(true)}
    >
      <div className="flex h-16 items-center justify-center border-b border-gray-200">
        <Link to="/" className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center">
            <span className="text-white font-bold text-sm">RA</span>
          </div>
          {!isCollapsed && (
            <span className="text-xl font-bold gradient-text transition-opacity duration-300">
              RealAssist
            </span>
          )}
        </Link>
      </div>
      
      <nav className="flex-1 space-y-1 px-4 py-6">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                'group flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 shadow-sm'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900',
                isCollapsed ? 'justify-center' : ''
              )}
              title={isCollapsed ? item.name : undefined}
            >
              <item.icon
                className={cn(
                  'h-5 w-5 flex-shrink-0 transition-colors',
                  isActive ? 'text-purple-600' : 'text-gray-400 group-hover:text-gray-500',
                  isCollapsed ? '' : 'mr-3'
                )}
                aria-hidden="true"
              />
              {!isCollapsed && (
                <span className="transition-opacity duration-300">
                  {item.name}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
      
      <div className="border-t border-gray-200 p-4">
        <div className={cn(
          "flex items-center",
          isCollapsed ? "justify-center" : "space-x-3"
        )}>
          <div className="h-8 w-8 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center">
            <span className="text-white text-xs font-medium">JD</span>
          </div>
          {!isCollapsed && (
            <div className="flex-1 transition-opacity duration-300">
              <p className="text-sm font-medium text-gray-900">John Doe</p>
              <p className="text-xs text-gray-500 capitalize">{role}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
