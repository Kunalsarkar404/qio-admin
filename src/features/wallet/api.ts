import { apiRequest } from '../../lib/apiClient'
import type { AdminWallet, WalletFilters, WalletListResponse, WalletStats, WalletTransaction } from './types'

export function listAdminWallets(filters: WalletFilters & { page?: number; limit?: number } = {}) {
    return apiRequest<WalletListResponse>('/admin/wallets', { query: filters })
}

/** All wallet routes take the USER id. */
export function getAdminWallet(userId: string) {
    return apiRequest<{ wallet: AdminWallet }>(`/admin/wallets/${userId}`)
}

export function adjustUserWallet(userId: string, type: 'credit' | 'debit', amount: number, reason: string) {
    return apiRequest<{ wallet: AdminWallet }>(`/admin/wallets/${userId}/${type}`, {
        method: 'POST',
        json: { amount, reason },
    })
}

export function getWalletStats() {
    return apiRequest<WalletStats>('/admin/wallets/stats')
}

export function getWalletTransactions(userId: string, filters: { type?: 'credit' | 'debit'; startDate?: string; endDate?: string } = {}) {
    return apiRequest<{ transactions: WalletTransaction[] }>(`/admin/wallets/${userId}/transactions`, { query: filters })
}
