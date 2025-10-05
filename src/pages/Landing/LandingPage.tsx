import React from 'react';
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
  PlayIcon,
  SparklesIcon,
  TrophyIcon,
  RocketLaunchIcon
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
    <div className="bg-gradient-to-br from-charcoal-50 via-white to-gold-50/30 dark:from-navy-950 dark:via-charcoal-900 dark:to-navy-900 min-h-screen">
      {/* Animated Background Blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gold-300/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-navy-300/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-1/2 w-80 h-80 bg-bronze-300/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      {/* Navigation */}
      <motion.nav 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="fixed top-4 left-4 right-4 z-50 max-w-7xl mx-auto rounded-2xl"
      >
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
          <div className="flex justify-between items-center h-18">
            <Link to="/" className="flex items-center space-x-3 group">
              <motion.div 
                whileHover={{ scale: 1.05, rotate: 5 }}
                className="h-10 w-10 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#f4e68c] flex items-center justify-center shadow-gold group-hover:shadow-gold-lg transition-all duration-300"
              >
                <BuildingOfficeIcon className="h-6 w-6 text-white" />
              </motion.div>
              <span className="text-xl font-display font-bold text-charcoal-900 dark:text-white group-hover:abs-gradient-text transition-all duration-300">
                RealAssist
              </span>
            </Link>
            
            <div className="hidden md:flex items-center space-x-1">
              <motion.a 
                whileHover={{ scale: 1.05 }}
                href="#features" 
                className="px-4 py-2 text-charcoal-700 dark:text-charcoal-300 font-medium hover:bg-gold-50 dark:hover:bg-gold-900/20 hover:text-gold-600 dark:hover:text-gold-400 rounded-xl transition-all duration-300"
              >
                Features
              </motion.a>
              <motion.a 
                whileHover={{ scale: 1.05 }}
                href="#testimonials" 
                className="px-4 py-2 text-charcoal-700 dark:text-charcoal-300 font-medium hover:bg-gold-50 dark:hover:bg-gold-900/20 hover:text-gold-600 dark:hover:text-gold-400 rounded-xl transition-all duration-300"
              >
                Testimonials
              </motion.a>
              <motion.a 
                whileHover={{ scale: 1.05 }}
                href="#pricing" 
                className="px-4 py-2 text-charcoal-700 dark:text-charcoal-300 font-medium hover:bg-gold-50 dark:hover:bg-gold-900/20 hover:text-gold-600 dark:hover:text-gold-400 rounded-xl transition-all duration-300"
              >
                Pricing
              </motion.a>
            </div>
            
            <div className="flex items-center space-x-3">
              <Link to="/login">
                <Button variant="ghost" className="text-charcoal-700 dark:text-charcoal-300 font-semibold hover:bg-gold-50 dark:hover:bg-gold-900/20 hover:text-gold-600 dark:hover:text-gold-400 border-0 transition-all duration-300">
                  Sign In
                </Button>
              </Link>
              <Link to="/register">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button className="abs-btn-primary group">
                  Get Started
                    <ArrowRightIcon className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                </Button>
                </motion.div>
              </Link>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden abs-gradient-bg pt-10 min-h-screen">
        {/* Premium Background Elements */}
        <motion.div
          className="absolute inset-0"
          style={{ y, opacity }}
        >
          <div className="absolute top-20 left-10 w-96 h-96 bg-gold-500/20 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob"></div>
          <div className="absolute top-40 right-10 w-96 h-96 bg-bronze-500/20 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-96 h-96 bg-gold-400/20 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob animation-delay-4000"></div>
          
          {/* Premium Grid Pattern */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23f59e0b%22%20fill-opacity%3D%220.05%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%221%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40"></div>
        </motion.div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1 }}
                className="flex items-center gap-2 mb-6"
              >
                <SparklesIcon className="h-6 w-6 text-gold-500" />
                <span className="text-gold-400 font-semibold text-sm uppercase tracking-wider">Premium Real Estate Platform</span>
              </motion.div>

              <motion.h1 
                className="text-6xl lg:text-7xl font-display font-bold text-white leading-tight"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                Transform Your
                <motion.span 
                  className="abs-gradient-text block"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                >
                  Investment Journey
                </motion.span>
              </motion.h1>
              
              <motion.p 
                className="text-lg text-charcoal-200 mt-4 leading-relaxed max-w-2xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                The ultimate platform for real estate developers and investors. 
                Manage leads, track payments, and grow your portfolio with confidence.
              </motion.p>
              
              <motion.div 
                className="flex flex-col sm:flex-row gap-6 mt-10"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
              >
                <Link to="/register">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button size="lg" className="abs-btn-primary group">
                      Get Started Free
                      <ArrowRightIcon className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                  </motion.div>
                </Link>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button size="lg" variant="outline" className="abs-btn-secondary group">
                    <PlayIcon className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                  Watch Demo
                </Button>
                </motion.div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.0 }}
                className="mt-6 flex items-center gap-8"
              >
                <div className="flex items-center gap-2">
                  <TrophyIcon className="h-5 w-5 text-gold-500" />
                  <span className="text-charcoal-200 text-sm">Trusted by 500+ Developers</span>
                </div>
                <div className="flex items-center gap-2">
                  <RocketLaunchIcon className="h-5 w-5 text-gold-500" />
                  <span className="text-charcoal-200 text-sm">$2B+ Portfolio Managed</span>
              </div>
              </motion.div>
              
              <motion.div 
                className="flex items-center space-x-6 mt-4"
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
                className="bg-charcoal-900 rounded-2xl shadow-2xl p-8 text-white border border-gold-200/20"
                whileHover={{ scale: 1.02, rotateY: 5 }}
                transition={{ duration: 0.3 }}
              >
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-white font-display">Dashboard Overview</h3>
                    <div className="flex space-x-2">
                      <motion.div 
                        className="w-3 h-3 bg-red-400 rounded-full"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      ></motion.div>
                      <div className="w-3 h-3 bg-gold-400 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <motion.div 
                      className="bg-gradient-to-r from-[#d4af37] to-[#f4e68c] p-4 rounded-lg shadow-gold"
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="text-2xl font-bold text-white font-display">$2.4M</div>
                      <div className="text-sm text-gold-100">Total Revenue</div>
                    </motion.div>
                    <motion.div 
                      className="bg-gradient-to-r from-navy-600 to-charcoal-700 p-4 rounded-lg"
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="text-2xl font-bold text-white font-display">+24%</div>
                      <div className="text-sm text-charcoal-200">Growth Rate</div>
                    </motion.div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-charcoal-300">Lead Conversion</span>
                      <span className="text-sm font-medium text-white">85%</span>
                    </div>
                    <div className="w-full bg-charcoal-700 rounded-full h-2">
                      <motion.div 
                        className="bg-gradient-to-r from-[#d4af37] to-[#f4e68c] h-2 rounded-full"
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
                className="absolute -top-4 -right-4 w-8 h-8 bg-gradient-to-r from-[#d4af37] to-[#f4e68c] rounded-full shadow-gold"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <motion.div
                className="absolute -bottom-4 -left-4 w-6 h-6 bg-gradient-to-r from-navy-500 to-charcoal-600 rounded-full"
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 2, repeat: Infinity, delay: 1 }}
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-gradient-to-br from-charcoal-50 to-white dark:from-charcoal-900 dark:to-charcoal-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl font-display font-bold text-charcoal-900 dark:text-white mb-6">
              Premium Features for
              <span className="block abs-gradient-text">Modern Real Estate</span>
            </h2>
            <p className="text-xl text-charcoal-600 dark:text-charcoal-300 max-w-3xl mx-auto">
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
                className="abs-card-premium p-8 group"
              >
                <motion.div 
                  className="h-14 w-14 bg-gradient-to-r from-gold-100 to-bronze-100 dark:from-gold-900/30 dark:to-bronze-900/30 rounded-xl flex items-center justify-center mb-6 group-hover:from-gold-500 group-hover:to-bronze-500 transition-all duration-300"
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.6 }}
                >
                  <feature.icon className="h-7 w-7 text-gold-600 dark:text-gold-400 group-hover:text-white transition-colors duration-300" />
                </motion.div>
                <h3 className="text-xl font-semibold text-charcoal-900 dark:text-white mb-4 group-hover:text-gold-600 transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-charcoal-600 dark:text-charcoal-300 leading-relaxed group-hover:text-charcoal-700 dark:group-hover:text-charcoal-200 transition-colors duration-300">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-24 bg-gradient-to-br from-charcoal-50 to-gold-50/30 dark:from-charcoal-900 dark:to-navy-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl font-display font-bold text-charcoal-900 dark:text-white mb-6">
              Trusted by Industry Leaders
            </h2>
            <p className="text-xl text-charcoal-600 dark:text-charcoal-300">
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
                className="abs-card-premium p-8 group"
              >
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: index * 0.1 + i * 0.1 }}
                    >
                      <StarIcon className="h-5 w-5 text-gold-500 fill-current" />
                    </motion.div>
                  ))}
                </div>
                <p className="text-charcoal-600 dark:text-charcoal-300 mb-6 italic group-hover:text-charcoal-700 dark:group-hover:text-charcoal-200 transition-colors duration-300">
                  "{testimonial.content}"
                </p>
                <div>
                  <div className="font-semibold text-charcoal-900 dark:text-white group-hover:text-gold-600 dark:group-hover:text-gold-400 transition-colors duration-300">{testimonial.name}</div>
                  <div className="text-sm text-charcoal-500 dark:text-charcoal-400">{testimonial.role}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 abs-gradient-bg">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl font-display font-bold text-white mb-6">
              Ready to Transform Your Real Estate Business?
            </h2>
            <p className="text-xl text-charcoal-200 mb-8">
              Join thousands of investors who trust RealAssist for their property management needs.
            </p>
            <Link to="/register">
              <Button size="lg" className="bg-gradient-to-r from-[#d4af37] to-[#f4e68c] text-white hover:shadow-gold-lg text-lg px-8 py-4 font-semibold">
                Get Started Today
                <ArrowRightIcon className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-charcoal-900 text-white py-12 border-t border-gold-200/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <Link to="/" className="flex items-center space-x-2 mb-4">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-[#d4af37] to-[#f4e68c] flex items-center justify-center shadow-gold">
                  <span className="text-white font-bold text-sm">RA</span>
                </div>
                <span className="text-xl font-display font-bold">RealAssist</span>
              </Link>
              <p className="text-charcoal-300">
                AI-powered real estate automation platform for modern investors.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4 text-gold-400">Product</h3>
              <ul className="space-y-2 text-charcoal-300">
                <li><a href="#" className="hover:text-gold-400 transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-gold-400 transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-gold-400 transition-colors">Demo</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4 text-gold-400">Support</h3>
              <ul className="space-y-2 text-charcoal-300">
                <li><a href="#" className="hover:text-gold-400 transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-gold-400 transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-gold-400 transition-colors">Documentation</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4 text-gold-400">Legal</h3>
              <ul className="space-y-2 text-charcoal-300">
                <li><a href="#" className="hover:text-gold-400 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-gold-400 transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-gold-400 transition-colors">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-charcoal-700 mt-8 pt-8 text-center text-charcoal-400">
            <p>&copy; 2024 RealAssist. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
