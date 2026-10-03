export interface AdminWallet {
    _id: string;
    user: {
        _id: string;
        name: string;
        email: string;
    };
    balance: number;
    totalCredit: number;
    totalDebit: number;
    transactions: WalletTransaction[];
}

export interface WalletTransaction {
    _id: string;
    title: string;
    amount: number;
    type: 'credit' | 'debit';
    reason?: string;
    relatedOrder?: string;
    date: string;
}

export interface WalletStats {
    totalActiveWallets: number;
    totalBalance: number;
    averageBalance: number;
    totalTransactions: number;
    monthlyTransactions: number;
}
