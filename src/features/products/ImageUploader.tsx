import { ImagePlus, X } from 'lucide-react'
import { useRef } from 'react'

type PendingImage = { file: File; previewUrl: string }

export function ImageUploader({
  existingImages,
  pendingImages,
  onRemoveExisting,
  onAddFiles,
  onRemovePending,
}: {
  existingImages: string[]
  pendingImages: PendingImage[]
  onRemoveExisting: (url: string) => void
  onAddFiles: (files: File[]) => void
  onRemovePending: (index: number) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <div className="image-uploader">
      <div className="image-grid">
        {existingImages.map((url) => (
          <div className="image-tile" key={url}>
            <img src={url} alt="" />
            <button type="button" className="image-remove" onClick={() => onRemoveExisting(url)} aria-label="Remove image">
              <X size={14} />
            </button>
          </div>
        ))}
        {pendingImages.map((image, index) => (
          <div className="image-tile" key={image.previewUrl}>
            <img src={image.previewUrl} alt="" />
            <button type="button" className="image-remove" onClick={() => onRemovePending(index)} aria-label="Remove image">
              <X size={14} />
            </button>
          </div>
        ))}
        <button type="button" className="image-add" onClick={() => inputRef.current?.click()}>
          <ImagePlus size={20} />
          <span>Add photo</span>
        </button>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/avif"
        multiple
        hidden
        onChange={(event) => {
          const files = Array.from(event.target.files || [])
          if (files.length) onAddFiles(files)
          event.target.value = ''
        }}
      />
    </div>
  )
}

export type { PendingImage }
