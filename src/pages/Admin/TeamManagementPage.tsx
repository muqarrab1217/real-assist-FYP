import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    UsersIcon,
    PlusIcon,
    MagnifyingGlassIcon,
    UserPlusIcon,
    TrashIcon,
    ChevronRightIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { adminAPI, authAPI } from '@/services/api';
import { Team, TeamMember, User } from '@/types';
import { formatDate } from '@/lib/utils';

export const TeamManagementPage: React.FC = () => {
    const [teams, setTeams] = useState<Team[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
    const [isAddingTeam, setIsAddingTeam] = useState(false);
    const [newTeamName, setNewTeamName] = useState('');
    const [newTeamDesc, setNewTeamDesc] = useState('');

    // Member search/add state
    const [searchEmail, setSearchEmail] = useState('');
    const [foundUser, setFoundUser] = useState<User | null>(null);
    const [isSearching, setIsSearching] = useState(false);
    const [isRegistering, setIsRegistering] = useState(false);
    const [registrationData, setRegistrationData] = useState({
        email: '',
        firstName: '',
        lastName: '',
        password: 'Password123!', // Default password for new members
    });

    useEffect(() => {
        fetchTeams();
    }, []);

    const fetchTeams = async () => {
        try {
            const data = await adminAPI.getTeams();
            setTeams(data);
        } catch (error) {
            console.error('Failed to fetch teams:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchTeamMembers = async (teamId: string) => {
        try {
            const data = await adminAPI.getTeamMembers(teamId);
            setTeamMembers(data);
        } catch (error) {
            console.error('Failed to fetch team members:', error);
        }
    };

    const handleCreateTeam = async () => {
        if (!newTeamName.trim()) return;
        try {
            await adminAPI.createTeam(newTeamName, newTeamDesc);
            setNewTeamName('');
            setNewTeamDesc('');
            setIsAddingTeam(false);
            fetchTeams();
        } catch (error) {
            console.error('Failed to create team:', error);
        }
    };

    const handleSelectTeam = (team: Team) => {
        setSelectedTeam(team);
        fetchTeamMembers(team.id);
    };

    const handleSearchUser = async () => {
        if (!searchEmail.trim()) return;
        setIsSearching(true);
        try {
            const user = await adminAPI.searchUserByEmail(searchEmail);
            setFoundUser(user);
            if (!user) {
                setRegistrationData(d => ({ ...d, email: searchEmail }));
                setIsRegistering(true);
            }
        } catch (error) {
            console.error('Search failed:', error);
        } finally {
            setIsSearching(false);
        }
    };

    const handleAddExistingMember = async () => {
        if (!selectedTeam || !foundUser) return;
        try {
            await adminAPI.addMemberToTeam(selectedTeam.id, foundUser.id);
            fetchTeamMembers(selectedTeam.id);
            setFoundUser(null);
            setSearchEmail('');
        } catch (error: any) {
            console.error('Failed to add member:', error);
            if (error.code === '23505') {
                alert('This user is already a member of this team.');
            } else {
                alert(error.message || 'Failed to add member');
            }
        }
    };

    const handleRegisterAndAdd = async () => {
        if (!selectedTeam || !registrationData.email) return;
        try {
            const newUser = await authAPI.register({
                email: registrationData.email,
                password: registrationData.password,
                firstName: registrationData.firstName,
                lastName: registrationData.lastName,
                role: 'employee' // Teams are for internal staff
            });

            await adminAPI.addMemberToTeam(selectedTeam.id, newUser.id);
            fetchTeamMembers(selectedTeam.id);
            setIsRegistering(false);
            setSearchEmail('');
            setRegistrationData({ email: '', firstName: '', lastName: '', password: 'Password123!' });
        } catch (error: any) {
            console.error('Registration failed:', error);
            alert(error.message || 'Registration failed');
        }
    };

    const handleRemoveMember = async (profileId: string) => {
        if (!selectedTeam) return;
        if (!confirm('Are you sure you want to remove this member?')) return;
        try {
            await adminAPI.removeMemberFromTeam(selectedTeam.id, profileId);
            fetchTeamMembers(selectedTeam.id);
        } catch (error) {
            console.error('Failed to remove member:', error);
        }
    };

    if (loading) {
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
                        <p style={{ color: 'rgba(156, 163, 175, 0.9)' }}>Organize your employees into teams for lead and project assignment</p>
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
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        {/* Add Member Search */}
                                        <div className="pt-4 border-t border-gold-200/10">
                                            <h4 className="text-sm font-semibold text-white mb-4 flex items-center">
                                                <UserPlusIcon className="h-4 w-4 mr-2 text-gold-400" />
                                                Add Member
                                            </h4>
                                            <div className="flex gap-2">
                                                <div className="relative flex-1">
                                                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                                                    <Input
                                                        placeholder="Search by email..."
                                                        value={searchEmail}
                                                        onChange={(e) => setSearchEmail(e.target.value)}
                                                        onKeyDown={(e) => e.key === 'Enter' && handleSearchUser()}
                                                        className="pl-10 bg-black border-gold-200/20"
                                                    />
                                                </div>
                                                <Button variant="outline" onClick={handleSearchUser} disabled={isSearching}>
                                                    {isSearching ? '...' : 'Search'}
                                                </Button>
                                            </div>

                                            {foundUser && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className="mt-4 p-4 bg-gold-900/20 border border-gold-500/20 rounded-xl flex items-center justify-between"
                                                >
                                                    <div>
                                                        <p className="font-semibold text-white">{foundUser.firstName} {foundUser.lastName}</p>
                                                        <p className="text-sm text-gray-400">{foundUser.email}</p>
                                                    </div>
                                                    <Button size="sm" onClick={handleAddExistingMember} style={{ backgroundImage: 'linear-gradient(135deg, #d4af37, #f4e68c)' }} className="text-black">
                                                        Add to Team
                                                    </Button>
                                                </motion.div>
                                            )}

                                            {isRegistering && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className="mt-4 p-6 bg-charcoal-900/50 border border-gold-500/20 rounded-xl space-y-4"
                                                >
                                                    <div className="flex justify-between items-center">
                                                        <h5 className="font-semibold text-gold-400">Register New Member</h5>
                                                        <button onClick={() => setIsRegistering(false)}><XMarkIcon className="h-4 w-4 text-gray-500" /></button>
                                                    </div>
                                                    <p className="text-sm text-gray-400">No user found with <strong>{searchEmail}</strong>. Fill details to register them.</p>
                                                    <div className="space-y-4">
                                                        <Input
                                                            placeholder="Email Address"
                                                            value={registrationData.email}
                                                            onChange={e => setRegistrationData(d => ({ ...d, email: e.target.value }))}
                                                            className="bg-black border-gold-200/20"
                                                        />
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <Input placeholder="First Name" value={registrationData.firstName} onChange={e => setRegistrationData(d => ({ ...d, firstName: e.target.value }))} className="bg-black border-gold-200/20" />
                                                            <Input placeholder="Last Name" value={registrationData.lastName} onChange={e => setRegistrationData(d => ({ ...d, lastName: e.target.value }))} className="bg-black border-gold-200/20" />
                                                        </div>
                                                    </div>
                                                    <Button onClick={handleRegisterAndAdd} className="w-full text-black font-semibold" style={{ backgroundImage: 'linear-gradient(135deg, #d4af37, #f4e68c)' }}>
                                                        Register & Add as Employee
                                                    </Button>
                                                </motion.div>
                                            )}
                                        </div>

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
        </div>
    );
};

// Simple CN helper for classes
function cn(...classes: (string | boolean | undefined)[]) {
    return classes.filter(Boolean).join(' ');
}
