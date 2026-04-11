import { User, Client, Property, Payment, PaymentProof, ProjectUpdate, Lead, Analytics, DashboardStats, Team, TeamMember } from '@/types';
import { supabase } from '@/lib/supabase';
import {
  mockAnalytics
} from '@/data/mockData';
import { detailedProjects, extractedProperties } from '@/data/extractedMockData';


// Auth API
export const authAPI = {
  async login(email: string, password: string): Promise<Partial<User>> {
    console.log('[DEBUG] authAPI.login: Attempting sign-in for', email);
    try {
      // Wrap in Promise.resolve() because signInWithPassword returns a Supabase
      // thenable, not a real Promise. Promise.race silently fails with thenables.
      const signInPromise = Promise.resolve(
        supabase.auth.signInWithPassword({ email, password })
      );
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('AUTH_TIMEOUT')), 45000)
      );

      const { data, error } = await Promise.race([signInPromise, timeoutPromise]);

      if (error) {
        console.error('[DEBUG] authAPI.login: Auth error:', error);
        throw error;
      }

      if (!data.user) {
        throw new Error('No user data returned from Auth');
      }

      console.log('[DEBUG] authAPI.login: Auth successful for', email);

      // Return minimal user info. The useAuth hook will handle fetching the full profile.
      const metaRole = data.user.user_metadata?.role;
      return {
        id: data.user.id,
        email: data.user.email!,
        role: metaRole || 'client'
      };
    } catch (e: any) {
      if (e.message === 'AUTH_TIMEOUT') {
        throw new Error('Authentication service is taking too long. Please check your connection and try again.');
      }
      throw e;
    }
  },

  async register(userData: { email: string; password: string; firstName: string; lastName: string; role: 'client' | 'admin' | 'employee' | 'sales_rep' }): Promise<User> {
    const { data, error } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        data: {
          first_name: userData.firstName,
          last_name: userData.lastName,
          role: userData.role,
        }
      }
    });

    if (error) throw error;
    if (!data.user) throw new Error('Registration failed');

    return {
      id: data.user.id,
      email: data.user.email!,
      firstName: userData.firstName,
      lastName: userData.lastName,
      role: userData.role,
    };
  },

  async forgotPassword(email: string): Promise<void> {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
  },

  async requestPasswordResetOTP(email: string): Promise<void> {
    console.log('[DEBUG] requestPasswordResetOTP: email =', email);
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) {
      console.error('[DEBUG] requestPasswordResetOTP error:', error);
      throw error;
    }
  },

  async verifyOTPAndUpdatePassword(email: string, otp: string, newPassword: string): Promise<void> {
    console.log('[DEBUG] verifyOTPAndUpdatePassword: email =', email);
    // 1. Verify the OTP
    const { error: verifyError } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: 'recovery',
    });

    if (verifyError) {
      console.error('[DEBUG] verifyOTPAndUpdatePassword verifyError:', verifyError);
      throw verifyError;
    }

    // 2. Update the password
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (updateError) {
      console.error('[DEBUG] verifyOTPAndUpdatePassword updateError:', updateError);
      throw updateError;
    }
  },

  async verifyPassword(email: string, password: string): Promise<void> {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      console.error('[DEBUG] verifyPassword error:', error);
      throw new Error('Incorrect current password');
    }
  },

  async updatePassword(currentPassword: string, newPassword: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.email) throw new Error('Not authenticated');

    // Verify current password first
    const { error: verifyError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword,
    });
    if (verifyError) throw new Error('Incorrect current password');

    // Update to the new password
    const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
    if (updateError) throw updateError;
  },

  async signOut(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }
};

