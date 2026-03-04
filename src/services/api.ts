import { User, Client, Property, Payment, ProjectUpdate, Lead, Analytics, DashboardStats, Team, TeamMember } from '@/types';
import { supabase } from '@/lib/supabase';
import {
  mockAnalytics
} from '@/data/mockData';
import { detailedProjects, extractedProperties } from '@/data/extractedMockData';


// Auth API
export const authAPI = {
  async login(email: string, password: string, _role?: 'client' | 'admin'): Promise<User> {
    console.log('[DEBUG] Login: Starting for', email);
    try {
      console.log('[DEBUG] Login: Calling supabase.auth.signInWithPassword...');

      // Use a race to prevent infinite hang in the Supabase call itself
      const signInPromise = supabase.auth.signInWithPassword({ email, password });
      const internalTimeout = new Promise<{ data: any, error: any }>((_, reject) =>
        setTimeout(() => reject(new Error('AUTH_TIMEOUT')), 15000)
      );

      let authResponse;
      try {
        authResponse = await Promise.race([signInPromise, internalTimeout]);
      } catch (err: any) {
        if (err.message === 'AUTH_TIMEOUT') {
          console.warn('[DEBUG] Login: signInWithPassword timed out, checking for session fallback...');
          // Check if it actually signed in despite the timeout (sometimes happens if storage is slow)
          const { data: { session } } = await supabase.auth.getSession();
          if (session && session.user.email?.toLowerCase() === email.toLowerCase()) {
            console.log('[DEBUG] Login: Fallback found active session for', email);
            authResponse = { data: { user: session.user }, error: null };
          } else {
            throw new Error('Authentication timed out. Please try again.');
          }
        } else {
          throw err;
        }
      }

      const { data, error } = authResponse;

      if (error) {
        console.error('[DEBUG] Login: Auth error:', error);
        throw error;
      }

      if (!data.user) {
        console.error('[DEBUG] Login: No user data returned');
        throw new Error('No user data returned from Auth');
      }

      console.log('[DEBUG] Login: Auth successful, UID:', data.user.id);
      console.log('[DEBUG] Login: Fetching profile from "profiles" table...');

      const profileTimeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('PROFILE_FETCH_TIMEOUT')), 12000)
      );

      const profilePromise = supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .limit(1);

      const { data: profiles, error: profileError } = (await Promise.race([profilePromise, profileTimeout])) as any;

      if (profileError) {
        console.error('[DEBUG] Login: Profile query error:', profileError);
        throw profileError;
      }

      console.log('[DEBUG] Login: Profile query returned:', profiles?.length || 0, 'rows');

      const profile = profiles && profiles.length > 0 ? profiles[0] : null;

      if (!profile) {
        console.error('[DEBUG] Login: Profile missing for user');
        throw new Error('User profile not found. If you just registered, please wait a moment or try again.');
      }

      console.log('[DEBUG] Login: Finalizing user object...');

      const authenticatedEmail = data.user.email!;
      const isSystemAdmin = authenticatedEmail.toLowerCase() === 'realassist@admin.com';

      return {
        id: data.user.id,
        email: authenticatedEmail,
        firstName: profile.first_name || '',
        lastName: profile.last_name || '',
        role: isSystemAdmin ? 'admin' : (profile.role || 'client'),
        createdAt: profile.created_at ? new Date(profile.created_at) : undefined,
      };
    } catch (e) {
      console.error('[DEBUG] Login: Unexpected catch:', e);
      throw e;
    }
  },

  async register(userData: { email: string; password: string; firstName: string; lastName: string; role: 'client' | 'admin' | 'employee' }): Promise<User> {
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

  async signOut(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }
};

