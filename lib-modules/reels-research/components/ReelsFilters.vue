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

function handleSortChange(sortBy: string) {
  store.setSortBy(sortBy as ReelsFilters['sortBy'])
}
</script>

<template>
  <div class="flex flex-wrap items-center justify-between gap-4 px-6 py-3 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-100/50 dark:bg-zinc-900/50">
    <!-- Category buttons -->
    <div class="flex flex-wrap items-center gap-2">
      <button
        v-for="category in categories"
        :key="category.value"
        :class="[
          'px-3 py-1.5 text-sm rounded-full transition-all',
          store.filters.category === category.value
            ? 'bg-purple-600 text-white'
            : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-300 dark:hover:bg-zinc-700 hover:text-zinc-900 dark:hover:text-white'
        ]"
        @click="handleCategoryChange(category.value)"
      >
        {{ category.label }}
      </button>
    </div>

    <!-- Sort dropdown -->
    <div class="flex items-center gap-2">
      <span class="text-sm text-zinc-500">Сортировка:</span>
      <Select :model-value="store.filters.sortBy" @update:model-value="handleSortChange">
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
