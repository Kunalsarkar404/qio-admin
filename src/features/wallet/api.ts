import { apiRequest } from '../../lib/apiClient';
import type { AdminWallet, WalletStats } from './types';

export async function listAdminWallets(
    token: string,
    filters?: {
        minBalance?: number;
        maxBalance?: number;
        search?: string;
        page?: number;
        limit?: number;
    }
) {
    const query = new URLSearchParams();
    if (filters?.minBalance) query.append('minBalance', filters.minBalance.toString());
    if (filters?.maxBalance) query.append('maxBalance', filters.maxBalance.toString());
    if (filters?.search) query.append('search', filters.search);
    if (filters?.page) query.append('page', filters.page.toString());
    if (filters?.limit) query.append('limit', filters.limit.toString());

    const queryString = query.toString();
    const url = `/admin/wallets${queryString ? `?${queryString}` : ''}`;

    return apiRequest<{ wallets: AdminWallet[]; total: number }>(url, { token });
}

export async function getAdminWallet(token: string, userId: string) {
    return apiRequest<{ wallet: AdminWallet }>(`/admin/wallets/${userId}`, { token });
}

export async function creditUserWallet(
    token: string,
    userId: string,
    amount: number,
    reason: string
) {
    return apiRequest<{ wallet: AdminWallet }>(`/admin/wallets/${userId}/credit`, {
        method: 'POST',
        token,
        json: { amount, reason },
    });
}

export async function debitUserWallet(
    token: string,
    userId: string,
    amount: number,
    reason: string
) {
    return apiRequest<{ wallet: AdminWallet }>(`/admin/wallets/${userId}/debit`, {
        method: 'POST',
        token,
        json: { amount, reason },
    });
}

export async function getWalletStats(token: string) {
    return apiRequest<WalletStats>('/admin/wallets/stats', { token });
}

export async function getWalletTransactionHistory(
    token: string,
    userId: string,
    filters?: {
        startDate?: string;
        endDate?: string;
        type?: 'credit' | 'debit';
    }
) {
    const query = new URLSearchParams();
    if (filters?.startDate) query.append('startDate', filters.startDate);
    if (filters?.endDate) query.append('endDate', filters.endDate);
    if (filters?.type) query.append('type', filters.type);

    const queryString = query.toString();
    const url = `/admin/wallets/${userId}/transactions${queryString ? `?${queryString}` : ''}`;

    return apiRequest<{
        transactions: any[];
    }>(url, { token });
}
