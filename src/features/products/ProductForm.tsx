import { useEffect, useState, type FormEvent } from 'react'
import { Modal } from '../../components/ui'
import { useAuth } from '../../context/AuthContext'
import { ImageUploader, type PendingImage } from './ImageUploader'
import { SizeStockEditor } from './SizeStockEditor'
import { createAdminProduct, updateAdminProduct } from './api'
import { PRODUCT_CATEGORIES, type AdminProduct, type SizeStockEntry } from './types'

export function ProductForm({
    product,
    onClose,
    onSaved,
}: {
    product: AdminProduct | null
    onClose: () => void
    onSaved: () => void
}) {
    const { token } = useAuth()
    const isEditing = Boolean(product)

    const [name, setName] = useState(product?.name ?? '')
    const [brand, setBrand] = useState(product?.brand ?? '')
    const [category, setCategory] = useState(product?.category ?? PRODUCT_CATEGORIES[0])
    const [price, setPrice] = useState(product ? String(product.price) : '')
    const [originalPrice, setOriginalPrice] = useState(product?.originalPrice ? String(product.originalPrice) : '')
    const [description, setDescription] = useState(product?.description ?? '')
    const [detailsText, setDetailsText] = useState((product?.details ?? []).join('\n'))
    const [materialText, setMaterialText] = useState((product?.materialAndFit ?? []).join('\n'))
    const [colorsText, setColorsText] = useState((product?.colors ?? []).join(', '))
    const [isNewProduct, setIsNewProduct] = useState(Boolean(product?.isNew))
    const [sizeStock, setSizeStock] = useState<SizeStockEntry[]>(
        product?.sizeStock?.length ? product.sizeStock : [{ size: '', stock: 0 }],
    )
    const [existingImages, setExistingImages] = useState<string[]>(product?.images ?? [])
    const [pendingImages, setPendingImages] = useState<PendingImage[]>([])
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        return () => {
            pendingImages.forEach((image) => URL.revokeObjectURL(image.previewUrl))
        }
    }, [pendingImages])

    const addFiles = (files: File[]) => {
        setPendingImages((current) => [...current, ...files.map((file) => ({ file, previewUrl: URL.createObjectURL(file) }))])
    }
    const removePending = (index: number) => {
        setPendingImages((current) => {
            const target = current[index]
            if (target) URL.revokeObjectURL(target.previewUrl)
            return current.filter((_, i) => i !== index)
        })
    }
    const removeExisting = (url: string) => setExistingImages((current) => current.filter((item) => item !== url))

    const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setError('')

        const cleanSizeStock = sizeStock.filter((row) => row.size.trim())
        if (!existingImages.length && !pendingImages.length) {
            setError('Add at least one product image')
            return
        }

        const formData = new FormData()
        formData.append('name', name.trim())
        formData.append('brand', brand.trim())
        formData.append('category', category)
        formData.append('price', price)
        if (originalPrice) formData.append('originalPrice', originalPrice)
        formData.append('description', description.trim())
        formData.append('details', JSON.stringify(detailsText.split('\n').map((line) => line.trim()).filter(Boolean)))
        formData.append('materialAndFit', JSON.stringify(materialText.split('\n').map((line) => line.trim()).filter(Boolean)))
        formData.append('colors', JSON.stringify(colorsText.split(',').map((item) => item.trim()).filter(Boolean)))
        formData.append('sizeStock', JSON.stringify(cleanSizeStock))
        formData.append('existingImages', JSON.stringify(existingImages))
        formData.append('isNewProduct', String(isNewProduct))
        pendingImages.forEach((image) => formData.append('images', image.file))

        setSubmitting(true)
        try {
            if (isEditing && product) {
                await updateAdminProduct(token, product.id, formData)
            } else {
                await createAdminProduct(token, formData)
            }
            onSaved()
            onClose()
        } catch (requestError) {
            setError(requestError instanceof Error ? requestError.message : 'Could not save product')
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <Modal title={isEditing ? 'Edit product' : 'Add a product'} onClose={onClose} wide>
            <form className="modal-form product-form" onSubmit={onSubmit}>
                <label>
                    Product name
                    <input value={name} onChange={(event) => setName(event.target.value)} required placeholder="Essential Overshirt" />
                </label>

                <div className="form-row">
                    <label>
                        Brand
                        <input value={brand} onChange={(event) => setBrand(event.target.value)} required placeholder="QIO Studio" />
                    </label>
                    <label>
                        Category
                        <select value={category} onChange={(event) => setCategory(event.target.value)}>
                            {PRODUCT_CATEGORIES.map((item) => (
                                <option key={item} value={item}>
                                    {item}
                                </option>
                            ))}
                        </select>
                    </label>
                </div>

                <div className="form-row">
                    <label>
                        Marked price (₹)
                        <input
                            type="number"
                            min={0}
                            value={originalPrice}
                            onChange={(event) => setOriginalPrice(event.target.value)}
                            placeholder="1999"
                        />
                    </label>
                    <label>
                        Selling price (₹)
                        <input
                            type="number"
                            min={0}
                            required
                            value={price}
                            onChange={(event) => setPrice(event.target.value)}
                            placeholder="1499"
                        />
                    </label>
                </div>

                <label>
                    Description
                    <textarea
                        value={description}
                        onChange={(event) => setDescription(event.target.value)}
                        rows={2}
                        placeholder="Short summary shown under the product name"
                    />
                </label>

                <label>
                    Product details <span className="field-hint">one point per line</span>
                    <textarea
                        value={detailsText}
                        onChange={(event) => setDetailsText(event.target.value)}
                        rows={4}
                        placeholder={'Peach White\nFleece Texture\nHalf Sleeves'}
                    />
                </label>

                <label>
                    Material &amp; fit <span className="field-hint">one point per line</span>
                    <textarea
                        value={materialText}
                        onChange={(event) => setMaterialText(event.target.value)}
                        rows={3}
                        placeholder={'Regular Fit\n100% Cotton\nMachine Wash'}
                    />
                </label>

                <label>
                    Colors <span className="field-hint">comma separated hex or names</span>
                    <input value={colorsText} onChange={(event) => setColorsText(event.target.value)} placeholder="#1A1A1A, #FFFFFF" />
                </label>

                <div>
                    <p className="field-label">Size chart &amp; stock</p>
                    <SizeStockEditor rows={sizeStock} onChange={setSizeStock} />
                </div>

                <div>
                    <p className="field-label">Product images</p>
                    <ImageUploader
                        existingImages={existingImages}
                        pendingImages={pendingImages}
                        onRemoveExisting={removeExisting}
                        onAddFiles={addFiles}
                        onRemovePending={removePending}
                    />
                </div>

                <label className="checkbox-row">
                    <input type="checkbox" checked={isNewProduct} onChange={(event) => setIsNewProduct(event.target.checked)} />
                    Mark as new arrival
                </label>

                {error && <p className="login-error">{error}</p>}

                <div className="modal-actions">
                    <button type="button" className="secondary-button" onClick={onClose}>
                        Cancel
                    </button>
                    <button type="submit" className="primary-button" disabled={submitting}>
                        {submitting ? 'Saving…' : isEditing ? 'Save changes' : 'Create product'}
                    </button>
                </div>
            </form>
        </Modal>
    )
}
