import { useEffect, useMemo, useState } from 'react'
import { Pencil, Search, Trash2 } from 'lucide-react'
import { ProductCell, StatusPill, Toolbar } from '../../components/ui'
import { useAuth } from '../../context/AuthContext'
import { deleteAdminProduct, listAdminProducts } from './api'
import { ProductForm } from './ProductForm'
import type { AdminProduct } from './types'

export function ProductsPage() {
    const { token } = useAuth()
    const [products, setProducts] = useState<AdminProduct[]>([])
    const [query, setQuery] = useState('')
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [editing, setEditing] = useState<AdminProduct | null>(null)
    const [formOpen, setFormOpen] = useState(false)
    const [reloadKey, setReloadKey] = useState(0)

    useEffect(() => {
        if (!token) return
        let cancelled = false
        setLoading(true)
        listAdminProducts(token)
            .then((data) => {
                if (cancelled) return
                setProducts(data.products)
                setError('')
            })
            .catch((requestError) => {
                if (cancelled) return
                setError(requestError instanceof Error ? requestError.message : 'Unable to load products')
            })
            .finally(() => {
                if (!cancelled) setLoading(false)
            })
        return () => {
            cancelled = true
        }
    }, [token, reloadKey])

    const filtered = useMemo(
        () => products.filter((product) => `${product.name} ${product.brand}`.toLowerCase().includes(query.toLowerCase())),
        [products, query],
    )

    const refresh = () => setReloadKey((key) => key + 1)

    const onDelete = async (product: AdminProduct) => {
        if (!confirm(`Delete "${product.name}"? This cannot be undone.`)) return
        try {
            await deleteAdminProduct(token, product.id)
            refresh()
        } catch (requestError) {
            alert(requestError instanceof Error ? requestError.message : 'Could not delete product')
        }
    }

    return (
        <section className="panel table-panel full-panel">
            <Toolbar
                title="Product catalog"
                text={loading ? 'Loading products…' : `${filtered.length} products matching your search`}
                action="Add product"
                onAction={() => {
                    setEditing(null)
                    setFormOpen(true)
                }}
            >
                <label className="search-box">
                    <Search size={17} />
                    <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search products" />
                </label>
            </Toolbar>

            {error && <p className="login-error">{error}</p>}

            <table>
                <thead>
                    <tr>
                        <th>Product</th>
                        <th>Category</th>
                        <th>Marked price</th>
                        <th>Selling price</th>
                        <th>Clicks</th>
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
                            <td>{product.originalPrice ? `₹${product.originalPrice.toLocaleString('en-IN')}` : '—'}</td>
                            <td>
                                <strong>₹{product.price.toLocaleString('en-IN')}</strong>
                            </td>
                            <td>{product.clicks}</td>
                            <td>{product.stock}</td>
                            <td>
                                <StatusPill status={product.stock > 0 ? 'Live' : 'Out of stock'} />
                            </td>
                            <td className="row-actions">
                                <button
                                    type="button"
                                    className="row-menu"
                                    aria-label="Edit product"
                                    onClick={() => {
                                        setEditing(product)
                                        setFormOpen(true)
                                    }}
                                >
                                    <Pencil size={15} />
                                </button>
                                <button type="button" className="row-menu row-menu-danger" aria-label="Delete product" onClick={() => onDelete(product)}>
                                    <Trash2 size={15} />
                                </button>
                            </td>
                        </tr>
                    ))}
                    {!loading && !filtered.length && (
                        <tr>
                            <td colSpan={8} className="empty-state">
                                No products yet. Click “Add product” to create your first listing.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>

            {formOpen && (
                <ProductForm
                    product={editing}
                    onClose={() => setFormOpen(false)}
                    onSaved={refresh}
                />
            )}
        </section>
    )
}
