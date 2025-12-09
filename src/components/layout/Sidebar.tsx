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
  ArrowRightOnRectangleIcon,
  CloudArrowUpIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

interface SidebarProps {
  role: 'client' | 'admin';
  onRoleChange?: (role: 'client' | 'admin') => void;
  onLogout?: () => void;
}

const clientNavigation = [
  { name: 'Dashboard', href: '/client/dashboard', icon: HomeIcon },
  { name: 'Payments', href: '/client/payments', icon: CreditCardIcon },
  { name: 'Ledger', href: '/client/ledger', icon: DocumentTextIcon },
  { name: 'Project Updates', href: '/client/updates', icon: NewspaperIcon },
  { name: 'Chat History', href: '/rag-history', icon: ChatBubbleLeftRightIcon },
];

const adminNavigation = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: HomeIcon },
  { name: 'Lead Management', href: '/admin/leads', icon: UsersIcon },
  { name: 'Customer Management', href: '/admin/customers', icon: UserGroupIcon },
  { name: 'Payments & Ledger', href: '/admin/payments', icon: CurrencyDollarIcon },
  { name: 'Analytics', href: '/admin/analytics', icon: ChartBarIcon },
  { name: 'RAG Upload', href: '/admin/rag-upload', icon: CloudArrowUpIcon },
  { name: 'Chat History', href: '/admin/rag-history', icon: ChatBubbleLeftRightIcon },
  { name: 'Settings', href: '/admin/settings', icon: Cog6ToothIcon },
];

export const Sidebar: React.FC<SidebarProps> = ({ role, onRoleChange, onLogout }) => {
  const location = useLocation();
  const navigation = role === 'client' ? clientNavigation : adminNavigation;
  
  const supportNavigation = [
    { name: 'Get Help', href: '/help', icon: UsersIcon },
    { name: 'Submit Feedback', href: `/${role}/submit-feedback`, icon: DocumentTextIcon },
  ];
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div 
      className={cn(
        "flex h-full flex-col transition-all duration-300 ease-in-out border-r border-gold-200/20 dark:border-gold-800/20",
        isCollapsed ? "w-16" : "w-64"
      )}
      style={{ 
        background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.08) 0%, rgba(0, 0, 0, 0.95) 100%)',
        backgroundColor: 'rgba(212, 175, 55, 0.05)',
        backdropFilter: 'blur(20px)',
        boxShadow: 'inset 0 0 200px rgba(212, 175, 55, 0.08)'
      }}
      onMouseEnter={() => setIsCollapsed(false)}
      onMouseLeave={() => setIsCollapsed(true)}
    >
      {/* Header */}
      <div className="flex h-16 items-center justify-center border-b border-gold-200/20 dark:border-gold-800/20">
        <Link to="/" className="flex items-center justify-center group mt-4">
          <img 
            src="/images/logo.png" 
            alt="RealAssist" 
            className={cn(
              "transition-all duration-300",
              isCollapsed ? "h-8 w-auto" : "h-12 w-auto"
            )}
          />
        </Link>
      </div>
      
      {/* Role Toggle */}
      {!isCollapsed && (
        <div className="px-4 py-4">
          <div className="flex bg-charcoal-800/50 backdrop-blur-sm rounded-xl p-1 border border-gold-200/20">
            <button
              onClick={() => onRoleChange?.('admin')}
              className={cn(
                "flex-1 py-2 px-3 text-sm font-semibold rounded-lg transition-all duration-300",
                role === 'admin'
                  ? "bg-gradient-to-r from-[#d4af37] to-[#f4e68c] text-white shadow-gold"
                  : "text-charcoal-300 hover:text-gold-400 hover:bg-gold-900/20"
              )}
            >
              Admin
            </button>
            <button
              onClick={() => onRoleChange?.('client')}
              className={cn(
                "flex-1 py-2 px-3 text-sm font-semibold rounded-lg transition-all duration-300",
                role === 'client'
                  ? "bg-gradient-to-r from-[#d4af37] to-[#f4e68c] text-white shadow-gold"
                  : "text-charcoal-300 hover:text-gold-400 hover:bg-gold-900/20"
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
          <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-gold-400">
            {!isCollapsed && "Main"}
          </div>
          {navigation.slice(0, 2).map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  'group flex items-center rounded-xl px-3 py-3 text-sm font-semibold transition-all duration-300 hover:scale-105',
                  isActive
                    ? 'bg-gradient-to-r from-[#d4af37] to-[#f4e68c] text-white shadow-gold'
                    : 'text-charcoal-300 hover:bg-gold-900/20 hover:text-gold-400',
                  isCollapsed ? 'justify-center' : ''
                )}
                title={isCollapsed ? item.name : undefined}
              >
                <item.icon
                  className={cn(
                    'h-5 w-5 flex-shrink-0 transition-all duration-300',
                    isActive ? 'text-white' : 'text-charcoal-400 group-hover:text-gold-400 group-hover:scale-110',
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
          <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-gold-400">
            {!isCollapsed && "Reports"}
          </div>
          {navigation.slice(2).map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                'group flex items-center rounded-xl px-3 py-3 text-sm font-semibold transition-all duration-300 hover:scale-105',
                isActive
                    ? 'abs-gradient-gold text-white shadow-gold'
                    : 'text-charcoal-300 hover:bg-gold-900/20 hover:text-gold-400',
                  isCollapsed ? 'justify-center' : ''
                )}
                title={isCollapsed ? item.name : undefined}
            >
              <item.icon
                  className={cn(
                    'h-5 w-5 flex-shrink-0 transition-all duration-300',
                    isActive ? 'text-white' : 'text-charcoal-400 group-hover:text-gold-400 group-hover:scale-110',
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
          <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-gold-400">
            {!isCollapsed && "Support"}
          </div>
          {supportNavigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  'group flex items-center rounded-xl px-3 py-3 text-sm font-semibold transition-all duration-300 hover:scale-105',
                  isActive
                    ? 'bg-gradient-to-r from-[#d4af37] to-[#f4e68c] text-white shadow-gold'
                    : 'text-charcoal-300 hover:bg-gold-900/20 hover:text-gold-400',
                  isCollapsed ? 'justify-center' : ''
                )}
                title={isCollapsed ? item.name : undefined}
              >
                <item.icon
                  className={cn(
                    'h-5 w-5 flex-shrink-0 transition-all duration-300',
                    isActive ? 'text-white' : 'text-charcoal-400 group-hover:text-gold-400 group-hover:scale-110',
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
      
      {/* User Profile */}
      <div className="border-t border-gold-200/20 dark:border-gold-800/20 p-4">
        <div className={cn(
          "flex items-center",
          isCollapsed ? "justify-center" : "space-x-3"
        )}>
                    
          {/* Profile Icon */}
          <div className="h-10 w-10 rounded-full bg-gradient-to-r from-[#d4af37] to-[#f4e68c] flex items-center justify-center shadow-gold">
            <span className="text-white text-sm font-bold">JD</span>
          </div>
          
          {!isCollapsed && (
            <div className="flex-1 transition-opacity duration-300">
              <p className="text-sm font-semibold text-white">
                John Doe
              </p>
              <p className="text-xs capitalize text-gold-400">
                {role}
              </p>
            </div>
          )}
          
          
          {/* Logout Icon - Hidden when collapsed */}
          {onLogout && !isCollapsed && (
            <button
              onClick={onLogout}
              className="flex items-center justify-center rounded-lg transition-all duration-200 p-2 text-charcoal-400 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400"
              title="Logout"
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
