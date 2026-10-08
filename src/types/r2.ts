import type { CategorySlug, MugType } from './index'

export interface R2Model {
  key: string
  id: string
  slug: string
  name: string
  category: CategorySlug
  mugType?: MugType
  url: string
}

export interface R2ModelPage {
  models: R2Model[]
  scanned: number
  nextCursor: string | null
}
