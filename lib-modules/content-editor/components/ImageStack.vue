<script setup lang="ts">
import { ref, computed } from 'vue'
import { Plus, X } from 'lucide-vue-next'
import { Button } from '~/components/ui/button'
import { cn } from '~/lib-modules/utils'

const props = withDefaults(defineProps<{
  images: string[]
  maxImages?: number
}>(), {
  maxImages: 14
})

const emit = defineEmits<{
  add: [file: File]
  remove: [index: number]
}>()

const activeIndex = ref(0)
const fileInput = ref<HTMLInputElement | null>(null)

const canAddMore = computed(() => props.images.length < props.maxImages)
const counterText = computed(() => `${props.images.length}/${props.maxImages}`)

// Reset active index if it exceeds bounds
watch(() => props.images.length, (newLength) => {
  if (activeIndex.value >= newLength && newLength > 0) {
    activeIndex.value = newLength - 1
  }
})

const bringToFront = (index: number) => {
  activeIndex.value = index
}

const handleAddClick = () => {
  fileInput.value?.click()
}

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  const files = target.files
  if (files && files.length > 0) {
    emit('add', files[0])
    // Reset input so same file can be selected again
    target.value = ''
  }
}

const handleRemove = (index: number, event: Event) => {
  event.stopPropagation()
  emit('remove', index)
}

// Calculate card offset and scale based on position relative to active card
const getCardStyle = (index: number) => {
  const diff = index - activeIndex.value
  const offset = diff * 24 // 24px offset between cards
  const scale = index === activeIndex.value ? 1 : 0.92
  const zIndex = props.images.length - Math.abs(diff)
  const opacity = Math.abs(diff) > 3 ? 0.5 : 1

  return {
    transform: `translateX(${offset}px) scale(${scale})`,
    zIndex,
    opacity
  }
}
</script>

<template>
  <div class="flex flex-col items-center gap-4">
    <!-- Stack container -->
    <div class="relative h-48 w-full flex items-center justify-center">
      <!-- Empty state -->
      <div
        v-if="images.length === 0"
        class="flex h-40 w-32 items-center justify-center rounded-md border-2 border-dashed border-border"
      >
        <button
          @click="handleAddClick"
          class="flex flex-col items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <Plus class="h-8 w-8" />
          <span class="text-xs">{{ $t('editor.imageStack.addPhoto') }}</span>
        </button>
      </div>

      <!-- Stacked cards -->
      <div v-else class="relative">
        <div
          v-for="(image, index) in images"
          :key="index"
          :style="getCardStyle(index)"
          :class="cn(
            'absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-200 ease-out',
            index === activeIndex ? 'shadow-xl' : 'shadow-md'
          )"
          @click="bringToFront(index)"
        >
          <div class="relative h-40 w-32 overflow-hidden rounded-md bg-muted">
            <img
              :src="image"
              :alt="`Photo ${index + 1}`"
              class="h-full w-full object-cover"
            />
            <!-- Remove button (only on active card) -->
            <button
              v-if="index === activeIndex"
              @click="handleRemove(index, $event)"
              class="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
            >
              <X class="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Navigation dots -->
    <div v-if="images.length > 1" class="flex items-center gap-1.5">
      <button
        v-for="(_, index) in images"
        :key="index"
        @click="bringToFront(index)"
        :class="cn(
          'h-2 w-2 rounded-full transition-colors',
          index === activeIndex
            ? 'bg-primary'
            : 'bg-border hover:bg-muted-foreground'
        )"
      />
    </div>

    <!-- Add button and counter -->
    <div class="flex items-center gap-3">
      <Button
        v-if="canAddMore"
        variant="outline"
        size="sm"
        @click="handleAddClick"
        class="gap-1.5"
      >
        <Plus class="h-4 w-4" />
        {{ $t('editor.imageStack.addPhoto') }}
      </Button>
      <span class="text-sm text-muted-foreground">
        {{ counterText }}
      </span>
    </div>

    <!-- Hidden file input -->
    <input
      ref="fileInput"
      type="file"
      accept="image/*"
      class="hidden"
      @change="handleFileChange"
    />
  </div>
</template>
