import { User, Client, Property, Payment, ProjectUpdate, Lead, Analytics, DashboardStats } from '@/types';

export const mockUser: User = {
  id: '1',
  email: 'john.doe@example.com',
  name: 'John Doe',
  role: 'client',
  avatar: '',
  createdAt: new Date('2023-01-15'),
};

export const mockAdminUser: User = {
  id: '2',
  email: 'admin@realassist.com',
  name: 'Admin User',
  role: 'admin',
  avatar: '',
  createdAt: new Date('2023-01-01'),
};

export const mockProperties: Property[] = [
  {
    id: '1',
    name: 'Sunset Towers',
    location: 'Miami, FL',
    developer: 'Miami Developers LLC',
    price: 450000,
    completionDate: new Date('2024-12-31'),
    images: ['/images/files-apartment-1_800x.jpg'],
    status: 'construction',
  },
  {
    id: '2',
    name: 'Ocean View Residences',
    location: 'San Diego, CA',
    developer: 'Pacific Coast Properties',
    price: 675000,
    completionDate: new Date('2025-06-30'),
    images: ['/images/files-apartment-1_800x.jpg'],
    status: 'planning',
  },
];

export const mockClient: Client = {
  id: '1',
  userId: '1',
  propertyId: '1',
  investmentAmount: 450000,
  currentInstallment: 8,
  totalInstallments: 24,
  status: 'active',
  createdAt: new Date('2023-01-15'),
};

