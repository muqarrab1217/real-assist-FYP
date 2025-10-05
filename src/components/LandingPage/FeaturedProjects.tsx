import React from 'react';
import { motion } from 'framer-motion';

type BadgeVariant =
  | 'flagship'
  | 'available'
  | 'booking-open'
  | 'booking-closed'
  | 'delivered'
  | 'premium'
  | 'default';

type Project = {
  href?: string;
  image: string;        // main hero image
  logo?: string;        // small square/rect logo
  title: string;
  description?: string;
  tags?: string[];
  badge?: { label: string; variant?: BadgeVariant };
  location?: string;
  price?: string;
  area?: string;
  units?: string;
  completion?: string;
  features?: string[];
  developer?: string;
};

type FeaturedProjectsProps = {
  title?: string;
  subtitle?: string;
  projects?: Project[];
  className?: string;
};

const GOLD = '#d4af37';
const LIGHT_GOLD = '#f4e5a1';

const badgeStyleFor = (variant: BadgeVariant | undefined) => {
  switch (variant) {
    case 'flagship':
    case 'default':
      return {
        background: `linear-gradient(135deg, ${GOLD}, ${LIGHT_GOLD})`,
        color: '#0a0a0a',
      };
    case 'available':
      return {
        background: 'linear-gradient(135deg, #28a745, #34ce57)',
        color: '#fff',
      };
    case 'booking-open':
      return {
        background: 'linear-gradient(135deg, #2ecc71, #58d68d)',
        color: '#0a0a0a',
      };
    case 'booking-closed':
      return {
        background: 'linear-gradient(135deg, #999999, #bbbbbb)',
        color: '#0a0a0a',
      };
    case 'delivered':
      return {
        background: 'linear-gradient(135deg, #ffd166, #ffe08a)',
        color: '#0a0a0a',
      };
    case 'premium':
      return {
        background: 'linear-gradient(135deg, #8B4513, #D2691E)',
        color: '#fff',
      };
    default:
      return {
        background: `linear-gradient(135deg, ${GOLD}, ${LIGHT_GOLD})`,
        color: '#0a0a0a',
      };
  }
};

