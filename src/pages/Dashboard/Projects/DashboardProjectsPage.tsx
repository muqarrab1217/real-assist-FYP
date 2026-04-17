import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    BuildingOfficeIcon,
    MapPinIcon,
    SparklesIcon,
    ArrowRightIcon,
    PlusIcon,
    ArrowPathIcon,
} from '@heroicons/react/24/outline';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { extractedProperties } from '@/data/extractedMockData';
import { InventoryBrowserModal } from '@/components/Projects/InventoryBrowserModal';
import { AddProjectModal } from '@/components/Projects/AddProjectModal';
import { EditProjectModal } from '@/components/Projects/EditProjectModal';
import { SubscriptionsModal } from '@/components/Projects/SubscriptionsModal';
import { Property } from '@/types';
import { useAuthContext } from '@/contexts/AuthContext';
import { useProperties } from '@/hooks/queries/useCommonQueries';
import { useQueryClient } from '@tanstack/react-query';
import { commonKeys } from '@/hooks/queries/useCommonQueries';
import { useAllProjectSubscriptions } from '@/hooks/queries/useAdminQueries';
import { useUserEnrollments, usePendingEnrollments } from '@/hooks/queries/useClientQueries';

export const DashboardProjectsPage: React.FC = () => {
    const { role } = useAuthContext();
    const queryClient = useQueryClient();
    const isAdmin = role === 'admin';
    const isClient = role === 'client';

    const [selectedProject, setSelectedProject] = useState<Property | null>(null);
    const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [projectToEdit, setProjectToEdit] = useState<Property | null>(null);
    const [isSubscriptionsModalOpen, setIsSubscriptionsModalOpen] = useState(false);
    const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
    const [selectedProjectName, setSelectedProjectName] = useState<string>('');

    const { data: userEnrollments = [] } = useUserEnrollments();
    const { data: pendingEnrollments = [] } = usePendingEnrollments();

    // Collect inventory_item_ids that this user already has active or pending enrollments for
    const enrolledInventoryIds = React.useMemo(
        () => new Set(userEnrollments.map((e: any) => e.inventory_item_id).filter(Boolean)),
        [userEnrollments]
    );
    const pendingInventoryIds = React.useMemo(
        () => new Set(
            pendingEnrollments
                .filter((e: any) => e.status === 'pending')
                .map((e: any) => e.inventoryItemId ?? e.inventory_item_id)
                .filter(Boolean)
        ),
        [pendingEnrollments]
    );

    // Count enrollments per project (for badge display)
    const enrollmentCountByProject = React.useMemo(() => {
        const counts = new Map<string, number>();
        for (const e of userEnrollments) {
            const pid = (e as any).projectId ?? (e as any).project_id;
            if (pid) counts.set(pid, (counts.get(pid) || 0) + 1);
        }
        for (const e of pendingEnrollments) {
            if ((e as any).status === 'pending') {
                const pid = (e as any).projectId ?? (e as any).project_id;
                if (pid) counts.set(pid, (counts.get(pid) || 0) + 1);
            }
        }
        return counts;
    }, [userEnrollments, pendingEnrollments]);

    const { data: dbProjects, isLoading: loadingProjects, refetch: fetchProjects } = useProperties();

    const projects = React.useMemo(() => {
        if (!dbProjects) return extractedProperties;
        
        const combined = [...dbProjects];
        const dbIds = new Set(dbProjects.map(p => p.id));

        extractedProperties.forEach(p => {
            if (!dbIds.has(p.id)) {
                combined.push(p);
            }
        });
        return combined;
    }, [dbProjects]);

    const loading = loadingProjects;

    const projectIds = projects.map(p => p.id);
    const subscriptionResults = useAllProjectSubscriptions(isAdmin ? projectIds : []);
    
    // Convert array of queries back into a Map
    const subscriptionCounts = React.useMemo(() => {
        const counts = new Map<string, number>();
        projects.forEach((project, index) => {
            counts.set(project.id, subscriptionResults[index]?.data?.count || 0);
        });
        return counts;
    }, [projects, subscriptionResults]);

    const handleEnroll = (project: Property) => {
        // Always allow opening the inventory browser — duplicate prevention
        // is handled at the unit level inside the modal and by the DB trigger
        setSelectedProject(project);
        setIsEnrollModalOpen(true);
    };

    const handleAddProjectSuccess = (_newProject: Property) => {
        queryClient.invalidateQueries({ queryKey: commonKeys.properties() });
    };

    const handleEditProject = (project: Property) => {
        setProjectToEdit(project);
        setIsEditModalOpen(true);
    };

    const handleEditProjectSuccess = (_updatedProject: Property) => {
        queryClient.invalidateQueries({ queryKey: commonKeys.properties() });
        setIsEditModalOpen(false);
        setProjectToEdit(null);
    };

    const handleSubscriptions = (project: Property) => {
        setSelectedProjectId(project.id);
        setSelectedProjectName(project.name);
        setIsSubscriptionsModalOpen(true);
    };

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
                        onClick={() => fetchProjects()}
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
                                <div className="relative h-64 overflow-hidden bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f]">
                                    {project.images && project.images.length > 0 ? (
                                        <img
                                            src={project.images[0]}
                                            alt={project.name}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                            onError={(e) => {
                                                // If image fails to load, show placeholder
                                                (e.target as HTMLImageElement).style.display = 'none';
                                            }}
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <div className="text-center">
                                                <BuildingOfficeIcon className="h-16 w-16 mx-auto mb-2 text-gold-500/40" />
                                                <p className="text-xs text-gold-500/40">No image available</p>
                                            </div>
                                        </div>
                                    )}
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
                                            className="w-full bg-gradient-to-r from-[#d4af37] to-[#f4e68c] text-black hover:bg-gold-500 hover:text-black font-bold py-6 rounded-2xl transition-all group/btn relative"
                                        >
                                            {enrollmentCountByProject.has(project.id)
                                                ? 'Enroll in Another Unit'
                                                : 'Experience & Enroll'}
                                            <ArrowRightIcon className="h-5 w-5 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                                            {enrollmentCountByProject.has(project.id) && (
                                                <span className="absolute -top-2 -right-2 inline-flex items-center justify-center h-6 w-6 rounded-full bg-black text-gold-500 text-xs font-bold border border-gold-500/40">
                                                    {enrollmentCountByProject.get(project.id)}
                                                </span>
                                            )}
                                        </Button>
                                    )}

                                    {isAdmin && (
                                        <div className="flex gap-2">
                                            <Button
                                                onClick={() => handleEditProject(project)}
                                                variant="outline"
                                                className="flex-1 border-gold-500/30 text-gold-500 hover:bg-gold-500/10"
                                            >
                                                Edit Details
                                            </Button>
                                            <Button
                                                onClick={() => handleSubscriptions(project)}
                                                className="flex-1 bg-gold-500 text-black hover:bg-gold-400 font-bold relative"
                                            >
                                                Subscriptions
                                                {subscriptionCounts.has(project.id) && (
                                                    <span className="absolute top-1 right-1 inline-flex items-center justify-center h-5 w-5 rounded-full bg-black text-gold-500 text-xs font-bold">
                                                        {subscriptionCounts.get(project.id)}
                                                    </span>
                                                )}
                                            </Button>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Inventory Browser + Enrollment Modal */}
            <InventoryBrowserModal
                isOpen={isEnrollModalOpen}
                onClose={() => setIsEnrollModalOpen(false)}
                project={selectedProject}
                enrolledInventoryIds={enrolledInventoryIds}
                pendingInventoryIds={pendingInventoryIds}
                enrollmentCount={selectedProject ? (enrollmentCountByProject.get(selectedProject.id) || 0) : 0}
            />

            {/* Add Project Modal */}
            <AddProjectModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSuccess={handleAddProjectSuccess}
            />

            {/* Edit Project Modal */}
            <EditProjectModal
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setProjectToEdit(null);
                }}
                project={projectToEdit}
                onSuccess={handleEditProjectSuccess}
            />

            {/* Subscriptions Modal */}
            <SubscriptionsModal
                isOpen={isSubscriptionsModalOpen}
                onClose={() => {
                    setIsSubscriptionsModalOpen(false);
                    setSelectedProjectId(null);
                }}
                projectId={selectedProjectId || ''}
                projectName={selectedProjectName}
            />
        </div>
    );
};
