import { useState } from 'react'
import { ArrowLeftRight, Search, Wallet as WalletIcon } from 'lucide-react'
import { FilterBar, Metric, Pagination, TableMessage, Toolbar, UserCell } from '../../components/ui'
import { useApiData } from '../../hooks/useApiData'
import { useDebouncedValue } from '../../hooks/useDebouncedValue'
import { formatDateTime, formatINR, formatNumber } from '../../lib/format'
import { getWalletStats, listAdminWallets } from './api'
import { WalletDetail } from './WalletDetail'

const PAGE_SIZE = 20

function toBound(value: string): number | '' {
    if (value.trim() === '') return ''
    const number = Number(value)
    return Number.isFinite(number) ? number : ''
}

export function WalletsPage() {
    const [search, setSearch] = useState('')
    const [minBalance, setMinBalance] = useState('')
    const [maxBalance, setMaxBalance] = useState('')
    const [page, setPage] = useState(1)
    const [detailUserId, setDetailUserId] = useState('')
    // Debounce a primitive key (not an object) so the timer isn't reset on every render.
    const debouncedKey = useDebouncedValue(JSON.stringify({ search: search.trim(), minBalance: toBound(minBalance), maxBalance: toBound(maxBalance) }))
    const debounced = JSON.parse(debouncedKey) as { search: string; minBalance: number | ''; maxBalance: number | '' }

    const stats = useApiData('wallet-stats', getWalletStats)
    const { data, error, loading, reload } = useApiData(`wallets:${debouncedKey}:${page}`, () =>
        listAdminWallets({ ...debounced, page, limit: PAGE_SIZE }),
    )
    const wallets = data?.wallets ?? []
    const rangeInvalid = debounced.minBalance !== '' && debounced.maxBalance !== '' && debounced.minBalance > debounced.maxBalance

    const onChanged = () => {
        reload()
        stats.reload()
    }

    return (
        <>
            <section className="metric-grid">
                <Metric icon={<WalletIcon />} label="Wallets" value={formatNumber(stats.data?.totalActiveWallets)} />
                <Metric icon={<WalletIcon />} label="Total balance held" value={formatINR(stats.data?.totalBalance)} />
                <Metric icon={<WalletIcon />} label="Average balance" value={formatINR(stats.data?.averageBalance)} />
                <Metric
                    icon={<ArrowLeftRight />}
                    label="Transactions"
                    value={formatNumber(stats.data?.totalTransactions)}
                    detail={`${formatNumber(stats.data?.monthlyTransactions)} this month`}
                />
            </section>
            {stats.error && <p className="login-error">{stats.error}</p>}

            <section className="panel table-panel full-panel">
                <Toolbar title="Customer wallets" text={data ? `${data.total.toLocaleString('en-IN')} wallets match your filters` : 'Loading wallets…'} />
                <FilterBar>
                    <label className="search-box">
                        <Search size={17} />
                        <input
                            value={search}
                            onChange={(event) => {
                                setSearch(event.target.value)
                                setPage(1)
                            }}
                            placeholder="Customer name or email"
                        />
                    </label>
                    <label className="filter-field">
                        Min ₹
                        <input
                            type="number"
                            min={0}
                            value={minBalance}
                            onChange={(event) => {
                                setMinBalance(event.target.value)
                                setPage(1)
                            }}
                        />
                    </label>
                    <label className="filter-field">
                        Max ₹
                        <input
                            type="number"
                            min={0}
                            value={maxBalance}
                            onChange={(event) => {
                                setMaxBalance(event.target.value)
                                setPage(1)
                            }}
                        />
                    </label>
                </FilterBar>
                {rangeInvalid && <p className="login-error">Minimum balance is greater than the maximum — no wallets can match.</p>}

                <table>
                    <thead>
                        <tr>
                            <th>Customer</th>
                            <th>Balance</th>
                            <th>Credited</th>
                            <th>Debited</th>
                            <th>Transactions</th>
                            <th>Last updated</th>
                            <th />
                        </tr>
                    </thead>
                    <tbody>
                        {wallets.map((wallet) => (
                            <tr key={wallet._id}>
                                <td>
                                    <UserCell name={wallet.user?.name} email={wallet.user?.email} />
                                </td>
                                <td>
                                    <strong>{formatINR(wallet.balance)}</strong>
                                </td>
                                <td>{formatINR(wallet.totalCredit)}</td>
                                <td>{formatINR(wallet.totalDebit)}</td>
                                <td>{wallet.transactionCount}</td>
                                <td>{formatDateTime(wallet.updatedAt)}</td>
                                <td>
                                    <button
                                        type="button"
                                        className="secondary-button compact"
                                        disabled={!wallet.user}
                                        onClick={() => wallet.user && setDetailUserId(wallet.user._id)}
                                    >
                                        Manage
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {!wallets.length && <TableMessage colSpan={7} loading={loading} error={error} empty="No wallets match these filters." />}
                    </tbody>
                </table>
                {error && wallets.length > 0 && <p className="login-error">{error}</p>}
                {data && <Pagination page={data.page} limit={data.limit} total={data.total} onChange={setPage} />}
            </section>

            {detailUserId && <WalletDetail userId={detailUserId} onClose={() => setDetailUserId('')} onChanged={onChanged} />}
        </>
    )
}