const Card: React.FC<{ project: Project; index: number }> = ({ project, index }) => {
  const badgeStyles = badgeStyleFor(project.badge?.variant || 'default');

  const content = (
    <motion.div
      className="relative rounded-3xl overflow-hidden border transition will-change-transform"
      style={{
        background: 'rgba(15,15,15,0.95)',
        borderColor: 'rgba(212,175,55,0.15)',
        boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
      }}
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        duration: 0.6, 
        delay: index * 0.1,
        ease: "easeOut"
      }}
      viewport={{ once: true, margin: "-50px" }}
      whileHover={{ 
        y: -8, 
        scale: 1.02,
        transition: { duration: 0.3, ease: "easeOut" }
      }}
    >
      {/* Badge */}
      {project.badge?.label && (
        <motion.div 
          className="absolute top-4 right-4 z-10"
          initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
          whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 0.4, delay: index * 0.1 + 0.2 }}
          viewport={{ once: true }}
          whileHover={{ scale: 1.1, rotate: 5 }}
        >
          <span
            className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide shadow"
            style={badgeStyles}
          >
            {project.badge.label}
          </span>
        </motion.div>
      )}

      {/* Visual */}
      <motion.div 
        className="relative h-72 overflow-hidden"
        initial={{ opacity: 0, scale: 1.1 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: index * 0.1 + 0.3 }}
        viewport={{ once: true }}
      >
        <motion.img
          src={project.image}
          alt={project.title}
          className="w-full h-full object-cover"
          whileHover={{ 
            scale: 1.1,
            transition: { duration: 0.4, ease: "easeOut" }
          }}
          initial={{ scale: 1 }}
        />
      </motion.div>

      {/* Info */}
      <motion.div 
        className="relative p-6"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: index * 0.1 + 0.4 }}
        viewport={{ once: true }}
      >
        {/* Title with small logo */}
        <motion.div 
          className="flex items-center gap-3 mb-2 min-w-0"
          whileHover={{ x: 5 }}
          transition={{ duration: 0.2 }}
        >
          {project.logo && (
            <motion.img
              src={project.logo}
              alt={`${project.title} logo`}
              className="w-14 h-12 object-contain rounded-md p-1"
              style={{
                border: '2px solid rgba(212,175,55,0.35)',
                background: 'rgba(212,175,55,0.12)',
              }}
              whileHover={{ 
                scale: 1.1, 
                rotate: 5,
                transition: { duration: 0.2 }
              }}
              initial={{ scale: 1, rotate: 0 }}
            />
          )}
          <motion.h3
            title={project.title}
            className="text-lg font-semibold truncate"
            style={{ color: GOLD, fontFamily: 'Playfair Display, serif' }}
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            {project.title}
          </motion.h3>
        </motion.div>

        {project.description && (
          <motion.p 
            className="text-sm text-gray-300 mb-4"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: index * 0.1 + 0.5 }}
            viewport={{ once: true }}
          >
            {project.description}
          </motion.p>
        )}

        {/* Project Details */}
        <motion.div 
          className="grid grid-cols-2 gap-3 mb-4"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 + 0.55 }}
          viewport={{ once: true }}
        >
          {project.location && (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ background: GOLD }}></div>
              <span className="text-xs text-gray-300 font-medium">{project.location}</span>
            </div>
          )}
          {project.price && (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ background: GOLD }}></div>
              <span className="text-xs text-gray-300 font-medium">{project.price}</span>
            </div>
          )}
          {project.area && (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ background: GOLD }}></div>
              <span className="text-xs text-gray-300 font-medium">{project.area}</span>
            </div>
          )}
          {project.units && (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ background: GOLD }}></div>
              <span className="text-xs text-gray-300 font-medium">{project.units}</span>
            </div>
          )}
          {project.completion && (
            <div className="flex items-center gap-2 col-span-2">
              <div className="w-2 h-2 rounded-full" style={{ background: GOLD }}></div>
              <span className="text-xs text-gray-300 font-medium">{project.completion}</span>
            </div>
          )}
        </motion.div>

        {/* Key Features */}
        {project.features && project.features.length > 0 && (
          <motion.div 
            className="mb-4"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 + 0.6 }}
            viewport={{ once: true }}
          >
            <div className="flex flex-wrap gap-1">
              {project.features.slice(0, 3).map((feature, i) => (
                <motion.span
                  key={i}
                  className="px-2 py-1 rounded text-[10px] font-medium"
                  style={{
                    background: 'rgba(212,175,55,0.08)',
                    color: GOLD,
                    border: '1px solid rgba(212,175,55,0.2)',
                  }}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ 
                    duration: 0.3, 
                    delay: index * 0.1 + 0.65 + i * 0.05 
                  }}
                  viewport={{ once: true }}
                >
                  {feature}
                </motion.span>
              ))}
              {project.features.length > 3 && (
                <motion.span
                  className="px-2 py-1 rounded text-[10px] font-medium"
                  style={{
                    background: 'rgba(212,175,55,0.08)',
                    color: GOLD,
                    border: '1px solid rgba(212,175,55,0.2)',
                  }}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ 
                    duration: 0.3, 
                    delay: index * 0.1 + 0.8 
                  }}
                  viewport={{ once: true }}
                >
                  +{project.features.length - 3} more
                </motion.span>
              )}
            </div>
          </motion.div>
        )}

        {/* Tags */}
        {project.tags && project.tags.length > 0 && (
          <motion.div 
            className="flex flex-wrap gap-2"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 + 0.85 }}
            viewport={{ once: true }}
          >
            {project.tags.map((t, i) => (
              <motion.span
                key={i}
                className="px-2.5 py-1 rounded-md text-[11px] font-medium"
                style={{
                  background: 'rgba(212,175,55,0.12)',
                  color: GOLD,
                  border: '1px solid rgba(212,175,55,0.25)',
                }}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ 
                  duration: 0.3, 
                  delay: index * 0.1 + 0.9 + i * 0.1 
                }}
                viewport={{ once: true }}
                whileHover={{ 
                  scale: 1.1, 
                  y: -2,
                  transition: { duration: 0.2 }
                }}
              >
                {t}
              </motion.span>
            ))}
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );

  return project.href ? (
    <a href={project.href} className="group block no-underline focus:outline-none">
      {content}
    </a>
  ) : (
    <div className="group">{content}</div>
  );
};

