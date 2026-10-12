import { useState } from 'react'
import { Modal, Pagination, ProductCell, TableMessage } from '../../components/ui'
import { useApiData } from '../../hooks/useApiData'
import { formatDateTime, formatINR } from '../../lib/format'
import { listUserProductViews } from './api'

const LIMIT = 25

/** Products a customer was shown / opened, most recent first. */
export function UserViewsModal({ user, onClose }: { user: { _id: string; name: string }; onClose: () => void }) {
    const [page, setPage] = useState(1)
    const { data, error, loading } = useApiData(`user-views:${user._id}:${page}`, () => listUserProductViews(user._id, page, LIMIT))
    const views = data?.views ?? []

    return (
        <Modal title={`Viewed by ${user.name}`} subtitle="Product impressions and opens" onClose={onClose} wide>
            <div className="table-panel detail-table">
                <table>
                    <thead>
                        <tr>
                            <th>Product</th>
                            <th>Price</th>
                            <th>Impressions</th>
                            <th>Opens</th>
                            <th>Last opened</th>
                        </tr>
                    </thead>
                    <tbody>
                        {!views.length && <TableMessage colSpan={5} loading={loading && !data} error={error} empty="This customer has not viewed any products yet." />}
                        {views.map((v, i) => (
                            <tr key={v.product?._id ?? i}>
                                <td>
                                    {v.product ? (
                                        <ProductCell name={v.product.name} brand={v.product.brand} image={v.product.image} />
                                    ) : (
                                        <span className="cell-sub">Deleted product</span>
                                    )}
                                </td>
                                <td>{v.product ? formatINR(v.product.price) : '—'}</td>
                                <td>{v.impressions}</td>
                                <td>{v.opens}</td>
                                <td>{formatDateTime(v.lastOpenedAt, 'Never')}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {data && <Pagination page={page} limit={LIMIT} total={data.total} onChange={setPage} />}
        </Modal>
    )
}
