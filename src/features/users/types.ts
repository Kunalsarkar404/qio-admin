export interface AdminUser {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    avatar?: string;
    isVerified: boolean;
    role: 'user' | 'admin';
    totalOrders: number;
    totalSpent: number;
    totalReviews: number;
    joinedDate: string;
    lastActive: string;
    status: 'active' | 'inactive' | 'suspended';
}

export interface UserStats {
    totalUsers: number;
    activeUsers: number;
    inactiveUsers: number;
    suspendedUsers: number;
    newUsersThisMonth: number;
    averageOrderValue: number;
}
