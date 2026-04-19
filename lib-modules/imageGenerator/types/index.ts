import type { GeneratedImageStatus, SignedAssetDto } from '~/scripts/shared/types/workspace'

export type ImageHistoryItem = {
    id: string
    prompt: string
    aspectRatio: string
    success: boolean
    status?: GeneratedImageStatus
    resultObjectId?: string | null
    result?: SignedAssetDto | null
    createdAt: string
    // Legacy fields for backwards compatibility
    accessHash?: string | null
    model?: string | null
}
