import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    UsersIcon,
    PlusIcon,
    UserPlusIcon,
    TrashIcon,
    ChevronRightIcon,
    PencilSquareIcon,
} from '@heroicons/react/24/outline';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { useAdminTeams, useAdminTeamMembers, useCreateTeam, useUpdateTeam, useDeleteTeam, useRemoveMemberFromTeam } from '@/hooks/queries/useAdminQueries';
import { useQueryClient } from '@tanstack/react-query';
import { Team } from '@/types';
import { formatDate } from '@/lib/utils';
import { AddMemberModal } from '@/components/Admin/AddMemberModal';

export const TeamManagementPage: React.FC = () => {
    const { data: teams = [], isLoading: loading } = useAdminTeams();
    const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
    const { data: teamMembers = [] } = useAdminTeamMembers(selectedTeam?.id);

    const createTeamMutation = useCreateTeam();
    const updateTeamMutation = useUpdateTeam();
    const deleteTeamMutation = useDeleteTeam();
    const removeMemberMutation = useRemoveMemberFromTeam();
    const queryClient = useQueryClient();

    const [isAddingTeam, setIsAddingTeam] = useState(false);
    const [newTeamName, setNewTeamName] = useState('');
    const [newTeamDesc, setNewTeamDesc] = useState('');

    // Edit team state
    const [isEditingTeam, setIsEditingTeam] = useState(false);
    const [editTeamName, setEditTeamName] = useState('');
    const [editTeamDesc, setEditTeamDesc] = useState('');

    // Add Member Modal
    const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);

    // Confirmation modals
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
    const [confirmRemoveOpen, setConfirmRemoveOpen] = useState(false);
    const [memberToRemove, setMemberToRemove] = useState<string | null>(null);

    const handleCreateTeam = async () => {
        if (!newTeamName.trim()) return;
        createTeamMutation.mutate(
            { name: newTeamName, description: newTeamDesc },
            {
                onSuccess: () => {
                    setNewTeamName('');
                    setNewTeamDesc('');
                    setIsAddingTeam(false);
                },
                onError: (error) => console.error('Failed to create team:', error)
            }
        );
    };

    const handleSelectTeam = (team: Team) => {
        setSelectedTeam(team);
    };

    const handleEditTeam = () => {
        if (!selectedTeam) return;
        setEditTeamName(selectedTeam.name);
        setEditTeamDesc(selectedTeam.description || '');
        setIsEditingTeam(true);
    };

    const handleSaveEdit = async () => {
        if (!selectedTeam || !editTeamName.trim()) return;
        updateTeamMutation.mutate(
            { id: selectedTeam.id, name: editTeamName, description: editTeamDesc },
            {
                onSuccess: () => {
                    setSelectedTeam({ ...selectedTeam, name: editTeamName, description: editTeamDesc });
                    setIsEditingTeam(false);
                },
                onError: (error) => console.error('Failed to update team:', error)
            }
        );
    };

    const handleDeleteTeam = () => {
        if (!selectedTeam) return;
        setConfirmDeleteOpen(true);
    };

    const handleConfirmDelete = () => {
        if (!selectedTeam) return;
        deleteTeamMutation.mutate(selectedTeam.id, {
            onSuccess: () => {
                setSelectedTeam(null);
                setConfirmDeleteOpen(false);
            },
            onError: (error) => console.error('Failed to delete team:', error)
        });
    };

    const handleAddMember = (_profileId: string) => {
        // Team-add is already handled inside AddMemberModal.
        // This callback just triggers a re-fetch of the members list.
        if (!selectedTeam) return;
        queryClient.invalidateQueries({ queryKey: ['admin', 'teamMembers', selectedTeam.id] });
    };

    const handleRemoveMember = (profileId: string) => {
        if (!selectedTeam) return;
        setMemberToRemove(profileId);
        setConfirmRemoveOpen(true);
    };

    const handleConfirmRemove = () => {
        if (!selectedTeam || !memberToRemove) return;
        removeMemberMutation.mutate(
            { teamId: selectedTeam.id, profileId: memberToRemove },
            {
                onSuccess: () => {
                    setConfirmRemoveOpen(false);
                    setMemberToRemove(null);
                },
                onError: (error) => console.error('Failed to remove member:', error)
            }
        );
    };

    if (loading && teams.length === 0) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#d4af37' }}></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 h-full flex flex-col">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold mb-2" style={{
                            fontFamily: 'Playfair Display, serif',
                            backgroundImage: 'linear-gradient(135deg, #d4af37, #f4e68c)',
                            WebkitBackgroundClip: 'text',
                            backgroundClip: 'text',
                            color: 'transparent',
                        }}>Team Management</h1>
                        <p style={{ color: 'rgba(156, 163, 175, 0.9)' }}>Organize your employees into teams for lead and project assignment (Select any Team for Details)</p>
                    </div>

                    <Dialog open={isAddingTeam} onOpenChange={setIsAddingTeam}>
                        <DialogTrigger asChild>
                            <Button className="text-black font-semibold" style={{
                                backgroundImage: 'linear-gradient(135deg, #d4af37, #f4e68c)'
                            }}>
                                <PlusIcon className="h-4 w-4 mr-2" />
                                New Team
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px] bg-[#1a1a1a] border-gold-200/20 text-white">
                            <DialogHeader>
                                <DialogTitle style={{ color: '#d4af37' }}>Create New Team</DialogTitle>
                                <DialogDescription className="text-gray-400">
                                    Define a new team to group your members.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <label htmlFor="name" className="text-sm font-medium text-gold-400">Team Name</label>
                                    <Input id="name" value={newTeamName} onChange={(e) => setNewTeamName(e.target.value)} className="bg-black border-gold-200/20" />
                                </div>
                                <div className="grid gap-2">
                                    <label htmlFor="desc" className="text-sm font-medium text-gold-400">Description</label>
                                    <textarea id="desc" value={newTeamDesc} onChange={(e) => setNewTeamDesc(e.target.value)} className="w-full bg-black border border-gold-200/20 rounded-md p-2 text-sm min-h-[100px]" />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button onClick={handleCreateTeam} className="w-full text-black font-semibold" style={{ backgroundImage: 'linear-gradient(135deg, #d4af37, #f4e68c)' }}>
                                    Create Team
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
                {/* Teams List */}
                <div className="lg:col-span-1 space-y-4 overflow-y-auto pr-2">
                    {teams.length === 0 ? (
                        <Card className="abs-card border-dashed">
                            <CardContent className="p-6 text-center text-gray-500">
                                <UsersIcon className="h-12 w-12 mx-auto mb-4 opacity-20" />
                                <p>No teams created yet.</p>
                            </CardContent>
                        </Card>
                    ) : (
                        teams.map((team) => (
                            <motion.div
                                key={team.id}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleSelectTeam(team)}
                            >
                                <Card className={cn(
                                    "abs-card cursor-pointer transition-all duration-300",
                                    selectedTeam?.id === team.id ? "border-[#d4af37] ring-1 ring-[#d4af37]/50 shadow-gold" : "border-gold-200/20"
                                )}>
                                    <CardContent className="p-4 flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <div className="h-10 w-10 rounded-lg bg-gold-900/40 flex items-center justify-center border border-gold-500/20">
                                                <UsersIcon className="h-6 w-6 text-gold-400" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-white">{team.name}</h3>
                                                <p className="text-xs text-gray-400">{team.memberCount} members</p>
                                            </div>
                                        </div>
                                        <ChevronRightIcon className="h-5 w-5 text-gray-500" />
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))
                    )}
                </div>

                {/* Team Details / Members */}
                <div className="lg:col-span-2">
                    <AnimatePresence mode="wait">
                        {selectedTeam ? (
                            <motion.div
                                key={selectedTeam.id}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                <Card className="abs-card h-full">
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0">
                                        <div>
                                            <CardTitle className="text-2xl" style={{ color: '#d4af37' }}>{selectedTeam.name}</CardTitle>
                                            <CardDescription className="text-gray-400 mt-1">{selectedTeam.description}</CardDescription>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-gray-400 hover:text-[#d4af37] hover:bg-[#d4af37]/10"
                                                onClick={handleEditTeam}
                                            >
                                                <PencilSquareIcon className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-gray-400 hover:text-red-500 hover:bg-red-500/10"
                                                onClick={handleDeleteTeam}
                                            >
                                                <TrashIcon className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                onClick={() => setIsAddMemberOpen(true)}
                                                className="text-black font-semibold"
                                                style={{ backgroundImage: 'linear-gradient(135deg, #d4af37, #f4e68c)' }}
                                            >
                                                <UserPlusIcon className="h-4 w-4 mr-2" />
                                                Add Member
                                            </Button>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-6">

                                        {/* Members Table */}
                                        <div className="pt-4">
                                            <h4 className="text-sm font-semibold text-white mb-4">Current Members ({teamMembers.length})</h4>
                                            <div className="rounded-xl border border-gold-200/10 overflow-hidden">
                                                <Table>
                                                    <TableHeader className="bg-gold-900/10">
                                                        <TableRow className="border-gold-200/10 hover:bg-transparent">
                                                            <TableHead>Member</TableHead>
                                                            <TableHead>Email</TableHead>
                                                            <TableHead>Joined</TableHead>
                                                            <TableHead className="text-right">Actions</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {teamMembers.length === 0 ? (
                                                            <TableRow>
                                                                <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                                                                    No members in this team.
                                                                </TableCell>
                                                            </TableRow>
                                                        ) : (
                                                            teamMembers.map((member) => (
                                                                <TableRow key={member.id} className="border-gold-200/10 hover:bg-gold-900/5 text-white">
                                                                    <TableCell className="font-medium">
                                                                        <div className="flex items-center space-x-3">
                                                                            <div className="h-8 w-8 rounded-full bg-gold-900/40 flex items-center justify-center text-xs text-gold-400 border border-gold-500/10 font-bold">
                                                                                {member.profile?.firstName?.[0]}{member.profile?.lastName?.[0]}
                                                                            </div>
                                                                            <span>{member.profile?.firstName} {member.profile?.lastName}</span>
                                                                        </div>
                                                                    </TableCell>
                                                                    <TableCell className="text-gray-400">{member.profile?.email}</TableCell>
                                                                    <TableCell className="text-gray-400">{formatDate(member.createdAt!)}</TableCell>
                                                                    <TableCell className="text-right">
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            className="text-gray-500 hover:text-red-500 hover:bg-red-500/10"
                                                                            onClick={() => handleRemoveMember(member.profileId)}
                                                                        >
                                                                            <TrashIcon className="h-4 w-4" />
                                                                        </Button>
                                                                    </TableCell>
                                                                </TableRow>
                                                            ))
                                                        )}
                                                    </TableBody>
                                                </Table>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ) : (
                            <div className="h-full flex items-center justify-center">
                                <div className="text-center space-y-4">
                                    <div className="h-20 w-20 bg-gold-900/20 rounded-full flex items-center justify-center mx-auto border border-gold-500/20">
                                        <UsersIcon className="h-10 w-10 text-gold-500/40" />
                                    </div>
                                    <p className="text-gray-500">Select a team from the list to manage its members.</p>
                                </div>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Add Member Modal */}
            {selectedTeam && (
                <AddMemberModal
                    open={isAddMemberOpen}
                    onClose={() => setIsAddMemberOpen(false)}
                    teamId={selectedTeam.id}
                    teamName={selectedTeam.name}
                    onMemberAdded={handleAddMember}
                />
            )}

            {/* Confirm Delete Team Dialog */}
            <Dialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
                <DialogContent className="sm:max-w-[400px] bg-[#1a1a1a] border-gold-200/20 text-white">
                    <DialogHeader>
                        <DialogTitle className="text-red-400">Delete Team</DialogTitle>
                        <DialogDescription className="text-gray-400">
                            Are you sure you want to delete <span className="text-white font-semibold">{selectedTeam?.name}</span>? All members will be removed. This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="outline" onClick={() => setConfirmDeleteOpen(false)} className="border-gold-200/20 text-gray-300 hover:bg-gold-900/10">
                            Cancel
                        </Button>
                        <Button onClick={handleConfirmDelete} disabled={deleteTeamMutation.isPending} className="bg-red-600 hover:bg-red-700 text-white">
                            {deleteTeamMutation.isPending ? 'Deleting...' : 'Delete Team'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Confirm Remove Member Dialog */}
            <Dialog open={confirmRemoveOpen} onOpenChange={(open) => { setConfirmRemoveOpen(open); if (!open) setMemberToRemove(null); }}>
                <DialogContent className="sm:max-w-[400px] bg-[#1a1a1a] border-gold-200/20 text-white">
                    <DialogHeader>
                        <DialogTitle className="text-red-400">Remove Member</DialogTitle>
                        <DialogDescription className="text-gray-400">
                            Are you sure you want to remove this member from <span className="text-white font-semibold">{selectedTeam?.name}</span>?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="outline" onClick={() => { setConfirmRemoveOpen(false); setMemberToRemove(null); }} className="border-gold-200/20 text-gray-300 hover:bg-gold-900/10">
                            Cancel
                        </Button>
                        <Button onClick={handleConfirmRemove} disabled={removeMemberMutation.isPending} className="bg-red-600 hover:bg-red-700 text-white">
                            {removeMemberMutation.isPending ? 'Removing...' : 'Remove Member'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Team Dialog */}
            <Dialog open={isEditingTeam} onOpenChange={setIsEditingTeam}>
                <DialogContent className="sm:max-w-[425px] bg-[#1a1a1a] border-gold-200/20 text-white">
                    <DialogHeader>
                        <DialogTitle style={{ color: '#d4af37' }}>Edit Team</DialogTitle>
                        <DialogDescription className="text-gray-400">
                            Update the team name and description.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <label htmlFor="edit-name" className="text-sm font-medium text-gold-400">Team Name</label>
                            <Input id="edit-name" value={editTeamName} onChange={(e) => setEditTeamName(e.target.value)} className="bg-black border-gold-200/20" />
                        </div>
                        <div className="grid gap-2">
                            <label htmlFor="edit-desc" className="text-sm font-medium text-gold-400">Description</label>
                            <textarea id="edit-desc" value={editTeamDesc} onChange={(e) => setEditTeamDesc(e.target.value)} className="w-full bg-black border border-gold-200/20 rounded-md p-2 text-sm min-h-[100px]" />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleSaveEdit} disabled={updateTeamMutation.isPending} className="w-full text-black font-semibold" style={{ backgroundImage: 'linear-gradient(135deg, #d4af37, #f4e68c)' }}>
                            {updateTeamMutation.isPending ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

// Simple CN helper for classes
function cn(...classes: (string | boolean | undefined)[]) {
    return classes.filter(Boolean).join(' ');
}