export const mockPayments: Payment[] = [
  {
    id: '1',
    clientId: '1',
    amount: 18750,
    installmentNumber: 1,
    dueDate: new Date('2023-02-15'),
    paidDate: new Date('2023-02-14'),
    status: 'paid',
    method: 'Bank Transfer',
    apartmentDetails: {
      building: 'ABS - POC 2 RESIDENTIAL',
      floor: '4TH',
      unitNumber: '439',
      bedrooms: '1 BED',
      area: '500',
      view: 'COURTYARD FACING',
      status: 'SOLD',
      totalPrice: 13750000
    }
  },
  {
    id: '2',
    clientId: '1',
    amount: 18750,
    installmentNumber: 2,
    dueDate: new Date('2023-03-15'),
    paidDate: new Date('2023-03-12'),
    status: 'paid',
    method: 'Credit Card',
    apartmentDetails: {
      building: 'ABS - POC 2 RESIDENTIAL',
      floor: '5TH',
      unitNumber: '501',
      bedrooms: '2 BED',
      area: '1000',
      view: 'FRONT & CORNER',
      status: 'SOLD',
      totalPrice: 28750000
    }
  },
  {
    id: '3',
    clientId: '1',
    amount: 18750,
    installmentNumber: 3,
    dueDate: new Date('2023-04-15'),
    paidDate: new Date('2023-04-15'),
    status: 'paid',
    method: 'Bank Transfer',
    apartmentDetails: {
      building: 'ABS - POC 2 RESIDENTIAL',
      floor: '5TH',
      unitNumber: '502',
      bedrooms: '2 BED',
      area: '1000',
      view: 'FRONT',
      status: 'SOLD',
      totalPrice: 27500000
    }
  },
  {
    id: '4',
    clientId: '1',
    amount: 18750,
    installmentNumber: 4,
    dueDate: new Date('2023-05-15'),
    paidDate: new Date('2023-05-10'),
    status: 'paid',
    method: 'Bank Transfer',
    apartmentDetails: {
      building: 'ABS - POC 2 RESIDENTIAL',
      floor: '4TH',
      unitNumber: '440',
      bedrooms: '1 BED',
      area: '500',
      view: 'COURTYARD FACING',
      status: 'SOLD',
      totalPrice: 13750000
    }
  },
  {
    id: '5',
    clientId: '1',
    amount: 18750,
    installmentNumber: 5,
    dueDate: new Date('2023-06-15'),
    paidDate: new Date('2023-06-14'),
    status: 'paid',
    method: 'Credit Card',
    apartmentDetails: {
      building: 'ABS - POC 2 RESIDENTIAL',
      floor: '4TH',
      unitNumber: '441',
      bedrooms: '2 BED',
      area: '800',
      view: 'COURTYARD FACING',
      status: 'SOLD',
      totalPrice: 22000000
    }
  },
  {
    id: '6',
    clientId: '1',
    amount: 18750,
    installmentNumber: 6,
    dueDate: new Date('2023-07-15'),
    paidDate: new Date('2023-07-16'),
    status: 'paid',
    method: 'Bank Transfer',
    apartmentDetails: {
      building: 'ABS - POC 2 RESIDENTIAL',
      floor: '5TH',
      unitNumber: '503',
      bedrooms: '1 BED',
      area: '500',
      view: 'FRONT',
      status: 'SOLD',
      totalPrice: 13750000
    }
  },
  {
    id: '7',
    clientId: '1',
    amount: 18750,
    installmentNumber: 7,
    dueDate: new Date('2023-08-15'),
    paidDate: new Date('2023-08-12'),
    status: 'paid',
    method: 'Bank Transfer',
    apartmentDetails: {
      building: 'ABS - POC 2 RESIDENTIAL',
      floor: '5TH',
      unitNumber: '504',
      bedrooms: '1 BED',
      area: '500',
      view: 'FRONT',
      status: 'SOLD',
      totalPrice: 13750000
    }
  },
  {
    id: '8',
    clientId: '1',
    amount: 18750,
    installmentNumber: 8,
    dueDate: new Date('2023-09-15'),
    paidDate: new Date('2023-09-14'),
    status: 'paid',
    method: 'Credit Card',
    apartmentDetails: {
      building: 'ABS - POC 2 RESIDENTIAL',
      floor: '4TH',
      unitNumber: '439',
      bedrooms: '1 BED',
      area: '500',
      view: 'COURTYARD FACING',
      status: 'SOLD',
      totalPrice: 13750000
    }
  },
  {
    id: '9',
    clientId: '1',
    amount: 18750,
    installmentNumber: 9,
    dueDate: new Date('2023-10-15'),
    status: 'pending',
    apartmentDetails: {
      building: 'ABS - POC 2 RESIDENTIAL',
      floor: '5TH',
      unitNumber: '501',
      bedrooms: '2 BED',
      area: '1000',
      view: 'FRONT & CORNER',
      status: 'SOLD',
      totalPrice: 28750000
    }
  },
  {
    id: '10',
    clientId: '1',
    amount: 18750,
    installmentNumber: 10,
    dueDate: new Date('2023-11-15'),
    status: 'pending',
    apartmentDetails: {
      building: 'ABS - POC 2 RESIDENTIAL',
      floor: '5TH',
      unitNumber: '502',
      bedrooms: '2 BED',
      area: '1000',
      view: 'FRONT',
      status: 'SOLD',
      totalPrice: 27500000
    }
  },
];

export const mockProjectUpdates: ProjectUpdate[] = [
  {
    id: '1',
    propertyId: '1',
    title: 'Foundation Work Completed',
    description: 'The foundation work for Sunset Towers has been successfully completed. All concrete pouring and structural foundation elements are now in place.',
    milestone: 'Foundation',
    progress: 100,
    images: ['/images/files-apartment-1_800x.jpg'],
    createdAt: new Date('2023-08-15'),
  },
  {
    id: '2',
    propertyId: '1',
    title: 'Structural Framework Progress',
    description: 'The steel framework is 75% complete. The first 15 floors have been fully constructed with steel beams and columns.',
    milestone: 'Structural Framework',
    progress: 75,
    images: ['/images/files-apartment-1_800x.jpg'],
    createdAt: new Date('2023-09-10'),
  },
  {
    id: '3',
    propertyId: '1',
    title: 'Electrical and Plumbing Installation',
    description: 'Electrical and plumbing systems are being installed on the lower floors. This includes all necessary conduits and piping.',
    milestone: 'MEP Systems',
    progress: 40,
    images: ['/images/files-apartment-1_800x.jpg'],
    createdAt: new Date('2023-09-25'),
  },
  {
    id: '4',
    propertyId: '1',
    title: 'Monthly Progress Update',
    description: 'Overall construction is on schedule. We are currently 35% complete with the project and expect to finish on time.',
    milestone: 'General Progress',
    progress: 35,
    images: ['/images/files-apartment-1_800x.jpg'],
    createdAt: new Date('2023-10-01'),
  },
];

