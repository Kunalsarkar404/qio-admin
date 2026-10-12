import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Modal } from '../../components/ui'
import { useApiData } from '../../hooks/useApiData'
import { errorMessage } from '../../lib/apiClient'
import { listAdminBrands } from '../brands/api'
import { ImageUploader, type PendingImage } from './ImageUploader'
import { SizeStockEditor } from './SizeStockEditor'
import { createAdminProduct, updateAdminProduct } from './api'
import {
    ALLOWED_IMAGE_TYPES,
    MAX_IMAGE_BYTES,
    MAX_PRODUCT_IMAGES,
    PRODUCT_CATEGORIES,
    type AdminProduct,
    type SizeStockEntry,
    PRODUCT_GENDERS,
    type ProductGender,
} from './types'

const splitLines = (text: string) =>
    text
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)

export function ProductForm({
    product,
    categories,
    onClose,
    onSaved,
}: {
    product: AdminProduct | null
    categories?: string[]
    onClose: () => void
    onSaved: (message: string) => void
}) {
    const isEditing = Boolean(product)
    const categoryOptions = categories?.length ? categories : [...PRODUCT_CATEGORIES]
    const brandsQuery = useApiData('brands', listAdminBrands)
    const activeBrands = (brandsQuery.data?.brands ?? []).filter((item) => item.isActive).map((item) => item.name)

    const [name, setName] = useState(product?.name ?? '')
    const [brand, setBrand] = useState(product?.brand ?? '')
    const [category, setCategory] = useState(product?.category ?? categoryOptions[0] ?? '')
    const [gender, setGender] = useState<ProductGender>(product?.gender ?? 'Unisex')
    const [price, setPrice] = useState(product ? String(product.price) : '')
    const [originalPrice, setOriginalPrice] = useState(product?.originalPrice ? String(product.originalPrice) : '')
    const [description, setDescription] = useState(product?.description ?? '')
    const [detailsText, setDetailsText] = useState((product?.details ?? []).join('\n'))
    const [materialText, setMaterialText] = useState((product?.materialAndFit ?? []).join('\n'))
    const [colorsText, setColorsText] = useState((product?.colors ?? []).join(', '))
    const [isNewProduct, setIsNewProduct] = useState(Boolean(product?.isNew))
    const [isActive, setIsActive] = useState(product?.isActive ?? true)
    const [sizeStock, setSizeStock] = useState<SizeStockEntry[]>(product?.sizeStock?.length ? product.sizeStock : [{ size: '', stock: 0 }])
    const [existingImages, setExistingImages] = useState<string[]>(product?.images ?? [])
    const [pendingImages, setPendingImages] = useState<PendingImage[]>([])
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState('')

    // Revoke preview URLs only when the form unmounts; individual removals revoke their own URL.
    const pendingRef = useRef<PendingImage[]>([])
    useEffect(() => {
        pendingRef.current = pendingImages
    }, [pendingImages])
    useEffect(
        () => () => {
            pendingRef.current.forEach((image) => URL.revokeObjectURL(image.previewUrl))
        },
        [],
    )

    const addFiles = (files: File[]) => {
        const problems: string[] = []
        const accepted: File[] = []
        let room = MAX_PRODUCT_IMAGES - existingImages.length - pendingImages.length
        for (const file of files) {
            if (!ALLOWED_IMAGE_TYPES.includes(file.type)) problems.push(`${file.name}: only JPEG, PNG, WEBP or AVIF images are allowed`)
            else if (file.size > MAX_IMAGE_BYTES) problems.push(`${file.name}: larger than 5 MB`)
            else if (room <= 0) problems.push(`${file.name}: a product can have at most ${MAX_PRODUCT_IMAGES} images`)
            else {
                accepted.push(file)
                room -= 1
            }
        }
        setError(problems.join('. '))
        if (accepted.length) {
            setPendingImages((current) => [...current, ...accepted.map((file) => ({ file, previewUrl: URL.createObjectURL(file) }))])
        }
    }
    const removePending = (index: number) => {
        const target = pendingImages[index]
        if (target) URL.revokeObjectURL(target.previewUrl)
        setPendingImages((current) => current.filter((_, i) => i !== index))
    }
    const removeExisting = (url: string) => setExistingImages((current) => current.filter((item) => item !== url))

    const validate = () => {
        if (!name.trim()) return 'Product name is required'
        if (!brand.trim()) return 'Choose a brand'
        if (!categoryOptions.includes(category)) return 'Choose a category'
        const sellingPrice = Number(price)
        if (!Number.isFinite(sellingPrice) || sellingPrice <= 0) return 'Selling price must be greater than 0'
        if (originalPrice.trim()) {
            const marked = Number(originalPrice)
            if (!Number.isFinite(marked) || marked < sellingPrice) return 'Marked price must be greater than or equal to the selling price'
        }
        const rows = sizeStock.filter((row) => row.size.trim())
        if (!rows.length) return 'Add at least one size with its stock'
        const seen = new Set<string>()
        for (const row of rows) {
            const key = row.size.trim().toLowerCase()
            if (seen.has(key)) return `Size "${row.size.trim()}" is listed more than once`
            seen.add(key)
        }
        const totalImages = existingImages.length + pendingImages.length
        if (!totalImages) return 'Add at least one product image'
        if (totalImages > MAX_PRODUCT_IMAGES) return `A product can have at most ${MAX_PRODUCT_IMAGES} images`
        for (const image of pendingImages) {
            if (!ALLOWED_IMAGE_TYPES.includes(image.file.type)) return `${image.file.name}: unsupported image type`
            if (image.file.size > MAX_IMAGE_BYTES) return `${image.file.name}: larger than 5 MB`
        }
        return ''
    }

    const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        const problem = validate()
        setError(problem)
        if (problem) return

        const cleanSizeStock = sizeStock.filter((row) => row.size.trim()).map((row) => ({ size: row.size.trim(), stock: row.stock }))
        const formData = new FormData()
        formData.append('name', name.trim())
        formData.append('brand', brand.trim())
        formData.append('category', category)
        formData.append('gender', gender)
        formData.append('price', price)
        if (originalPrice.trim()) formData.append('originalPrice', originalPrice)
        formData.append('description', description.trim())
        formData.append('details', JSON.stringify(splitLines(detailsText)))
        formData.append('materialAndFit', JSON.stringify(splitLines(materialText)))
        formData.append('colors', JSON.stringify(colorsText.split(',').map((item) => item.trim()).filter(Boolean)))
        formData.append('sizeStock', JSON.stringify(cleanSizeStock))
        formData.append('existingImages', JSON.stringify(existingImages))
        formData.append('isNewProduct', String(isNewProduct))
        formData.append('isActive', String(isActive))
        pendingImages.forEach((image) => formData.append('images', image.file))

        setSubmitting(true)
        try {
            if (isEditing && product) await updateAdminProduct(product.id, formData)
            else await createAdminProduct(formData)
            onSaved(`${name.trim()} ${isEditing ? 'updated' : 'created'}.`)
            onClose()
        } catch (requestError) {
            setError(errorMessage(requestError, 'Could not save product'))
        } finally {
            setSubmitting(false)
        }
    }

    const brandOptions = brand && !activeBrands.includes(brand) ? [brand, ...activeBrands] : activeBrands

    return (
        <Modal title={isEditing ? 'Edit product' : 'Add a product'} onClose={onClose} wide>
            <form className="modal-form product-form" onSubmit={onSubmit} noValidate>
                <label>
                    Product name
                    <input value={name} onChange={(event) => setName(event.target.value)} required placeholder="Essential Overshirt" />
                </label>

                <div className="form-row">
                    <label>
                        Brand
                        <select value={brand} onChange={(event) => setBrand(event.target.value)} required>
                            <option value="" disabled>
                                {brandsQuery.loading && !brandsQuery.data ? 'Loading brands…' : 'Select a brand'}
                            </option>
                            {brandOptions.map((item) => (
                                <option key={item} value={item}>
                                    {item}
                                    {!activeBrands.includes(item) ? ' (inactive or removed)' : ''}
                                </option>
                            ))}
                        </select>
                        {brandsQuery.error && <span className="field-hint">Could not load brands: {brandsQuery.error}</span>}
                    </label>
                    <label>
                        Category
                        <select value={category} onChange={(event) => setCategory(event.target.value)}>
                            {categoryOptions.map((item) => (
                                <option key={item} value={item}>
                                    {item}
                                </option>
                            ))}
                        </select>
                    </label>
                    <label>
                        Gender
                        <select value={gender} onChange={(event) => setGender(event.target.value as ProductGender)}>
                            {PRODUCT_GENDERS.map((item) => (
                                <option key={item} value={item}>
                                    {item === 'Unisex' ? 'Unisex (Men & Women)' : item}
                                </option>
                            ))}
                        </select>
                    </label>
                </div>

                <div className="form-row">
                    <label>
                        Marked price (₹) <span className="field-hint">optional, ≥ selling price</span>
                        <input type="number" min={0} step="any" value={originalPrice} onChange={(event) => setOriginalPrice(event.target.value)} placeholder="1999" />
                    </label>
                    <label>
                        Selling price (₹)
                        <input type="number" min={0} step="any" required value={price} onChange={(event) => setPrice(event.target.value)} placeholder="1499" />
                    </label>
                </div>

                <label>
                    Description
                    <textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={2} placeholder="Short summary shown under the product name" />
                </label>

                <label>
                    Product details <span className="field-hint">one point per line</span>
                    <textarea value={detailsText} onChange={(event) => setDetailsText(event.target.value)} rows={4} placeholder={'Peach White\nFleece Texture\nHalf Sleeves'} />
                </label>

                <label>
                    Material &amp; fit <span className="field-hint">one point per line</span>
                    <textarea value={materialText} onChange={(event) => setMaterialText(event.target.value)} rows={3} placeholder={'Regular Fit\n100% Cotton\nMachine Wash'} />
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
                    <p className="field-label">
                        Product images <span className="field-hint">up to {MAX_PRODUCT_IMAGES} · JPEG, PNG, WEBP or AVIF · 5 MB each</span>
                    </p>
                    <ImageUploader
                        existingImages={existingImages}
                        pendingImages={pendingImages}
                        onRemoveExisting={removeExisting}
                        onAddFiles={addFiles}
                        onRemovePending={removePending}
                        canAdd={existingImages.length + pendingImages.length < MAX_PRODUCT_IMAGES}
                    />
                </div>

                <label className="checkbox-row">
                    <input type="checkbox" checked={isNewProduct} onChange={(event) => setIsNewProduct(event.target.checked)} />
                    Mark as new arrival
                </label>
                <label className="checkbox-row">
                    <input type="checkbox" checked={isActive} onChange={(event) => setIsActive(event.target.checked)} />
                    Active (visible in the store)
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
