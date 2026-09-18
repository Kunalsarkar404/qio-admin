import { ArrowUpRight, ChevronDown, Plus, X, type LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

export function Metric({ icon, label, value, change }: { icon: ReactNode; label: string; value: string; change?: string }) {
  return (
    <article className="metric-card">
      <div className="metric-top">
        <span className="metric-icon">{icon}</span>
        {change && (
          <span className="metric-change positive">
            <ArrowUpRight size={14} /> {change}
          </span>
        )}
      </div>
      <p>{label}</p>
      <strong>{value}</strong>
      <small>vs. previous period</small>
    </article>
  )
}

export function PanelHeading({ title, detail, action }: { title: string; detail: string; action?: string }) {
  return (
    <div className="panel-heading">
      <div>
        <h2>{title}</h2>
        <p>{detail}</p>
      </div>
      {action && (
        <button type="button">
          {action} <ChevronDown size={14} />
        </button>
      )}
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

export function StatusPill({ status }: { status: string }) {
  return <span className={`status-pill ${status.toLowerCase().replaceAll(' ', '-')}`}>{status}</span>
}

export function ProductCell({ name, brand, image }: { name: string; brand: string; image?: string }) {
  return (
    <div className="product-cell">
      <div className="product-thumb">
        {image ? <img src={image} alt="" /> : null}
      </div>
      <div>
        <strong>{name}</strong>
        <span>{brand}</span>
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

export function Modal({ title, subtitle, onClose, children, wide }: { title: string; subtitle?: string; onClose: () => void; children: ReactNode; wide?: boolean }) {
  return (
    <div className="modal-backdrop">
      <div className={wide ? 'modal modal-wide' : 'modal'}>
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

export function EmptyState({ text }: { text: string }) {
  return <p className="empty-state">{text}</p>
}
