const inr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2, minimumFractionDigits: 0 })
const inrCompact = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', notation: 'compact', maximumFractionDigits: 1 })

export function formatINR(value: number | null | undefined) {
    return inr.format(Number(value) || 0)
}

export function formatINRCompact(value: number | null | undefined) {
    return inrCompact.format(Number(value) || 0)
}

export function formatNumber(value: number | null | undefined) {
    return (Number(value) || 0).toLocaleString('en-IN')
}

export function formatDate(value: string | null | undefined, fallback = '—') {
    if (!value) return fallback
    const date = new Date(value)
    return Number.isNaN(date.getTime()) ? fallback : date.toLocaleDateString('en-IN', { dateStyle: 'medium' })
}

export function formatDateTime(value: string | null | undefined, fallback = '—') {
    if (!value) return fallback
    const date = new Date(value)
    return Number.isNaN(date.getTime()) ? fallback : date.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
}

export function initials(name: string | null | undefined) {
    const parts = String(name || '').trim().split(/\s+/).filter(Boolean)
    if (!parts.length) return '?'
    return parts
        .slice(0, 2)
        .map((part) => part[0]!.toUpperCase())
        .join('')
}

export function greeting(date = new Date()) {
    const hour = date.getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
}
