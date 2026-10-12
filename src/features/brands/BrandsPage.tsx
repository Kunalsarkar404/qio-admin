import { useState } from 'react'
import { Pencil, Power } from 'lucide-react'
import { Notice, StatusPill, Toolbar, type NoticeState } from '../../components/ui'
import { useApiData } from '../../hooks/useApiData'
import { errorMessage } from '../../lib/apiClient'
import { initials } from '../../lib/format'
import { listAdminBrands, updateBrand } from './api'
import { BrandForm } from './BrandForm'
import type { AdminBrand } from './types'

export function BrandsPage() {
    const { data, error, loading, reload } = useApiData('brands', listAdminBrands)
    const brands = data?.brands ?? []
    const activeCount = brands.filter((brand) => brand.isActive).length
    const [formOpen, setFormOpen] = useState(false)
    const [editing, setEditing] = useState<AdminBrand | null>(null)
    const [notice, setNotice] = useState<NoticeState>(null)
    const [busyId, setBusyId] = useState('')

    const onSaved = (message: string) => {
        setNotice({ kind: 'success', text: message })
        reload()
    }

    const toggleActive = async (brand: AdminBrand) => {
        setBusyId(brand.id)
        setNotice(null)
        try {
            await updateBrand(brand.id, { isActive: !brand.isActive })
            onSaved(`${brand.name} ${brand.isActive ? 'deactivated' : 'activated'}.`)
        } catch (requestError) {
            setNotice({ kind: 'error', text: errorMessage(requestError, 'Could not update the brand') })
        } finally {
            setBusyId('')
        }
    }

    return (
        <section className="panel table-panel full-panel">
            <Toolbar
                title="Brand directory"
                text={loading && !data ? 'Loading brands…' : `${activeCount} active of ${brands.length} brands`}
                action="Create brand"
                onAction={() => {
                    setEditing(null)
                    setFormOpen(true)
                }}
            />
            <Notice notice={notice} onDismiss={() => setNotice(null)} />
            {error && <p className="login-error">{error}</p>}
            <div className="brand-grid">
                {brands.map((brand) => (
                    <article className={brand.isActive ? 'brand-card' : 'brand-card is-inactive'} key={brand.id}>
                        <div className="brand-logo">{initials(brand.name)}</div>
                        <div>
                            <h3>{brand.name}</h3>
                            <p>{brand.website || 'No website added'}</p>
                            <StatusPill status={brand.isActive ? 'Active' : 'Inactive'} />
                        </div>
                        <div className="brand-actions">
                            <button
                                type="button"
                                className="row-menu"
                                aria-label={`Edit ${brand.name}`}
                                title="Edit"
                                onClick={() => {
                                    setEditing(brand)
                                    setFormOpen(true)
                                }}
                            >
                                <Pencil size={15} />
                            </button>
                            <button
                                type="button"
                                className="row-menu"
                                aria-label={brand.isActive ? `Deactivate ${brand.name}` : `Activate ${brand.name}`}
                                title={brand.isActive ? 'Deactivate' : 'Activate'}
                                disabled={busyId === brand.id}
                                onClick={() => toggleActive(brand)}
                            >
                                <Power size={15} />
                            </button>
                        </div>
                    </article>
                ))}
                {!loading && !error && !brands.length && <p className="empty-state">No brands yet. Create your first brand to organize products.</p>}
            </div>
            {formOpen && <BrandForm brand={editing} onClose={() => setFormOpen(false)} onSaved={onSaved} />}
        </section>
    )
}
