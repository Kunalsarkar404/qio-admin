import { useMemo, useState } from 'react'
import { Eye, Pencil, Search, Trash2 } from 'lucide-react'
import { ProductViewersModal } from '../tracking/ProductViewersModal'
import { openRate } from '../tracking/types'
import { ConfirmDialog, FilterBar, Notice, ProductCell, StatusPill, TableMessage, Toolbar, type NoticeState } from '../../components/ui'
import { useApiData } from '../../hooks/useApiData'
import { formatINR } from '../../lib/format'
import { deleteAdminProduct, listAdminProducts } from './api'
import { ProductForm } from './ProductForm'
import { productStatus, type AdminProduct } from './types'

export function ProductsPage() {
    const { data, error, loading, reload } = useApiData('products', listAdminProducts)
    const products = useMemo(() => data?.products ?? [], [data])
    const [query, setQuery] = useState('')
    const [category, setCategory] = useState('')
    const [editing, setEditing] = useState<AdminProduct | null>(null)
    const [formOpen, setFormOpen] = useState(false)
    const [deleting, setDeleting] = useState<AdminProduct | null>(null)
    const [notice, setNotice] = useState<NoticeState>(null)
    const [viewing, setViewing] = useState<AdminProduct | null>(null)

    const filtered = useMemo(() => {
        const needle = query.trim().toLowerCase()
        return products.filter(
            (product) => (!category || product.category === category) && `${product.name} ${product.brand}`.toLowerCase().includes(needle),
        )
    }, [products, query, category])

    const onSaved = (message: string) => {
        setNotice({ kind: 'success', text: message })
        reload()
    }

    return (
        <section className="panel table-panel full-panel">
            <Toolbar
                title="Product catalog"
                text={loading && !data ? 'Loading products…' : `${filtered.length} of ${products.length} products`}
                action="Add product"
                onAction={() => {
                    setEditing(null)
                    setFormOpen(true)
                }}
            />

            <FilterBar>
                <label className="search-box">
                    <Search size={17} />
                    <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search name or brand" />
                </label>
                <select className="filter-select" value={category} onChange={(event) => setCategory(event.target.value)} aria-label="Category">
                    <option value="">All categories</option>
                    {(data?.categories ?? []).map((item) => (
                        <option key={item} value={item}>
                            {item}
                        </option>
                    ))}
                </select>
            </FilterBar>

            <Notice notice={notice} onDismiss={() => setNotice(null)} />
            {error && products.length > 0 && <p className="login-error">{error}</p>}

            <table>
                <thead>
                    <tr>
                        <th>Product</th>
                        <th>Category</th>
                        <th>Marked price</th>
                        <th>Selling price</th>
                        <th>Impressions</th>
                        <th>Opens</th>
                        <th>Open rate</th>
                        <th>Stock</th>
                        <th>Status</th>
                        <th />
                    </tr>
                </thead>
                <tbody>
                    {filtered.map((product) => (
                        <tr key={product.id}>
                            <td>
                                <ProductCell name={product.name} brand={product.brand} image={product.image} />
                            </td>
                            <td>{product.category}</td>
                            <td>{product.originalPrice ? formatINR(product.originalPrice) : '—'}</td>
                            <td>
                                <strong>{formatINR(product.price)}</strong>
                            </td>
                            <td>{product.impressions}</td>
                            <td>{product.clicks}</td>
                            <td>{openRate(product.clicks, product.impressions)}</td>
                            <td>{product.sizeStock?.length ? product.stock : <span className="cell-sub">Not tracked</span>}</td>
                            <td>
                                <StatusPill status={productStatus(product)} />
                            </td>
                            <td className="row-actions">
                                <button
                                    type="button"
                                    className="row-menu"
                                    aria-label={`Who viewed ${product.name}`}
                                    title="Who viewed this"
                                    onClick={() => setViewing(product)}
                                >
                                    <Eye size={15} />
                                </button>
                                <button
                                    type="button"
                                    className="row-menu"
                                    aria-label={`Edit ${product.name}`}
                                    onClick={() => {
                                        setEditing(product)
                                        setFormOpen(true)
                                    }}
                                >
                                    <Pencil size={15} />
                                </button>
                                <button type="button" className="row-menu row-menu-danger" aria-label={`Delete ${product.name}`} onClick={() => setDeleting(product)}>
                                    <Trash2 size={15} />
                                </button>
                            </td>
                        </tr>
                    ))}
                    {!filtered.length && (
                        <TableMessage
                            colSpan={10}
                            loading={loading && !data}
                            error={error}
                            empty={products.length ? 'No products match your filters.' : 'No products yet. Click “Add product” to create your first listing.'}
                        />
                    )}
                </tbody>
            </table>

            {formOpen && <ProductForm product={editing} categories={data?.categories} onClose={() => setFormOpen(false)} onSaved={onSaved} />}
            {deleting && (
                <ConfirmDialog
                    title={`Delete “${deleting.name}”?`}
                    message="The product, its reviews and its images are removed, and it is taken out of every cart and wishlist. This cannot be undone. To hide it temporarily, edit it and untick “Active” instead."
                    confirmLabel="Delete product"
                    danger
                    onConfirm={async () => {
                        await deleteAdminProduct(deleting.id)
                        onSaved(`${deleting.name} deleted.`)
                    }}
                    onClose={() => setDeleting(null)}
                />
            )}
            {viewing && <ProductViewersModal product={viewing} onClose={() => setViewing(null)} />}
        </section>
    )
}
