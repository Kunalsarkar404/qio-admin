export interface UserStreak {
    _id: string;
    user: {
        _id: string;
        name: string;
        email: string;
    };
    currentStreak: number;
    maxStreak: number;
    lastVisitDate: string;
    totalVisits: number;
}

export interface StreakStats {
    totalUsers: number;
    usersWithStreaks: number;
    averageCurrentStreak: number;
    maxStreakRecord: number;
    totalStreaks: number;
    topStreakUsers: UserStreak[];
}

export interface StreakTrend {
    date: string;
    activeUsers: number;
    newStreaks: number;
    streaksLost: number;
}
