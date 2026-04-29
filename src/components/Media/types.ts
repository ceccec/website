import type { StaticImageData } from 'next/image'
import type { TypedUploadCollection, UploadCollectionSlug } from 'payload'
import type { ElementType, Ref } from 'react'

export interface Props {
  alt?: string
  className?: string
  fill?: boolean // for NextImage only
  height?: null | number
  htmlElement?: ElementType | null
  imgClassName?: string
  onClick?: () => void
  onLoad?: () => void
  priority?: boolean // for NextImage only
  ref?: Ref<HTMLImageElement | HTMLVideoElement | null>
  /** Populated upload doc or numeric id when depth=0 */
  resource?: number | TypedUploadCollection[UploadCollectionSlug]
  sizes?: string // for NextImage only
  src?: null | StaticImageData | string // for static media
  videoClassName?: string
  width?: null | number
}
