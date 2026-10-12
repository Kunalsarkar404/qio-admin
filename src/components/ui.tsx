import { ChevronLeft, ChevronRight, Plus, X, type LucideIcon } from 'lucide-react'
import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import { errorMessage } from '../lib/apiClient'

export function Metric({ icon, label, value, change, detail }: { icon: ReactNode; label: string; value: string; change?: string; detail?: string }) {
  return (
    <article className="metric-card">
      <div className="metric-top">
        <span className="metric-icon">{icon}</span>
      </div>
      <p>{label}</p>
      <strong>{value}</strong>
      {change ? <small>{change} vs. previous period</small> : detail ? <small>{detail}</small> : null}
    </article>
  )
}

export function PanelHeading({ title, detail, action }: { title: string; detail: string; action?: ReactNode }) {
  return (
    <div className="panel-heading">
      <div>
        <h2>{title}</h2>
        <p>{detail}</p>
      </div>
      {action}
    </div>
  )
}

export function Pulse({ icon, label, value, meta, color }: { icon: ReactNode; label: string; value: string; meta: string; color: string }) {
  return (
    <div className="pulse-row">
      <span className={`pulse-icon ${color}`}>{icon}</span>
      <div>
        <p>{label}</p>
        <strong>{value}</strong>
        <small>{meta}</small>
      </div>
    </div>
  )
}

export function QuickAction({ icon, title, text, onClick }: { icon: ReactNode; title: string; text: string; onClick?: () => void }) {
  return (
    <button type="button" className="quick-action" onClick={onClick}>
      <span>{icon}</span>
      <div>
        <strong>{title}</strong>
        <p>{text}</p>
      </div>
      <Plus size={17} />
    </button>
  )
}

function statusClass(status: string) {
  return status.toLowerCase().trim().replaceAll(/\s+/g, '-')
}

export function StatusPill({ status }: { status: string }) {
  const label = status ? status.charAt(0).toUpperCase() + status.slice(1) : '—'
  return <span className={`status-pill ${statusClass(status)}`}>{label}</span>
}

/** Renders a rating as stars; tolerates fractional, missing or out-of-range values. */
export function Stars({ rating }: { rating: number | null | undefined }) {
  const value = Number.isFinite(Number(rating)) ? Number(rating) : 0
  const filled = Math.min(5, Math.max(0, Math.round(value)))
  return (
    <span className="rating" aria-label={`${value.toFixed(1)} out of 5`}>
      <span aria-hidden="true">
        {'★'.repeat(filled)}
        <span className="rating-empty">{'★'.repeat(5 - filled)}</span>
      </span>
      <b>{value.toFixed(1)}</b>
    </span>
  )
}

export function ProductCell({ name, brand, image }: { name: string; brand: string; image?: string }) {
  return (
    <div className="product-cell">
      <div className="product-thumb">{image ? <img src={image} alt="" /> : null}</div>
      <div>
        <strong>{name}</strong>
        <span>{brand}</span>
      </div>
    </div>
  )
}

export function UserCell({ name, email }: { name?: string | null; email?: string | null }) {
  const label = name || 'Deleted user'
  return (
    <div className="user-cell">
      <div className="user-avatar">
        {label
          .split(' ')
          .filter(Boolean)
          .map((part) => part[0])
          .join('')
          .slice(0, 2)
          .toUpperCase()}
      </div>
      <div>
        <strong>{label}</strong>
        <span>{email || '—'}</span>
      </div>
    </div>
  )
}

export function Toolbar({
  title,
  text,
  action,
  actionIcon: ActionIcon = Plus,
  onAction,
  children,
}: {
  title: string
  text: string
  action?: string
  actionIcon?: LucideIcon
  onAction?: () => void
  children?: ReactNode
}) {
  return (
    <div className="table-toolbar">
      <div>
        <h2>{title}</h2>
        <p>{text}</p>
      </div>
      <div className="toolbar-actions">
        {children}
        {action && (
          <button type="button" className="primary-button" onClick={onAction}>
            <ActionIcon size={17} /> {action}
          </button>
        )}
      </div>
    </div>
  )
}

