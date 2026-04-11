import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  XMarkIcon,
  MagnifyingGlassIcon,
  EnvelopeIcon,
  UserPlusIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { adminAPI } from '@/services/api';
import { User } from '@/types';

interface AddMemberModalProps {
  open: boolean;
  onClose: () => void;
  teamId: string;
  teamName: string;
  onMemberAdded: (profileId: string) => void;
}

type Tab = 'existing' | 'invite';
type InviteStep = 'form' | 'sending' | 'success' | 'error';

function generatePassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$';
  let password = '';
  // Ensure at least 1 uppercase, 1 lowercase, 1 digit, 1 special
  password += 'ABCDEFGHJKLMNPQRSTUVWXYZ'[Math.floor(Math.random() * 24)];
  password += 'abcdefghjkmnpqrstuvwxyz'[Math.floor(Math.random() * 23)];
  password += '23456789'[Math.floor(Math.random() * 8)];
  password += '!@#$'[Math.floor(Math.random() * 4)];
  for (let i = 4; i < 8; i++) {
    password += chars[Math.floor(Math.random() * chars.length)];
  }
  // Shuffle
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

export const AddMemberModal: React.FC<AddMemberModalProps> = ({
  open,
  onClose,
  teamId,
  teamName,
  onMemberAdded,
}) => {
  const [activeTab, setActiveTab] = useState<Tab>('existing');

  // Existing member search
  const [searchEmail, setSearchEmail] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [foundUser, setFoundUser] = useState<User | null>(null);
  const [searchError, setSearchError] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [addedSuccess, setAddedSuccess] = useState(false);

  // Invite new member
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'employee' | 'sales_rep'>('employee');
  const [inviteStep, setInviteStep] = useState<InviteStep>('form');
  const [inviteError, setInviteError] = useState('');
  const [emailSent, setEmailSent] = useState(true);

  const resetState = () => {
    setSearchEmail('');
    setFoundUser(null);
    setSearchError('');
    setIsSearching(false);
    setIsAdding(false);
    setAddedSuccess(false);
    setInviteEmail('');
    setInviteRole('employee');
    setInviteStep('form');
    setInviteError('');
    setEmailSent(true);
    setActiveTab('existing');
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleSearchUser = async () => {
    if (!searchEmail.trim()) return;
    setIsSearching(true);
    setSearchError('');
    setFoundUser(null);
    try {
      const user = await adminAPI.searchUserByEmail(searchEmail.trim());
      if (user) {
        setFoundUser(user);
      } else {
        setSearchError('No user found with this email. You can invite them instead.');
      }
    } catch {
      setSearchError('Search failed. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddExisting = async () => {
    if (!foundUser) return;
    setIsAdding(true);
    try {
      await adminAPI.addMemberToTeam(teamId, foundUser.id);
      onMemberAdded(foundUser.id);
      setAddedSuccess(true);
    } catch (err: any) {
      console.error('Failed to add member:', err);
      if (err.code === '23505') {
        setSearchError('This user is already a member of this team.');
      } else {
        setSearchError(err.message || 'Failed to add member. Please try again.');
      }
    } finally {
      setIsAdding(false);
    }
  };

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return;
    setInviteStep('sending');
    setInviteError('');

    const generatedPassword = generatePassword();

    try {
      // Backend creates user, profile, adds to team, and sends email — all in one call
      const { userId, emailSent: sent } = await adminAPI.inviteMember({
        email: inviteEmail.trim(),
        password: generatedPassword,
        role: inviteRole,
        teamId,
      });

      onMemberAdded(userId);
      setEmailSent(sent);
      setInviteStep('success');
    } catch (err: any) {
      console.error('Invite failed:', err);
      setInviteError(err.message || 'Failed to send invitation. Please try again.');
      setInviteStep('error');
    }
  };

  if (!open) return null;

  const modal = (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center"
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={handleClose} />

        {/* Modal */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ type: 'spring', duration: 0.4 }}
          className="relative w-full max-w-lg mx-4 overflow-hidden"
          style={{
            background: 'rgba(26,26,26,0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(212,175,55,0.25)',
            borderRadius: '20px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gold-200/10">
            <div>
              <h2 className="text-xl font-bold" style={{
                fontFamily: 'Playfair Display, serif',
                backgroundImage: 'linear-gradient(135deg, #d4af37, #f4e68c)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                color: 'transparent',
              }}>Add Member</h2>
              <p className="text-xs text-gray-400 mt-1">to {teamName}</p>
            </div>
            <button onClick={handleClose} className="text-gray-500 hover:text-white transition-colors">
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          {/* Tab Switcher */}
          <div className="flex border-b border-gold-200/10">
            <button
              onClick={() => setActiveTab('existing')}
              className={`flex-1 py-3 text-sm font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
                activeTab === 'existing'
                  ? 'text-[#d4af37] border-b-2 border-[#d4af37]'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <MagnifyingGlassIcon className="h-4 w-4" />
              Existing User
            </button>
            <button
              onClick={() => setActiveTab('invite')}
              className={`flex-1 py-3 text-sm font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
                activeTab === 'invite'
                  ? 'text-[#d4af37] border-b-2 border-[#d4af37]'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <EnvelopeIcon className="h-4 w-4" />
              Invite New
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {activeTab === 'existing' && addedSuccess && (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="py-8 flex flex-col items-center gap-4 text-center"
              >
                <div className="h-16 w-16 rounded-full bg-green-500/20 flex items-center justify-center">
                  <CheckCircleIcon className="h-8 w-8 text-green-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Member Added!</h3>
                  <p className="text-sm text-gray-400 mt-1">
                    <strong className="text-[#d4af37]">{foundUser?.email || searchEmail}</strong> has been added to {teamName}.
                  </p>
                </div>
                <Button onClick={handleClose} variant="outline" className="mt-2 border-gold-200/20">
                  Done
                </Button>
              </motion.div>
            )}

            {activeTab === 'existing' && !addedSuccess && (
              <div className="space-y-4">
                <p className="text-sm text-gray-400">Search for an existing user by their email address to add them to this team.</p>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <Input
                      placeholder="Enter email address..."
                      value={searchEmail}
                      onChange={(e) => { setSearchEmail(e.target.value); setSearchError(''); setFoundUser(null); }}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearchUser()}
                      className="pl-10 bg-black border-gold-200/20"
                    />
                  </div>
                  <Button
                    variant="outline"
                    onClick={handleSearchUser}
                    disabled={isSearching || !searchEmail.trim()}
                    className="border-gold-200/20"
                  >
                    {isSearching ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-gold-400 border-t-transparent" />
                    ) : 'Search'}
                  </Button>
                </div>

                {foundUser && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-gold-900/20 border border-gold-500/20 rounded-xl flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gold-900/40 flex items-center justify-center text-sm text-gold-400 border border-gold-500/10 font-bold">
                        {foundUser.firstName?.[0]}{foundUser.lastName?.[0]}
                      </div>
                      <div>
                        <p className="font-semibold text-white">{foundUser.firstName} {foundUser.lastName}</p>
                        <p className="text-xs text-gray-400">{foundUser.email} · {foundUser.role}</p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={handleAddExisting}
                      disabled={isAdding}
                      className="text-black font-semibold"
                      style={{ backgroundImage: 'linear-gradient(135deg, #d4af37, #f4e68c)' }}
                    >
                      <UserPlusIcon className="h-4 w-4 mr-1" />
                      {isAdding ? 'Adding...' : 'Add'}
                    </Button>
                  </motion.div>
                )}

                {searchError && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-xl flex items-start gap-3 bg-amber-500/10 border border-amber-500/20"
                  >
                    <ExclamationTriangleIcon className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-amber-300">{searchError}</p>
                      <button
                        onClick={() => { setActiveTab('invite'); setInviteEmail(searchEmail); }}
                        className="text-xs text-[#d4af37] hover:underline mt-1"
                      >
                        Switch to invite tab →
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            )}

            {activeTab === 'invite' && inviteStep === 'form' && (
              <div className="space-y-5">
                <p className="text-sm text-gray-400">
                  Enter the email of the person you want to invite. A temporary password will be generated and sent to their email.
                </p>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Email Address</label>
                  <div className="relative">
                    <EnvelopeIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <Input
                      type="email"
                      placeholder="member@example.com"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      className="pl-10 bg-black border-gold-200/20"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Role</label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as 'employee' | 'sales_rep')}
                    className="w-full bg-black border border-gold-200/20 rounded-md px-3 py-2 text-sm text-white focus:border-gold-500/40 focus:outline-none"
                  >
                    <option value="employee">Employee</option>
                    <option value="sales_rep">Sales Representative</option>
                  </select>
                </div>
                <Button
                  onClick={handleInvite}
                  disabled={!inviteEmail.trim()}
                  className="w-full text-black font-semibold"
                  style={{ backgroundImage: 'linear-gradient(135deg, #d4af37, #f4e68c)' }}
                >
                  <EnvelopeIcon className="h-4 w-4 mr-2" />
                  Send Invitation
                </Button>
              </div>
            )}

            {activeTab === 'invite' && inviteStep === 'sending' && (
              <div className="py-8 flex flex-col items-center gap-4">
                <div className="h-12 w-12 animate-spin rounded-full border-3 border-gold-400 border-t-transparent" />
                <p className="text-gray-400 text-sm">Sending invitation to {inviteEmail}...</p>
              </div>
            )}

            {activeTab === 'invite' && inviteStep === 'success' && (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="py-8 flex flex-col items-center gap-4 text-center"
              >
                <div className="h-16 w-16 rounded-full bg-green-500/20 flex items-center justify-center">
                  <CheckCircleIcon className="h-8 w-8 text-green-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Invitation Sent!</h3>
                  <p className="text-sm text-gray-400 mt-1">
                    Account created for <strong className="text-[#d4af37]">{inviteEmail}</strong>. A welcome email with login credentials has been sent to them.
                  </p>
                </div>
                <Button onClick={handleClose} variant="outline" className="mt-2 border-gold-200/20">
                  Done
                </Button>
              </motion.div>
            )}

            {activeTab === 'invite' && inviteStep === 'error' && (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="py-8 flex flex-col items-center gap-4 text-center"
              >
                <div className="h-16 w-16 rounded-full bg-red-500/20 flex items-center justify-center">
                  <ExclamationTriangleIcon className="h-8 w-8 text-red-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Invitation Failed</h3>
                  <p className="text-sm text-red-400 mt-1">{inviteError}</p>
                </div>
                <Button onClick={() => setInviteStep('form')} variant="outline" className="mt-2 border-gold-200/20">
                  Try Again
                </Button>
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );

  return createPortal(modal, document.getElementById('portal-root') || document.body);
};
