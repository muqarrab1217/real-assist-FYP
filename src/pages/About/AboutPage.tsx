import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowRightIcon,
  BuildingOffice2Icon,
  ShieldCheckIcon,
  UserGroupIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  SparklesIcon,
  TrophyIcon,
  ChartBarIcon,
  ClockIcon,
  HomeModernIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  HandThumbUpIcon,
  LightBulbIcon,
  RocketLaunchIcon
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';

export const AboutPage: React.FC = () => {
  const companyValues = [
    {
      icon: ShieldCheckIcon,
      title: '100% SHARIAH Compliant',
      description: 'World\'s first 100% SHARIAH compliant real estate company. Every project, transaction, and partnership strictly follows Islamic guidelines and principles.'
    },
    {
      icon: HandThumbUpIcon,
      title: 'Integrity & Transparency',
      description: 'We believe in honest communication and transparent dealings. All project details, payment plans, and documentation are crystal clear.'
    },
    {
      icon: TrophyIcon,
      title: 'Excellence in Delivery',
      description: 'With 16+ delivered projects and 5000+ satisfied clients, we maintain the highest standards in construction quality and timely possession.'
    },
    {
      icon: UserGroupIcon,
      title: 'Customer-Centric Approach',
      description: 'Your satisfaction is our priority. We provide dedicated support throughout your investment journey, from booking to possession.'
    }
  ];

  const communicationPolicies = [
    {
      icon: ChatBubbleLeftRightIcon,
      title: 'Open Communication',
      description: 'We maintain transparent communication channels with all stakeholders. Regular updates, progress reports, and prompt responses to queries.'
    },
    {
      icon: ClockIcon,
      title: '24/7 Support',
      description: 'Our customer support team is available round the clock to address your concerns, answer questions, and provide assistance.'
    },
    {
      icon: DocumentTextIcon,
      title: 'Clear Documentation',
      description: 'All agreements, payment plans, and legal documents are provided in clear, understandable language with complete transparency.'
    },
    {
      icon: PhoneIcon,
      title: 'Multi-Channel Access',
      description: 'Reach us through phone, email, WhatsApp, or visit our office. We ensure you can always connect with us conveniently.'
    }
  ];

  const businessPolicies = [
    {
      title: 'Payment Plans',
      points: [
        'Flexible installment options tailored to your needs',
        'No hidden charges or surprise fees',
        'Easy payment methods - bank transfer, cheque, online',
        'Grace period for installments',
        'Early payment discounts available'
      ]
    },
    {
      title: 'Project Delivery',
      points: [
        'Commitment to on-time possession',
        'Regular construction updates',
        'Quality assurance at every stage',
        'Final inspection before handover',
        'Post-possession support'
      ]
    },
    {
      title: 'Legal Compliance',
      points: [
        'Approved maps from relevant authorities',
        'NOC from development authority',
        'Clear property titles',
        'Complete legal documentation',
        'RERA registered projects'
      ]
    },
    {
      title: 'Customer Rights',
      points: [
        'Right to complete project information',
        'Right to visit construction site',
        'Right to transfer/resell property',
        'Refund policy in case of project cancellation',
        'Legal recourse for disputes'
      ]
    }
  ];

  const projectPortfolio = [
    {
      category: 'Residential',
      count: '8+',
      description: 'Luxury apartments and premium residences',
      highlights: ['Pearl One Series', 'ABS Residency', 'Premium Villas']
    },
    {
      category: 'Commercial',
      count: '6+',
      description: 'Modern offices and retail spaces',
      highlights: ['ABS Mall', 'Business Centers', 'Retail Plazas']
    },
    {
      category: 'Mixed-Use',
      count: '2+',
      description: 'Integrated residential and commercial',
      highlights: ['ABS Mall & Residency', 'Urban Centers']
    }
  ];

  const futurePlans = [
    {
      icon: RocketLaunchIcon,
      title: 'Expansion Plans',
      description: 'Launching 5+ new projects in the next 2 years across prime locations in Lahore and other major cities.'
    },
    {
      icon: LightBulbIcon,
      title: 'Innovation Focus',
      description: 'Introducing smart home technology, eco-friendly construction, and sustainable development practices in upcoming projects.'
    },
    {
      icon: ChartBarIcon,
      title: 'Market Leadership',
      description: 'Aiming to become Pakistan\'s top SHARIAH-compliant real estate developer with 30+ projects by 2027.'
    },
    {
      icon: UserGroupIcon,
      title: 'Community Building',
      description: 'Creating integrated communities with world-class amenities, promoting quality lifestyle and strong investor returns.'
    }
  ];

  const achievements = [
    { number: '16+', label: 'Delivered Projects' },
    { number: '5000+', label: 'Satisfied Clients' },
    { number: '500+', label: 'Brand Outlets' },
    { number: '7.5M+', label: 'Sq. Ft Developed' }
  ];

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%)' }}>
      {/* Navigation */}
      <motion.nav 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="fixed top-4 left-4 right-4 z-50 max-w-7xl mx-auto"
      >
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
          <div className="flex justify-between items-center h-18">
            <Link to="/" className="flex items-center group">
              <motion.img 
                src="/images/logo.png"
                alt="ABS Developers"
                whileHover={{ scale: 1.05 }}
                className="h-14 w-auto transition-all duration-300"
              />
            </Link>
            
            <div className="hidden md:flex items-center space-x-1">
              <Link to="/">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="px-4 py-2 font-medium hover:bg-gold-900/20 hover:text-gold-400 rounded-xl transition-all duration-300"
                  style={{ color: 'rgba(156, 163, 175, 0.9)' }}
                >
                  Home
                </motion.div>
              </Link>
              <Link to="/projects">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="px-4 py-2 font-medium hover:bg-gold-900/20 hover:text-gold-400 rounded-xl transition-all duration-300"
                  style={{ color: 'rgba(156, 163, 175, 0.9)' }}
                >
                  Projects
                </motion.div>
              </Link>
              <Link to="/about">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="px-4 py-2 font-medium rounded-xl transition-all duration-300"
                  style={{ color: '#d4af37', background: 'rgba(212,175,55,0.1)' }}
                >
                  About
                </motion.div>
              </Link>
            </div>
            
            <div className="flex items-center space-x-3">
              <Link to="/login">
                <Button variant="ghost" className="font-semibold hover:bg-gold-900/20 hover:text-gold-400 border-0 transition-all duration-300" style={{ color: 'rgba(156, 163, 175, 0.9)' }}>
                  Sign In
                </Button>
              </Link>
              <Link to="/register">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button 
                    className="group"
                    style={{
                      background: 'linear-gradient(135deg, #d4af37, #f4e5a1)',
                      color: '#0a0a0a',
                      border: 'none'
                    }}
                  >
                    Get Started
                    <ArrowRightIcon className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                  </Button>
                </motion.div>
              </Link>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Content */}
      <div className="pt-32 pb-16 px-4">
        {/* Subtle dot pattern overlay */}
        <div
          className="fixed inset-0 opacity-30 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(rgba(212,175,55,0.1) 1px, transparent 1px)",
            backgroundSize: '50px 50px',
          }}
        />
        
        <div className="max-w-7xl mx-auto relative">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-8 md:mb-12"
          >
            <h1 
              className="text-5xl md:text-6xl font-bold mb-6"
              style={{
                backgroundImage: 'linear-gradient(135deg, #d4af37, #f4e5a1)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                color: 'transparent',
                fontFamily: 'Playfair Display, serif',
              }}
            >
              About ABS Developers
            </h1>
            <p className="text-base md:text-lg text-gray-300 max-w-3xl mx-auto">
              Pakistan's First 100% SHARIAH Compliant Real Estate Company
              <br />
              Building Trust, Delivering Excellence Since Inception
            </p>
          </motion.div>

          {/* Achievements */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {achievements.map((achievement, index) => (
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
                <h3 className="text-3xl font-display font-bold text-white mb-3">
                  {achievement.number}
                </h3>
                <p className="text-sm text-charcoal-300 uppercase tracking-wider font-semibold">
                  {achievement.label}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Company Values */}
          <section className="mb-16 md:mb-20">
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
                Our Core Values
              </h2>
              <p className="mt-3 text-base md:text-lg text-gray-300 max-w-3xl mx-auto">
                The principles that guide every decision we make
              </p>
            </motion.div>
            
            <div className="grid md:grid-cols-2 gap-8">
              {companyValues.map((value, index) => (
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
                    className="h-16 w-16 bg-gradient-to-r from-[#d4af37] to-[#f4e68c] rounded-full flex items-center justify-center mb-6 shadow-gold group-hover:shadow-gold-lg transition-all duration-300"
                    whileHover={{ rotate: 360, scale: 1.1 }}
                    transition={{ duration: 0.6 }}
                  >
                    <value.icon className="h-8 w-8 text-white" />
                  </motion.div>
                  <h3 
                    className="text-2xl font-semibold mb-4"
                    style={{ 
                      color: '#d4af37',
                      fontFamily: 'Playfair Display, serif'
                    }}
                  >
                    {value.title}
                  </h3>
                  <p className="text-gray-300 leading-relaxed">
                    {value.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Communication Policies */}
          <section className="mb-16 md:mb-20">
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
                Our Communication Approach
              </h2>
              <p className="mt-3 text-base md:text-lg text-gray-300 max-w-3xl mx-auto">
                Stay connected with transparent, accessible communication
              </p>
            </motion.div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {communicationPolicies.map((policy, index) => (
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
                    <policy.icon className="h-8 w-8 text-white" />
                  </motion.div>
                  <h3 className="text-xl font-bold text-white mb-3 text-center">
                    {policy.title}
                  </h3>
                  <p className="text-sm text-gray-300 leading-relaxed text-center">
                    {policy.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Business Policies */}
          <section className="mb-16 md:mb-20">
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
                Our Policies & Commitments
              </h2>
              <p className="mt-3 text-base md:text-lg text-gray-300 max-w-3xl mx-auto">
                Clear policies ensuring transparency and customer protection
              </p>
            </motion.div>
            
            <div className="grid md:grid-cols-2 gap-8">
              {businessPolicies.map((policy, index) => (
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
                  <h3 
                    className="text-2xl font-semibold mb-6"
                    style={{ 
                      color: '#d4af37',
                      fontFamily: 'Playfair Display, serif'
                    }}
                  >
                    {policy.title}
                  </h3>
                  <ul className="space-y-3">
                    {policy.points.map((point, idx) => (
                      <li key={idx} className="flex items-start">
                        <CheckCircleIcon className="h-5 w-5 mr-3 mt-0.5 flex-shrink-0" style={{ color: '#d4af37' }} />
                        <span className="text-gray-300">{point}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Project Portfolio */}
          <section className="mb-16 md:mb-20">
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
                Our Project Portfolio
              </h2>
              <p className="mt-3 text-base md:text-lg text-gray-300 max-w-3xl mx-auto">
                Diverse developments across residential, commercial, and mixed-use sectors
              </p>
            </motion.div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {projectPortfolio.map((portfolio, index) => (
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
                    <HomeModernIcon className="h-8 w-8 text-white" />
                  </motion.div>
                  <h3 className="text-3xl font-display font-bold text-white mb-3 text-center">
                    {portfolio.count}
                  </h3>
                  <p className="text-sm text-charcoal-300 uppercase tracking-wider font-semibold text-center mb-4">
                    {portfolio.category}
                  </p>
                  <p className="text-gray-300 text-center mb-6 leading-relaxed">
                    {portfolio.description}
                  </p>
                  <div className="space-y-2">
                    {portfolio.highlights.map((highlight, idx) => (
                      <div 
                        key={idx}
                        className="px-4 py-2 rounded-lg text-sm text-center"
                        style={{
                          background: 'rgba(212,175,55,0.1)',
                          color: '#d4af37'
                        }}
                      >
                        {highlight}
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
            
            <div className="text-center mt-12">
              <Link to="/projects">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    size="lg"
                    className="text-lg px-8 py-4 font-semibold"
                    style={{
                      background: 'linear-gradient(135deg, #d4af37, #f4e5a1)',
                      color: '#0a0a0a',
                      border: 'none'
                    }}
                  >
                    View All Projects
                    <ArrowRightIcon className="ml-2 h-5 w-5" />
                  </Button>
                </motion.div>
              </Link>
            </div>
          </section>

          {/* Future Plans */}
          <section className="mb-16 md:mb-20">
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
                Our Vision & Future Plans
              </h2>
              <p className="mt-3 text-base md:text-lg text-gray-300 max-w-3xl mx-auto">
                Innovation and expansion driving Pakistan's real estate future
              </p>
            </motion.div>
            
            <div className="grid md:grid-cols-2 gap-8">
              {futurePlans.map((plan, index) => (
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
                    className="h-16 w-16 bg-gradient-to-r from-[#d4af37] to-[#f4e68c] rounded-full flex items-center justify-center mb-6 shadow-gold group-hover:shadow-gold-lg transition-all duration-300"
                    whileHover={{ rotate: 360, scale: 1.1 }}
                    transition={{ duration: 0.6 }}
                  >
                    <plan.icon className="h-8 w-8 text-white" />
                  </motion.div>
                  <h3 
                    className="text-2xl font-semibold mb-4"
                    style={{ 
                      color: '#d4af37',
                      fontFamily: 'Playfair Display, serif'
                    }}
                  >
                    {plan.title}
                  </h3>
                  <p className="text-gray-300 leading-relaxed">
                    {plan.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Contact CTA */}
          <section className="mb-16 md:mb-20">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="mx-auto max-w-4xl px-4 text-center"
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
                Ready to Start Your Investment Journey?
              </h2>
              <p className="text-base md:text-lg text-gray-300 mb-8 max-w-3xl mx-auto">
                Join thousands of satisfied investors who trust ABS Developers for their real estate investments
              </p>
              <Link to="/register">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
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
                </motion.div>
              </Link>
            </motion.div>
          </section>
        </div>
      </div>

      {/* Footer */}
      <footer 
        className="relative py-12 mt-20"
        style={{ 
          background: 'linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%)',
          borderTop: '1px solid rgba(212,175,55,0.2)'
        }}
      >
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p style={{ color: 'rgba(156, 163, 175, 0.8)' }}>
            &copy; 2024 ABS Developers. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

