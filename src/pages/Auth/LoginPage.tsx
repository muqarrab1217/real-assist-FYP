import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthContext } from '@/contexts/AuthContext';
import { authAPI } from '@/services/api';

const LOADING_STEPS = [
  'Signing in...',
  'Verifying credentials...',
  'Fetching user details...',
  'Initializing payment plans...',
  'Loading your dashboard...',
];

export const LoginPage: React.FC = () => {
  const { login } = useAuthContext();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setLoadingStep(0);
    setError(null);

    // Cycle through loading messages at random intervals
    let cancelled = false;
    const scheduleNextStep = (currentStep: number) => {
      if (cancelled || currentStep >= LOADING_STEPS.length - 1) return;
      const delay = 900 + Math.random() * 1800; // 0.9s – 2.7s
      setTimeout(() => {
        if (cancelled) return;
        const nextStep = currentStep + 1;
        setLoadingStep(nextStep);
        scheduleNextStep(nextStep);
      }, delay);
    };
    scheduleNextStep(0);

    try {
      console.log('[DEBUG] LoginPage: Initiating login for', formData.email);
      const user = await authAPI.login(formData.email, formData.password);
      cancelled = true;

      // 1. Update local auth state immediately for snappiness
      // The useAuth hook will eventually refine this with the full profile data
      login(user);

      // 2. Navigate immediately based on email or returned hint
      const dashboardRoutes: Record<string, string> = {
        admin: '/admin/dashboard',
        employee: '/admin/dashboard',
        sales_rep: '/sales-rep/dashboard',
        client: '/client/dashboard',
      };
      const isAdmin = user.role === 'admin';
      const redirectPath = isAdmin ? '/admin/dashboard' : (dashboardRoutes[user.role] || '/client/dashboard');
      
      console.log('[DEBUG] LoginPage: Login successful, redirecting to', redirectPath);
      navigate(redirectPath, { replace: true });
    } catch (err: any) {
      cancelled = true;
      console.error('Login error:', err);
      if (err.message?.includes('timeout') || err.message?.includes('taking too long')) {
        setError('Login is taking longer than usual. Please check your internet or try refreshing.');
      } else {
        setError(err.message || 'Invalid email or password');
      }
    } finally {
      cancelled = true;
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex items-center justify-center min-h-screen"
    >
      <Card className="w-full max-w-2xl mx-auto" style={{
        background: 'rgba(26,26,26,0.75)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(212,175,55,0.25)',
        borderRadius: '24px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
      }}>
        <CardHeader className="text-center">
          <div className="flex justify-center">
            <img src="/images/logo.png" alt="ABS Developers" className="h-16 w-auto" />
          </div>
          <CardTitle className="text-2xl font-bold" style={{
            fontFamily: 'Playfair Display, serif',
            backgroundImage: 'linear-gradient(135deg, #d4af37, #f4e68c)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
          }}>Welcome Back</CardTitle>
          <CardDescription style={{ color: 'rgba(156, 163, 175, 0.9)' }}>
            Sign in to your RealAssist account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">

            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2" style={{ color: 'rgba(212,175,55,0.9)' }}>
                Email Address
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter your email"
                className="w-full"
                style={{ background: '#000000', border: '1px solid rgba(212,175,55,0.25)' }}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2" style={{ color: 'rgba(212,175,55,0.9)' }}>
                Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter your password"
                  className="w-full pr-10"
                  style={{ background: '#000000', border: '1px solid rgba(212,175,55,0.25)' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors duration-300"
                  style={{ color: 'rgba(212,175,55,0.7)' }}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="rounded"
                  style={{
                    accentColor: '#d4af37',
                    border: '1px solid rgba(212,175,55,0.5)',
                  }}
                />
                <span className="ml-2 text-sm" style={{ color: 'rgba(156, 163, 175, 0.9)' }}>Remember me</span>
              </label>
              <Link
                to="/forgot-password"
                className="text-sm transition-colors duration-300"
                style={{ color: '#d4af37' }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#f4e68c'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#d4af37'}
              >
                Forgot password?
              </Link>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm text-center">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full font-semibold flex items-center justify-center gap-3"
              style={{
                backgroundImage: 'linear-gradient(135deg, #d4af37, #f4e68c)',
                borderRadius: '12px',
                padding: '14px',
                color: '#000000',
              }}
            >
              <span className="flex-1 text-center">
                {isLoading ? LOADING_STEPS[loadingStep] : 'Sign In'}
              </span>
              {isLoading && (
                <svg
                  className="h-5 w-5 animate-spin flex-shrink-0"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  style={{ color: 'rgba(0,0,0,0.5)' }}
                >
                  <circle
                    className="opacity-25"
                    cx="12" cy="12" r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
              )}
            </Button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full" style={{ borderTop: '1px solid rgba(212,175,55,0.25)' }} />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2" style={{
                  background: 'rgba(26,26,26,0.75)',
                  backdropFilter: 'blur(100px)',
                  color: 'rgba(156, 163, 175, 0.9)'
                }}>Or continue with</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <Button className="w-full" style={{
                background: '#000000',
                border: '1px solid rgba(212,175,55,0.25)',
                color: 'white',
              }}>
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Google
              </Button>
              <Button className="w-full" style={{
                background: '#000000',
                border: '1px solid rgba(212,175,55,0.25)',
                color: 'white',
              }}>
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                Facebook
              </Button>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm" style={{ color: 'rgba(156, 163, 175, 0.9)' }}>
              Don't have an account?{' '}
              <Link
                to="/register"
                className="font-medium transition-colors duration-300"
                style={{ color: '#d4af37' }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#f4e68c'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#d4af37'}
              >
                Sign up
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
