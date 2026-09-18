import { Plus, X } from 'lucide-react'
import type { SizeStockEntry } from './types'

/** Editable size chart — each row's stock count feeds the app's per-size availability. */
export function SizeStockEditor({ rows, onChange }: { rows: SizeStockEntry[]; onChange: (rows: SizeStockEntry[]) => void }) {
    const updateRow = (index: number, patch: Partial<SizeStockEntry>) => {
        onChange(rows.map((row, i) => (i === index ? { ...row, ...patch } : row)))
    }
    const removeRow = (index: number) => onChange(rows.filter((_, i) => i !== index))
    const addRow = () => onChange([...rows, { size: '', stock: 0 }])

    return (
        <div className="size-stock-editor">
            {rows.map((row, index) => (
                <div className="size-stock-row" key={index}>
                    <input
                        placeholder="Size (e.g. M)"
                        value={row.size}
                        onChange={(event) => updateRow(index, { size: event.target.value })}
                    />
                    <input
                        type="number"
                        min={0}
                        placeholder="Stock"
                        value={row.stock}
                        onChange={(event) => updateRow(index, { stock: Math.max(0, Number(event.target.value) || 0) })}
                    />
                    <button type="button" className="icon-button" onClick={() => removeRow(index)} aria-label="Remove size">
                        <X size={16} />
                    </button>
                </div>
            ))}
            <button type="button" className="secondary-button size-stock-add" onClick={addRow}>
                <Plus size={15} /> Add size
            </button>
        </div>
    )
}
