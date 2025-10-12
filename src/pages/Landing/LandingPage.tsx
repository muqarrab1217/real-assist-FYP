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
import { Testimonials } from '@/components/LandingPage/testimonials';
import { ExperienceVision } from '@/components/LandingPage/ExperienceVision';
import { FeaturedProjects } from '@/components/LandingPage/FeaturedProjects';

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
      <section 
        className="relative overflow-hidden pt-6 min-h-screen pt-24"
        style={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%)' }}
      >
        {/* subtle gold dot pattern overlay */}
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-30 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(rgba(212,175,55,0.1) 1px, transparent 1px)",
            backgroundSize: '50px 50px',
          }}
        />
        
        {/* Premium Background Elements */}
        <motion.div
          className="absolute inset-0"
          style={{ y, opacity }}
        >
          <div className="absolute top-20 left-10 w-96 h-96 bg-gold-500/20 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob"></div>
          <div className="absolute top-40 right-10 w-96 h-96 bg-bronze-500/20 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-96 h-96 bg-gold-400/20 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob animation-delay-4000"></div>
        </motion.div>

        <div className="relative mx-auto max-w-7xl px-4 py-24">
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
                <SparklesIcon className="h-6 w-6" style={{ color: '#d4af37' }} />
                <span 
                  className="font-semibold text-sm uppercase tracking-wider"
                  style={{ color: '#d4af37' }}
                >
                  Premium Real Estate Platform
                </span>
              </motion.div>

              <motion.h1 
                className="text-6xl lg:text-7xl font-bold leading-tight"
                style={{ 
                  color: 'white',
                  fontFamily: 'Playfair Display, serif'
                }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                Transform Your
                <motion.span 
                  className="block"
                  style={{
                    backgroundImage: 'linear-gradient(135deg, #d4af37, #f4e5a1)',
                    WebkitBackgroundClip: 'text',
                    backgroundClip: 'text',
                    color: 'transparent',
                  }}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                >
                  Investment Journey
                </motion.span>
              </motion.h1>
              
              <motion.p 
                className="text-lg mt-4 leading-relaxed max-w-2xl"
                style={{ color: 'rgba(156, 163, 175, 0.9)' }}
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
                    <Button 
                      size="lg" 
                      className="group py-2 px-4 rounded-xl"
                      style={{
                        background: 'linear-gradient(135deg, #d4af37, #f4e5a1)',
                        color: '#0a0a0a',
                        border: 'none'
                      }}
                    >
                      Get Started Free
                      <ArrowRightIcon className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </motion.div>
                </Link>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button 
                    size="lg" 
                    className="group py-2 px-4 rounded-xl"
                    style={{
                      background: 'rgba(26,26,26,0.75)',
                      color: 'white',
                      border: '1px solid rgba(212,175,55,0.25)',
                      backdropFilter: 'blur(10px)'
                    }}
                  >
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
                  <TrophyIcon className="h-5 w-5" style={{ color: '#d4af37' }} />
                  <span className="text-sm" style={{ color: 'rgba(156, 163, 175, 0.9)' }}>Trusted by 500+ Developers</span>
                </div>
                <div className="flex items-center gap-2">
                  <RocketLaunchIcon className="h-5 w-5" style={{ color: '#d4af37' }} />
                  <span className="text-sm" style={{ color: 'rgba(156, 163, 175, 0.9)' }}>$2B+ Portfolio Managed</span>
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
                      <StarIcon className="h-5 w-5" style={{ color: '#d4af37' }} />
                    </motion.div>
                  ))}
                  <span className="ml-2" style={{ color: 'rgba(156, 163, 175, 0.9)' }}>4.9/5 from 500+ users</span>
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
                className="rounded-2xl shadow-2xl p-8 text-white border backdrop-blur"
                style={{
                  background: 'rgba(26,26,26,0.75)',
                  borderColor: 'rgba(212,175,55,0.25)',
                  boxShadow: '0 0 0 0 rgba(212,175,55,0)',
                }}
                whileHover={{ scale: 1.02, rotateY: 5 }}
                transition={{ duration: 0.3 }}
              >
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 
                      className="text-lg font-semibold text-white"
                      style={{ fontFamily: 'Playfair Display, serif' }}
                    >
                      Dashboard Overview
                    </h3>
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
                      className="p-4 rounded-lg"
                      style={{
                        background: 'linear-gradient(135deg, #d4af37, #f4e5a1)',
                        boxShadow: '0 8px 25px rgba(212,175,55,0.4)',
                      }}
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div 
                        className="text-2xl font-bold text-white"
                        style={{ fontFamily: 'Playfair Display, serif' }}
                      >
                        $2.4M
                      </div>
                      <div className="text-sm" style={{ color: 'rgba(10, 10, 10, 0.8)' }}>Total Revenue</div>
                    </motion.div>
                    <motion.div 
                      className="p-4 rounded-lg"
                      style={{
                        background: 'rgba(26,26,26,0.6)',
                        border: '1px solid rgba(212,175,55,0.25)',
                      }}
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div 
                        className="text-2xl font-bold text-white"
                        style={{ fontFamily: 'Playfair Display, serif' }}
                      >
                        +24%
                      </div>
                      <div className="text-sm" style={{ color: 'rgba(156, 163, 175, 0.9)' }}>Growth Rate</div>
                    </motion.div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm" style={{ color: 'rgba(156, 163, 175, 0.9)' }}>Lead Conversion</span>
                      <span className="text-sm font-medium text-white">85%</span>
                    </div>
                    <div className="w-full rounded-full h-2" style={{ background: 'rgba(26,26,26,0.6)' }}>
                      <motion.div 
                        className="h-2 rounded-full"
                        style={{
                          background: 'linear-gradient(135deg, #d4af37, #f4e5a1)',
                        }}
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
                className="absolute -top-4 -right-4 w-8 h-8 rounded-full"
                style={{
                  background: 'linear-gradient(135deg, #d4af37, #f4e5a1)',
                  boxShadow: '0 8px 25px rgba(212,175,55,0.4)',
                }}
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <motion.div
                className="absolute -bottom-4 -left-4 w-6 h-6 rounded-full"
                style={{
                  background: 'rgba(26,26,26,0.6)',
                  border: '1px solid rgba(212,175,55,0.25)',
                }}
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 2, repeat: Infinity, delay: 1 }}
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Why Choose ABS Developers Section */}
      <section 
        className="relative py-16 md:py-20"
        style={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%)' }}
      >
        {/* subtle gold dot pattern overlay */}
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-30 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(rgba(212,175,55,0.1) 1px, transparent 1px)",
            backgroundSize: '50px 50px',
          }}
        />
        
        <div className="relative mx-auto max-w-7xl px-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-8 md:mb-12"
          >
            <h2 
              className="text-3xl md:text-4xl font-semibold tracking-tight"
              style={{
                backgroundImage: 'linear-gradient(135deg, #d4af37, #f4e5a1)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                color: 'transparent',
                fontFamily: 'Playfair Display, serif',
              }}
            >
              Why Choose RealAssist
            </h2>
            <p className="mt-3 text-base md:text-lg text-gray-300 max-w-3xl mx-auto">
              Experience the difference of working with Pakistan's first Shariah compliant real estate leaders
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: StarIcon,
                number: "World's 1st",
                description: "100% SHARIAH COMPLIANT COMPANY"
              },
              {
                icon: ChartBarIcon,
                number: "7.5M+",
                description: "SQ. FT PLANNED PROJECTS"
              },
              {
                icon: UserGroupIcon,
                number: "5000+",
                description: "SATISFIED CLIENTS"
              },
              {
                icon: TrophyIcon,
                number: "16+",
                description: "DELIVERED PROJECTS"
              }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ 
                  y: -10,
                  scale: 1.02,
                  transition: { duration: 0.3 }
                }}
                className="group relative rounded-2xl p-6 md:p-8 border backdrop-blur transition transform hover:-translate-y-2"
                style={{
                  background: 'rgba(26,26,26,0.75)',
                  borderColor: 'rgba(212,175,55,0.25)',
                  boxShadow: '0 0 0 0 rgba(212,175,55,0)',
                }}
              >
                <motion.div 
                  className="h-16 w-16 bg-gradient-to-r from-[#d4af37] to-[#f4e68c] rounded-full flex items-center justify-center mx-auto mb-6 shadow-gold group-hover:shadow-gold-lg transition-all duration-300"
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.6 }}
                >
                  <stat.icon className="h-8 w-8 text-white" />
                </motion.div>
                <h3 className="text-3xl font-display font-bold text-white mb-3">
                  {stat.number}
                </h3>
                <p className="text-sm text-charcoal-300 uppercase tracking-wider font-semibold">
                  {stat.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Projects Section */}
      <FeaturedProjects />

      {/* Features Section */}
      <section 
        id="features" 
        className="relative py-16 md:py-20"
        style={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%)' }}
      >
        {/* subtle gold dot pattern overlay */}
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-30 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(rgba(212,175,55,0.1) 1px, transparent 1px)",
            backgroundSize: '50px 50px',
          }}
        />
        
        <div className="relative mx-auto max-w-7xl px-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-8 md:mb-12"
          >
            <h2 
              className="text-3xl md:text-4xl font-semibold tracking-tight"
              style={{
                backgroundImage: 'linear-gradient(135deg, #d4af37, #f4e5a1)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                color: 'transparent',
                fontFamily: 'Playfair Display, serif',
              }}
            >
              Premium Features for Modern Real Estate
            </h2>
            <p className="mt-3 text-base md:text-lg text-gray-300 max-w-3xl mx-auto">
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
                className="group relative rounded-2xl p-6 md:p-8 border backdrop-blur transition transform hover:-translate-y-2"
                style={{
                  background: 'rgba(26,26,26,0.75)',
                  borderColor: 'rgba(212,175,55,0.25)',
                  boxShadow: '0 0 0 0 rgba(212,175,55,0)',
                }}
              >
                <motion.div 
                  className="h-16 w-16 bg-gradient-to-r from-[#d4af37] to-[#f4e5a1] rounded-full flex items-center justify-center mb-6 shadow-gold group-hover:shadow-gold-lg transition-all duration-300"
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.6 }}
                >
                  <feature.icon className="h-8 w-8 text-white" />
                </motion.div>
                <h3 
                  className="text-xl font-semibold mb-4"
                  style={{ 
                    color: '#d4af37',
                    fontFamily: 'Playfair Display, serif'
                  }}
                >
                  {feature.title}
                </h3>
                <p className="text-gray-300 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Detailed Features Section */}
      <section 
        className="relative py-16 md:py-20"
        style={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%)' }}
      >
        {/* subtle gold dot pattern overlay */}
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-30 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(rgba(212,175,55,0.1) 1px, transparent 1px)",
            backgroundSize: '50px 50px',
          }}
        />
        
        <div className="relative mx-auto max-w-7xl px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: ShieldCheckIcon,
                title: "100% Shariah Compliant",
                description: "World's first 100% Shariah compliant real estate company ensuring your investments align with Islamic principles. Every project, transaction, and partnership follows strict Islamic guidelines.",
                button: "CERTIFIED ISLAMIC"
              },
              {
                icon: BuildingOfficeIcon,
                title: "Prime Bahria Town Location",
                description: "Strategic developments in Bahria Town, Lahore - Pakistan's most prestigious planned community. Our projects benefit from excellent connectivity, world-class amenities, and high investment returns.",
                button: "PREMIUM LOCATION"
              },
              {
                icon: UserGroupIcon,
                title: "Expert Leadership",
                description: "Led by Dr. Subbayal and a team of highly seasoned industry executives. Our leadership brings decades of experience in luxury real estate development and Islamic finance.",
                button: "EXPERIENCED TEAM"
              },
              {
                icon: UserGroupIcon,
                title: "Trusted Partnerships",
                description: "Strategic partnerships with industry leaders including DASCON (construction), INTERWOOD (interiors), and BAHRIA TOWN (development). Quality assured through proven collaborations.",
                button: "QUALITY PARTNERS"
              },
              {
                icon: BuildingOfficeIcon,
                title: "Innovative Architecture",
                description: "State-of-the-art technologies and modern amenities in every building. From Pearl One series to Burj Quaid, we create architectural marvels that redefine luxury living.",
                button: "MODERN DESIGN"
              },
              {
                icon: ShieldCheckIcon,
                title: "Proven Track Record",
                description: "16+ successfully delivered projects, 500+ brand outlets, and over 1000 satisfied clients. Our commitment to excellence is reflected in every completed development.",
                button: "TRUSTED RESULTS"
              }
            ].map((feature, index) => (
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
                className="group relative rounded-2xl p-6 md:p-8 border backdrop-blur transition transform hover:-translate-y-2"
                style={{
                  background: 'rgba(26,26,26,0.75)',
                  borderColor: 'rgba(212,175,55,0.25)',
                  boxShadow: '0 0 0 0 rgba(212,175,55,0)',
                }}
              >
                <motion.div 
                  className="h-16 w-16 bg-gradient-to-r from-[#d4af37] to-[#f4e68c] rounded-full flex items-center justify-center mb-6 shadow-gold group-hover:shadow-gold-lg transition-all duration-300"
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.6 }}
                >
                  <feature.icon className="h-8 w-8 text-white" />
                </motion.div>
                <h3 
                  className="text-2xl font-semibold mb-4"
                  style={{ 
                    color: '#d4af37',
                    fontFamily: 'Playfair Display, serif'
                  }}
                >
                  {feature.title}
                </h3>
                <p className="text-gray-300 mb-6 leading-relaxed">
                  {feature.description}
                </p>
                <Button 
                  className="font-semibold text-sm px-6 py-2 rounded-xl"
                  style={{
                    background: 'linear-gradient(135deg, #d4af37, #f4e5a1)',
                    color: '#0a0a0a',
                    border: 'none'
                  }}
                >
                  {feature.button}
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Experience Vision Component */}
      <ExperienceVision />

      {/* Additional Testimonials Component */}
      <Testimonials />

      {/* CTA Section */}
      <section 
        className="relative py-16 md:py-20"
        style={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%)' }}
      >
        {/* subtle gold dot pattern overlay */}
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-30 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(rgba(212,175,55,0.1) 1px, transparent 1px)",
            backgroundSize: '50px 50px',
          }}
        />
        
        <div className="relative mx-auto max-w-4xl px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 
              className="text-3xl md:text-4xl font-semibold tracking-tight mb-6"
              style={{
                backgroundImage: 'linear-gradient(135deg, #d4af37, #f4e5a1)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                color: 'transparent',
                fontFamily: 'Playfair Display, serif',
              }}
            >
              Ready to Transform Your Real Estate Business?
            </h2>
            <p className="text-base md:text-lg text-gray-300 mb-8 max-w-3xl mx-auto">
              Join thousands of investors who trust RealAssist for their property management needs.
            </p>
            <Link to="/register">
              <Button 
                size="lg" 
                className="text-lg px-8 py-4 font-semibold"
                style={{
                  background: 'linear-gradient(135deg, #d4af37, #f4e5a1)',
                  color: '#0a0a0a',
                  border: 'none'
                }}
              >
                Get Started Today
                <ArrowRightIcon className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer 
        className="relative py-12"
        style={{ 
          background: 'linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%)',
          borderTop: '1px solid rgba(212,175,55,0.2)'
        }}
      >
        <div className="relative mx-auto max-w-7xl px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <Link to="/" className="flex items-center space-x-2 mb-4">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-[#d4af37] to-[#f4e68c] flex items-center justify-center shadow-gold">
                  <span className="text-white font-bold text-sm">RA</span>
                </div>
                <span 
                  className="text-xl font-bold"
                  style={{ 
                    color: '#d4af37',
                    fontFamily: 'Playfair Display, serif'
                  }}
                >
                  RealAssist
                </span>
              </Link>
              <p className="text-gray-300">
                AI-powered real estate automation platform for modern investors.
              </p>
            </div>
            
            <div>
              <h3 
                className="font-semibold mb-4"
                style={{ color: '#d4af37' }}
              >
                Product
              </h3>
              <ul className="space-y-2 text-gray-300">
                <li><a href="#" className="hover:text-gray-100 transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-gray-100 transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-gray-100 transition-colors">Demo</a></li>
              </ul>
            </div>
            
            <div>
              <h3 
                className="font-semibold mb-4"
                style={{ color: '#d4af37' }}
              >
                Support
              </h3>
              <ul className="space-y-2 text-gray-300">
                <li><a href="#" className="hover:text-gray-100 transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-gray-100 transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-gray-100 transition-colors">Documentation</a></li>
              </ul>
            </div>
            
            <div>
              <h3 
                className="font-semibold mb-4"
                style={{ color: '#d4af37' }}
              >
                Legal
              </h3>
              <ul className="space-y-2 text-gray-300">
                <li><a href="#" className="hover:text-gray-100 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-gray-100 transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-gray-100 transition-colors">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
          
          <div 
            className="mt-8 pt-8 text-center"
            style={{ 
              borderTop: '1px solid rgba(212,175,55,0.2)',
              color: 'rgba(156, 163, 175, 0.8)'
            }}
          >
            <p>&copy; 2024 RealAssist. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
