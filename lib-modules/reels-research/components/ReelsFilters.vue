<script setup lang="ts">
import { useReelsResearchStore } from '../stores/reelsResearchStore'
import type { ReelsFilters } from '../types'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'

const store = useReelsResearchStore()

const categories: { value: ReelsFilters['category']; label: string }[] = [
  { value: 'all', label: 'Все' },
  { value: 'trending', label: 'Трендовые' },
  { value: 'educational', label: 'Обучающие' },
  { value: 'entertainment', label: 'Развлекательные' },
  { value: 'lifestyle', label: 'Лайфстайл' },
  { value: 'business', label: 'Бизнес' }
]

const sortOptions: { value: ReelsFilters['sortBy']; label: string }[] = [
  { value: 'views', label: 'Просмотры' },
  { value: 'likes', label: 'Лайки' },
  { value: 'comments', label: 'Комментарии' }
]

function handleCategoryChange(category: ReelsFilters['category']) {
  store.setCategory(category)
}

</script>

<template>
  <div class="flex flex-wrap items-center justify-between gap-4 px-6 py-3 border-b border-border bg-card">
    <!-- Category buttons -->
    <div class="flex flex-wrap items-center gap-2">
      <button
        v-for="category in categories"
        :key="category.value"
        :class="[
          'px-3 py-1.5 text-sm rounded-full transition-all',
          store.filters.category === category.value
            ? 'bg-primary text-primary-foreground'
            : 'bg-secondary text-muted-foreground hover:bg-accent hover:text-foreground'
        ]"
        @click="handleCategoryChange(category.value)"
      >
        {{ category.label }}
      </button>
    </div>

    <!-- Sort dropdown -->
    <div class="flex items-center gap-2">
      <span class="text-sm text-muted-foreground">Сортировка:</span>
      <Select :model-value="store.filters.sortBy" @update:model-value="(v) => store.setSortBy(v as ReelsFilters['sortBy'])">
        <SelectTrigger class="w-[140px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem
            v-for="option in sortOptions"
            :key="option.value"
            :value="option.value"
          >
            {{ option.label }}
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  </div>
</template>
