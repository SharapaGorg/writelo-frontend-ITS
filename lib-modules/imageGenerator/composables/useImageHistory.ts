import { ApiController } from '~/scripts/shared/api/controller'
import { useDemoMode, demoImageHistoryItem, isDemoImage, DEMO_IMAGE_OUTPUT_URL } from '~/lib-modules/demo-mode'
import { useWorkspaceContext } from '~/lib-modules/workspaces'
import type { ImageHistoryItem } from '../types'
import type { GeneratedImageDto } from '~/scripts/shared/types/workspace'

const $api = new ApiController()

const images = ref<ImageHistoryItem[]>([])
const isLoading = ref(false)
const hasMore = ref(true)
const isInitialized = ref(false)

const LIMIT = 20

// Adapter to convert new API format to local format
function adaptImage(dto: GeneratedImageDto): ImageHistoryItem {
    return {
        id: dto.id,
        prompt: dto.prompt,
        aspectRatio: dto.aspectRatio,
        success: dto.success,
        status: dto.status,
        resultObjectId: dto.resultObjectId,
        result: dto.result,
        createdAt: dto.createdAt,
        // Legacy fields for backwards compatibility
        accessHash: undefined,
        model: undefined,
    }
}

export const useImageHistory = () => {
    const { isDemoMode } = useDemoMode()

    const fetchImages = async (reset: boolean = false) => {
        // In demo mode, show demo image in history
        if (isDemoMode.value) {
            images.value = [demoImageHistoryItem]
            isInitialized.value = true
            hasMore.value = false
            return
        }

        if (isLoading.value || (!hasMore.value && !reset)) return

        if (reset) {
            images.value = []
            hasMore.value = true
        }

        // Get workspace ID
        const workspaceContext = useWorkspaceContext()
        if (!workspaceContext.isReady.value) {
            console.warn('[useImageHistory] Workspace context not ready')
            return
        }
        const workspaceId = workspaceContext.currentWorkspaceId.value!

        isLoading.value = true

        try {
            const offset = reset ? 0 : images.value.length
            const response = await $api.getWorkspaceImageHistory(workspaceId, offset, LIMIT)

            if (!response.hasMore) {
                hasMore.value = false
            }

            const adapted = response.items.map(adaptImage)
            images.value = [...images.value, ...adapted]
            isInitialized.value = true
        } catch (e) {
            console.error('Failed to fetch image history:', e)
        } finally {
            isLoading.value = false
        }
    }

    const getImageUrl = (image: ImageHistoryItem): string | null => {
        // New API format - use signed URL from result
        if (image.result?.url) {
            return image.result.url
        }

        // Return demo image URL for demo images
        if (isDemoImage(image.id)) {
            return DEMO_IMAGE_OUTPUT_URL
        }

        // Legacy format with accessHash (deprecated)
        if (image.accessHash) {
            return `${$api['domain']}/images/${image.id}_${image.accessHash}`
        }

        return null
    }

    const addToHistory = (image: ImageHistoryItem) => {
        images.value = [image, ...images.value]
    }

    /**
     * Clear history (on workspace change or logout)
     */
    const clear = () => {
        images.value = []
        hasMore.value = true
        isInitialized.value = false
    }

    return {
        images: computed(() => images.value),
        isLoading: computed(() => isLoading.value),
        hasMore: computed(() => hasMore.value),
        isInitialized: computed(() => isInitialized.value),
        fetchImages,
        getImageUrl,
        addToHistory,
        clear,
    }
}
