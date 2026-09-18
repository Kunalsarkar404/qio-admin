import { useState, type FormEvent } from 'react'
import { Modal } from '../../components/ui'
import { useAuth } from '../../context/AuthContext'
import { createBrand } from './api'

export function BrandForm({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
    const { token } = useAuth()
    const [name, setName] = useState('')
    const [website, setWebsite] = useState('')
    const [error, setError] = useState('')
    const [submitting, setSubmitting] = useState(false)

    const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setSubmitting(true)
        setError('')
        try {
            await createBrand(token, name.trim(), website.trim())
            onSaved()
            onClose()
        } catch (requestError) {
            setError(requestError instanceof Error ? requestError.message : 'Could not create brand')
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <Modal title="Create a new brand" onClose={onClose}>
            <form className="modal-form" onSubmit={onSubmit}>
                <label>
                    Name
                    <input value={name} onChange={(event) => setName(event.target.value)} required placeholder="QIO Studio" />
                </label>
                <label>
                    Website
                    <input value={website} onChange={(event) => setWebsite(event.target.value)} type="url" placeholder="https://brand.com" />
                </label>
                {error && <p className="login-error">{error}</p>}
                <div className="modal-actions">
                    <button type="button" className="secondary-button" onClick={onClose}>
                        Cancel
                    </button>
                    <button type="submit" className="primary-button" disabled={submitting}>
                        {submitting ? 'Creating…' : 'Create brand'}
                    </button>
                </div>
            </form>
        </Modal>
    )
}
