import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeftIcon, EnvelopeIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setIsSubmitted(true);
    }
  };

  if (isSubmitted) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-center min-h-screen"
      >
        <Card className="w-full max-w-md mx-auto" style={{
          background: 'rgba(26,26,26,0.75)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(212,175,55,0.25)',
          borderRadius: '24px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
        }}>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-6">
              <img src="/images/logo.png" alt="ABS Developers" className="h-16 w-auto" />
            </div>
            <div className="mx-auto h-16 w-16 rounded-full flex items-center justify-center mb-4" style={{
              backgroundImage: 'linear-gradient(135deg, #d4af37, #f4e68c)',
            }}>
              <EnvelopeIcon className="h-8 w-8 text-black" />
            </div>
            <CardTitle className="text-2xl font-bold" style={{ 
              fontFamily: 'Playfair Display, serif',
              backgroundImage: 'linear-gradient(135deg, #d4af37, #f4e68c)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent',
            }}>Check Your Email</CardTitle>
            <CardDescription style={{ color: 'rgba(156, 163, 175, 0.9)' }}>
              We've sent a password reset link to your email address
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="mb-6" style={{ color: 'rgba(156, 163, 175, 0.9)' }}>
              Please check your email inbox and click the link to reset your password. 
              If you don't see the email, check your spam folder.
            </p>
            
            <div className="space-y-4">
              <Button
                onClick={() => setIsSubmitted(false)}
                className="w-full"
                style={{
                  background: '#000000',
                  border: '1px solid rgba(212,175,55,0.25)',
                  color: 'white',
                }}
              >
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                Back to Reset
              </Button>
              
              <Link to="/login">
                <Button className="w-full" style={{ 
                  background: '#000000',
                  border: '1px solid rgba(212,175,55,0.25)',
                  color: 'white'
                }}>
                  Back to Sign In
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex items-center justify-center min-h-screen"
    >
      <Card className="w-full max-w-md mx-auto" style={{
        background: 'rgba(26,26,26,0.75)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(212,175,55,0.25)',
        borderRadius: '24px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
      }}>
        <CardHeader className="text-center">
          <div className="flex justify-center mb-6">
            <img src="/images/logo.png" alt="ABS Developers" className="h-16 w-auto" />
          </div>
          <CardTitle className="text-2xl font-bold" style={{ 
            fontFamily: 'Playfair Display, serif',
            backgroundImage: 'linear-gradient(135deg, #d4af37, #f4e68c)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
          }}>Reset Password</CardTitle>
          <CardDescription style={{ color: 'rgba(156, 163, 175, 0.9)' }}>
            Enter your email address and we'll send you a link to reset your password
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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                style={{ background: '#000000', border: '1px solid rgba(212,175,55,0.25)' }}
              />
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
              Send Reset Link
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="inline-flex items-center text-sm transition-colors duration-300"
              style={{ color: '#d4af37' }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#f4e68c'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#d4af37'}
            >
              <ArrowLeftIcon className="h-4 w-4 mr-1" />
              Back to Sign In
            </Link>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
