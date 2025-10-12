import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  MagnifyingGlassIcon,
  FunnelIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  PhoneIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { adminAPI } from '@/services/api';
import { Lead } from '@/types';
import { formatDate } from '@/lib/utils';

export const LeadManagementPage: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [newNote, setNewNote] = useState('');

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const data = await adminAPI.getLeads();
        setLeads(data);
        setFilteredLeads(data);
      } catch (error) {
        console.error('Failed to fetch leads:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeads();
  }, []);

  useEffect(() => {
    let filtered = leads;

    if (searchTerm) {
      filtered = filtered.filter(lead =>
        lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.phone.includes(searchTerm)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(lead => lead.status === statusFilter);
    }

    setFilteredLeads(filtered);
  }, [leads, searchTerm, statusFilter]);

  const handleStatusUpdate = async (leadId: string, newStatus: 'hot' | 'warm' | 'cold' | 'dead') => {
    try {
      await adminAPI.updateLeadStatus(leadId, newStatus);
      const updatedLeads = await adminAPI.getLeads();
      setLeads(updatedLeads);
    } catch (error) {
      console.error('Failed to update lead status:', error);
    }
  };

  const handleAddNote = async () => {
    if (!selectedLead || !newNote.trim()) return;

    try {
      await adminAPI.addLeadNote(selectedLead.id, newNote);
      const updatedLeads = await adminAPI.getLeads();
      setLeads(updatedLeads);
      setNewNote('');
      setSelectedLead(null);
    } catch (error) {
      console.error('Failed to add note:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'hot':
        return <Badge variant="destructive">Hot</Badge>;
      case 'warm':
        return <Badge variant="warning">Warm</Badge>;
      case 'cold':
        return <Badge variant="secondary">Cold</Badge>;
      case 'dead':
        return <Badge variant="outline">Dead</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    if (score >= 40) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const leadStats = {
    total: leads.length,
    hot: leads.filter(l => l.status === 'hot').length,
    warm: leads.filter(l => l.status === 'warm').length,
    cold: leads.filter(l => l.status === 'cold').length,
    dead: leads.filter(l => l.status === 'dead').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#d4af37' }}></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
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
            }}>Lead Management</h1>
            <p style={{ color: 'rgba(156, 163, 175, 0.9)' }}>Manage and track your sales leads with AI-powered insights</p>
          </div>
          <Button className="text-black font-semibold" style={{ 
            backgroundImage: 'linear-gradient(135deg, #d4af37, #f4e68c)'
          }}>
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Lead
          </Button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="abs-card-premium">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold" style={{ color: '#ffffff' }}>{leadStats.total}</p>
              <p className="text-sm" style={{ color: 'rgba(212,175,55,0.9)' }}>Total Leads</p>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="abs-card-premium">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold" style={{ color: '#ffffff' }}>{leadStats.hot}</p>
              <p className="text-sm" style={{ color: 'rgba(212,175,55,0.9)' }}>Hot Leads</p>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="abs-card-premium">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold" style={{ color: '#ffffff' }}>{leadStats.warm}</p>
              <p className="text-sm" style={{ color: 'rgba(212,175,55,0.9)' }}>Warm Leads</p>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="abs-card-premium">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold" style={{ color: '#ffffff' }}>{leadStats.cold}</p>
              <p className="text-sm" style={{ color: 'rgba(212,175,55,0.9)' }}>Cold Leads</p>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Card className="abs-card-premium">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold" style={{ color: '#ffffff' }}>{leadStats.dead}</p>
              <p className="text-sm" style={{ color: 'rgba(212,175,55,0.9)' }}>Dead Leads</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Filters and Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <Card className="abs-card">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: '#d4af37' }} />
                  <Input
                    placeholder="Search leads by name, email, or phone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                    style={{ background: '#000000', border: '1px solid rgba(212,175,55,0.25)' }}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 rounded-lg"
                  style={{ 
                    background: '#000000', 
                    border: '1px solid rgba(212,175,55,0.25)',
                    color: '#ffffff'
                  }}
                >
                  <option value="all">All Status</option>
                  <option value="hot">Hot</option>
                  <option value="warm">Warm</option>
                  <option value="cold">Cold</option>
                  <option value="dead">Dead</option>
                </select>
                <Button variant="outline">
                  <FunnelIcon className="h-4 w-4 mr-2" />
                  More Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Leads Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.7 }}
      >
        <Card className="abs-card">
          <CardHeader>
            <CardTitle style={{ 
              fontFamily: 'Playfair Display, serif',
              color: '#d4af37'
            }}>Leads ({filteredLeads.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Last Contact</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLeads.map((lead) => (
                    <TableRow key={lead.id}>
                      <TableCell className="font-medium dark:text-white">{lead.name}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                            <EnvelopeIcon className="h-3 w-3 mr-1" />
                            {lead.email}
                          </div>
                          <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                            <PhoneIcon className="h-3 w-3 mr-1" />
                            {lead.phone}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="dark:text-white">{lead.source}</TableCell>
                      <TableCell>{getStatusBadge(lead.status)}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getScoreColor(lead.score)}`}>
                          {lead.score}
                        </span>
                      </TableCell>
                      <TableCell>{formatDate(lead.lastContact)}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setSelectedLead(lead)}
                              >
                                <EyeIcon className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle className="dark:text-white">Lead Details - {lead.name}</DialogTitle>
                                <DialogDescription className="dark:text-gray-300">
                                  View and manage lead information
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                                    <p className="text-gray-900 dark:text-white">{lead.name}</p>
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                                    <p className="text-gray-900 dark:text-white">{lead.email}</p>
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
                                    <p className="text-gray-900 dark:text-white">{lead.phone}</p>
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Source</label>
                                    <p className="text-gray-900 dark:text-white">{lead.source}</p>
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                                    {getStatusBadge(lead.status)}
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Score</label>
                                    <span className={`px-2 py-1 rounded-full text-sm font-medium ${getScoreColor(lead.score)}`}>
                                      {lead.score}
                                    </span>
                                  </div>
                                </div>

                                <div>
                                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Notes</label>
                                  <p className="text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">{lead.notes}</p>
                                </div>

                                <div>
                                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Add Note</label>
                                  <textarea
                                    value={newNote}
                                    onChange={(e) => setNewNote(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    rows={3}
                                    placeholder="Add a note about this lead..."
                                  />
                                </div>

                                <div className="flex justify-between">
                                  <div className="flex space-x-2">
                                    <select
                                      value={lead.status}
                                      onChange={(e) => handleStatusUpdate(lead.id, e.target.value as any)}
                                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    >
                                      <option value="hot">Hot</option>
                                      <option value="warm">Warm</option>
                                      <option value="cold">Cold</option>
                                      <option value="dead">Dead</option>
                                    </select>
                                  </div>
                                  <Button onClick={handleAddNote} disabled={!newNote.trim()}>
                                    Add Note
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                          <Button size="sm" variant="outline">
                            <PencilIcon className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};
