import { useState } from 'react'
import { Modal, Pagination, TableMessage, UserCell } from '../../components/ui'
import { useApiData } from '../../hooks/useApiData'
import { formatDateTime } from '../../lib/format'
import { listProductViewers } from './api'
import { openRate } from './types'

const LIMIT = 25

/** Signed-in customers who were shown / opened a product. Anonymous views only count in the totals. */
export function ProductViewersModal({
    product,
    onClose,
}: {
    product: { id: string; name: string; impressions: number; clicks: number }
    onClose: () => void
}) {
    const [page, setPage] = useState(1)
    const { data, error, loading } = useApiData(`viewers:${product.id}:${page}`, () => listProductViewers(product.id, page, LIMIT))
    const viewers = data?.viewers ?? []

    return (
        <Modal
            title={product.name}
            subtitle={`${product.impressions} impressions · ${product.clicks} opens · ${openRate(product.clicks, product.impressions)} open rate (all visitors)`}
            onClose={onClose}
            wide
        >
            <div className="table-panel detail-table">
                <table>
                    <thead>
                        <tr>
                            <th>Customer</th>
                            <th>Impressions</th>
                            <th>Opens</th>
                            <th>Last opened</th>
                            <th>Last seen</th>
                        </tr>
                    </thead>
                    <tbody>
                        {!viewers.length && <TableMessage colSpan={5} loading={loading && !data} error={error} empty="No signed-in customer has seen this product yet." />}
                        {viewers.map((v, i) => (
                            <tr key={v.user?._id ?? i}>
                                <td>
                                    <UserCell name={v.user?.name ?? 'Deleted user'} email={v.user?.email} />
                                </td>
                                <td>{v.impressions}</td>
                                <td>{v.opens}</td>
                                <td>{formatDateTime(v.lastOpenedAt, 'Never')}</td>
                                <td>{formatDateTime(v.lastSeenAt, 'Never')}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {data && <Pagination page={page} limit={LIMIT} total={data.total} onChange={setPage} />}
        </Modal>
    )
}
