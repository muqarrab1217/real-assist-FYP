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
  ChatBubbleLeftRightIcon,
  BuildingOfficeIcon,
  ClipboardDocumentListIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';
import { User } from '@/types';

// Hide scrollbar styles
const scrollbarHideStyle = `
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
`;

interface SidebarProps {
  role: 'client' | 'admin' | 'employee' | 'sales_rep';
  onRoleChange?: (role: 'client' | 'admin' | 'employee' | 'sales_rep') => void;
  onLogout?: () => void;
  user?: User | null;
}

const clientNavigation = [
  { name: 'Dashboard', href: '/client/dashboard', icon: HomeIcon },
  { name: 'Projects', href: '/client/projects', icon: BuildingOfficeIcon },
  { name: 'Payments', href: '/client/payments', icon: CreditCardIcon },
  { name: 'Ledger', href: '/client/ledger', icon: DocumentTextIcon },
  { name: 'Project Updates', href: '/client/updates', icon: NewspaperIcon },
  { name: 'Chat History', href: '/client/chat-history', icon: ChatBubbleLeftRightIcon },

  { name: 'Settings', href: '/client/settings', icon: Cog6ToothIcon },
];

const employeeNavigation = [
  { name: 'Dashboard', href: '/employee/dashboard', icon: HomeIcon },
  { name: 'Chat History', href: '/employee/chat-history', icon: ChatBubbleLeftRightIcon },

  { name: 'Settings', href: '/employee/settings', icon: Cog6ToothIcon },
];

const adminNavigation = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: HomeIcon },
  { name: 'Projects', href: '/admin/projects', icon: BuildingOfficeIcon },
  { name: 'Team Management', href: '/admin/teams', icon: UserGroupIcon },
  { name: 'Lead Management', href: '/admin/leads', icon: UsersIcon },
  { name: 'Enrollment Requests', href: '/admin/enrollments', icon: ClipboardDocumentListIcon },
  { name: 'Customer Management', href: '/admin/customers', icon: UserGroupIcon },
  { name: 'Payments & Ledger', href: '/admin/payments', icon: CurrencyDollarIcon },
  { name: 'Analytics', href: '/admin/analytics', icon: ChartBarIcon },
  { name: 'RAG Upload', href: '/admin/rag-upload', icon: CloudArrowUpIcon },
  { name: 'Chat History', href: '/admin/chat-history', icon: ChatBubbleLeftRightIcon },

  { name: 'Settings', href: '/admin/settings', icon: Cog6ToothIcon },
];

const salesRepNavigation = [
  { name: 'Dashboard', href: '/sales-rep/dashboard', icon: HomeIcon },
  { name: 'Verifications', href: '/sales-rep/verifications', icon: ShieldCheckIcon },
  { name: 'Chat History', href: '/sales-rep/chat-history', icon: ChatBubbleLeftRightIcon },
  { name: 'Settings', href: '/sales-rep/settings', icon: Cog6ToothIcon },
];

export const Sidebar: React.FC<SidebarProps> = ({ role, onRoleChange, onLogout, user }) => {
  const location = useLocation();
  const navigation = role === 'client' ? clientNavigation : (role === 'employee' ? employeeNavigation : (role === 'sales_rep' ? salesRepNavigation : adminNavigation));

  const roleSlug = role.replace('_', '-');
  const supportNavigation = [
    { name: 'Get Help', href: `/${roleSlug}/get-help`, icon: UsersIcon },
    { name: 'Submit Feedback', href: `/${roleSlug}/submit-feedback`, icon: DocumentTextIcon },
  ];
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <>
      <style>{scrollbarHideStyle}</style>
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

      {/* Role Badge / Toggle */}
      {!isCollapsed && (
        <div className="px-4 py-4">
          {user?.role === 'admin' ? (
            <div className="flex bg-charcoal-800/50 backdrop-blur-sm rounded-xl p-1 border border-gold-200/20">
              <button
                onClick={() => onRoleChange?.('admin')}
                className={cn(
                  "flex-1 py-2 px-3 text-sm font-semibold rounded-lg transition-all duration-300",
                  role === 'admin'
                    ? "bg-gradient-to-r from-[#d4af37] to-[#f4e68c] text-black shadow-gold"
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
                    ? "bg-gradient-to-r from-[#d4af37] to-[#f4e68c] text-black shadow-gold"
                    : "text-charcoal-300 hover:text-gold-400 hover:bg-gold-900/20"
                )}
              >
                Client
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-center rounded-xl px-4 py-2 border border-gold-200/20"
              style={{ background: 'rgba(212,175,55,0.08)' }}>
              <span className="text-sm font-semibold capitalize"
                style={{ color: '#d4af37' }}>
                {user?.role?.replace('_', ' ') || role.replace('_', ' ')}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Main Navigation */}
      <nav className="flex-1 overflow-y-auto px-4 py-2 space-y-1 scrollbar-hide">
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
          <div className="h-10 w-10 rounded-full bg-gradient-to-r from-[#d4af37] to-[#f4e68c] flex items-center justify-center shadow-gold shrink-0">
            <span className="text-white text-sm font-bold">
              {user?.firstName?.[0] || 'U'}{user?.lastName?.[0] || ''}
            </span>
          </div>

          {!isCollapsed && (
            <div className="flex-1 transition-opacity duration-300 min-w-0">
              <p className="text-sm font-semibold text-white truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs capitalize text-gold-400">
                {role}
              </p>
            </div>
          )}


          {/* Logout Icon */}
          {onLogout && !isCollapsed && (
            <button
              onClick={onLogout}
              className="flex items-center justify-center rounded-lg transition-all duration-200 p-2 text-charcoal-400 hover:bg-red-100/10 hover:text-red-500"
              title="Logout"
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5 shrink-0" />
            </button>
          )}
        </div>
      </div>
      </div>
    </>
  );
};
