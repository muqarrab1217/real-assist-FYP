import { User, Client, Property, Payment, ProjectUpdate, Lead, Analytics, DashboardStats } from '@/types';
import { 
  mockUser, 
  mockAdminUser, 
  mockClient, 
  mockProperties, 
  mockPayments, 
  mockProjectUpdates, 
  mockLeads, 
  mockAnalytics,
  mockClientDashboardStats,
  mockAdminDashboardStats
} from '@/data/mockData';

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Auth API
export const authAPI = {
  async login(_email: string, _password: string, role: 'client' | 'admin'): Promise<User> {
    await delay(1000);
    
    if (role === 'client') {
      return mockUser;
    } else {
      return mockAdminUser;
    }
  },

  async register(_userData: any): Promise<User> {
    await delay(1000);
    return mockUser;
  },

  async forgotPassword(_email: string): Promise<void> {
    await delay(1000);
  },
};

// Client API
export const clientAPI = {
  async getDashboardStats(): Promise<DashboardStats[]> {
    await delay(500);
    return mockClientDashboardStats;
  },

  async getClient(): Promise<Client> {
    await delay(300);
    return mockClient;
  },

  async getPayments(): Promise<Payment[]> {
    await delay(300);
    return mockPayments;
  },

  async getProjectUpdates(): Promise<ProjectUpdate[]> {
    await delay(300);
    return mockProjectUpdates;
  },

  async makePayment(paymentId: string, _amount: number, method: string): Promise<Payment> {
    await delay(1000);
    
    const payment = mockPayments.find(p => p.id === paymentId);
    if (payment) {
      payment.status = 'paid';
      payment.paidDate = new Date();
      payment.method = method;
    }
    
    return payment!;
  },

  async exportLedger(format: 'pdf' | 'excel'): Promise<Blob> {
    await delay(2000);
    // Mock file download
    const content = format === 'pdf' ? 'PDF content' : 'Excel content';
    return new Blob([content], { type: format === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  },
};

// Admin API
export const adminAPI = {
  async getDashboardStats(): Promise<DashboardStats[]> {
    await delay(500);
    return mockAdminDashboardStats;
  },

  async getAnalytics(): Promise<Analytics> {
    await delay(300);
    return mockAnalytics;
  },

  async getLeads(): Promise<Lead[]> {
    await delay(300);
    return mockLeads;
  },

  async getClients(): Promise<Client[]> {
    await delay(300);
    return [mockClient];
  },

  async getPayments(): Promise<Payment[]> {
    await delay(300);
    return mockPayments;
  },

  async updateLeadStatus(leadId: string, status: 'hot' | 'warm' | 'cold' | 'dead'): Promise<Lead> {
    await delay(500);
    
    const lead = mockLeads.find(l => l.id === leadId);
    if (lead) {
      lead.status = status;
      lead.lastContact = new Date();
    }
    
    return lead!;
  },

  async addLeadNote(leadId: string, note: string): Promise<Lead> {
    await delay(500);
    
    const lead = mockLeads.find(l => l.id === leadId);
    if (lead) {
      lead.notes += '\n' + note;
      lead.lastContact = new Date();
    }
    
    return lead!;
  },

  async exportData(format: 'pdf' | 'excel'): Promise<Blob> {
    await delay(2000);
    // Mock file download
    const content = format === 'pdf' ? 'PDF content' : 'Excel content';
    return new Blob([content], { type: format === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  },
};

// Common API
export const commonAPI = {
  async getProperties(): Promise<Property[]> {
    await delay(300);
    return mockProperties;
  },

  async getProperty(id: string): Promise<Property | undefined> {
    await delay(300);
    return mockProperties.find(p => p.id === id);
  },
};
