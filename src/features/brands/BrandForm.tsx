import { useState, type FormEvent } from 'react'
import { Modal } from '../../components/ui'
import { errorMessage } from '../../lib/apiClient'
import { createBrand, updateBrand } from './api'
import type { AdminBrand } from './types'

export function BrandForm({ brand, onClose, onSaved }: { brand: AdminBrand | null; onClose: () => void; onSaved: (message: string) => void }) {
    const [name, setName] = useState(brand?.name ?? '')
    const [website, setWebsite] = useState(brand?.website ?? '')
    const [isActive, setIsActive] = useState(brand?.isActive ?? true)
    const [error, setError] = useState('')
    const [submitting, setSubmitting] = useState(false)

    const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        const trimmedName = name.trim()
        const trimmedWebsite = website.trim()
        if (!trimmedName) {
            setError('Brand name is required')
            return
        }
        if (trimmedWebsite && !/^https?:\/\/\S+$/i.test(trimmedWebsite)) {
            setError('Website must start with http:// or https://')
            return
        }
        setSubmitting(true)
        setError('')
        try {
            if (brand) {
                await updateBrand(brand.id, { name: trimmedName, website: trimmedWebsite, isActive })
                onSaved(`${trimmedName} updated.`)
            } else {
                await createBrand(trimmedName, trimmedWebsite)
                onSaved(`${trimmedName} created.`)
            }
            onClose()
        } catch (requestError) {
            setError(errorMessage(requestError, 'Could not save the brand'))
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <Modal title={brand ? `Edit ${brand.name}` : 'Create a new brand'} onClose={onClose}>
            <form className="modal-form" onSubmit={onSubmit} noValidate>
                <label>
                    Name
                    <input value={name} onChange={(event) => setName(event.target.value)} required placeholder="QIO Studio" maxLength={80} />
                </label>
                <label>
                    Website
                    <input value={website} onChange={(event) => setWebsite(event.target.value)} type="url" placeholder="https://brand.com" />
                </label>
                {brand && (
                    <label className="checkbox-row">
                        <input type="checkbox" checked={isActive} onChange={(event) => setIsActive(event.target.checked)} />
                        Active (available when creating products)
                    </label>
                )}
                {error && <p className="login-error">{error}</p>}
                <div className="modal-actions">
                    <button type="button" className="secondary-button" onClick={onClose}>
                        Cancel
                    </button>
                    <button type="submit" className="primary-button" disabled={submitting}>
                        {submitting ? 'Saving…' : brand ? 'Save changes' : 'Create brand'}
                    </button>
                </div>
            </form>
        </Modal>
    )
}
