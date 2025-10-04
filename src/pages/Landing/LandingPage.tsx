import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  ArrowRightIcon,
  StarIcon,
  BuildingOfficeIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  UserGroupIcon,
  ClockIcon,
  ShieldCheckIcon,
  PlayIcon
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';

export const LandingPage: React.FC = () => {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 300], [0, -50]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0.8]);

  const features = [
    {
      icon: BuildingOfficeIcon,
      title: 'Smart Lead Management',
      description: 'AI-powered lead scoring and automated follow-up sequences to maximize conversion rates.',
    },
    {
      icon: CurrencyDollarIcon,
      title: 'Payment Automation',
      description: 'Streamlined payment processing with automated reminders and real-time tracking.',
    },
    {
      icon: ChartBarIcon,
      title: 'Analytics Dashboard',
      description: 'Comprehensive insights and reporting to track performance and optimize strategies.',
    },
    {
      icon: UserGroupIcon,
      title: 'Client Management',
      description: 'Centralized client profiles with complete investment history and communication logs.',
    },
    {
      icon: ClockIcon,
      title: 'Real-time Updates',
      description: 'Instant notifications for project milestones, payments, and important announcements.',
    },
    {
      icon: ShieldCheckIcon,
      title: 'Secure & Compliant',
      description: 'Bank-level security with full compliance to real estate regulations and standards.',
    },
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Real Estate Investor',
      content: 'RealAssist has transformed how I manage my property investments. The AI insights are incredibly accurate.',
      rating: 5,
    },
    {
      name: 'Michael Chen',
      role: 'Investment Advisor',
      content: 'The automation features save me hours every week. My clients love the real-time updates.',
      rating: 5,
    },
    {
      name: 'Emily Rodriguez',
      role: 'Property Developer',
      content: 'The lead management system is game-changing. We\'ve increased our conversion rate by 40%.',
      rating: 5,
    },
  ];

  return (
    <div className="bg-white">
      {/* Navigation */}
      <nav className="fixed top-2 left-0 right-0 z-50 max-w-7xl mx-auto rounded-lg bg-blue/80 backdrop-blur-md border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2">
              <div className="h-8 px-2 rounded-lg bg-gradient-to-r from-purple-400 to-blue-600 flex items-center justify-center">
                <span className="text-white font-bold text-lg">RealAssist.co</span>
              </div>
              {/* <span className="text-xl font-bold text-blue-400">RealAssist</span> */}
            </Link>
            
            <div className="hidden md:flex items-center space-x-2 ">
              <a href="#features" className="px-4 py-2 text-gray-700 font-bold hover:bg-white/50 hover:text-purple-600 rounded-lg transition-all duration-200">Features</a>
              <a href="#testimonials" className="px-4 py-2 text-gray-700 font-bold hover:bg-white/50 hover:text-purple-600 rounded-lg transition-all duration-200">Testimonials</a>
              <a href="#pricing" className="px-4 py-2 text-gray-700 font-bold hover:bg-white/50 hover:text-purple-600 rounded-lg transition-all duration-200">Pricing</a>
            </div>
            
            <div className="flex items-center space-x-3">
              <Link to="/login">
                <Button variant="ghost" className="text-gray-700 font-semibold hover:bg-white/50 hover:text-purple-600">
                  Sign In
                </Button>
              </Link>
              <Link to="/register">
                <Button className="bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 border-0 shadow-lg">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br pt-24 from-purple-50 via-blue-50 to-indigo-100 min-h-screen">
        {/* Animated Background Elements */}
        <motion.div
          className="absolute inset-0"
          style={{ y, opacity }}
        >
          <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        </motion.div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <motion.h1 
                className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                AI-Powered Real Estate
                <motion.span 
                  className="gradient-text block"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                >
                  Automation
                </motion.span>
              </motion.h1>
              
              <motion.p 
                className="text-xl text-gray-600 mt-6 leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                Streamline your property investments with intelligent automation, 
                real-time insights, and seamless client management. 
                Transform your real estate business today.
              </motion.p>
              
              <motion.div 
                className="flex flex-col sm:flex-row gap-4 mt-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
              >
                <Link to="/register">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button size="lg" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-lg px-8 py-4">
                      Start Free Trial
                      <ArrowRightIcon className="ml-2 h-5 w-5" />
                    </Button>
                  </motion.div>
                </Link>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button size="lg" variant="outline" className="text-lg px-8 py-4">
                    <PlayIcon className="mr-2 h-5 w-5" />
                    Watch Demo
                  </Button>
                </motion.div>
              </motion.div>
              
              <motion.div 
                className="flex items-center space-x-6 mt-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.0 }}
              >
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: 1.2 + i * 0.1 }}
                    >
                      <StarIcon className="h-5 w-5 text-yellow-400 fill-current" />
                    </motion.div>
                  ))}
                  <span className="ml-2 text-gray-600">4.9/5 from 500+ users</span>
                </div>
              </motion.div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              {/* Inverted Dashboard Card */}
              <motion.div 
                className="bg-gray-900 rounded-2xl shadow-2xl p-8 text-white"
                whileHover={{ scale: 1.02, rotateY: 5 }}
                transition={{ duration: 0.3 }}
              >
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-white">Dashboard Overview</h3>
                    <div className="flex space-x-2">
                      <motion.div 
                        className="w-3 h-3 bg-red-400 rounded-full"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      ></motion.div>
                      <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <motion.div 
                      className="bg-gradient-to-r from-purple-600 to-blue-600 p-4 rounded-lg"
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="text-2xl font-bold text-white">$2.4M</div>
                      <div className="text-sm text-purple-100">Total Revenue</div>
                    </motion.div>
                    <motion.div 
                      className="bg-gradient-to-r from-green-600 to-emerald-600 p-4 rounded-lg"
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="text-2xl font-bold text-white">+24%</div>
                      <div className="text-sm text-green-100">Growth Rate</div>
                    </motion.div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-300">Lead Conversion</span>
                      <span className="text-sm font-medium text-white">85%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <motion.div 
                        className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: "85%" }}
                        transition={{ duration: 2, delay: 1 }}
                      ></motion.div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Floating Elements */}
              <motion.div
                className="absolute -top-4 -right-4 w-8 h-8 bg-purple-500 rounded-full"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <motion.div
                className="absolute -bottom-4 -left-4 w-6 h-6 bg-blue-500 rounded-full"
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 2, repeat: Infinity, delay: 1 }}
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our comprehensive platform provides all the tools and insights 
              you need to manage your real estate investments effectively.
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ 
                  y: -10,
                  scale: 1.02,
                  transition: { duration: 0.3 }
                }}
                className="bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 group"
              >
                <motion.div 
                  className="h-12 w-12 bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg flex items-center justify-center mb-6 group-hover:from-purple-600 group-hover:to-blue-600 transition-all duration-300"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <feature.icon className="h-6 w-6 text-purple-600 group-hover:text-white transition-colors duration-300" />
                </motion.div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4 group-hover:text-purple-600 transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors duration-300">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Trusted by Industry Leaders
            </h2>
            <p className="text-xl text-gray-600">
              See what our clients say about RealAssist
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ 
                  y: -5,
                  scale: 1.02,
                  transition: { duration: 0.3 }
                }}
                className="bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 group"
              >
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: index * 0.1 + i * 0.1 }}
                    >
                      <StarIcon className="h-5 w-5 text-yellow-400 fill-current" />
                    </motion.div>
                  ))}
                </div>
                <p className="text-gray-600 mb-6 italic group-hover:text-gray-700 transition-colors duration-300">
                  "{testimonial.content}"
                </p>
                <div>
                  <div className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors duration-300">{testimonial.name}</div>
                  <div className="text-sm text-gray-500">{testimonial.role}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-purple-600 to-blue-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to Transform Your Real Estate Business?
            </h2>
            <p className="text-xl text-purple-100 mb-8">
              Join thousands of investors who trust RealAssist for their property management needs.
            </p>
            <Link to="/register">
              <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-50 text-lg px-8 py-4">
                Get Started Today
                <ArrowRightIcon className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <Link to="/" className="flex items-center space-x-2 mb-4">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">RA</span>
                </div>
                <span className="text-xl font-bold">RealAssist</span>
              </Link>
              <p className="text-gray-400">
                AI-powered real estate automation platform for modern investors.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Demo</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 RealAssist. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
