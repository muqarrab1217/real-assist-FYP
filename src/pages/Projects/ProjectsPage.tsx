import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  BuildingOffice2Icon, 
  MapPinIcon, 
  CurrencyDollarIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import { detailedProjects } from '@/data/extractedMockData';
import { Button } from '@/components/ui/button';

// Filter to only include the 5 specific projects
const FEATURED_PROJECT_IDS = [
  'abs_mall_&_residency_2_-_asaan_ghar_offer_2025',
  'pearl_one_capital_-_residential_-_asaan_ghar_offer',
  'pearl_one_capital_-_commercial_-_asaan_ghar_offer_2025',
  'pearl_one_courtyard_-_development_deal',
  'pearl_one_premium_-_(development_deal)'
];

export const ProjectsPage: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'residential' | 'commercial' | 'mixed-use'>('all');

  // Filter projects based on IDs and type
  const filteredProjects = detailedProjects
    .filter(project => FEATURED_PROJECT_IDS.includes(project.id))
    .filter(project => filter === 'all' || project.type === filter);

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

      {/* Hero Section */}
      <section className="relative pt-32 pb-16 px-4 overflow-hidden">
        <div className="absolute inset-0 opacity-30 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(rgba(212,175,55,0.1) 1px, transparent 1px)",
            backgroundSize: '50px 50px',
          }}
        />
        
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
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
              Our Premium Projects
            </h1>
            <p className="text-xl max-w-3xl mx-auto" style={{ color: 'rgba(156, 163, 175, 0.9)' }}>
              Discover world-class residential and commercial developments by ABS Developers
            </p>
          </motion.div>

          {/* Filter Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex justify-center gap-3 mb-12 flex-wrap"
          >
            {(['all', 'residential', 'commercial', 'mixed-use'] as const).map((type) => (
              <motion.button
                key={type}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setFilter(type)}
                className="px-6 py-3 rounded-xl font-semibold transition-all duration-300"
                style={
                  filter === type
                    ? {
                        background: 'linear-gradient(135deg, #d4af37, #f4e5a1)',
                        color: '#0a0a0a',
                        boxShadow: '0 10px 25px rgba(212,175,55,0.4)'
                      }
                    : {
                        background: 'rgba(26,26,26,0.75)',
                        color: 'rgba(156, 163, 175, 0.9)',
                        border: '1px solid rgba(212,175,55,0.25)'
                      }
                }
              >
                {type === 'all' ? 'All Projects' : type.charAt(0).toUpperCase() + type.slice(1)}
              </motion.button>
            ))}
          </motion.div>

          {/* Projects Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProjects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                whileHover={{ y: -10, scale: 1.02 }}
              >
                <Link to={`/projects/${project.id}`}>
                  <div 
                    className="rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border backdrop-blur group"
                    style={{
                      background: 'rgba(26,26,26,0.75)',
                      borderColor: 'rgba(212,175,55,0.25)',
                    }}
                  >
                    {/* Project Image */}
                    <div className="relative h-64 bg-gradient-to-br from-gray-800 to-gray-900 overflow-hidden">
                      {project.images && project.images.length > 0 ? (
                        <img
                          src={project.images[0]}
                          alt={project.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <BuildingOffice2Icon className="h-24 w-24 text-gray-600" />
                        </div>
                      )}
                      
                      {/* Type Badge */}
                      <div className="absolute top-4 right-4">
                        <span 
                          className="px-4 py-2 backdrop-blur-sm rounded-full text-xs font-semibold shadow-lg"
                          style={{
                            background: 'rgba(212,175,55,0.9)',
                            color: '#0a0a0a'
                          }}
                        >
                          {project.type}
                        </span>
                      </div>
                    </div>

                    {/* Project Details */}
                    <div className="p-6">
                      <h3 
                        className="text-2xl font-bold mb-3 text-white" 
                        style={{ fontFamily: 'Playfair Display, serif' }}
                      >
                        {project.name}
                      </h3>
                      
                      <div className="flex items-center mb-3" style={{ color: 'rgba(156, 163, 175, 0.9)' }}>
                        <MapPinIcon className="h-5 w-5 mr-2" style={{ color: '#d4af37' }} />
                        <span className="text-sm">{project.location}</span>
                      </div>

                      <p className="mb-4 line-clamp-2" style={{ color: 'rgba(156, 163, 175, 0.9)' }}>
                        {project.description}
                      </p>

                      {/* Price Range */}
                      {project.priceRange.min && project.priceRange.max && (
                        <div className="flex items-center text-white mb-4">
                          <CurrencyDollarIcon className="h-5 w-5 mr-2" style={{ color: '#d4af37' }} />
                          <span className="font-semibold">
                            PKR {(project.priceRange.min / 1000000).toFixed(1)}M - {(project.priceRange.max / 1000000).toFixed(1)}M
                          </span>
                        </div>
                      )}

                      {/* Amenities Preview */}
                      {project.amenities.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {project.amenities.slice(0, 3).map((amenity, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1 text-xs rounded-full"
                              style={{
                                background: 'rgba(212,175,55,0.15)',
                                color: '#d4af37'
                              }}
                            >
                              {amenity}
                            </span>
                          ))}
                          {project.amenities.length > 3 && (
                            <span 
                              className="px-3 py-1 text-xs rounded-full"
                              style={{
                                background: 'rgba(156, 163, 175, 0.1)',
                                color: 'rgba(156, 163, 175, 0.9)'
                              }}
                            >
                              +{project.amenities.length - 3} more
                            </span>
                          )}
                        </div>
                      )}

                      {/* View Details Button */}
                      <Button
                        className="w-full group"
                        style={{
                          background: 'linear-gradient(135deg, #d4af37, #f4e5a1)',
                          color: '#0a0a0a',
                          border: 'none'
                        }}
                      >
                        View Details
                        <ArrowRightIcon className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* No Results */}
          {filteredProjects.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <BuildingOffice2Icon className="h-24 w-24 mx-auto mb-4" style={{ color: 'rgba(156, 163, 175, 0.3)' }} />
              <h3 className="text-2xl font-semibold mb-2" style={{ color: 'rgba(156, 163, 175, 0.9)' }}>No projects found</h3>
              <p style={{ color: 'rgba(156, 163, 175, 0.7)' }}>Try adjusting your filters</p>
            </motion.div>
          )}
        </div>
      </section>

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

