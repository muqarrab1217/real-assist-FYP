import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { EyeIcon, EyeSlashIcon, CheckIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    if (!formData.agreeToTerms) {
      alert('Please agree to the terms and conditions');
      return;
    }
    // Mock registration
    navigate('/client/dashboard');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const passwordRequirements = [
    { text: 'At least 8 characters', met: formData.password.length >= 8 },
    { text: 'One uppercase letter', met: /[A-Z]/.test(formData.password) },
    { text: 'One lowercase letter', met: /[a-z]/.test(formData.password) },
    { text: 'One number', met: /\d/.test(formData.password) },
  ];

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
          }}>Create Account</CardTitle>
          <CardDescription style={{ color: 'rgba(156, 163, 175, 0.9)' }}>
            Join RealAssist and start managing your investments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium mb-2" style={{ color: 'rgba(212,175,55,0.9)' }}>
                  First Name
                </label>
                <Input
                  id="firstName"
                  name="firstName"
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={handleInputChange}
                  placeholder="John"
                  style={{ background: '#000000', border: '1px solid rgba(212,175,55,0.25)' }}
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium mb-2" style={{ color: 'rgba(212,175,55,0.9)' }}>
                  Last Name
                </label>
                <Input
                  id="lastName"
                  name="lastName"
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={handleInputChange}
                  placeholder="Doe"
                  style={{ background: '#000000', border: '1px solid rgba(212,175,55,0.25)' }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
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
                  placeholder="john@example.com"
                  style={{ background: '#000000', border: '1px solid rgba(212,175,55,0.25)' }}
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium mb-2" style={{ color: 'rgba(212,175,55,0.9)' }}>
                  Phone Number
                </label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+1 (555) 123-4567"
                  style={{ background: '#000000', border: '1px solid rgba(212,175,55,0.25)' }}
                />
              </div>
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
                  placeholder="Create a password"
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
              
              {formData.password && (
                <div className="mt-2 space-y-1">
                  {passwordRequirements.map((req, index) => (
                    <div key={index} className="flex items-center text-sm">
                      <CheckIcon
                        className={`h-4 w-4 mr-2 transition-colors duration-300`}
                        style={{ color: req.met ? '#d4af37' : 'rgba(156, 163, 175, 0.5)' }}
                      />
                      <span style={{ color: req.met ? 'rgba(212,175,55,0.9)' : 'rgba(156, 163, 175, 0.7)' }}>
                        {req.text}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2" style={{ color: 'rgba(212,175,55,0.9)' }}>
                Confirm Password
              </label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Confirm your password"
                  className="w-full pr-10"
                  style={{ background: '#000000', border: '1px solid rgba(212,175,55,0.25)' }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors duration-300"
                  style={{ color: 'rgba(212,175,55,0.7)' }}
                >
                  {showConfirmPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
              {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                <p className="mt-1 text-sm" style={{ color: '#ef4444' }}>Passwords do not match</p>
              )}
            </div>

            <div className="flex items-start">
              <input
                id="agreeToTerms"
                name="agreeToTerms"
                type="checkbox"
                checked={formData.agreeToTerms}
                onChange={handleInputChange}
                className="mt-1 rounded"
                style={{
                  accentColor: '#d4af37',
                  border: '1px solid rgba(212,175,55,0.5)',
                }}
              />
              <label htmlFor="agreeToTerms" className="ml-2 text-sm" style={{ color: 'rgba(156, 163, 175, 0.9)' }}>
                I agree to the{' '}
                <a href="#" className="transition-colors duration-300" style={{ color: '#d4af37' }}>
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="#" className="transition-colors duration-300" style={{ color: '#d4af37' }}>
                  Privacy Policy
                </a>
              </label>
            </div>

            <Button
              type="submit"
              className="w-full text-black font-semibold"
              style={{
                backgroundImage: 'linear-gradient(135deg, #d4af37, #f4e68c)',
                borderRadius: '12px',
                padding: '14px',
              }}
            >
              Create Account
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
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Facebook
              </Button>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm" style={{ color: 'rgba(156, 163, 175, 0.9)' }}>
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-medium transition-colors duration-300"
                style={{ color: '#d4af37' }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#f4e68c'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#d4af37'}
              >
                Sign in
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