// Client API
export const clientAPI = {
  async getDashboardStats(): Promise<DashboardStats[]> {
    const [propertyRes, paymentRes] = await Promise.all([
      supabase.from('properties').select('*', { count: 'exact', head: true }),
      supabase.from('payments').select('*', { count: 'exact', head: true })
    ]);

    return [
      { title: 'Properties', value: propertyRes.count || 0, change: 0, changeType: 'increase', icon: 'HomeIcon' },
      { title: 'Payments', value: paymentRes.count || 0, change: 0, changeType: 'increase', icon: 'CreditCardIcon' },
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
    const { data, error } = await supabase
      .from('payments')
      .update({ status: 'paid', paid_date: new Date().toISOString(), method })
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
    const { data, error } = await supabase.from('clients').select('*');
    if (error) throw error;
    return data;
  },

  async getPayments(): Promise<Payment[]> {
    const { data, error } = await supabase.from('payments').select('*').order('due_date', { ascending: false });
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
      status: property.status
    };

    const { data, error } = await supabase
      .from('properties')
      .insert([dbData])
      .select()
      .single();

    if (error) throw error;
    return {
      ...data,
      priceMin: data.price_min,
      priceMax: data.price_max,
      brochureUrl: data.brochure_url,
      completionDate: data.completion_date ? new Date(data.completion_date) : undefined,
    };
  },

  async updateProperty(id: string, property: Partial<Property>): Promise<Property> {
    const dbData: any = { ...property };
    if (property.priceMin !== undefined) dbData.price_min = property.priceMin;
    if (property.priceMax !== undefined) dbData.price_max = property.priceMax;
    if (property.brochureUrl !== undefined) dbData.brochure_url = property.brochureUrl;

    // Clean up frontend-only keys if any
    delete dbData.priceMin;
    delete dbData.priceMax;
    delete dbData.brochureUrl;

    const { data, error } = await supabase
      .from('properties')
      .update(dbData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return {
      ...data,
      priceMin: data.price_min,
      priceMax: data.price_max,
      brochureUrl: data.brochure_url,
      completionDate: data.completion_date ? new Date(data.completion_date) : undefined,
    };
  },

};

// Common API
export const commonAPI = {
  async getProperties(): Promise<Property[]> {
    const { data, error } = await supabase.from('properties').select('*').order('name');
    if (error) throw error;
    return (data || []).map(p => ({
      ...p,
      priceMin: p.price_min,
      priceMax: p.price_max,
      brochureUrl: p.brochure_url,
      completionDate: p.completion_date ? new Date(p.completion_date) : undefined,
    }));
  },

  async getProperty(id: string): Promise<Property | undefined> {
    const { data, error } = await supabase.from('properties').select('*').eq('id', id).single();
    if (error) return undefined;
    return {
      ...data,
      priceMin: data.price_min,
      priceMax: data.price_max,
      brochureUrl: data.brochure_url,
      completionDate: data.completion_date ? new Date(data.completion_date) : undefined,
    };
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
        status: 'pending'
      }])
      .select()
      .single();

    if (error) throw error;

    // --- Generate Payment Schedule ---
    const { data: profile } = await supabase.from('profiles').select('created_at').eq('id', user.id).single();
    const registrationDate = profile?.created_at ? new Date(profile.created_at) : new Date();
    const dueDay = registrationDate.getDate();

    const totalInstallments = data.installmentDurationYears * 12;
    const downPaymentInstallmentAmount = data.downPayment / 3;
    const monthlyAmount = data.monthlyInstallment;

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

    // Create Monthly Installments starting immediately after down payment
    const installmentStartMonth = new Date(startMonth.getFullYear(), startMonth.getMonth() + 3, 1);

    for (let i = 1; i <= totalInstallments; i++) {
      const periodDate = new Date(installmentStartMonth.getFullYear(), installmentStartMonth.getMonth() + (i - 1), 1);
      const lastDayOfMonth = new Date(periodDate.getFullYear(), periodDate.getMonth() + 1, 0).getDate();
      const actualDueDay = Math.min(dueDay, lastDayOfMonth);
      const dueDate = new Date(periodDate.getFullYear(), periodDate.getMonth(), actualDueDay);

      paymentRecords.push({
        amount: monthlyAmount,
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

  async getUserEnrollments(): Promise<any[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data: enrollments, error } = await supabase
      .from('project_enrollments')
      .select('*')
      .eq('user_id', user.id)
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
    const { data, error } = await supabase
      .from('project_enrollments')
      .select('*, profile:profiles(*)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(e => ({
      ...e,
      projectId: e.project_id,
      totalPrice: e.total_price,
      downPayment: e.down_payment,
      installmentDurationYears: e.installment_duration_years,
      monthlyInstallment: e.monthly_installment,
      createdAt: e.created_at,
    }));
  },

};
