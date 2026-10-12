import type { PageInfo, UserRef } from '../../types'

/** serializeAdminTxn */
export type WalletTransaction = {
    _id: string
    title: string
    amount: number
    type: 'credit' | 'debit'
    date: string
}

/** serializeAdminWallet — `transactions` only on detail / credit / debit responses */
export type AdminWallet = {
    _id: string
    user: UserRef | null
    balance: number
    totalCredit: number
    totalDebit: number
    transactionCount: number
    updatedAt: string
    transactions?: WalletTransaction[]
}

export type WalletListResponse = { wallets: AdminWallet[] } & PageInfo

export type WalletFilters = {
    search?: string
    minBalance?: number | ''
    maxBalance?: number | ''
}

export type WalletStats = {
    totalActiveWallets: number
    totalBalance: number
    averageBalance: number
    totalTransactions: number
    monthlyTransactions: number
}
