import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BuildingOfficeIcon,
    MapPinIcon,
    SparklesIcon,
    ArrowRightIcon,
    ShieldCheckIcon,
    StarIcon,
    PlusIcon,
    ArrowPathIcon
} from '@heroicons/react/24/outline';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { extractedProperties } from '@/data/extractedMockData';
import { ProjectEnrollmentModal } from '@/components/Projects/ProjectEnrollmentModal';
import { AddProjectModal } from '@/components/Projects/AddProjectModal';
import { Property } from '@/types';
import { useAuthContext } from '@/contexts/AuthContext';
import { commonAPI } from '@/services/api';

export const DashboardProjectsPage: React.FC = () => {
    const { role } = useAuthContext();
    const [selectedProject, setSelectedProject] = useState<Property | null>(null);
    const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    const [projects, setProjects] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchProjects = async () => {
        setLoading(true);
        try {
            const dbProjects = await commonAPI.getProperties();
            // Combine mock with DB projects for a rich initial view, 
            // ensuring no duplicates by ID (if mock IDs match DB IDs)
            const combined = [...dbProjects];
            const dbIds = new Set(dbProjects.map(p => p.id));

            extractedProperties.forEach(p => {
                if (!dbIds.has(p.id)) {
                    combined.push(p);
                }
            });

            setProjects(combined);
        } catch (error) {
            console.error('Failed to fetch projects:', error);
            setProjects(extractedProperties);
        } finally {

            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    const handleEnroll = (project: Property) => {
        setSelectedProject(project);
        setIsEnrollModalOpen(true);
    };

    const handleAddProjectSuccess = (newProject: Property) => {
        setProjects(prev => [newProject, ...prev]);
    };

    const isAdmin = role === 'admin';
    const isClient = role === 'client';

    return (
        <div className="space-y-12 pb-20">
            {/* Hero Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden rounded-3xl p-12 bg-[#0a0a0a] border border-gold-500/20"
                style={{ background: 'linear-gradient(135deg, rgba(26,26,26,0.9) 0%, rgba(10,10,10,1) 100%)' }}
            >
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <BuildingOfficeIcon className="h-64 w-64 text-gold-500" />
                </div>
                <div className="relative z-10 max-w-3xl">
                    <div className="flex items-center gap-2 mb-4">
                        <SparklesIcon className="h-5 w-5 text-gold-400" />
                        <span className="text-xs uppercase tracking-[0.2em] font-bold text-gold-400">Exclusive Developments</span>
                    </div>
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <h1 className="text-5xl font-bold mb-6 text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
                                Curated Properties for <span className="text-gold-400 italic">Visionary Investors</span>
                            </h1>
                            <p className="text-lg text-gray-400 leading-relaxed mb-0">
                                Explore our flagship projects designed for high ROI and premium lifestyle.
                            </p>
                        </div>

                        {isAdmin && (
                            <Button
                                onClick={() => setIsAddModalOpen(true)}
                                className="bg-gold-500 text-black hover:bg-gold-400 font-bold px-8 py-6 rounded-2xl flex items-center gap-2 shadow-lg shadow-gold-500/20"
                            >
                                <PlusIcon className="h-5 w-5" />
                                Add Project
                            </Button>
                        )}
                    </div>
                </div>
            </motion.div>

            {/* Vision Quote Section */}
            <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                className="text-center max-w-4xl mx-auto px-6 py-4 flex flex-col items-center"
            >
                <div className="flex items-center gap-4 mb-2">
                    <h2 className="text-2xl font-serif italic text-gold-400">"Building Legacies, Delivering Excellence"</h2>
                    <button
                        onClick={fetchProjects}
                        disabled={loading}
                        className="text-gold-500/50 hover:text-gold-500 transition-colors"
                    >
                        <ArrowPathIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
                <div className="h-1 w-20 bg-gold-500/40 rounded-full"></div>
            </motion.div>

            {/* Projects Grid */}
            {loading && projects.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <div className="h-12 w-12 border-4 border-gold-500/20 border-t-gold-500 rounded-full animate-spin"></div>
                    <p className="text-gold-400 font-medium animate-pulse">Refining Portfolio...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-2">
                    {projects.map((project, index) => (
                        <motion.div
                            key={project.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            viewport={{ once: true }}
                        >
                            <Card className="group relative overflow-hidden rounded-3xl bg-[#0f0f0f] border-gold-500/20 hover:border-gold-500/40 transition-all duration-500 h-full flex flex-col border border-gold-500/20">
                                {/* Project Image */}
                                <div className="relative h-64 overflow-hidden">
                                    <img
                                        src={project.images?.[0] || '/images/placeholder.png'}
                                        alt={project.name}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f0f] to-transparent opacity-60"></div>
                                    <div className="absolute top-4 right-4">
                                        <Badge className="bg-gold-500 text-black font-bold uppercase tracking-wider text-[10px] px-3">
                                            {project.type || 'Development'}
                                        </Badge>
                                    </div>
                                </div>

                                <CardContent className="p-8 flex-1 flex flex-col">
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-gold-400 transition-colors" style={{ fontFamily: 'Playfair Display, serif' }}>
                                                {project.name}
                                            </h3>
                                            <div className="flex items-center text-sm text-gray-500">
                                                <MapPinIcon className="h-4 w-4 mr-1 text-gold-500/60" />
                                                {project.location}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-3 mb-8 flex-1 text-gray-400 text-sm leading-relaxed line-clamp-3">
                                        {project.description || 'Premium development project focusing on luxury and modern architecture.'}
                                    </div>

                                    <div className="space-y-3 mb-8 pb-4 border-b border-gold-500/10">
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-gray-500">Starting From</span>
                                            <span className="text-white font-bold">PKR {(project.priceMin || project.price || 0).toLocaleString()}</span>
                                        </div>
                                    </div>



                                    {isClient && (
                                        <Button
                                            onClick={() => handleEnroll(project)}
                                            className="w-full bg-gradient-to-r from-[#d4af37] to-[#f4e68c] text-black hover:bg-gold-500 hover:text-black font-bold py-6 rounded-2xl transition-all group/btn"
                                        >
                                            Experience & Enroll
                                            <ArrowRightIcon className="h-5 w-5 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                                        </Button>
                                    )}

                                    {isAdmin && (
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                className="flex-1 border-gold-500/30 text-gold-500 hover:bg-gold-500/10"
                                            >
                                                Edit Details
                                            </Button>
                                            <Button
                                                className="flex-1 bg-gold-500/10 text-gold-500 hover:bg-gold-500/20"
                                            >
                                                Subscriptions
                                            </Button>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Enrollment Modal */}
            <ProjectEnrollmentModal
                isOpen={isEnrollModalOpen}
                onClose={() => setIsEnrollModalOpen(false)}
                project={selectedProject}
            />

            {/* Add Project Modal */}
            <AddProjectModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSuccess={handleAddProjectSuccess}
            />
        </div>
    );
};