export const mockLeads: Lead[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@email.com',
    phone: '+1 (555) 123-4567',
    source: 'Website',
    status: 'hot',
    score: 95,
    lastContact: new Date('2023-10-05'),
    notes: 'Interested in luxury condos in Miami. Budget: $500k-800k. Looking for 2-3 bedroom units.',
    assignedTo: 'admin@realassist.com',
  },
  {
    id: '2',
    name: 'Michael Chen',
    email: 'michael.chen@email.com',
    phone: '+1 (555) 234-5678',
    source: 'Referral',
    status: 'warm',
    score: 78,
    lastContact: new Date('2023-10-03'),
    notes: 'Referred by existing client. Interested in investment properties in California.',
    assignedTo: 'admin@realassist.com',
  },
  {
    id: '3',
    name: 'Emily Rodriguez',
    email: 'emily.rodriguez@email.com',
    phone: '+1 (555) 345-6789',
    source: 'Social Media',
    status: 'cold',
    score: 45,
    lastContact: new Date('2023-09-28'),
    notes: 'Initial inquiry about real estate investment. No follow-up response yet.',
    assignedTo: 'admin@realassist.com',
  },
  {
    id: '4',
    name: 'David Thompson',
    email: 'david.thompson@email.com',
    phone: '+1 (555) 456-7890',
    source: 'Website',
    status: 'dead',
    score: 20,
    lastContact: new Date('2023-08-15'),
    notes: 'No response to multiple follow-ups. Marked as inactive.',
    assignedTo: 'admin@realassist.com',
  },
  {
    id: '5',
    name: 'Lisa Wang',
    email: 'lisa.wang@email.com',
    phone: '+1 (555) 567-8901',
    source: 'Email Campaign',
    status: 'hot',
    score: 88,
    lastContact: new Date('2023-10-06'),
    notes: 'Very interested in pre-construction properties. Has signed up for updates.',
    assignedTo: 'admin@realassist.com',
  },
];

export const mockAnalytics: Analytics = {
  totalLeads: 1247,
  activeClients: 342,
  totalRevenue: 2450000,
  monthlyRevenue: 187500,
  conversionRate: 24.5,
  averageDealSize: 485000,
};

export const mockClientDashboardStats: DashboardStats[] = [
  {
    title: 'Total Investment',
    value: '$450,000',
    change: 0,
    changeType: 'increase',
    icon: 'CurrencyDollarIcon',
  },
  {
    title: 'Payments Made',
    value: '8/24',
    change: 33.3,
    changeType: 'increase',
    icon: 'CheckCircleIcon',
  },
  {
    title: 'Amount Paid',
    value: '$150,000',
    change: 33.3,
    changeType: 'increase',
    icon: 'BanknotesIcon',
  },
  {
    title: 'Project Progress',
    value: '35%',
    change: 5.2,
    changeType: 'increase',
    icon: 'ChartBarIcon',
  },
];

export const mockAdminDashboardStats: DashboardStats[] = [
  {
    title: 'Total Leads',
    value: '1,247',
    change: 12.5,
    changeType: 'increase',
    icon: 'UsersIcon',
  },
  {
    title: 'Active Clients',
    value: '342',
    change: 8.3,
    changeType: 'increase',
    icon: 'UserGroupIcon',
  },
  {
    title: 'Monthly Revenue',
    value: '$187,500',
    change: 15.2,
    changeType: 'increase',
    icon: 'CurrencyDollarIcon',
  },
  {
    title: 'Conversion Rate',
    value: '24.5%',
    change: 2.1,
    changeType: 'increase',
    icon: 'ChartBarIcon',
  },
];
