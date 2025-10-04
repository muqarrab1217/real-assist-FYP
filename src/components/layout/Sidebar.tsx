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
  CurrencyDollarIcon,
  SunIcon,
  MoonIcon
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';
import { useTheme } from '@/contexts/ThemeContext';

interface SidebarProps {
  role: 'client' | 'admin';
  onRoleChange?: (role: 'client' | 'admin') => void;
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

const supportNavigation = [
  { name: 'Get Help', href: '/help', icon: UsersIcon },
  { name: 'Submit Feedback', href: '/feedback', icon: DocumentTextIcon },
];

export const Sidebar: React.FC<SidebarProps> = ({ role, onRoleChange }) => {
  const location = useLocation();
  const navigation = role === 'client' ? clientNavigation : adminNavigation;
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { isDarkMode, toggleDarkMode } = useTheme();

  return (
    <div 
      className={cn(
        "flex h-full flex-col shadow-lg transition-all duration-300 ease-in-out",
        isDarkMode ? "bg-gray-900" : "bg-white",
        isCollapsed ? "w-16" : "w-64"
      )}
      onMouseEnter={() => setIsCollapsed(false)}
      onMouseLeave={() => setIsCollapsed(true)}
    >
      {/* Header */}
      <div className="flex h-16 items-center justify-center border-b border-gray-200 dark:border-gray-700">
        <Link to="/" className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center">
            <span className="text-white font-bold text-sm">RA</span>
          </div>
          {!isCollapsed && (
            <span className={cn(
              "text-xl font-bold transition-opacity duration-300",
              isDarkMode ? "text-white" : "gradient-text"
            )}>
              RealAssist
            </span>
          )}
        </Link>
      </div>
      
      {/* Role Toggle */}
      {!isCollapsed && (
        <div className="px-4 py-4">
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => onRoleChange?.('admin')}
              className={cn(
                "flex-1 py-2 px-3 text-sm font-medium rounded-md transition-all duration-200",
                role === 'admin'
                  ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              )}
            >
              Admin
            </button>
            <button
              onClick={() => onRoleChange?.('client')}
              className={cn(
                "flex-1 py-2 px-3 text-sm font-medium rounded-md transition-all duration-200",
                role === 'client'
                  ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              )}
            >
              Client
            </button>
          </div>
        </div>
      )}

      {/* Main Navigation */}
      <nav className="flex-1 space-y-1 px-4 py-2">
        <div className="space-y-1">
          <div className={cn(
            "px-3 py-2 text-xs font-semibold uppercase tracking-wider",
            isDarkMode ? "text-gray-400" : "text-gray-500"
          )}>
            {!isCollapsed && "Main"}
          </div>
          {navigation.slice(0, 2).map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  'group flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900 dark:to-blue-900 text-purple-700 dark:text-purple-300 shadow-sm'
                    : isDarkMode 
                      ? 'text-gray-300 hover:bg-gray-800 hover:text-white'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900',
                  isCollapsed ? 'justify-center' : ''
                )}
                title={isCollapsed ? item.name : undefined}
              >
                <item.icon
                  className={cn(
                    'h-5 w-5 flex-shrink-0 transition-colors',
                    isActive ? 'text-purple-600 dark:text-purple-400' : isDarkMode ? 'text-gray-400 group-hover:text-gray-300' : 'text-gray-400 group-hover:text-gray-500',
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
        </div>

        {/* Reports Section */}
        <div className="space-y-1">
          <div className={cn(
            "px-3 py-2 text-xs font-semibold uppercase tracking-wider",
            isDarkMode ? "text-gray-400" : "text-gray-500"
          )}>
            {!isCollapsed && "Reports"}
          </div>
          {navigation.slice(2).map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                'group flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200',
                isActive
                    ? 'bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900 dark:to-blue-900 text-purple-700 dark:text-purple-300 shadow-sm'
                    : isDarkMode 
                      ? 'text-gray-300 hover:bg-gray-800 hover:text-white'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900',
                  isCollapsed ? 'justify-center' : ''
                )}
                title={isCollapsed ? item.name : undefined}
            >
              <item.icon
                  className={cn(
                    'h-5 w-5 flex-shrink-0 transition-colors',
                    isActive ? 'text-purple-600 dark:text-purple-400' : isDarkMode ? 'text-gray-400 group-hover:text-gray-300' : 'text-gray-400 group-hover:text-gray-500',
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
        </div>

        {/* Support Section */}
        <div className="space-y-1">
          <div className={cn(
            "px-3 py-2 text-xs font-semibold uppercase tracking-wider",
            isDarkMode ? "text-gray-400" : "text-gray-500"
          )}>
            {!isCollapsed && "Support"}
          </div>
          {supportNavigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  'group flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900 dark:to-blue-900 text-purple-700 dark:text-purple-300 shadow-sm'
                    : isDarkMode 
                      ? 'text-gray-300 hover:bg-gray-800 hover:text-white'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900',
                  isCollapsed ? 'justify-center' : ''
                )}
                title={isCollapsed ? item.name : undefined}
              >
                <item.icon
                  className={cn(
                    'h-5 w-5 flex-shrink-0 transition-colors',
                    isActive ? 'text-purple-600 dark:text-purple-400' : isDarkMode ? 'text-gray-400 group-hover:text-gray-300' : 'text-gray-400 group-hover:text-gray-500',
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
        </div>
      </nav>
      
      {/* Theme Toggle */}
      <div className="px-4 py-2">
        <button
          onClick={toggleDarkMode}
          className={cn(
            "w-full flex items-center justify-center rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
            isDarkMode 
              ? "text-gray-300 hover:bg-gray-800 hover:text-white" 
              : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
          )}
          title={isCollapsed ? (isDarkMode ? "Light Mode" : "Dark Mode") : undefined}
        >
          {isDarkMode ? (
            <SunIcon className="h-5 w-5" />
          ) : (
            <MoonIcon className="h-5 w-5" />
          )}
          {!isCollapsed && (
            <span className="ml-3 transition-opacity duration-300">
              {isDarkMode ? "Light Mode" : "Dark Mode"}
            </span>
          )}
        </button>
      </div>
      
      {/* User Profile */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-4">
        <div className={cn(
          "flex items-center",
          isCollapsed ? "justify-center" : "space-x-3"
        )}>
          <div className="h-8 w-8 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center">
            <span className="text-white text-xs font-medium">JD</span>
          </div>
          {!isCollapsed && (
            <div className="flex-1 transition-opacity duration-300">
              <p className={cn(
                "text-sm font-medium",
                isDarkMode ? "text-white" : "text-gray-900"
              )}>
                John Doe
              </p>
              <p className={cn(
                "text-xs capitalize",
                isDarkMode ? "text-gray-400" : "text-gray-500"
              )}>
                {role}
              </p>
          </div>
          )}
        </div>
      </div>
    </div>
  );
};
