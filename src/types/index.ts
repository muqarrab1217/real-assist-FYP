export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: 'admin' | 'client' | 'employee';
    avatar?: string;
    createdAt?: Date;
}

export interface Client {
    id: string;
    userId: string;
    propertyId?: string;
    investmentAmount: number;
    currentInstallment: number;
    totalInstallments: number;
    status: 'active' | 'completed' | 'paused';
    createdAt?: Date;
}

export interface Property {
    id: string;
    name: string;
    type: string;
    location: string;
    price?: number;
    priceMin?: number;
    priceMax?: number;
    description?: string;
    amenities?: string[];
    images?: string[];
    brochureUrl?: string;
    completionDate?: Date;
    status?: string;
}

export interface Payment {
    id: string;
    clientId: string;
    projectId?: string;
    amount: number;
    installmentNumber: number;
    dueDate: Date;
    paidDate?: Date;
    status: 'pending' | 'paid' | 'overdue';
    method?: string;
    project?: Property | null;
    apartmentDetails?: {
        building?: string;
        floor?: string;
        unitNumber?: string;
        bedrooms?: string;
        area?: string;
        view?: string;
        status?: string;
        totalPrice?: number;
    };
}

export interface ProjectUpdate {
    id: string;
    propertyId: string;
    title: string;
    description: string;
    milestone?: string;
    progress: number;
    images?: string[];
    createdAt: Date;
}

export interface Lead {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    source?: string;
    status: 'hot' | 'warm' | 'cold' | 'dead';
    score?: number;
    lastContact?: Date;
    notes?: string;
    assignedTo?: string;
    createdAt?: Date;
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

export interface Team {
    id: string;
    name: string;
    description?: string;
    memberCount?: number;
    createdAt?: Date;
}

export interface TeamMember {
    id: string;
    teamId: string;
    profileId: string;
    createdAt?: string;
    profile?: User;
}