/** One row of filter controls above a table. */
export function FilterBar({ children }: { children: ReactNode }) {
  return <div className="filter-bar">{children}</div>
}

export function Pagination({ page, limit, total, onChange }: { page: number; limit: number; total: number; onChange: (page: number) => void }) {
  const pages = Math.max(1, Math.ceil(total / Math.max(1, limit)))
  if (total <= limit && page <= 1) return null
  const from = total ? (page - 1) * limit + 1 : 0
  const to = Math.min(total, page * limit)
  return (
    <div className="pagination">
      <span>
        {from}–{to} of {total.toLocaleString('en-IN')}
      </span>
      <div>
        <button type="button" className="secondary-button" disabled={page <= 1} onClick={() => onChange(page - 1)} aria-label="Previous page">
          <ChevronLeft size={15} />
        </button>
        <b>
          Page {page} of {pages}
        </b>
        <button type="button" className="secondary-button" disabled={page >= pages} onClick={() => onChange(page + 1)} aria-label="Next page">
          <ChevronRight size={15} />
        </button>
      </div>
    </div>
  )
}

export type NoticeState = { kind: 'success' | 'error'; text: string } | null

export function Notice({ notice, onDismiss }: { notice: NoticeState; onDismiss: () => void }) {
  if (!notice) return null
  return (
    <div className={`notice notice-${notice.kind}`} role={notice.kind === 'error' ? 'alert' : 'status'}>
      <span>{notice.text}</span>
      <button type="button" onClick={onDismiss} aria-label="Dismiss">
        <X size={14} />
      </button>
    </div>
  )
}

export function Modal({ title, subtitle, onClose, children, wide }: { title: string; subtitle?: string; onClose: () => void; children: ReactNode; wide?: boolean }) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      className="modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div className={wide ? 'modal modal-wide' : 'modal'} role="dialog" aria-modal="true" aria-label={title}>
        <div className="modal-heading">
          <div>
            <p className="eyebrow">{subtitle || 'Catalog management'}</p>
            <h2>{title}</h2>
          </div>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

/**
 * In-app confirmation dialog (replaces window.confirm/prompt). `onConfirm` may throw —
 * its message is shown inside the dialog; on success the dialog closes itself.
 */
export function ConfirmDialog({
  title,
  message,
  confirmLabel = 'Confirm',
  danger,
  reason,
  onConfirm,
  onClose,
}: {
  title: string
  message: ReactNode
  confirmLabel?: string
  danger?: boolean
  reason?: { label: string; required?: boolean; placeholder?: string }
  onConfirm: (reason: string) => Promise<void> | void
  onClose: () => void
}) {
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (reason?.required && !text.trim()) {
      setError(`${reason.label} is required`)
      return
    }
    setBusy(true)
    setError('')
    try {
      await onConfirm(text.trim())
      onClose()
    } catch (requestError) {
      setError(errorMessage(requestError))
      setBusy(false)
    }
  }

  return (
    <Modal title={title} subtitle="Please confirm" onClose={busy ? () => undefined : onClose}>
      <form className="modal-form" onSubmit={onSubmit}>
        <div className="confirm-message">{message}</div>
        {reason && (
          <label>
            {reason.label}
            {!reason.required && <span className="field-hint">optional</span>}
            <input value={text} onChange={(event) => setText(event.target.value)} placeholder={reason.placeholder} maxLength={300} autoFocus />
          </label>
        )}
        {error && <p className="login-error">{error}</p>}
        <div className="modal-actions">
          <button type="button" className="secondary-button" onClick={onClose} disabled={busy}>
            Cancel
          </button>
          <button type="submit" className={danger ? 'primary-button danger-button' : 'primary-button'} disabled={busy}>
            {busy ? 'Working…' : confirmLabel}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export function EmptyState({ text }: { text: string }) {
  return <p className="empty-state">{text}</p>
}

/** Table body placeholder row for loading / error / empty states. */
export function TableMessage({ colSpan, loading, error, empty }: { colSpan: number; loading: boolean; error: string; empty: string }) {
  return (
    <tr>
      <td colSpan={colSpan} className="empty-state">
        {loading ? 'Loading…' : error ? error : empty}
      </td>
    </tr>
  )
}
