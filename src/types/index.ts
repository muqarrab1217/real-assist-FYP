export interface User {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    name?: string; // Added for compatibility with existing mock data
    role: 'admin' | 'client' | 'employee' | 'sales_rep';
    avatar?: string;
    phone?: string;
    profileCompleted?: boolean;
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
    fullName?: string;
    email?: string;
    phone?: string;
    propertyName?: string;
    totalPaid?: number;
    remainingBalance?: number;
    overdueCount?: number;
}

export interface UnitType {
    type?: string;
    bedrooms?: string;
    area?: string;
    price?: number;
}

export interface PaymentPlan {
    downPaymentPercentage?: number;
    durationMonths?: number;
    totalInstallments?: number;
}

export interface InventoryItem {
    id: string;
    projectId: string;
    rowData: Record<string, string>;
    status: 'available' | 'sold' | 'reserved' | 'booked';
    createdAt: Date;
    updatedAt: Date;
}

export interface Property {
    id: string;
    name: string;
    type: string;
    location: string;
    developer?: string;
    price?: number;
    priceMin?: number;
    priceMax?: number;
    priceRange?: {
        min: number;
        max: number;
    };
    description?: string;
    amenities?: string[];
    images?: string[];
    brochureUrl?: string;
    brochure?: string;
    completionDate?: Date;
    status?: string;
    unitTypes?: UnitType[];
    paymentPlan?: PaymentPlan;
    // Unit range configuration (legacy)
    roomNumberMin?: number;
    roomNumberMax?: number;
    floorNumberMin?: number;
    floorNumberMax?: number;
    unitNumberMin?: string;
    unitNumberMax?: string;
    areaMin?: number;
    areaMax?: number;
    unitTypeOptions?: string[];
    // Inventory system fields
    inventoryHeaders?: string[];    // ordered column headers from uploaded Excel
    blueprintUrl?: string;          // uploaded floor plan image URL
    inventoryFileUrl?: string;      // uploaded Excel/CSV file URL in storage
    bookingDeadline?: Date;         // deadline to book a slot
    priceColumnKey?: string | null; // which Excel header holds unit price
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
    type?: 'downpayment' | 'installment' | 'custom' | 'fee';
    billingPeriod?: Date;
    paymentMethod?: 'portal' | 'manual_proof' | 'stripe';
    verificationStatus?: 'not_required' | 'pending_verification' | 'verified' | 'rejected';
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
    // Admin-enriched fields
    clientName?: string;
    clientEmail?: string;
    propertyName?: string;
    investmentAmount?: number;
}

export interface PaymentProof {
    id: string;
    paymentId: string;
    clientId: string;
    proofUrl: string;
    proofType: 'bank_transfer' | 'jazzcash' | 'easypaisa' | 'cheque' | 'cash_receipt' | 'other';
    notes?: string;
    status: 'pending_review' | 'approved' | 'rejected';
    reviewedBy?: string;
    reviewedAt?: Date;
    rejectionReason?: string;
    createdAt: Date;
    submittedAt?: Date;
    updatedAt?: Date;
    // Joined fields
    payment?: Payment;
    client?: Client;
    reviewer?: User;
}

export interface Enrollment {
    id: string;
    userId: string;
    projectId: string;
    totalPrice: number;
    downPayment: number;
    installmentDurationYears: number;
    monthlyInstallment: number;
    status: 'pending' | 'active' | 'completed' | 'rejected';
    selectedUnitType?: string;
    selectedFloor?: number;
    selectedUnitNumber?: string;
    unitDetails?: {
        type?: string;
        floor?: string;
        unitNumber?: string;
        bedrooms?: string;
        area?: string;
        view?: string;
    };
    adminNotes?: string;
    rejectedReason?: string;
    processedBy?: string;
    processedAt?: Date;
    createdAt: Date;
    profile?: User;
    project?: Property;
    // Inventory system fields
    inventoryItemId?: string;
    paymentFrequency?: 'monthly' | 'yearly';
    isFlexiblePlan?: boolean;
    downPaymentPercentage?: number;
}

export interface EnrollmentAuditLog {
    id: string;
    enrollmentId: string;
    action: 'created' | 'approved' | 'rejected' | 'modified';
    oldStatus?: string;
    newStatus?: string;
    performedBy?: string;
    notes?: string;
    createdAt: Date;
    performer?: User;
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
    userId?: string;
    chatSessionId?: string;
    classificationSource?: string;
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
