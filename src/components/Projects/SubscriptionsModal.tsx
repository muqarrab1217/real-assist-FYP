import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useProjectSubscriptions } from '@/hooks/queries/useAdminQueries';

interface SubscribedClient {
  id: string;
  enrollmentId: string;
  clientName: string;
  clientEmail: string;
  unitType: string;
  floor: string | number;
  unitNumber: string;
  totalPrice: number;
  downPayment: number;
  monthlyInstallment: number;
  installmentDuration: number;
  enrolledDate: string;
  status: string;
}

interface SubscriptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  projectName?: string;
}

export const SubscriptionsModal: React.FC<SubscriptionsModalProps> = ({
  isOpen,
  onClose,
  projectId,
  projectName = 'Project'
}) => {
  const { 
    data: subscriptions, 
    isLoading: loading, 
    error,
    refetch 
  } = useProjectSubscriptions(isOpen ? projectId : undefined);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="overflow-hidden max-h-[90vh] flex flex-col bg-[#0f0f0f] border border-gold-500/20">
        <DialogHeader className="flex-shrink-0 pb-4 border-b border-gold-500/10">
          <DialogTitle className="text-2xl font-bold text-white">
            Project Subscriptions
          </DialogTitle>
          <p className="text-sm text-gold-400 mt-2">{projectName}</p>
        </DialogHeader>

        {loading && (
          <div className="flex-1 flex items-center justify-center overflow-hidden">
            <div className="flex flex-col items-center gap-3">
              <div className="h-10 w-10 border-4 border-gold-500/20 border-t-gold-500 rounded-full animate-spin"></div>
              <p className="text-gold-400 font-medium text-sm">Loading subscriptions...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="flex-1 flex items-center justify-center overflow-hidden">
            <div className="text-center">
              <p className="text-red-400 font-medium">Failed to load subscriptions</p>
              <Button
                onClick={() => refetch()}
                variant="outline"
                className="mt-4 border-gold-500/30 text-gold-500 hover:bg-gold-500/10"
              >
                Try Again
              </Button>
            </div>
          </div>
        )}

        {!loading && !error && subscriptions && (
          <div className="flex-1 overflow-hidden flex flex-col">
            {/* Count Badge */}
            <div className="flex-shrink-0 px-6 py-3">
              <div className="inline-block bg-gold-500/20 border border-gold-500/40 rounded-lg px-4 py-2">
                <span className="text-gold-400 font-bold">
                  {subscriptions.count} Client{subscriptions.count !== 1 ? 's' : ''} Subscribed
                </span>
              </div>
            </div>

            {/* Clients List */}
            {subscriptions.count === 0 ? (
              <div className="flex-1 flex items-center justify-center overflow-hidden">
                <div className="text-center">
                  <p className="text-gray-400 font-medium">No active subscriptions yet</p>
                  <p className="text-sm text-gray-500 mt-1">This project will appear here when clients enroll</p>
                </div>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
                {subscriptions.clients.map((client) => (
                  <div
                    key={client.enrollmentId}
                    className="bg-[#1a1a1a] rounded-xl border border-gold-500/10 p-4 hover:border-gold-500/30 transition-colors"
                  >
                    {/* Client Name and Email */}
                    <div className="mb-3">
                      <p className="font-bold text-white">{client.clientName}</p>
                      <p className="text-xs text-gray-500">{client.clientEmail}</p>
                    </div>

                    {/* Unit Details */}
                    <div className="grid grid-cols-3 gap-2 mb-3 text-xs">
                      <div>
                        <span className="text-gray-500">Unit Type</span>
                        <p className="text-gold-400 font-medium">{client.unitType || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Floor</span>
                        <p className="text-gold-400 font-medium">{client.floor || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Unit #</span>
                        <p className="text-gold-400 font-medium">{client.unitNumber || 'N/A'}</p>
                      </div>
                    </div>

                    {/* Financial Details */}
                    <div className="space-y-2 mb-3 text-xs border-t border-gold-500/10 pt-3">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Total Investment:</span>
                        <span className="text-white font-bold">PKR {client.totalPrice.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Down Payment:</span>
                        <span className="text-white">PKR {client.downPayment.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Monthly Installment:</span>
                        <span className="text-gold-400 font-bold">PKR {client.monthlyInstallment.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Duration:</span>
                        <span className="text-white">{client.installmentDuration} year{client.installmentDuration !== 1 ? 's' : ''}</span>
                      </div>
                    </div>

                    {/* Enrollment Date */}
                    <div className="flex justify-between items-center text-xs pt-3 border-t border-gold-500/10 text-gray-500">
                      <span>Enrolled</span>
                      <span>
                        {new Date(client.enrolledDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Close Button */}
        <div className="flex-shrink-0 flex gap-3 pt-4 border-t border-gold-500/10 px-6 pb-4">
          <Button
            onClick={onClose}
            className="flex-1 bg-gold-500 text-black hover:bg-gold-400 font-bold py-3 rounded-xl transition-all"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
