import React from 'react';
import { motion } from 'framer-motion';
import {
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  DocumentMagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useSalesRepDashboardStats, usePendingVerifications } from '@/hooks/queries/useSalesRepQueries';
import { formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

export const SalesRepDashboard: React.FC = () => {
  const { data: stats } = useSalesRepDashboardStats();
  const { data: pendingProofs = [] } = usePendingVerifications();

  const statCards = [
    {
      label: 'Pending Verification',
      value: stats?.pending ?? 0,
      icon: ClockIcon,
      color: 'text-yellow-400',
      bg: 'bg-yellow-500/10',
      border: 'border-yellow-500/20',
    },
    {
      label: 'Approved',
      value: stats?.approved ?? 0,
      icon: CheckCircleIcon,
      color: 'text-green-400',
      bg: 'bg-green-500/10',
      border: 'border-green-500/20',
    },
    {
      label: 'Rejected',
      value: stats?.rejected ?? 0,
      icon: XCircleIcon,
      color: 'text-red-400',
      bg: 'bg-red-500/10',
      border: 'border-red-500/20',
    },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white font-serif">Verification Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Review and verify client payment proofs</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className={`bg-[#0a0a0a] ${card.border} border`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-gray-500">{card.label}</p>
                    <p className={`text-4xl font-bold mt-2 ${card.color}`}>{card.value}</p>
                  </div>
                  <div className={`h-14 w-14 rounded-2xl ${card.bg} flex items-center justify-center`}>
                    <card.icon className={`h-7 w-7 ${card.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Recent Pending Proofs */}
      <Card className="bg-[#0a0a0a] border-gold-500/10">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <DocumentMagnifyingGlassIcon className="h-5 w-5 text-gold-500" />
              <h2 className="text-lg font-bold text-white">Recent Pending Verifications</h2>
            </div>
            <Link to="/sales-rep/verifications">
              <Button variant="outline" size="sm" className="border-gold-500/20 text-gold-500 hover:bg-gold-500/10">
                View All
              </Button>
            </Link>
          </div>

          {pendingProofs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <CheckCircleIcon className="h-12 w-12 text-green-500/30" />
              <p className="text-gray-500 text-sm">No pending verifications. All caught up!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingProofs.slice(0, 5).map((proof: any) => (
                <motion.div
                  key={proof.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-gold-500/20 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-yellow-500/10 flex items-center justify-center">
                      <ClockIcon className="h-5 w-5 text-yellow-400" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">
                        {proof.client?.fullName || 'Client'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {proof.proofType?.replace('_', ' ')} • PKR {proof.payment?.amount?.toLocaleString() || '—'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className="bg-yellow-500/10 text-yellow-400 border-yellow-500/20">
                      Pending
                    </Badge>
                    <p className="text-xs text-gray-500">{formatDate(proof.submittedAt)}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
