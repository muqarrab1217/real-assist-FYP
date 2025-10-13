export interface User {
  id: string;
  email: string;
  name: string;
  role: 'client' | 'admin';
  avatar?: string;
  createdAt: Date;
}

export interface Client {
  id: string;
  userId: string;
  propertyId: string;
  investmentAmount: number;
  currentInstallment: number;
  totalInstallments: number;
  status: 'active' | 'completed' | 'paused';
  createdAt: Date;
}

export interface Property {
  id: string;
  name: string;
  location: string;
  developer: string;
  price: number;
  completionDate: Date;
  images: string[];
  status: 'planning' | 'construction' | 'completed';
}

export interface Payment {
  id: string;
  clientId: string;
  amount: number;
  installmentNumber: number;
  dueDate: Date;
  paidDate?: Date;
  status: 'pending' | 'paid' | 'overdue';
  method?: string;
  apartmentDetails?: {
    building: string;
    floor: string;
    unitNumber: string;
    bedrooms: string;
    area: string;
    view: string;
    status: string;
    totalPrice: number;
  };
}

export interface ProjectUpdate {
  id: string;
  propertyId: string;
  title: string;
  description: string;
  milestone: string;
  progress: number;
  images: string[];
  createdAt: Date;
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  source: string;
  status: 'hot' | 'warm' | 'cold' | 'dead';
  score: number;
  lastContact: Date;
  notes: string;
  assignedTo?: string;
}

export interface Analytics {
  totalLeads: number;
  activeClients: number;
  totalRevenue: number;
  monthlyRevenue: number;
  conversionRate: number;
  averageDealSize: number;
}

export interface DashboardStats {
  title: string;
  value: string | number;
  change: number;
  changeType: 'increase' | 'decrease';
  icon: string;
}

export interface UnitType {
  type?: string;
  bedrooms?: number;
  area?: string;
  price?: number;
}

export interface PaymentPlan {
  downPaymentPercentage?: number;
  durationMonths?: number;
  totalInstallments?: number;
}