export const FeaturedProjects: React.FC<FeaturedProjectsProps> = ({
  title = 'Explore All Our Developments',
  subtitle = 'Discover the complete portfolio of our exceptional projects',
  projects = [
    {
      href: '/pearl-one-courtyard.html',
      image: '/images/files-POC-1_1_1375e22c-6fbc-4623-bbff-6f72a6f9709f_600x400.png',
      logo: '/images/files-Pearl_One_Courtyard_3_120x100.png',
      title: 'Pearl One Courtyard',
      description: 'Flagship luxury residential development featuring world-class amenities and Islamic-compliant architecture in the heart of Bahria Town.',
      tags: ['Luxury Apartments', 'Commercial Spaces', 'Islamic Design'],
      badge: { label: 'Flagship', variant: 'flagship' },
      location: 'Bahria Town, Lahore',
      price: 'PKR 45 Lakh - 1.2 Cr',
      area: '2.5 Acres',
      units: '500+ Units',
      completion: 'Q4 2025',
      features: ['Swimming Pool', 'Gymnasium', 'Mosque', 'Parking', 'Security'],
      developer: 'ABS Developers',
    },
    {
      href: '/pearl-one-courtyard-2.html',
      image: '/images/files-POC-2_600x400.png',
      logo: '/images/files-perl-one-courtyrd-1_120x100.png',
      title: 'Pearl One Courtyard 2',
      description: 'Luxury residential complex with modern amenities, featuring premium finishes and state-of-the-art facilities.',
      tags: ['Landmark Architecture', 'Engineering Marvel'],
      badge: { label: 'Booking Open', variant: 'booking-open' },
      location: 'Bahria Town, Lahore',
      price: 'PKR 55 Lakh - 1.5 Cr',
      area: '3.2 Acres',
      units: '650+ Units',
      completion: 'Q2 2026',
      features: ['Rooftop Garden', 'Kids Play Area', 'Community Center', '24/7 Security'],
      developer: 'ABS Developers',
    },
    {
      href: '/pearl-one-courtyard-3.html',
      image: '/images/files-POC-3_600x400.png',
      logo: '/images/files-perl-one-courtyrd-1_120x100.png',
      title: 'Pearl One Courtyard 3',
      description: 'Next phase of our flagship residential series with enhanced features and premium location benefits.',
      tags: ['Mixed-Use', 'Retail Spaces', 'Community Hub'],
      badge: { label: 'Booking Closed', variant: 'booking-closed' },
      location: 'Bahria Town, Lahore',
      price: 'PKR 60 Lakh - 2 Cr',
      area: '4.1 Acres',
      units: '800+ Units',
      completion: 'Q3 2026',
      features: ['Shopping Mall', 'Restaurants', 'Medical Center', 'School'],
      developer: 'ABS Developers',
    },
    {
      href: '/mall-residency.html',
      image: '/images/files-ABS-MALL_600x400.png',
      logo: '/images/files-mall-residancy_7675dedb-694d-4331-b692-bbc3e1c53166_120x100.png',
      title: 'ABS Mall & Residency',
      description: 'Mixed-use development combining luxury residential units with premium retail spaces and entertainment facilities.',
      tags: ['Mixed-Use', 'Retail Spaces', 'Community Hub'],
      badge: { label: 'Available', variant: 'available' },
      location: 'Bahria Town, Lahore',
      price: 'PKR 35 Lakh - 85 Lakh',
      area: '5.8 Acres',
      units: '400+ Units',
      completion: 'Q1 2025',
      features: ['Shopping Complex', 'Food Court', 'Cinema', 'Parking'],
      developer: 'ABS Developers',
    },
    {
      href: '/mall-residency-2.html',
      image: '/images/files-ABS-MALL-2_600x400.png',
      logo: '/images/files-mall-residancy-2_120x100.png',
      title: 'ABS Mall & Residency 2',
      description: 'Integrated shopping and living experience with modern retail outlets and comfortable residential spaces.',
      tags: ['Mixed-Use', 'Retail Spaces', 'Community Hub'],
      badge: { label: 'Available', variant: 'available' },
      location: 'Bahria Town, Lahore',
      price: 'PKR 40 Lakh - 95 Lakh',
      area: '4.5 Acres',
      units: '350+ Units',
      completion: 'Q2 2025',
      features: ['Hypermarket', 'Restaurants', 'Entertainment Zone', 'Gym'],
      developer: 'ABS Developers',
    },
    {
      href: '/pearl-one-tower.html',
      image: '/images/files-POT_600x400.png',
      logo: '/images/files-pearlone-tower_120x100.png',
      title: 'Pearl One Tower',
      description: 'Iconic tower with panoramic city views, featuring premium office spaces and luxury residential units.',
      tags: ['Mixed-Use', 'Retail Spaces', 'Community Hub'],
      badge: { label: 'Delivered', variant: 'delivered' },
      location: 'Bahria Town, Lahore',
      price: 'PKR 80 Lakh - 3 Cr',
      area: '2.8 Acres',
      units: '200+ Units',
      completion: 'Completed 2023',
      features: ['Sky Lounge', 'Business Center', 'Concierge Service', 'Valet Parking'],
      developer: 'ABS Developers',
    },
    {
      href: '/pearl-one-premium.html',
      image: '/images/files-POP_600x400.png',
      logo: '/images/files-perl-one-premium-logo_120x100.png',
      title: 'Pearl One Premium',
      description: 'Ultra-luxury residential development with exclusive amenities and premium finishes for discerning investors.',
      tags: ['Mixed-Use', 'Retail Spaces', 'Community Hub'],
      badge: { label: 'Available', variant: 'available' },
      location: 'Bahria Town, Lahore',
      price: 'PKR 1.5 Cr - 5 Cr',
      area: '6.2 Acres',
      units: '150+ Units',
      completion: 'Q4 2025',
      features: ['Private Garden', 'Wine Cellar', 'Home Theater', 'Butler Service'],
      developer: 'ABS Developers',
    },
    {
      href: '/pearl-one-capital.html',
      image: '/images/files-POCAPITAL_600x400.png',
      logo: '/images/files-capital_6334f1cf-4372-4b96-ad52-4f9d08a345f6_120x100.png',
      title: 'Pearl One Capital',
      description: 'Premier mixed-use development project combining luxury living with commercial opportunities in prime location.',
      tags: ['Mixed-Use', 'Retail Spaces', 'Community Hub'],
      badge: { label: 'Available', variant: 'available' },
      location: 'Bahria Town, Lahore',
      price: 'PKR 70 Lakh - 2.5 Cr',
      area: '7.5 Acres',
      units: '600+ Units',
      completion: 'Q1 2026',
      features: ['Business District', 'Luxury Hotel', 'Convention Center', 'Helipad'],
      developer: 'ABS Developers',
    },
  ],
  className = '',
}) => {
  return (
    <section
      aria-labelledby="featured-projects-title"
      className={`relative py-16 md:py-20 ${className}`}
      style={{ background: 'linear-gradient(135deg, #0a0a0a 0%, #141414 100%)' }}
    >
      <div
        className="absolute inset-0 opacity-25 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(rgba(212,175,55,0.08) 1px, transparent 1px)",
          backgroundSize: '40px 40px',
        }}
        aria-hidden="true"
      />
      <div className="relative mx-auto max-w-7xl px-4">
        {/* Title */}
        <motion.div 
          className="text-center mb-10 md:mb-14"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <motion.h2
            id="featured-projects-title"
            className="text-3xl md:text-4xl font-semibold"
            style={{
              color: GOLD,
              fontFamily: 'Playfair Display, serif',
            }}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            {title}
          </motion.h2>
          {subtitle && (
            <motion.p 
              className="mt-3 text-base md:text-lg text-gray-300 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
            >
              {subtitle}
            </motion.p>
          )}
        </motion.div>

        {/* Grid */}
        <div className="grid gap-8 md:gap-10"
             style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>
          {projects.map((p, i) => (
            <Card key={`${p.title}-${i}`} project={p} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
};