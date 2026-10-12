import { useState, type FormEvent } from 'react'
import { Modal, StatusPill } from '../../components/ui'
import { useApiData } from '../../hooks/useApiData'
import { errorMessage } from '../../lib/apiClient'
import { formatDateTime, formatINR } from '../../lib/format'
import { adjustUserWallet, getAdminWallet } from './api'
import type { AdminWallet } from './types'

export function WalletDetail({ userId, onClose, onChanged }: { userId: string; onClose: () => void; onChanged: () => void }) {
    const { data, error, loading } = useApiData(`wallet:${userId}`, () => getAdminWallet(userId))
    const [updated, setUpdated] = useState<AdminWallet | null>(null)
    const wallet = updated ?? data?.wallet ?? null

    const [type, setType] = useState<'credit' | 'debit'>('credit')
    const [amount, setAmount] = useState('')
    const [reason, setReason] = useState('')
    const [formError, setFormError] = useState('')
    const [success, setSuccess] = useState('')
    const [submitting, setSubmitting] = useState(false)

    const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setFormError('')
        setSuccess('')
        const value = Number(amount)
        if (!Number.isFinite(value) || value <= 0) {
            setFormError('Enter an amount greater than 0')
            return
        }
        if (Math.round(value * 100) !== value * 100) {
            setFormError('Amount can have at most 2 decimal places')
            return
        }
        if (!reason.trim()) {
            setFormError('A reason is required for manual adjustments')
            return
        }
        if (type === 'debit' && wallet && value > wallet.balance) {
            setFormError(`Insufficient balance — the wallet holds ${formatINR(wallet.balance)}`)
            return
        }
        setSubmitting(true)
        try {
            const result = await adjustUserWallet(userId, type, value, reason.trim())
            setUpdated(result.wallet)
            setSuccess(`${type === 'credit' ? 'Credited' : 'Debited'} ${formatINR(value)}.`)
            setAmount('')
            setReason('')
            onChanged()
        } catch (requestError) {
            setFormError(errorMessage(requestError, 'Adjustment failed'))
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <Modal title={wallet?.user?.name ? `${wallet.user.name}'s wallet` : 'Wallet'} subtitle="Wallet management" onClose={onClose} wide>
            {loading && !wallet && <p className="empty-state">Loading wallet…</p>}
            {error && !wallet && <p className="login-error">{error}</p>}
            {wallet && (
                <div className="detail-stack">
                    <div className="detail-grid">
                        <div>
                            <p className="field-label">Balance</p>
                            <strong className="detail-big">{formatINR(wallet.balance)}</strong>
                        </div>
                        <div>
                            <p className="field-label">Total credited</p>
                            <span>{formatINR(wallet.totalCredit)}</span>
                        </div>
                        <div>
                            <p className="field-label">Total debited</p>
                            <span>{formatINR(wallet.totalDebit)}</span>
                        </div>
                        <div>
                            <p className="field-label">Account</p>
                            <span>{wallet.user?.email || '—'}</span>
                            {wallet.user?.phone && <small>{wallet.user.phone}</small>}
                        </div>
                    </div>

                    <form className="modal-form adjust-form" onSubmit={onSubmit}>
                        <p className="field-label">Manual adjustment</p>
                        <div className="form-row">
                            <label>
                                Type
                                <select value={type} onChange={(event) => setType(event.target.value as 'credit' | 'debit')}>
                                    <option value="credit">Credit (add funds)</option>
                                    <option value="debit">Debit (remove funds)</option>
                                </select>
                            </label>
                            <label>
                                Amount (₹)
                                <input type="number" min={0.01} step={0.01} value={amount} onChange={(event) => setAmount(event.target.value)} required />
                            </label>
                        </div>
                        <label>
                            Reason
                            <input value={reason} onChange={(event) => setReason(event.target.value)} maxLength={120} placeholder="e.g. Goodwill credit for delayed delivery" required />
                        </label>
                        {formError && <p className="login-error">{formError}</p>}
                        {success && <p className="notice notice-success">{success}</p>}
                        <div className="modal-actions">
                            <button type="submit" className="primary-button" disabled={submitting}>
                                {submitting ? 'Saving…' : type === 'credit' ? 'Credit wallet' : 'Debit wallet'}
                            </button>
                        </div>
                    </form>

                    <div className="table-panel detail-table">
                        <p className="field-label">Recent transactions ({wallet.transactionCount})</p>
                        <table>
                            <thead>
                                <tr>
                                    <th>Description</th>
                                    <th>Type</th>
                                    <th>Amount</th>
                                    <th>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(wallet.transactions ?? []).map((txn) => (
                                    <tr key={txn._id}>
                                        <td className="review-text">{txn.title}</td>
                                        <td>
                                            <StatusPill status={txn.type} />
                                        </td>
                                        <td>
                                            <strong>
                                                {txn.type === 'debit' ? '−' : '+'}
                                                {formatINR(txn.amount)}
                                            </strong>
                                        </td>
                                        <td>{formatDateTime(txn.date)}</td>
                                    </tr>
                                ))}
                                {!wallet.transactions?.length && (
                                    <tr>
                                        <td colSpan={4} className="empty-state">
                                            No transactions yet.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </Modal>
    )
}
