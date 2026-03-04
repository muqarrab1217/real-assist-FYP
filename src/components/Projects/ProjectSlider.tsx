import React from 'react';
import { motion } from 'framer-motion';
import {
    MapPinIcon,
    ArrowRightIcon,
    SparklesIcon
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import { detailedProjects } from '@/data/extractedMockData';

interface ProjectSliderProps {
    onEnroll: (project: any) => void;
}

export const ProjectSlider: React.FC<ProjectSliderProps> = ({ onEnroll }) => {
    // Sort projects by status or date if needed, for now just taking constructed ones
    const upcomingProjects = detailedProjects.slice(0, 6);

    return (
        <section className="py-20 relative overflow-hidden" style={{ background: '#0a0a0a' }}>
            {/* Background decoration */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gold-500/50 to-transparent shadow-[0_0_15px_rgba(212,175,55,0.3)]" />

            <div className="max-w-7xl mx-auto px-4 mb-10">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                    className="flex items-center gap-2 mb-4"
                >
                    <SparklesIcon className="h-6 w-6" style={{ color: '#d4af37' }} />
                    <h2
                        className="text-3xl md:text-4xl font-bold"
                        style={{
                            fontFamily: 'Playfair Display, serif',
                            color: '#d4af37'
                        }}
                    >
                        Current & Upcoming Projects
                    </h2>
                </motion.div>
                <p style={{ color: 'rgba(156, 163, 175, 0.8)' }} className="max-w-2xl">
                    Join the future of premium living. Explore our latest developments and enroll early to secure your investment.
                </p>
            </div>

            <div className="relative">
                {/* Infinite Scroll / Slider container */}
                <div className="flex overflow-x-auto pb-10 px-4 gap-6 no-scrollbar snap-x snap-mandatory">
                    {upcomingProjects.map((project, index) => (
                        <motion.div
                            key={project.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            viewport={{ once: true }}
                            className="flex-shrink-0 w-80 md:w-96 snap-center"
                        >
                            <div
                                className="abs-card-premium overflow-hidden group h-full flex flex-col"
                                style={{
                                    background: 'rgba(26,26,26,0.8)',
                                    border: '1px solid rgba(212,175,55,0.2)',
                                    borderRadius: '24px',
                                }}
                            >
                                {/* Image Area */}
                                <div className="relative h-56 overflow-hidden">
                                    <img
                                        src={project.images[0]}
                                        alt={project.name}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                                    <div className="absolute top-4 left-4">
                                        <span
                                            className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest"
                                            style={{
                                                background: 'linear-gradient(135deg, #d4af37, #f4e68c)',
                                                color: '#000'
                                            }}
                                        >
                                            {project.status === 'construction' ? 'In Progress' : 'Upcoming'}
                                        </span>
                                    </div>
                                </div>

                                {/* Content Area */}
                                <div className="p-6 flex-grow flex flex-col">
                                    <h3
                                        className="text-xl font-bold mb-2 text-white"
                                        style={{ fontFamily: 'Playfair Display, serif' }}
                                    >
                                        {project.name}
                                    </h3>

                                    <div className="flex items-center mb-4 text-sm" style={{ color: 'rgba(156, 163, 175, 0.9)' }}>
                                        <MapPinIcon className="h-4 w-4 mr-1 text-gold-500" />
                                        {project.location}
                                    </div>

                                    <p className="text-sm line-clamp-2 mb-6 flex-grow" style={{ color: 'rgba(156, 163, 175, 0.7)' }}>
                                        {project.description}
                                    </p>

                                    <div className="flex gap-3">
                                        <Button
                                            onClick={() => onEnroll(project)}
                                            className="flex-1 font-bold text-black"
                                            style={{
                                                background: 'linear-gradient(135deg, #d4af37, #f4e68c)',
                                                borderRadius: '12px'
                                            }}
                                        >
                                            Enroll Now
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="px-3"
                                            style={{
                                                borderColor: 'rgba(212,175,55,0.3)',
                                                color: '#d4af37',
                                                background: 'transparent',
                                                borderRadius: '12px'
                                            }}
                                        >
                                            <ArrowRightIcon className="h-5 w-5" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Custom scroll indicators if needed or just styling */}
            </div>

            <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
        </section>
    );
};
