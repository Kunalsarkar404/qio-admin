import { useState, type FormEvent } from 'react'
import { Modal } from '../../components/ui'
import { errorMessage } from '../../lib/apiClient'
import { PRODUCT_CATEGORIES } from '../products/types'
import { createAdminCoupon, updateAdminCoupon } from './api'
import type { AdminCoupon, CouponInput, DiscountType } from './types'

const CODE_PATTERN = /^[A-Z0-9_-]{3,30}$/

/** ISO → value for <input type="datetime-local"> in local time */
function toLocalInput(iso: string | null | undefined) {
    if (!iso) return ''
    const date = new Date(iso)
    if (Number.isNaN(date.getTime())) return ''
    const offset = date.getTimezoneOffset() * 60000
    return new Date(date.getTime() - offset).toISOString().slice(0, 16)
}

function optionalNumber(value: string) {
    return value.trim() === '' ? null : Number(value)
}

export function CouponForm({ coupon, onClose, onSaved }: { coupon: AdminCoupon | null; onClose: () => void; onSaved: (message: string) => void }) {
    const isEditing = Boolean(coupon)
    const [code, setCode] = useState(coupon?.code ?? '')
    const [description, setDescription] = useState(coupon?.description ?? '')
    const [discountType, setDiscountType] = useState<DiscountType>(coupon?.discountType ?? 'percentage')
    const [discountValue, setDiscountValue] = useState(coupon ? String(coupon.discountValue) : '')
    const [maxDiscount, setMaxDiscount] = useState(coupon?.maxDiscount != null ? String(coupon.maxDiscount) : '')
    const [minPurchase, setMinPurchase] = useState(coupon?.minPurchase ? String(coupon.minPurchase) : '')
    const [maxUses, setMaxUses] = useState(coupon?.maxUses != null ? String(coupon.maxUses) : '')
    const [expiresAt, setExpiresAt] = useState(toLocalInput(coupon?.expiresAt))
    const [isActive, setIsActive] = useState(coupon?.isActive ?? true)
    const [categories, setCategories] = useState<string[]>(coupon?.applicableCategories ?? [])
    const [error, setError] = useState('')
    const [submitting, setSubmitting] = useState(false)

    const validate = (): CouponInput | string => {
        const normalizedCode = code.trim().toUpperCase()
        if (!CODE_PATTERN.test(normalizedCode)) return 'Code must be 3–30 characters: letters, numbers, - or _'
        const value = Number(discountValue)
        if (!Number.isFinite(value) || value <= 0) return 'Discount value must be greater than 0'
        if (discountType === 'percentage' && value > 100) return 'Percentage discount cannot exceed 100'
        const max = optionalNumber(maxDiscount)
        if (max !== null && (!Number.isFinite(max) || max < 0)) return 'Max discount must be 0 or more'
        const min = optionalNumber(minPurchase)
        if (min !== null && (!Number.isFinite(min) || min < 0)) return 'Minimum purchase must be 0 or more'
        const uses = optionalNumber(maxUses)
        if (uses !== null && (!Number.isInteger(uses) || uses < 1)) return 'Max uses must be a whole number of at least 1'
        let expiry: string | null = null
        if (expiresAt) {
            const date = new Date(expiresAt)
            if (Number.isNaN(date.getTime())) return 'Expiry date is invalid'
            expiry = date.toISOString()
        }
        return {
            code: normalizedCode,
            description: description.trim(),
            discountType,
            discountValue: value,
            maxDiscount: discountType === 'percentage' ? max : null,
            minPurchase: min,
            maxUses: uses,
            expiresAt: expiry,
            isActive,
            applicableCategories: categories,
        }
    }

    const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setError('')
        const payload = validate()
        if (typeof payload === 'string') {
            setError(payload)
            return
        }
        setSubmitting(true)
        try {
            if (coupon) await updateAdminCoupon(coupon._id, payload)
            else await createAdminCoupon(payload)
            onSaved(`Coupon ${payload.code} ${coupon ? 'updated' : 'created'}.`)
            onClose()
        } catch (requestError) {
            setError(errorMessage(requestError, 'Could not save the coupon'))
        } finally {
            setSubmitting(false)
        }
    }

    const toggleCategory = (category: string) =>
        setCategories((current) => (current.includes(category) ? current.filter((item) => item !== category) : [...current, category]))

    return (
        <Modal title={isEditing ? `Edit ${coupon?.code}` : 'Create a coupon'} subtitle="Promotions" onClose={onClose} wide>
            <form className="modal-form product-form" onSubmit={onSubmit} noValidate>
                <div className="form-row">
                    <label>
                        Code
                        <input
                            value={code}
                            onChange={(event) => setCode(event.target.value.toUpperCase())}
                            placeholder="WELCOME10"
                            maxLength={30}
                            required
                        />
                    </label>
                    <label>
                        Discount type
                        <select value={discountType} onChange={(event) => setDiscountType(event.target.value as DiscountType)}>
                            <option value="percentage">Percentage off</option>
                            <option value="fixed">Fixed amount off (₹)</option>
                        </select>
                    </label>
                </div>
                <label>
                    Description
                    <input value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Shown to customers" maxLength={200} />
                </label>
                <div className="form-row">
                    <label>
                        {discountType === 'percentage' ? 'Discount (%)' : 'Discount (₹)'}
                        <input
                            type="number"
                            min={0}
                            max={discountType === 'percentage' ? 100 : undefined}
                            step="any"
                            value={discountValue}
                            onChange={(event) => setDiscountValue(event.target.value)}
                            required
                        />
                    </label>
                    <label>
                        Max discount (₹) <span className="field-hint">percentage only, optional</span>
                        <input
                            type="number"
                            min={0}
                            step="any"
                            value={maxDiscount}
                            disabled={discountType !== 'percentage'}
                            onChange={(event) => setMaxDiscount(event.target.value)}
                        />
                    </label>
                </div>
                <div className="form-row">
                    <label>
                        Minimum purchase (₹) <span className="field-hint">optional</span>
                        <input type="number" min={0} step="any" value={minPurchase} onChange={(event) => setMinPurchase(event.target.value)} />
                    </label>
                    <label>
                        Max uses <span className="field-hint">blank = unlimited</span>
                        <input type="number" min={1} step={1} value={maxUses} onChange={(event) => setMaxUses(event.target.value)} />
                    </label>
                </div>
                <label>
                    Expires at <span className="field-hint">blank = never</span>
                    <input type="datetime-local" value={expiresAt} onChange={(event) => setExpiresAt(event.target.value)} />
                </label>
                <div>
                    <p className="field-label">Applies to categories <span className="field-hint">none selected = all categories</span></p>
                    <div className="chip-row">
                        {PRODUCT_CATEGORIES.map((category) => (
                            <label key={category} className="checkbox-row chip">
                                <input type="checkbox" checked={categories.includes(category)} onChange={() => toggleCategory(category)} />
                                {category}
                            </label>
                        ))}
                    </div>
                </div>
                <label className="checkbox-row">
                    <input type="checkbox" checked={isActive} onChange={(event) => setIsActive(event.target.checked)} />
                    Active (customers can redeem it)
                </label>
                {error && <p className="login-error">{error}</p>}
                <div className="modal-actions">
                    <button type="button" className="secondary-button" onClick={onClose}>
                        Cancel
                    </button>
                    <button type="submit" className="primary-button" disabled={submitting}>
                        {submitting ? 'Saving…' : isEditing ? 'Save changes' : 'Create coupon'}
                    </button>
                </div>
            </form>
        </Modal>
    )
}
