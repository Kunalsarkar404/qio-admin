import { useState } from 'react'
import { StatusPill, Toolbar } from '../../components/ui'
import type { DashboardBrand } from '../../types'
import { BrandForm } from './BrandForm'

export function BrandsPage({ brands, onChanged }: { brands: DashboardBrand[]; onChanged: () => void }) {
    const [formOpen, setFormOpen] = useState(false)

    return (
        <section className="panel table-panel full-panel">
            <Toolbar title="Brand directory" text={`${brands.length} active brands across your catalog`} action="Create brand" onAction={() => setFormOpen(true)} />
            <div className="brand-grid">
                {brands.map((brand) => (
                    <article className="brand-card" key={brand.id}>
                        <div className="brand-logo">{brand.name.split(' ').map((part) => part[0]).join('').slice(0, 2)}</div>
                        <div>
                            <h3>{brand.name}</h3>
                            <p>{brand.website || 'No website added'}</p>
                        </div>
                        <StatusPill status="Live" />
                    </article>
                ))}
                {!brands.length && <p className="empty-state">No brands yet. Create your first brand to organize products.</p>}
            </div>
            {formOpen && <BrandForm onClose={() => setFormOpen(false)} onSaved={onChanged} />}
        </section>
    )
}
