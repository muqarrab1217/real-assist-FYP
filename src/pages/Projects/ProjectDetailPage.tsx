import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeftIcon,
  ArrowRightIcon,
  MapPinIcon,
  BuildingOffice2Icon,
  CurrencyDollarIcon,
  CheckCircleIcon,
  DocumentArrowDownIcon,
  CalendarIcon,
  HomeModernIcon,
  ShieldCheckIcon,
  SparklesIcon,
  ChartBarIcon,
  TruckIcon,
  ClockIcon,
  PhoneIcon,
  EnvelopeIcon,
  XMarkIcon,
  RectangleGroupIcon
} from '@heroicons/react/24/outline';
import { detailedProjects } from '@/data/extractedMockData';
import { Button } from '@/components/ui/button';
import { BlueprintDisplay } from '@/components/Projects/BlueprintDisplay';
import type { UnitType, PaymentPlan } from '@/types';

type FlatType = 'economy' | 'premium' | 'penthouse';

export const ProjectDetailPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [showBlueprintModal, setShowBlueprintModal] = useState(false);
  const [activeTab, setActiveTab] = useState<FlatType>('economy');

  const project = detailedProjects.find(p => p.id === projectId);

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%)' }}>
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Project Not Found</h1>
          <Link to="/projects">
            <Button style={{
              background: 'linear-gradient(135deg, #d4af37, #f4e5a1)',
              color: '#0a0a0a'
            }}>Back to Projects</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Mock additional data (in real app, this would come from API/database)
  const keyHighlights = [
    'Prime location in Lahore',
    'World-class amenities',
    'Flexible payment plans',
    'High ROI potential',
    'SHARIAH compliant',
    'Possession on time guarantee'
  ];

  const specifications = [
    { label: 'Total Floors', value: project.type === 'commercial' ? '12-15' : '8-10' },
    { label: 'Units', value: project.type === 'commercial' ? '120+' : '80+' },
    { label: 'Parking', value: 'Basement + Ground' },
    { label: 'Completion', value: '2025-2026' }
  ];

  const locationFeatures = [
    { icon: TruckIcon, title: '5 min to Main Boulevard', description: 'Direct access to major highway' },
    { icon: BuildingOffice2Icon, title: 'Commercial Hub', description: 'Surrounded by shopping centers' },
    { icon: HomeModernIcon, title: 'Residential Area', description: 'Family-friendly neighborhood' },
    { icon: ClockIcon, title: '15 min to Airport', description: 'Easy connectivity' }
  ];

  const whyInvest = [
    { title: 'Prime Location', description: 'Strategic position in one of Lahore\'s most sought-after areas' },
    { title: 'High Returns', description: 'Expected 30-40% appreciation in 3-5 years' },
    { title: 'Quality Construction', description: 'Built by ABS Developers with proven track record' },
    { title: 'Modern Design', description: 'Contemporary architecture with premium finishes' },
    { title: 'Complete Facilities', description: 'All modern amenities and services included' },
    { title: 'Legal Documentation', description: 'Clear title, approved maps, and NOC from authorities' }
  ];

  const constructionPhases = [
    { phase: 'Foundation', status: 'Completed', percentage: 100 },
    { phase: 'Structure', status: 'In Progress', percentage: 75 },
    { phase: 'Finishing', status: 'Upcoming', percentage: 30 },
    { phase: 'Handover', status: 'Planned', percentage: 0 }
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
                  className="px-4 py-2 font-medium rounded-xl transition-all duration-300"
                  style={{ color: '#d4af37', background: 'rgba(212,175,55,0.1)' }}
                >
                  Projects
                </motion.div>
              </Link>
              <Link to="/about">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="px-4 py-2 font-medium hover:bg-gold-900/20 hover:text-gold-400 rounded-xl transition-all duration-300"
                  style={{ color: 'rgba(156, 163, 175, 0.9)' }}
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
          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <button
              onClick={() => navigate('/projects')}
              className="flex items-center hover:text-gold-400 transition-colors"
              style={{ color: 'rgba(156, 163, 175, 0.9)' }}
            >
              <ArrowLeftIcon className="h-5 w-5 mr-2" />
              Back to Projects
            </button>
          </motion.div>

          {/* Hero Image Section */}
          {project.images && project.images.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="relative h-[500px] rounded-2xl overflow-hidden mb-12 shadow-2xl border"
              style={{
                borderColor: 'rgba(212,175,55,0.3)'
              }}
            >
              <img
                src={project.images[0]}
                alt={project.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              
              {/* Project Title Overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-8 pointer-events-none">
                <div className="pointer-events-auto">
                <div className="flex items-center gap-3 mb-4">
                  <span 
                    className="px-2 py-1 rounded-full text-xs font-semibold"
                    style={{
                      background: 'rgba(212,175,55,0.9)',
                      color: '#0a0a0a'
                    }}
                  >
                    {project.type}
                  </span>
                  <span 
                    className="px-2 py-1 rounded-full text-xs font-semibold"
                    style={{
                      background: 'rgba(34,197,94,0.9)',
                      color: '#0a0a0a'
                    }}
                  >
                    {project.status}
                  </span>
                </div>
                
                <h1 
                  className="text-5xl md:text-6xl font-bold mb-4 text-white"
                  style={{ fontFamily: 'Playfair Display, serif' }}
                >
                  {project.name}
                </h1>
                
                <div className="flex items-center text-white/90 text-lg">
                  <MapPinIcon className="h-6 w-6 mr-2" style={{ color: '#d4af37' }} />
                  <span>{project.location}</span>
                </div>
                </div>
                
                {/* View Units Button - Below title */}
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowBlueprintModal(true);
                  }}
                  className="mt-4 px-6 py-3 rounded-xl font-semibold shadow-2xl flex items-center gap-2 backdrop-blur-sm pointer-events-auto relative z-10"
                  style={{
                    background: 'linear-gradient(135deg, #d4af37, #f4e5a1)',
                    color: '#0a0a0a',
                    border: 'none'
                  }}
                >
                  <RectangleGroupIcon className="h-5 w-5" />
                  View Units
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* Quick Stats Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12"
          >
            {specifications.map((spec, index) => (
              <div
                key={index}
                className="rounded-xl p-6 text-center border backdrop-blur"
                style={{
                  background: 'rgba(26,26,26,0.75)',
                  borderColor: 'rgba(212,175,55,0.25)'
                }}
              >
                <p className="text-sm mb-2" style={{ color: 'rgba(156, 163, 175, 0.9)' }}>{spec.label}</p>
                <p className="text-2xl font-bold text-white">{spec.value}</p>
              </div>
            ))}
          </motion.div>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Overview Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="rounded-2xl p-8 shadow-lg border backdrop-blur"
                style={{
                  background: 'rgba(26,26,26,0.75)',
                  borderColor: 'rgba(212,175,55,0.25)'
                }}
              >
                <h2 className="text-3xl font-bold mb-6 text-white flex items-center" style={{ fontFamily: 'Playfair Display, serif' }}>
                  <SparklesIcon className="h-8 w-8 mr-3" style={{ color: '#d4af37' }} />
                  Project Overview
                </h2>
                <div className="space-y-4" style={{ color: 'rgba(156, 163, 175, 0.9)' }}>
                  <p className="leading-relaxed text-lg">{project.description}</p>
                  
                  <div className="grid md:grid-cols-2 gap-6 pt-6">
                    <div className="flex items-start">
                      <BuildingOffice2Icon className="h-6 w-6 mr-3 mt-1 flex-shrink-0" style={{ color: '#d4af37' }} />
                      <div>
                        <h4 className="font-semibold text-white mb-1">Developer</h4>
                        <p>{project.developer}</p>
                        <p className="text-sm mt-1">16+ Projects Delivered</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <CalendarIcon className="h-6 w-6 mr-3 mt-1 flex-shrink-0" style={{ color: '#d4af37' }} />
                      <div>
                        <h4 className="font-semibold text-white mb-1">Project Status</h4>
                        <p className="capitalize">{project.status}</p>
                        <p className="text-sm mt-1">Expected Completion: 2025-2026</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Key Highlights */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="rounded-2xl p-8 shadow-lg border backdrop-blur"
                style={{
                  background: 'rgba(26,26,26,0.75)',
                  borderColor: 'rgba(212,175,55,0.25)'
                }}
              >
                <h2 className="text-3xl font-bold mb-6 text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
                  Key Highlights
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {keyHighlights.map((highlight, index) => (
                    <div key={index} className="flex items-center">
                      <CheckCircleIcon className="h-6 w-6 mr-3 flex-shrink-0" style={{ color: '#d4af37' }} />
                      <span className="text-white">{highlight}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Amenities & Facilities */}
              {project.amenities && project.amenities.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  className="rounded-2xl p-8 shadow-lg border backdrop-blur"
                  style={{
                    background: 'rgba(26,26,26,0.75)',
                    borderColor: 'rgba(212,175,55,0.25)'
                  }}
                >
                  <h2 className="text-3xl font-bold mb-6 text-white flex items-center" style={{ fontFamily: 'Playfair Display, serif' }}>
                    <HomeModernIcon className="h-8 w-8 mr-3" style={{ color: '#d4af37' }} />
                    Amenities & Facilities
                  </h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    {project.amenities.map((amenity, index) => (
                      <div 
                        key={index} 
                        className="flex items-center p-4 rounded-lg border"
                        style={{
                          background: 'rgba(212,175,55,0.05)',
                          borderColor: 'rgba(212,175,55,0.2)'
                        }}
                      >
                        <CheckCircleIcon className="h-6 w-6 mr-3 flex-shrink-0" style={{ color: '#22c55e' }} />
                        <span className="text-white">{amenity}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Location & Connectivity */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="rounded-2xl p-8 shadow-lg border backdrop-blur"
                style={{
                  background: 'rgba(26,26,26,0.75)',
                  borderColor: 'rgba(212,175,55,0.25)'
                }}
              >
                <h2 className="text-3xl font-bold mb-6 text-white flex items-center" style={{ fontFamily: 'Playfair Display, serif' }}>
                  <MapPinIcon className="h-8 w-8 mr-3" style={{ color: '#d4af37' }} />
                  Location & Connectivity
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {locationFeatures.map((feature, index) => (
                    <div key={index} className="flex items-start">
                      <div 
                        className="p-3 rounded-lg mr-4"
                        style={{
                          background: 'rgba(212,175,55,0.15)',
                        }}
                      >
                        <feature.icon className="h-6 w-6" style={{ color: '#d4af37' }} />
                      </div>
                      <div>
                        <h4 className="font-semibold text-white mb-1">{feature.title}</h4>
                        <p style={{ color: 'rgba(156, 163, 175, 0.9)' }}>{feature.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Unit Types */}
              {project.unitTypes && project.unitTypes.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                  className="rounded-2xl p-8 shadow-lg border backdrop-blur"
                  style={{
                    background: 'rgba(26,26,26,0.75)',
                    borderColor: 'rgba(212,175,55,0.25)'
                  }}
                >
                  <h2 className="text-3xl font-bold mb-6 text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
                    Available Unit Types
                  </h2>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {(project.unitTypes as UnitType[]).slice(0, 9).map((unit, index) => (
                      <div 
                        key={index} 
                        className="rounded-lg p-5 border hover:scale-105 transition-transform duration-300"
                        style={{
                          background: 'rgba(26,26,26,0.6)',
                          borderColor: 'rgba(212,175,55,0.25)'
                        }}
                      >
                        {unit.type && <p className="font-semibold text-white mb-2 text-lg">{unit.type}</p>}
                        {unit.bedrooms && <p className="text-sm mb-1" style={{ color: 'rgba(156, 163, 175, 0.9)' }}>🛏️ {unit.bedrooms} Bedrooms</p>}
                        {unit.area && <p className="text-sm mb-1" style={{ color: 'rgba(156, 163, 175, 0.9)' }}>📐 {unit.area} sq ft</p>}
                        {unit.price && (
                          <p className="font-bold mt-3 text-xl" style={{ color: '#d4af37' }}>
                            PKR {unit.price.toLocaleString()}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Why Invest */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.7 }}
                className="rounded-2xl p-8 shadow-lg border backdrop-blur"
                style={{
                  background: 'rgba(26,26,26,0.75)',
                  borderColor: 'rgba(212,175,55,0.25)'
                }}
              >
                <h2 className="text-3xl font-bold mb-6 text-white flex items-center" style={{ fontFamily: 'Playfair Display, serif' }}>
                  <ChartBarIcon className="h-8 w-8 mr-3" style={{ color: '#d4af37' }} />
                  Why Invest in This Project
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {whyInvest.map((reason, index) => (
                    <div 
                      key={index}
                      className="p-5 rounded-lg border"
                      style={{
                        background: 'rgba(212,175,55,0.05)',
                        borderColor: 'rgba(212,175,55,0.2)'
                      }}
                    >
                      <h4 className="font-bold text-white mb-2 text-lg">{reason.title}</h4>
                      <p style={{ color: 'rgba(156, 163, 175, 0.9)' }}>{reason.description}</p>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Construction Progress */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
                className="rounded-2xl p-8 shadow-lg border backdrop-blur"
                style={{
                  background: 'rgba(26,26,26,0.75)',
                  borderColor: 'rgba(212,175,55,0.25)'
                }}
              >
                <h2 className="text-3xl font-bold mb-6 text-white flex items-center" style={{ fontFamily: 'Playfair Display, serif' }}>
                  <TruckIcon className="h-8 w-8 mr-3" style={{ color: '#d4af37' }} />
                  Construction Progress
                </h2>
                <div className="space-y-6">
                  {constructionPhases.map((phase, index) => (
                    <div key={index}>
                      <div className="flex justify-between mb-2">
                        <span className="text-white font-semibold">{phase.phase}</span>
                        <span style={{ color: '#d4af37' }}>{phase.percentage}%</span>
                      </div>
                      <div className="w-full h-3 rounded-full" style={{ background: 'rgba(26,26,26,0.6)' }}>
                        <motion.div
                          className="h-3 rounded-full"
                          style={{
                            background: 'linear-gradient(90deg, #d4af37, #f4e5a1)',
                            width: `${phase.percentage}%`
                          }}
                          initial={{ width: 0 }}
                          whileInView={{ width: `${phase.percentage}%` }}
                          transition={{ duration: 1, delay: index * 0.1 }}
                          viewport={{ once: true }}
                        />
                      </div>
                      <p className="text-sm mt-1" style={{ color: 'rgba(156, 163, 175, 0.9)' }}>Status: {phase.status}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Right Column - Sidebar */}
            <div className="space-y-6">
              {/* Price Card */}
              {project.priceRange.min && project.priceRange.max && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                  className="rounded-2xl p-8 shadow-lg border backdrop-blur sticky top-28"
                  style={{
                    background: 'linear-gradient(135deg, rgba(212,175,55,0.15), rgba(212,175,55,0.05))',
                    borderColor: 'rgba(212,175,55,0.3)'
                  }}
                >
                  <div className="flex items-center mb-4">
                    <CurrencyDollarIcon className="h-8 w-8 mr-3" style={{ color: '#d4af37' }} />
                    <h3 className="text-xl font-bold text-white">Price Range</h3>
                  </div>
                  <div className="mb-6">
                    <p className="text-4xl font-bold text-white">
                      PKR {(project.priceRange.min / 1000000).toFixed(1)}M
                    </p>
                    <p className="mt-1" style={{ color: 'rgba(156, 163, 175, 0.9)' }}>
                      to PKR {(project.priceRange.max / 1000000).toFixed(1)}M
                    </p>
                  </div>

                  {/* Payment Plan Info */}
                  {project.paymentPlan && (
                    <div 
                      className="rounded-xl p-4 mb-6 border"
                      style={{
                        background: 'rgba(26,26,26,0.6)',
                        borderColor: 'rgba(212,175,55,0.2)'
                      }}
                    >
                      <h4 className="font-semibold text-white mb-3">Payment Plan Available</h4>
                      {(project.paymentPlan as PaymentPlan).downPaymentPercentage && (
                        <p className="text-sm mb-2" style={{ color: 'rgba(156, 163, 175, 0.9)' }}>
                          Down Payment: <strong className="text-white">{(project.paymentPlan as PaymentPlan).downPaymentPercentage}%</strong>
                        </p>
                      )}
                      {(project.paymentPlan as PaymentPlan).durationMonths && (
                        <p className="text-sm mb-2" style={{ color: 'rgba(156, 163, 175, 0.9)' }}>
                          Duration: <strong className="text-white">{(project.paymentPlan as PaymentPlan).durationMonths} months</strong>
                        </p>
                      )}
                      {(project.paymentPlan as PaymentPlan).totalInstallments && (
                        <p className="text-sm" style={{ color: 'rgba(156, 163, 175, 0.9)' }}>
                          Installments: <strong className="text-white">{(project.paymentPlan as PaymentPlan).totalInstallments}</strong>
                        </p>
                      )}
                    </div>
                  )}

                  {/* Download Brochure */}
                  {project.brochure && (
                    <a
                      href={project.brochure}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block mb-3"
                    >
                      <Button 
                        className="w-full"
                        style={{
                          background: 'linear-gradient(135deg, #d4af37, #f4e5a1)',
                          color: '#0a0a0a',
                          border: 'none'
                        }}
                      >
                        <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
                        Download Brochure
                      </Button>
                    </a>
                  )}

                  {/* Contact Button */}
                  <Link to="/register">
                    <Button className="w-full" variant="outline" style={{
                      borderColor: 'rgba(212,175,55,0.5)',
                      color: '#d4af37'
                    }}>
                      Get More Information
                    </Button>
                  </Link>
                </motion.div>
              )}

              {/* Contact Card */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="rounded-2xl p-8 shadow-lg border backdrop-blur"
                style={{
                  background: 'rgba(26,26,26,0.75)',
                  borderColor: 'rgba(212,175,55,0.25)'
                }}
              >
                <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                  <PhoneIcon className="h-6 w-6 mr-2" style={{ color: '#d4af37' }} />
                  Need Assistance?
                </h3>
                <p className="mb-6" style={{ color: 'rgba(156, 163, 175, 0.9)' }}>
                  Our sales team is ready to help you with any questions about this project.
                </p>
                <div className="space-y-3 mb-6">
                  <div className="flex items-center">
                    <PhoneIcon className="h-5 w-5 mr-3" style={{ color: '#d4af37' }} />
                    <span className="text-white">+92 300 1234567</span>
                  </div>
                  <div className="flex items-center">
                    <EnvelopeIcon className="h-5 w-5 mr-3" style={{ color: '#d4af37' }} />
                    <span className="text-white">sales@absdevelopers.com</span>
                  </div>
                </div>
                <Link to="/register">
                  <Button 
                    className="w-full"
                    style={{
                      background: 'linear-gradient(135deg, #d4af37, #f4e5a1)',
                      color: '#0a0a0a',
                      border: 'none'
                    }}
                  >
                    Schedule a Visit
                  </Button>
                </Link>
              </motion.div>

              {/* Features Badge */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="rounded-2xl p-8 shadow-lg border backdrop-blur"
                style={{
                  background: 'rgba(26,26,26,0.75)',
                  borderColor: 'rgba(212,175,55,0.25)'
                }}
              >
                <div className="text-center">
                  <ShieldCheckIcon className="h-16 w-16 mx-auto mb-4" style={{ color: '#d4af37' }} />
                  <h4 className="font-bold text-white text-lg mb-2">100% SHARIAH Compliant</h4>
                  <p className="text-sm" style={{ color: 'rgba(156, 163, 175, 0.9)' }}>
                    All transactions follow Islamic principles
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Blueprint Modal */}
      <AnimatePresence>
        {showBlueprintModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4 overflow-y-auto"
            onClick={() => setShowBlueprintModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
              className="rounded-2xl max-w-7xl w-full shadow-2xl border my-8"
              style={{
                background: 'rgba(26,26,26,0.98)',
                borderColor: 'rgba(212,175,55,0.3)',
                backdropFilter: 'blur(20px)',
                maxHeight: '90vh'
              }}
            >
              {/* Modal Navbar */}
              <div className="flex items-center justify-between gap-6 p-6 border-b" style={{ borderColor: 'rgba(212,175,55,0.25)' }}>
                {/* Left - Heading */}
                <div className="flex-shrink-0">
                  <h2 className="text-2xl font-bold text-white flex items-center" style={{ fontFamily: 'Playfair Display, serif' }}>
                    <HomeModernIcon className="h-7 w-7 mr-2" style={{ color: '#d4af37' }} />
                    Unit Availability
                  </h2>
                  <p className="text-xs mt-1" style={{ color: 'rgba(156, 163, 175, 0.9)' }}>
                    {project.name}
                  </p>
                </div>

                {/* Middle - Tabs */}
                <div className="hidden md:flex gap-2 flex-1 justify-center">
                  {(['economy', 'premium', 'penthouse'] as FlatType[]).map((type) => (
                    <motion.button
                      key={type}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setActiveTab(type)}
                      className="px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-300 capitalize"
                      style={
                        activeTab === type
                          ? {
                              background: 'linear-gradient(135deg, #d4af37, #f4e5a1)',
                              color: '#0a0a0a',
                            }
                          : {
                              background: 'rgba(255,255,255,0.05)',
                              color: 'rgba(156, 163, 175, 0.9)',
                              border: '1px solid rgba(212,175,55,0.2)'
                            }
                      }
                    >
                      {type}
                    </motion.button>
                  ))}
                </div>

                {/* Right - Close Button */}
                <button
                  onClick={() => setShowBlueprintModal(false)}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors flex-shrink-0"
                >
                  <XMarkIcon className="h-7 w-7 text-white" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 100px)' }}>
                <BlueprintDisplay 
                  projectId={project.id} 
                  useSvgBlueprint={project.id === 'pearl_one_premium_-_(development_deal)'}
                  project={project}
                  activeTab={activeTab}
                  showTabs={false}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