// Client API
export const clientAPI = {
  async getDashboardStats(): Promise<DashboardStats[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Get client records for this user
    const { data: clientRecords } = await supabase
      .from('clients')
      .select('id')
      .eq('user_id', user.id);

    if (!clientRecords || clientRecords.length === 0) {
      // Return zeros if no clients found
      return [
        { title: 'Total Investment', value: 0, change: 0, changeType: 'increase', icon: 'BanknotesIcon' },
        { title: 'Amount Paid', value: 0, change: 0, changeType: 'increase', icon: 'CheckCircleIcon' },
        { title: 'Pending Due', value: 0, change: 0, changeType: 'decrease', icon: 'ExclamationTriangleIcon' },
        { title: 'Active Projects', value: 0, change: 0, changeType: 'increase', icon: 'BuildingOfficeIcon' }
      ];
    }

    const clientIds = clientRecords.map((c: any) => c.id);
    const { data: payments } = await supabase
      .from('payments')
      .select('*')
      .in('client_id', clientIds);

    // Calculate financial metrics
    const paymentsList = payments || [];
    const totalInvested = paymentsList.reduce((sum: number, p: any) => sum + (p.amount || 0), 0);
    const totalPaid = paymentsList
      .filter((p: any) => p.status === 'paid')
      .reduce((sum: number, p: any) => sum + (p.amount || 0), 0);
    const totalPending = paymentsList
      .filter((p: any) => p.status === 'pending' || p.status === 'overdue')
      .reduce((sum: number, p: any) => sum + (p.amount || 0), 0);

    // Calculate percentage changes
    const paidPercentage = totalInvested > 0 ? Math.round((totalPaid / totalInvested) * 100) : 0;

    // Get projects count
    const { data: properties } = await supabase
      .from('properties')
      .select('*');

    return [
      {
        title: 'Total Investment',
        value: totalInvested,
        change: paidPercentage,
        changeType: 'increase',
        icon: 'BanknotesIcon'
      },
      {
        title: 'Amount Paid',
        value: totalPaid,
        change: 5,
        changeType: 'increase',
        icon: 'CheckCircleIcon'
      },
      {
        title: 'Pending Due',
        value: totalPending,
        change: 0,
        changeType: totalPending > 0 ? 'increase' : 'decrease',
        icon: 'ExclamationTriangleIcon'
      },
      {
        title: 'Active Projects',
        value: properties?.length || 0,
        change: 2,
        changeType: 'increase',
        icon: 'BuildingOfficeIcon'
      }
    ];
  },

  async getClient(): Promise<Client> {
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase.from('clients').select('*').eq('user_id', user?.id).single();
    if (error) throw error;
    return data;
  },

  async getPayments(): Promise<Payment[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data: clientRecords } = await supabase
      .from('clients')
      .select('id, property_id')
      .eq('user_id', user.id);

    if (!clientRecords || clientRecords.length === 0) return [];

    const clientIds = clientRecords.map(c => c.id);
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .in('client_id', clientIds)
      .order('due_date', { ascending: false });

    if (error) throw error;

    const propertyIds = Array.from(new Set(clientRecords.map(c => c.property_id))).filter(isValidUUID);
    const { data: properties } = await supabase
      .from('properties')
      .select('*')
      .in('id', propertyIds);

    const propertyMap = new Map((properties || []).map(p => [p.id, p]));
    const clientToPropertyMap = new Map(clientRecords.map(c => [c.id, c.property_id]));

    return (data || []).map(p => {
      const propId = clientToPropertyMap.get(p.client_id);
      const prop = propId ? propertyMap.get(propId) : null;
      return {
        ...p,
        clientId: p.client_id,
        installmentNumber: p.installment_number,
        dueDate: new Date(p.due_date),
        paidDate: p.paid_date ? new Date(p.paid_date) : undefined,
        billingPeriod: p.billing_period ? new Date(p.billing_period) : new Date(p.due_date),
        type: p.type || 'installment',
        apartmentDetails: p.apartment_details,
        projectId: propId,
        project: prop ? {
          ...prop,
          priceMin: prop.price_min,
          priceMax: prop.price_max,
          brochureUrl: prop.brochure_url,
        } : null
      };
    });
  },

  async getClientFinancials(projectId?: string): Promise<any> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    let query = supabase.from('client_financial_ledger').select('*').eq('user_id', user.id);
    if (projectId) {
      query = query.eq('property_id', projectId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async getProjectUpdates(): Promise<ProjectUpdate[]> {
    const { data, error } = await supabase.from('project_updates').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map(u => ({
      id: u.id,
      propertyId: u.property_id,
      title: u.title,
      description: u.description,
      milestone: u.milestone,
      progress: u.progress,
      images: u.images || [],
      createdAt: u.created_at ? new Date(u.created_at) : new Date(),
    }));
  },


  async makePayment(paymentId: string, _amount: number, method: string): Promise<Payment> {
    // For manual proof payments, don't mark as paid — keep pending until verified
    if (method === 'manual_proof') {
      const { data, error } = await supabase
        .from('payments')
        .update({
          payment_method: 'manual_proof',
          verification_status: 'pending_verification',
          method: 'Manual Proof'
        })
        .eq('id', paymentId)
        .select()
        .single();
      if (error) throw error;
      return data;
    }

    const { data, error } = await supabase
      .from('payments')
      .update({ status: 'paid', paid_date: new Date().toISOString(), method, payment_method: 'portal', verification_status: 'not_required' })
      .eq('id', paymentId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async exportLedger(format: 'pdf' | 'excel'): Promise<Blob> {
    const content = format === 'pdf' ? 'Real Ledger PDF' : 'Real Ledger Excel';
    return new Blob([content], { type: format === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  },

  async getProjectPayments(projectId: string): Promise<Payment[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // First find the client record for this user and project
    if (!isValidUUID(projectId)) {
      console.warn('[API] Invalid Project UUID:', projectId);
      return [];
    }

    let { data: client, error: clientError } = await supabase
      .from('clients')
      .select('id')
      .eq('user_id', user.id)
      .eq('property_id', projectId)
      .single();

    // If no client record, we might need to initialize one from enrollment
    if (clientError || !client) {
      console.log('[API] Initializing client record from enrollment for project:', projectId);

      // Check if an enrollment exists
      const { data: enrollment, error: enrollError } = await supabase
        .from('project_enrollments')
        .select('*')
        .eq('user_id', user.id)
        .eq('project_id', projectId)
        .single();

      if (enrollError || !enrollment) {
        console.warn('[API] No enrollment found to initialize schedule');
        return [];
      }

      // Create client record
      const { data: newClient, error: createClientError } = await supabase
        .from('clients')
        .insert({
          user_id: user.id,
          property_id: projectId,
          investment_amount: enrollment.total_price,
          total_installments: enrollment.installment_duration_years * 12,
          current_installment: 0,
          status: 'active'
        })
        .select()
        .single();

      if (createClientError) throw createClientError;
      client = newClient;

      // Generate full payment schedule (e.g. 12 months for 1 year)
      const totalMonths = enrollment.installment_duration_years * 12;
      const installments = [];
      const startDate = new Date(enrollment.created_at || new Date());

      for (let i = 1; i <= totalMonths; i++) {
        const dueDate = new Date(startDate);
        dueDate.setMonth(startDate.getMonth() + i);

        installments.push({
          client_id: newClient.id,
          amount: enrollment.monthly_installment,
          installment_number: i,
          due_date: dueDate.toISOString(),
          status: 'pending'
        });
      }

      const { error: batchError } = await supabase
        .from('payments')
        .insert(installments);

      if (batchError) throw batchError;
    }

    if (!client) return [];

    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('client_id', client.id)
      .order('due_date', { ascending: true }); // Timeline usually ascending

    if (error) throw error;
    return (data || []).map(p => ({
      ...p,
      clientId: p.client_id,
      installmentNumber: p.installment_number,
      dueDate: new Date(p.due_date),
      paidDate: p.paid_date ? new Date(p.paid_date) : undefined,
      billingPeriod: p.billing_period ? new Date(p.billing_period) : new Date(p.due_date),
      type: p.type || 'installment',
      apartmentDetails: p.apartment_details,
    }));
  }
}

// Payment Proof API
export const paymentProofAPI = {
  async uploadProof(data: {
    paymentId: string;
    proofFile: File;
    proofType: PaymentProof['proofType'];
    notes?: string;
  }): Promise<PaymentProof> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Find client record
    const { data: client } = await supabase
      .from('clients')
      .select('id')
      .eq('user_id', user.id)
      .limit(1)
      .single();
    if (!client) throw new Error('Client record not found');

    // Upload file to storage
    const fileExt = data.proofFile.name.split('.').pop();
    const fileName = `${user.id}/${data.paymentId}_${Date.now()}.${fileExt}`;
    const { error: uploadError } = await supabase.storage
      .from('payment-proofs')
      .upload(fileName, data.proofFile);
    if (uploadError) throw uploadError;

    const { data: urlData } = supabase.storage.from('payment-proofs').getPublicUrl(fileName);

    // Create proof record
    const { data: proof, error } = await supabase
      .from('payment_proofs')
      .insert({
        payment_id: data.paymentId,
        client_id: client.id,
        proof_url: urlData.publicUrl,
        proof_type: data.proofType,
        notes: data.notes || null,
        status: 'pending_review'
      })
      .select()
      .single();
    if (error) throw error;
    return {
      ...proof,
      paymentId: proof.payment_id,
      clientId: proof.client_id,
      proofUrl: proof.proof_url,
      proofType: proof.proof_type,
      reviewedBy: proof.reviewed_by,
      reviewedAt: proof.reviewed_at ? new Date(proof.reviewed_at) : undefined,
      rejectionReason: proof.rejection_reason,
      createdAt: new Date(proof.created_at),
    };
  },

  async getProofsForPayment(paymentId: string): Promise<PaymentProof[]> {
    const { data, error } = await supabase
      .from('payment_proofs')
      .select('*')
      .eq('payment_id', paymentId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map(p => ({
      ...p,
      paymentId: p.payment_id,
      clientId: p.client_id,
      proofUrl: p.proof_url,
      proofType: p.proof_type,
      reviewedBy: p.reviewed_by,
      reviewedAt: p.reviewed_at ? new Date(p.reviewed_at) : undefined,
      rejectionReason: p.rejection_reason,
      createdAt: new Date(p.created_at),
    }));
  },
};

// Sales Rep API
export const salesRepAPI = {
  async getPendingVerifications(): Promise<PaymentProof[]> {
    const { data, error } = await supabase
      .from('payment_proofs')
      .select(`
        *,
        payments:payment_id ( id, amount, installment_number, due_date, status, client_id ),
        clients:client_id ( id, user_id, property_id )
      `)
      .eq('status', 'pending_review')
      .order('created_at', { ascending: true });
    if (error) throw error;

    // Batch-fetch profiles for client names
    const userIds = [...new Set((data || []).map((p: any) => p.clients?.user_id).filter(Boolean))];
    const profilesMap: Record<string, any> = {};
    if (userIds.length > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email')
        .in('id', userIds);
      (profiles || []).forEach((pr: any) => { profilesMap[pr.id] = pr; });
    }

    return (data || []).map((p: any) => {
      const profile = p.clients?.user_id ? profilesMap[p.clients.user_id] : null;
      return {
        ...p,
        paymentId: p.payment_id,
        clientId: p.client_id,
        proofUrl: p.proof_url,
        proofType: p.proof_type,
        reviewedBy: p.reviewed_by,
        reviewedAt: p.reviewed_at ? new Date(p.reviewed_at) : undefined,
        rejectionReason: p.rejection_reason,
        createdAt: new Date(p.created_at),
        client: p.clients ? {
          ...p.clients,
          fullName: profile ? `${profile.first_name} ${profile.last_name}` : undefined,
          email: profile?.email,
        } : undefined,
      };
    });
  },

  async getAllVerifications(): Promise<PaymentProof[]> {
    const { data, error } = await supabase
      .from('payment_proofs')
      .select(`
        *,
        payments:payment_id ( id, amount, installment_number, due_date, status, client_id ),
        clients:client_id ( id, user_id, property_id )
      `)
      .order('created_at', { ascending: false });
    if (error) throw error;

    // Batch-fetch profiles for client names
    const userIds = [...new Set((data || []).map((p: any) => p.clients?.user_id).filter(Boolean))];
    const profilesMap: Record<string, any> = {};
    if (userIds.length > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email')
        .in('id', userIds);
      (profiles || []).forEach((pr: any) => { profilesMap[pr.id] = pr; });
    }

    return (data || []).map((p: any) => {
      const profile = p.clients?.user_id ? profilesMap[p.clients.user_id] : null;
      return {
        ...p,
        paymentId: p.payment_id,
        clientId: p.client_id,
        proofUrl: p.proof_url,
        proofType: p.proof_type,
        reviewedBy: p.reviewed_by,
        reviewedAt: p.reviewed_at ? new Date(p.reviewed_at) : undefined,
        rejectionReason: p.rejection_reason,
        createdAt: new Date(p.created_at),
        client: p.clients ? {
          ...p.clients,
          fullName: profile ? `${profile.first_name} ${profile.last_name}` : undefined,
          email: profile?.email,
        } : undefined,
      };
    });
  },

  async approveProof(proofId: string): Promise<PaymentProof> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Get the proof to find payment_id
    const { data: proof } = await supabase
      .from('payment_proofs')
      .select('payment_id')
      .eq('id', proofId)
      .single();

    // Update proof status
    const { data: updatedProof, error } = await supabase
      .from('payment_proofs')
      .update({
        status: 'approved',
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString()
      })
      .eq('id', proofId)
      .select()
      .single();
    if (error) throw error;

    // Mark payment as paid and verified
    if (proof) {
      await supabase
        .from('payments')
        .update({
          status: 'paid',
          paid_date: new Date().toISOString(),
          verification_status: 'verified'
        })
        .eq('id', proof.payment_id);
    }

    return updatedProof;
  },

  async rejectProof(proofId: string, reason: string): Promise<PaymentProof> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Get the proof to find payment_id
    const { data: proof } = await supabase
      .from('payment_proofs')
      .select('payment_id')
      .eq('id', proofId)
      .single();

    const { data: updatedProof, error } = await supabase
      .from('payment_proofs')
      .update({
        status: 'rejected',
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
        rejection_reason: reason
      })
      .eq('id', proofId)
      .select()
      .single();
    if (error) throw error;

    // Revert payment verification status
    if (proof) {
      await supabase
        .from('payments')
        .update({
          verification_status: 'rejected',
          payment_method: null
        })
        .eq('id', proof.payment_id);
    }

    return updatedProof;
  },

  async getDashboardStats() {
    const [pendingRes, approvedRes, rejectedRes] = await Promise.all([
      supabase.from('payment_proofs').select('id', { count: 'exact', head: true }).eq('status', 'pending_review'),
      supabase.from('payment_proofs').select('id', { count: 'exact', head: true }).eq('status', 'approved'),
      supabase.from('payment_proofs').select('id', { count: 'exact', head: true }).eq('status', 'rejected'),
    ]);
    return {
      pending: pendingRes.count || 0,
      approved: approvedRes.count || 0,
      rejected: rejectedRes.count || 0,
      total: (pendingRes.count || 0) + (approvedRes.count || 0) + (rejectedRes.count || 0),
    };
  }
};

// Admin API
export const adminAPI = {
  async getDashboardStats(): Promise<DashboardStats[]> {
    const [leadRes, revenueRes] = await Promise.all([
      supabase.from('leads').select('*', { count: 'exact', head: true }),
      supabase.from('payments').select('amount').eq('status', 'paid')
    ]);

    const totalRev = revenueRes.data?.reduce((acc, curr) => acc + curr.amount, 0) || 0;

    return [
      { title: 'Total Leads', value: leadRes.count || 0, change: 5, changeType: 'increase', icon: 'UserGroupIcon' },
      { title: 'Revenue', value: `PKR ${totalRev.toLocaleString()}`, change: 12, changeType: 'increase', icon: 'BanknotesIcon' },
    ];
  },

  async getAnalytics(): Promise<Analytics> {
    return mockAnalytics;
  },

  async getLeads(): Promise<Lead[]> {
    const { data, error } = await supabase.from('leads').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map(l => ({
      ...l,
      lastContact: l.last_contact ? new Date(l.last_contact) : undefined,
      assignedTo: l.assigned_to,
    }));
  },


  async getClients(): Promise<Client[]> {
    const { data, error } = await supabase
      .from('clients')
      .select('*, profile:profiles(first_name, last_name, email, phone), property:properties(name)');
    if (error) throw error;

    // Fetch payment summaries for all clients
    const { data: payments } = await supabase
      .from('payments')
      .select('client_id, amount, status');

    const paymentsByClient: Record<string, { totalPaid: number; overdueCount: number }> = {};
    (payments || []).forEach((p: any) => {
      if (!paymentsByClient[p.client_id]) {
        paymentsByClient[p.client_id] = { totalPaid: 0, overdueCount: 0 };
      }
      if (p.status === 'paid') paymentsByClient[p.client_id].totalPaid += Number(p.amount);
      if (p.status === 'overdue') paymentsByClient[p.client_id].overdueCount += 1;
    });

    return (data || []).map((c: any) => ({
      id: c.id,
      userId: c.user_id,
      propertyId: c.property_id,
      investmentAmount: Number(c.investment_amount),
      currentInstallment: c.current_installment,
      totalInstallments: c.total_installments,
      status: c.status,
      createdAt: c.created_at ? new Date(c.created_at) : undefined,
      fullName: c.profile ? `${c.profile.first_name || ''} ${c.profile.last_name || ''}`.trim() : undefined,
      email: c.profile?.email,
      phone: c.profile?.phone,
      propertyName: c.property?.name,
      totalPaid: paymentsByClient[c.id]?.totalPaid || 0,
      remainingBalance: Number(c.investment_amount) - (paymentsByClient[c.id]?.totalPaid || 0),
      overdueCount: paymentsByClient[c.id]?.overdueCount || 0,
    }));
  },

  async getClientPayments(clientId: string): Promise<Payment[]> {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('client_id', clientId)
      .order('due_date', { ascending: true });
    if (error) throw error;
    return (data || []).map((p: any) => ({
      ...p,
      clientId: p.client_id,
      installmentNumber: p.installment_number,
      dueDate: new Date(p.due_date),
      paidDate: p.paid_date ? new Date(p.paid_date) : undefined,
      billingPeriod: p.billing_period ? new Date(p.billing_period) : new Date(p.due_date),
      type: p.type || 'installment',
      apartmentDetails: p.apartment_details,
    }));
  },

  async getPayments(): Promise<Payment[]> {
    const { data, error } = await supabase
      .from('payments')
      .select('*, client:clients(user_id, investment_amount, property:properties(name), profile:profiles(first_name, last_name, email))')
      .order('due_date', { ascending: false });
    if (error) throw error;
    return (data || []).map((p: any) => ({
      ...p,
      clientId: p.client_id,
      projectId: p.project_id,
      installmentNumber: p.installment_number,
      dueDate: new Date(p.due_date),
      paidDate: p.paid_date ? new Date(p.paid_date) : undefined,
      billingPeriod: p.billing_period ? new Date(p.billing_period) : new Date(p.due_date),
      type: p.type || 'installment',
      apartmentDetails: p.apartment_details,
      clientName: p.client ? `${p.client.profile?.first_name || ''} ${p.client.profile?.last_name || ''}`.trim() || undefined : undefined,
      clientEmail: p.client?.profile?.email,
      propertyName: p.client?.property?.name,
      investmentAmount: p.client ? Number(p.client.investment_amount) : undefined,
    }));
  },


  async updateLeadStatus(leadId: string, status: 'hot' | 'warm' | 'cold' | 'dead'): Promise<Lead> {
    const { data, error } = await supabase
      .from('leads')
      .update({ status, last_contact: new Date().toISOString() })
      .eq('id', leadId)
      .select()
      .single();
    if (error) throw error;
    return {
      ...data,
      lastContact: data.last_contact ? new Date(data.last_contact) : undefined,
      assignedTo: data.assigned_to,
    };
  },

  async addLeadNote(leadId: string, note: string): Promise<Lead> {
    const { data: lead } = await supabase.from('leads').select('notes').eq('id', leadId).single();
    const updatedNotes = (lead?.notes || '') + '\n' + note;

    const { data, error } = await supabase
      .from('leads')
      .update({ notes: updatedNotes, last_contact: new Date().toISOString() })
      .eq('id', leadId)
      .select()
      .single();
    if (error) throw error;
    return {
      ...data,
      lastContact: data.last_contact ? new Date(data.last_contact) : undefined,
      assignedTo: data.assigned_to,
    };
  },


  async exportData(format: 'pdf' | 'excel'): Promise<Blob> {
    const content = format === 'pdf' ? 'Admin Export PDF' : 'Admin Export Excel';
    return new Blob([content], { type: format === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  },

  // Team Management
  async getTeams(): Promise<Team[]> {
    const { data: teams, error } = await supabase
      .from('teams')
      .select('*, team_members(count)')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return teams.map(t => ({
      ...t,
      memberCount: t.team_members?.[0]?.count || 0
    }));
  },

  async createTeam(name: string, description: string): Promise<Team> {
    const { data, error } = await supabase
      .from('teams')
      .insert({ name, description })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateTeam(id: string, name: string, description: string): Promise<Team> {
    const { data, error } = await supabase
      .from('teams')
      .update({ name, description })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteTeam(id: string): Promise<void> {
    const { error } = await supabase
      .from('teams')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async getTeamMembers(teamId: string): Promise<TeamMember[]> {
    const { data, error } = await supabase
      .from('team_members')
      .select('*, profile:profiles(*)')
      .eq('team_id', teamId);

    if (error) throw error;

    return data.map(m => ({
      id: m.id,
      teamId: m.team_id,
      profileId: m.profile_id,
      createdAt: m.created_at,
      profile: {
        id: m.profile.id,
        email: m.profile.email,
        firstName: m.profile.first_name,
        lastName: m.profile.last_name,
        role: m.profile.role
      }
    }));
  },

  async addMemberToTeam(teamId: string, profileId: string): Promise<void> {
    const { error } = await supabase
      .from('team_members')
      .insert({ team_id: teamId, profile_id: profileId });

    if (error) throw error;
  },

  async removeMemberFromTeam(teamId: string, profileId: string): Promise<void> {
    const { error } = await supabase
      .from('team_members')
      .delete()
      .eq('team_id', teamId)
      .eq('profile_id', profileId);

    if (error) throw error;
  },

  async searchUserByEmail(email: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email.toLowerCase())
      .limit(1);

    if (error) throw error;
    if (!data || data.length === 0) return null;

    const p = data[0];
    return {
      id: p.id,
      email: p.email,
      firstName: p.first_name,
      lastName: p.last_name,
      role: p.role
    };
  },

  async inviteMember(payload: { email: string; password: string; role: string; teamId?: string }): Promise<{ userId: string; emailSent: boolean }> {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:10000';
    const { data: { session } } = await supabase.auth.getSession();
    const res = await fetch(`${API_BASE_URL}/api/invite-member`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Network error' }));
      throw new Error(err.error || 'Failed to invite member');
    }
    const data = await res.json();
    return { userId: data.userId, emailSent: !!data.emailSent };
  },

  async updateProfile(profileId: string, data: { first_name?: string; last_name?: string; phone?: string; profile_completed?: boolean }): Promise<void> {
    const { error } = await supabase
      .from('profiles')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', profileId);
    if (error) throw error;
  },

  // Property Management
  async createProperty(property: Partial<Property>): Promise<Property> {
    const dbData = {
      name: property.name,
      type: property.type,
      location: property.location,
      price_min: property.priceMin,
      price_max: property.priceMax,
      description: property.description,
      amenities: property.amenities,
      images: property.images,
      brochure_url: property.brochureUrl,
      status: property.status,
      room_number_min: property.roomNumberMin,
      room_number_max: property.roomNumberMax,
      floor_number_min: property.floorNumberMin,
      floor_number_max: property.floorNumberMax,
      unit_number_min: property.unitNumberMin,
      unit_number_max: property.unitNumberMax,
      area_min: property.areaMin,
      area_max: property.areaMax,
      unit_types: property.unitTypeOptions || [],
      inventory_headers: property.inventoryHeaders || [],
      blueprint_url: property.blueprintUrl || null,
      inventory_file_url: property.inventoryFileUrl || null,
      booking_deadline: property.bookingDeadline ? new Date(property.bookingDeadline).toISOString() : null,
      price_column_key: property.priceColumnKey || null,
    };

    const { data, error } = await supabase
      .from('properties')
      .insert([dbData])
      .select()
      .single();

    if (error) throw error;
    return mapPropertyFromDb(data);
  },

  async updateProperty(id: string, property: Partial<Property>): Promise<Property> {
    const dbData: any = {
      ...property,
      unit_types: property.unitTypeOptions
    };
    if (property.priceMin !== undefined) dbData.price_min = property.priceMin;
    if (property.priceMax !== undefined) dbData.price_max = property.priceMax;
    if (property.brochureUrl !== undefined) dbData.brochure_url = property.brochureUrl;
    if (property.roomNumberMin !== undefined) dbData.room_number_min = property.roomNumberMin;
    if (property.roomNumberMax !== undefined) dbData.room_number_max = property.roomNumberMax;
    if (property.floorNumberMin !== undefined) dbData.floor_number_min = property.floorNumberMin;
    if (property.floorNumberMax !== undefined) dbData.floor_number_max = property.floorNumberMax;
    if (property.unitNumberMin !== undefined) dbData.unit_number_min = property.unitNumberMin;
    if (property.unitNumberMax !== undefined) dbData.unit_number_max = property.unitNumberMax;
    if (property.areaMin !== undefined) dbData.area_min = property.areaMin;
    if (property.areaMax !== undefined) dbData.area_max = property.areaMax;
    if (property.inventoryHeaders !== undefined) dbData.inventory_headers = property.inventoryHeaders;
    if (property.blueprintUrl !== undefined) dbData.blueprint_url = property.blueprintUrl;
    if (property.inventoryFileUrl !== undefined) dbData.inventory_file_url = property.inventoryFileUrl;
    if (property.bookingDeadline !== undefined) dbData.booking_deadline = property.bookingDeadline ? new Date(property.bookingDeadline).toISOString() : null;
    if (property.priceColumnKey !== undefined) dbData.price_column_key = property.priceColumnKey;

    // Clean up frontend-only keys
    delete dbData.priceMin;
    delete dbData.priceMax;
    delete dbData.brochureUrl;
    delete dbData.roomNumberMin;
    delete dbData.roomNumberMax;
    delete dbData.floorNumberMin;
    delete dbData.floorNumberMax;
    delete dbData.unitNumberMin;
    delete dbData.unitNumberMax;
    delete dbData.areaMin;
    delete dbData.areaMax;
    delete dbData.unitTypeOptions;
    delete dbData.inventoryHeaders;
    delete dbData.blueprintUrl;
    delete dbData.inventoryFileUrl;
    delete dbData.bookingDeadline;
    delete dbData.priceColumnKey;

    const { data, error } = await supabase
      .from('properties')
      .update(dbData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return mapPropertyFromDb(data);
  },

};

// Helper to map DB row to frontend Property type
function mapPropertyFromDb(data: any): Property {
  return {
    ...data,
    priceMin: data.price_min,
    priceMax: data.price_max,
    brochureUrl: data.brochure_url,
    completionDate: data.completion_date ? new Date(data.completion_date) : undefined,
    roomNumberMin: data.room_number_min,
    roomNumberMax: data.room_number_max,
    floorNumberMin: data.floor_number_min,
    floorNumberMax: data.floor_number_max,
    unitNumberMin: data.unit_number_min,
    unitNumberMax: data.unit_number_max,
    areaMin: data.area_min,
    areaMax: data.area_max,
    unitTypeOptions: data.unit_types,
    inventoryHeaders: data.inventory_headers || [],
    blueprintUrl: data.blueprint_url || null,
    inventoryFileUrl: data.inventory_file_url || null,
    bookingDeadline: data.booking_deadline ? new Date(data.booking_deadline) : undefined,
    priceColumnKey: data.price_column_key || null,
  };
}

// Common API
export const commonAPI = {
  async getProperties(): Promise<Property[]> {
    const { data, error } = await supabase.from('properties').select('*').order('name');
    if (error) throw error;
    return (data || []).map(mapPropertyFromDb);
  },

  async getProperty(id: string): Promise<Property | undefined> {
    const { data, error } = await supabase.from('properties').select('*').eq('id', id).single();
    if (error) return undefined;
    return mapPropertyFromDb(data);
  },
};


// Lead API
export const leadAPI = {
  async createLead(leadData: Partial<Lead>): Promise<Lead> {
    const { data, error } = await supabase
      .from('leads')
      .insert([leadData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};
// Helper to validate UUID format
const isValidUUID = (id: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

// Enrollment API
export const enrollmentAPI = {
  async createEnrollment(data: {
    projectId: string;
    totalPrice: number;
    downPayment: number;
    installmentDurationYears: number;
    monthlyInstallment: number;
    unitDetails?: any;
    inventoryItemId?: string;
    paymentFrequency?: 'monthly' | 'yearly';
    isFlexiblePlan?: boolean;
    downPaymentPercentage?: number;
  }): Promise<any> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    let validProjectId = data.projectId;

    if (!isValidUUID(validProjectId)) {
      // Resolve mock ID to real DB property
      const mockProject = detailedProjects.find(p => p.id === validProjectId) || extractedProperties.find(p => p.id === validProjectId);

      if (mockProject) {
        let { data: existingProp } = await supabase.from('properties').select('id').eq('name', mockProject.name).maybeSingle();
        if (existingProp) {
          validProjectId = existingProp.id;
        } else {
          const { data: newPropId, error: insertErr } = await supabase.rpc('create_mock_property_if_missing', {
            p_name: mockProject.name,
            p_type: (mockProject as any).type || 'residential',
            p_location: mockProject.location,
            p_price_min: (mockProject as any).priceRange?.min || (mockProject as any).price || 0,
            p_description: (mockProject as any).description || ''
          });

          if (insertErr) throw insertErr;
          validProjectId = newPropId;
        }
      } else {
        const { data: anyProp } = await supabase.from('properties').select('id').limit(1).maybeSingle();
        if (anyProp) {
          validProjectId = anyProp.id;
        } else {
          throw new Error("No valid property found to enroll in.");
        }
      }
    }

    const { data: enrollment, error } = await supabase
      .from('project_enrollments')
      .insert([{
        user_id: user.id,
        project_id: validProjectId,
        total_price: data.totalPrice,
        down_payment: data.downPayment,
        installment_duration_years: data.installmentDurationYears,
        monthly_installment: data.monthlyInstallment,
        selected_unit_type: data.unitDetails?.type,
        selected_floor: data.unitDetails?.floor ? parseInt(data.unitDetails.floor) : null,
        selected_unit_number: data.unitDetails?.unitNumber,
        unit_details: data.unitDetails || {},
        status: 'pending',
        ...(data.inventoryItemId && { inventory_item_id: data.inventoryItemId }),
        ...(data.paymentFrequency && { payment_frequency: data.paymentFrequency }),
        ...(data.isFlexiblePlan != null && { is_flexible_plan: data.isFlexiblePlan }),
        ...(data.downPaymentPercentage != null && { down_payment_percentage: data.downPaymentPercentage }),
      }])
      .select()
      .single();

    if (error) throw error;

    // --- Generate Payment Schedule ---
    const { data: profile } = await supabase.from('profiles').select('created_at').eq('id', user.id).single();
    const registrationDate = profile?.created_at ? new Date(profile.created_at) : new Date();
    const dueDay = registrationDate.getDate();

    const isYearly = data.paymentFrequency === 'yearly';
    const totalInstallments = isYearly
      ? Math.ceil(data.installmentDurationYears)
      : data.installmentDurationYears * 12;
    const downPaymentInstallmentAmount = data.downPayment / 3;

    // For yearly frequency, compute per-year amount from remaining balance
    const remaining = data.totalPrice - data.downPayment;
    const installmentAmount = isYearly
      ? (totalInstallments > 0 ? remaining / totalInstallments : 0)
      : data.monthlyInstallment;

    const paymentRecords: any[] = [];
    const today = new Date();
    // First billing period starts precisely on the 1st of the NEXT calendar month
    const startMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);

    // Create 3 Down Payment Installments (Split over next 3 months)
    for (let i = 0; i < 3; i++) {
      const periodDate = new Date(startMonth.getFullYear(), startMonth.getMonth() + i, 1);
      // Use registration day as due day, ensuring it doesn't exceed days in month
      const lastDayOfMonth = new Date(periodDate.getFullYear(), periodDate.getMonth() + 1, 0).getDate();
      const actualDueDay = Math.min(dueDay, lastDayOfMonth);
      const dueDate = new Date(periodDate.getFullYear(), periodDate.getMonth(), actualDueDay);

      paymentRecords.push({
        amount: downPaymentInstallmentAmount,
        installment_number: 0, // 0 indicates downpayment
        due_date: dueDate.toISOString(),
        billing_period: periodDate.toISOString(),
        status: 'pending',
        type: 'downpayment'
        // client_id will be mapped later when `client` resolves
      });
    }

    // Create Installments starting immediately after down payment
    const installmentStartMonth = new Date(startMonth.getFullYear(), startMonth.getMonth() + 3, 1);
    const monthStep = isYearly ? 12 : 1;

    for (let i = 1; i <= totalInstallments; i++) {
      const periodDate = new Date(installmentStartMonth.getFullYear(), installmentStartMonth.getMonth() + (i - 1) * monthStep, 1);
      const lastDayOfMonth = new Date(periodDate.getFullYear(), periodDate.getMonth() + 1, 0).getDate();
      const actualDueDay = Math.min(dueDay, lastDayOfMonth);
      const dueDate = new Date(periodDate.getFullYear(), periodDate.getMonth(), actualDueDay);

      paymentRecords.push({
        amount: installmentAmount,
        installment_number: i,
        due_date: dueDate.toISOString(),
        billing_period: periodDate.toISOString(),
        status: 'pending',
        type: 'installment'
      });
    }

    // Find or create client record
    let { data: client } = await supabase
      .from('clients')
      .select('id')
      .eq('user_id', user.id)
      .eq('property_id', validProjectId)
      .maybeSingle();

    if (!client) {
      const { data: newClient, error: clientErr } = await supabase
        .from('clients')
        .insert({
          user_id: user.id,
          property_id: validProjectId,
          investment_amount: data.totalPrice,
          total_installments: totalInstallments,
          status: 'active'
        })
        .select()
        .single();

      if (clientErr) throw clientErr;
      client = newClient;
    }

    if (!client) throw new Error('Failed to create or find client record');

    // Bulk insert payments
    const finalPayments = paymentRecords.map(p => ({
      client_id: client.id,
      amount: p.amount,
      installment_number: p.installment_number,
      due_date: p.due_date,
      billing_period: p.billing_period,
      status: 'pending',
      type: p.type
    }));

    const { error: paymentsErr } = await supabase
      .from('payments')
      .insert(finalPayments);

    if (paymentsErr) throw paymentsErr;

    return enrollment;
  },

  /**
   * Get ONLY verified (approved) enrollments for the client's Project Updates page
   * Pending enrollments are NOT shown here - they must be approved by admin first
   */
  async getUserEnrollments(): Promise<any[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Only return enrollments that have been verified/approved (status = 'active' or 'completed')
    const { data: enrollments, error } = await supabase
      .from('project_enrollments')
      .select('*')
      .eq('user_id', user.id)
      .in('status', ['active', 'completed'])  // Only verified enrollments
      .order('created_at', { ascending: false });

    if (error) throw error;
    if (!enrollments || enrollments.length === 0) return [];

    // Manually fetch properties to avoid Supabase schema cache issues
    const projectIds = Array.from(new Set(enrollments.map(e => e.project_id))).filter(id => id && typeof id === 'string' && id.length > 20);

    if (projectIds.length === 0) {
      return enrollments.map(e => ({
        ...e,
        projectId: e.project_id,
        totalPrice: e.total_price,
        downPayment: e.down_payment,
        installmentDurationYears: e.installment_duration_years,
        monthlyInstallment: e.monthly_installment,
        createdAt: e.created_at,
        project: null
      }));
    }

    const { data: projects, error: projectsError } = await supabase
      .from('properties')
      .select('*')
      .in('id', projectIds);

    if (projectsError) throw projectsError;

    const projectsMap = new Map((projects || []).map(p => [p.id, p]));

    return enrollments.map(e => {
      const p = projectsMap.get(e.project_id);
      return {
        ...e,
        projectId: e.project_id,
        totalPrice: e.total_price,
        downPayment: e.down_payment,
        installmentDurationYears: e.installment_duration_years,
        monthlyInstallment: e.monthly_installment,
        createdAt: e.created_at,
        project: p ? {
          ...p,
          priceMin: p.price_min,
          priceMax: p.price_max,
          brochureUrl: p.brochure_url,
          completionDate: p.completion_date ? new Date(p.completion_date) : undefined,
        } : null
      };
    });
  },


  async getAllEnrollments(): Promise<any[]> {
    // First fetch enrollments with user profiles
    const { data: enrollments, error } = await supabase
      .from('project_enrollments')
      .select('*, profile:profiles!user_id(*)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    if (!enrollments || enrollments.length === 0) return [];

    // Then fetch properties separately to avoid schema relationship issues
    const projectIds = Array.from(new Set(enrollments.map(e => e.project_id))).filter(id => id);

    let projectsMap = new Map();
    if (projectIds.length > 0) {
      const { data: projects } = await supabase
        .from('properties')
        .select('*')
        .in('id', projectIds);

      projectsMap = new Map((projects || []).map(p => [p.id, p]));
    }

    // Combine enrollments with projects
    return (enrollments || []).map(e => ({
      ...e,
      projectId: e.project_id,
      totalPrice: e.total_price,
      downPayment: e.down_payment,
      installmentDurationYears: e.installment_duration_years,
      monthlyInstallment: e.monthly_installment,
      createdAt: e.created_at,
      project: projectsMap.get(e.project_id) || null
    }));
  },

  /**
   * Admin: Approve enrollment and activate payment schedule
   */
  async approveEnrollment(enrollmentId: string, adminNotes?: string): Promise<any> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // 1. Get enrollment details
    const { data: enrollment, error: fetchError } = await supabase
      .from('project_enrollments')
      .select('*, profile:profiles!user_id(*)')
      .eq('id', enrollmentId)
      .single();

    if (fetchError) throw fetchError;
    if (!enrollment) throw new Error('Enrollment not found');
    if (enrollment.status !== 'pending') {
      throw new Error('Only pending enrollments can be approved');
    }

    // 2. Update enrollment status to 'active'
    const { data: updatedEnrollment, error: updateError } = await supabase
      .from('project_enrollments')
      .update({
        status: 'active',
        admin_notes: adminNotes,
        processed_by: user.id,
        processed_at: new Date().toISOString()
      })
      .eq('id', enrollmentId)
      .select()
      .single();

    if (updateError) throw updateError;

    // 3. Log audit trail
    await supabase.from('enrollment_audit_log').insert({
      enrollment_id: enrollmentId,
      action: 'approved',
      old_status: 'pending',
      new_status: 'active',
      performed_by: user.id,
      notes: adminNotes || 'Enrollment approved by admin'
    });

    // 4. Update client status to active if exists
    await supabase
      .from('clients')
      .update({ status: 'active' })
      .eq('user_id', enrollment.user_id)
      .eq('property_id', enrollment.project_id);

    return updatedEnrollment;
  },

  /**
   * Admin: Reject enrollment and cancel payment schedule
   */
  async rejectEnrollment(enrollmentId: string, reason: string): Promise<any> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    if (!reason || reason.trim().length === 0) {
      throw new Error('Rejection reason is required');
    }

    // 1. Get enrollment details
    const { data: enrollment, error: fetchError } = await supabase
      .from('project_enrollments')
      .select('*')
      .eq('id', enrollmentId)
      .single();

    if (fetchError) throw fetchError;
    if (!enrollment) throw new Error('Enrollment not found');
    if (enrollment.status !== 'pending') {
      throw new Error('Only pending enrollments can be rejected');
    }

    // 2. Update enrollment status to 'rejected'
    const { data: updatedEnrollment, error: updateError } = await supabase
      .from('project_enrollments')
      .update({
        status: 'rejected',
        rejected_reason: reason,
        processed_by: user.id,
        processed_at: new Date().toISOString()
      })
      .eq('id', enrollmentId)
      .select()
      .single();

    if (updateError) throw updateError;

    // 3. Delete associated payment schedule
    const { data: client } = await supabase
      .from('clients')
      .select('id')
      .eq('user_id', enrollment.user_id)
      .eq('property_id', enrollment.project_id)
      .maybeSingle();

    if (client) {
      // Delete all pending payments
      await supabase
        .from('payments')
        .delete()
        .eq('client_id', client.id);

      // Update client status to paused
      await supabase
        .from('clients')
        .update({ status: 'paused' })
        .eq('id', client.id);
    }

    // 4. Log audit trail
    await supabase.from('enrollment_audit_log').insert({
      enrollment_id: enrollmentId,
      action: 'rejected',
      old_status: 'pending',
      new_status: 'rejected',
      performed_by: user.id,
      notes: reason
    });

    return updatedEnrollment;
  },

  /**
   * Get detailed enrollment info (for admin review)
   */
  async getEnrollmentDetails(enrollmentId: string): Promise<any> {
    // Fetch enrollment with profile
    const { data: enrollment, error } = await supabase
      .from('project_enrollments')
      .select(`
        *,
        profile:profiles!user_id(id, email, first_name, last_name, role, created_at)
      `)
      .eq('id', enrollmentId)
      .single();

    if (error) throw error;

    // Fetch project separately
    let project = null;
    if (enrollment.project_id) {
      const { data: projectData } = await supabase
        .from('properties')
        .select('*')
        .eq('id', enrollment.project_id)
        .single();
      project = projectData;
    }

    return {
      ...enrollment,
      projectId: enrollment.project_id,
      totalPrice: enrollment.total_price,
      downPayment: enrollment.down_payment,
      installmentDurationYears: enrollment.installment_duration_years,
      monthlyInstallment: enrollment.monthly_installment,
      createdAt: enrollment.created_at,
      selectedUnitType: enrollment.selected_unit_type,
      selectedFloor: enrollment.selected_floor,
      selectedUnitNumber: enrollment.selected_unit_number,
      unitDetails: enrollment.unit_details,
      adminNotes: enrollment.admin_notes,
      rejectedReason: enrollment.rejected_reason,
      processedBy: enrollment.processed_by,
      processedAt: enrollment.processed_at,
      project: project
    };
  },

  /**
   * Get audit log for an enrollment
   */
  async getEnrollmentAuditLog(enrollmentId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('enrollment_audit_log')
      .select('*, performer:profiles!performed_by(first_name, last_name, email)')
      .eq('enrollment_id', enrollmentId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  /**
   * Get pending/rejected enrollments for the client (limited info - no full project access)
   * This is used to show "Under Verification" status on the dashboard
   */
  async getPendingEnrollments(): Promise<any[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data: enrollments, error } = await supabase
      .from('project_enrollments')
      .select('id, project_id, status, created_at, rejected_reason')
      .eq('user_id', user.id)
      .in('status', ['pending', 'rejected'])
      .order('created_at', { ascending: false });

    if (error) throw error;
    if (!enrollments || enrollments.length === 0) return [];

    // Fetch basic project info (name only)
    const projectIds = Array.from(new Set(enrollments.map(e => e.project_id))).filter(id => id && typeof id === 'string' && id.length > 20);

    if (projectIds.length === 0) {
      return enrollments.map(e => ({
        id: e.id,
        projectId: e.project_id,
        status: e.status,
        createdAt: e.created_at,
        rejectedReason: e.rejected_reason,
        projectName: 'Unknown Project'
      }));
    }

    const { data: projects } = await supabase
      .from('properties')
      .select('id, name')
      .in('id', projectIds);

    const projectsMap = new Map((projects || []).map(p => [p.id, p.name]));

    return enrollments.map(e => ({
      id: e.id,
      projectId: e.project_id,
      status: e.status,
      createdAt: e.created_at,
      rejectedReason: e.rejected_reason,
      projectName: projectsMap.get(e.project_id) || 'Unknown Project'
    }));
  },

  /**
   * Get project subscriptions with client details
   * Returns count and list of clients who have enrolled/purchased the project
   */
  async getProjectSubscriptions(projectId: string): Promise<{
    count: number;
    clients: any[];
  }> {
    // Fetch all active/approved enrollments for this project
    const { data: enrollments, error } = await supabase
      .from('project_enrollments')
      .select('*, profile:profiles!user_id(id, first_name, last_name, email)')
      .eq('project_id', projectId)
      .in('status', ['active', 'completed'])
      .order('created_at', { ascending: false });

    if (error) throw error;

    if (!enrollments || enrollments.length === 0) {
      return { count: 0, clients: [] };
    }

    // Format the client data
    const clients = enrollments.map(e => ({
      id: e.id,
      enrollmentId: e.id,
      clientName: e.profile ? `${e.profile.first_name} ${e.profile.last_name}` : 'Unknown',
      clientEmail: e.profile?.email || '',
      unitType: e.selected_unit_type || '',
      floor: e.selected_floor || '',
      unitNumber: e.selected_unit_number || '',
      totalPrice: e.total_price,
      downPayment: e.down_payment,
      monthlyInstallment: e.monthly_installment,
      installmentDuration: e.installment_duration_years,
      enrolledDate: e.created_at,
      status: e.status
    }));

    return {
      count: enrollments.length,
      clients
    };
  },

};

// Inventory API
export const inventoryAPI = {
  async getProjectInventory(projectId: string): Promise<import('@/types').InventoryItem[]> {
    const { data, error } = await supabase
      .from('project_inventory')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at');

    if (error) throw error;
    return (data || []).map((item: any) => ({
      id: item.id,
      projectId: item.project_id,
      rowData: item.row_data,
      status: item.status,
      createdAt: new Date(item.created_at),
      updatedAt: new Date(item.updated_at),
    }));
  },

  async uploadProjectInventory(projectId: string, rows: Record<string, string>[], statusKey?: string): Promise<void> {
    const inventoryRows = rows.map(row => {
      const rawStatus = statusKey ? (row[statusKey] || '').toLowerCase().trim() : 'available';
      const status = rawStatus === 'sold' ? 'sold' : 'available';
      return {
        project_id: projectId,
        row_data: row,
        status,
      };
    });

    // Bulk insert in batches of 100
    for (let i = 0; i < inventoryRows.length; i += 100) {
      const batch = inventoryRows.slice(i, i + 100);
      const { error } = await supabase.from('project_inventory').insert(batch);
      if (error) throw error;
    }
  },

  async replaceProjectInventory(projectId: string, rows: Record<string, string>[], statusKey?: string): Promise<void> {
    // Delete existing inventory for this project
    const { error: delError } = await supabase
      .from('project_inventory')
      .delete()
      .eq('project_id', projectId);
    if (delError) throw delError;

    // Re-upload
    await inventoryAPI.uploadProjectInventory(projectId, rows, statusKey);
  },

  async updateInventoryItemStatus(itemId: string, status: 'available' | 'sold' | 'reserved' | 'booked'): Promise<void> {
    const { error } = await supabase
      .from('project_inventory')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', itemId);
    if (error) throw error;
  },

  async uploadBlueprint(projectId: string, file: File): Promise<string> {
    const ext = file.name.split('.').pop();
    const filePath = `blueprints/${projectId}/blueprint.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('project-files')
      .upload(filePath, file, { upsert: true });
    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('project-files')
      .getPublicUrl(filePath);

    return data.publicUrl;
  },

  async uploadInventoryFile(projectId: string, file: File): Promise<string> {
    const filePath = `inventory/${projectId}/${file.name}`;

    const { error: uploadError } = await supabase.storage
      .from('project-files')
      .upload(filePath, file, { upsert: true });
    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('project-files')
      .getPublicUrl(filePath);

    return data.publicUrl;
  },
};
