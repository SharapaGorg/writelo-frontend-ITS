<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import {
  ChevronDown,
  Rocket,
  Calendar,
  Play,
  Heart,
  MessageCircle,
  Search,
  Check,
  Users,
  Clock,
  SlidersHorizontal,
} from 'lucide-vue-next'
import { useReelsResearchStore } from '../stores/reelsResearchStore'
import { Input } from '~/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '~/components/ui/dropdown-menu'
import { cn } from '~/lib-modules/utils'

const store = useReelsResearchStore()

const sortOptions = [
  { value: 'newest' as const, label: 'Сначала новые', icon: Calendar, iconClass: 'text-emerald-600' },
  { value: 'rank_score' as const, label: 'Самые вирусные', icon: Rocket, iconClass: 'text-orange-500' },
  { value: 'plays' as const, label: 'Больше проигрываний', icon: Play, iconClass: 'text-blue-500' },
  { value: 'views' as const, label: 'Больше просмотров', icon: Play, iconClass: 'text-sky-500' },
  { value: 'likes' as const, label: 'Больше лайков', icon: Heart, iconClass: 'text-rose-500' },
  { value: 'comments' as const, label: 'Больше комментариев', icon: MessageCircle, iconClass: 'text-amber-600' },
]

const durationOptions = [
  { value: 'all' as const, label: 'Любая длительность' },
  { value: 'short' as const, label: 'До 15 сек' },
  { value: 'medium' as const, label: '15–30 сек' },
  { value: 'long' as const, label: '30–60 сек' },
  { value: 'xlong' as const, label: 'Больше 60 сек' },
]

const authorSizeOptions = [
  { value: 'all' as const, label: 'Любые авторы', short: 'Размер автора' },
  { value: 'micro' as const, label: 'Микро (< 10K)', short: 'Микро' },
  { value: 'small' as const, label: 'Малые (10K – 100K)', short: '10K – 100K' },
  { value: 'medium' as const, label: 'Средние (100K – 1M)', short: '100K – 1M' },
  { value: 'large' as const, label: 'Крупные (> 1M)', short: '> 1M' },
]

const postedRangeOptions = [
  { value: 'all' as const, label: 'За всё время', short: 'Когда опубликовано' },
  { value: '24h' as const, label: 'За 24 часа', short: '24 часа' },
  { value: '7d' as const, label: 'За 7 дней', short: '7 дней' },
  { value: '30d' as const, label: 'За 30 дней', short: '30 дней' },
  { value: '90d' as const, label: 'За 90 дней', short: '90 дней' },
]

const activeSort = computed(() =>
  sortOptions.find(o => o.value === store.filters.sortBy) ?? sortOptions[0]
)
const activeDuration = computed(() =>
  durationOptions.find(o => o.value === store.filters.duration) ?? durationOptions[0]
)
const activeAuthorSize = computed(() =>
  authorSizeOptions.find(o => o.value === store.filters.authorSize) ?? authorSizeOptions[0]
)
const activePostedRange = computed(() =>
  postedRangeOptions.find(o => o.value === store.filters.postedRange) ?? postedRangeOptions[0]
)

const durationTriggerLabel = computed(() =>
  store.filters.duration === 'all' ? 'Длительность' : activeDuration.value.label
)
const authorSizeTriggerLabel = computed(() => activeAuthorSize.value.short)
const postedRangeTriggerLabel = computed(() => activePostedRange.value.short)

// Search drives the server-side `q` filter — debounce so each keystroke
// doesn't reset the cursor + refetch.
let searchTimer: ReturnType<typeof setTimeout> | null = null
const searchModel = computed({
  get: () => store.filters.search,
  set: (v: string | number) => {
    store.setSearch(String(v))
    if (searchTimer) clearTimeout(searchTimer)
    searchTimer = setTimeout(() => store.commitSearch(), 350)
  },
})
onBeforeUnmount(() => {
  if (searchTimer) clearTimeout(searchTimer)
})

const triggerClass =
  'group flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-sm font-medium text-foreground ' +
  'hover:bg-accent transition-colors data-[state=open]:bg-accent ' +
  'data-[state=open]:ring-1 data-[state=open]:ring-ring outline-none'

const activeTriggerClass = (active: boolean) =>
  active ? 'ring-1 ring-ring bg-accent/60' : ''

const isExpanded = ref(false)
const activeNonSearchCount = computed(() => {
  let n = 0
  if (store.filters.duration !== 'all') n++
  if (store.filters.authorSize !== 'all') n++
  if (store.filters.postedRange !== 'all') n++
  if (store.filters.sortBy !== 'newest') n++
  return n
})
</script>

<template>
  <div class="flex flex-col gap-2">
    <!-- Row 1: search + mobile filters toggle -->
    <div class="flex items-center gap-2">
      <div class="relative flex-1 min-w-0 sm:max-w-sm">
        <Search class="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
        <Input
          v-model="searchModel"
          placeholder="Поиск по описанию или автору"
          class="pl-8"
        />
      </div>

      <button
        type="button"
        class="sm:hidden inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-sm font-medium text-foreground border border-border hover:bg-accent transition-colors flex-shrink-0"
        :aria-expanded="isExpanded"
        @click="isExpanded = !isExpanded"
      >
        <SlidersHorizontal class="size-4" />
        <span>Фильтры</span>
        <span
          v-if="activeNonSearchCount > 0"
          class="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-brand text-brand-foreground text-[10px] font-semibold leading-none"
        >
          {{ activeNonSearchCount }}
        </span>
        <ChevronDown
          class="size-4 text-muted-foreground transition-transform"
          :class="{ 'rotate-180': isExpanded }"
        />
      </button>
    </div>

    <!-- Row 2: dropdowns — collapsed on mobile by default, always visible on sm+ -->
    <div :class="[isExpanded ? 'flex' : 'hidden', 'sm:flex flex-wrap items-center gap-2']">
      <!-- Sort -->
    <DropdownMenu>
      <DropdownMenuTrigger as-child>
        <button type="button" :class="triggerClass">
          <component :is="activeSort.icon" :class="cn('size-4', activeSort.iconClass)" />
          <span>{{ activeSort.label }}</span>
          <ChevronDown class="size-4 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" class="w-56">
        <DropdownMenuItem
          v-for="option in sortOptions"
          :key="option.value"
          @select="store.setSortBy(option.value)"
        >
          <component :is="option.icon" :class="cn('size-4', option.iconClass)" />
          <span>{{ option.label }}</span>
          <Check v-if="store.filters.sortBy === option.value" class="size-4 ml-auto text-muted-foreground" />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>

    <!-- Author size -->
    <DropdownMenu>
      <DropdownMenuTrigger as-child>
        <button
          type="button"
          :class="[triggerClass, activeTriggerClass(store.filters.authorSize !== 'all')]"
        >
          <Users class="size-4 text-violet-500" />
          <span>{{ authorSizeTriggerLabel }}</span>
          <ChevronDown class="size-4 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" class="w-56">
        <DropdownMenuItem
          v-for="option in authorSizeOptions"
          :key="option.value"
          @select="store.setAuthorSize(option.value)"
        >
          <span>{{ option.label }}</span>
          <Check v-if="store.filters.authorSize === option.value" class="size-4 ml-auto text-muted-foreground" />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>

    <!-- Posted range -->
    <DropdownMenu>
      <DropdownMenuTrigger as-child>
        <button
          type="button"
          :class="[triggerClass, activeTriggerClass(store.filters.postedRange !== 'all')]"
        >
          <Clock class="size-4 text-emerald-500" />
          <span>{{ postedRangeTriggerLabel }}</span>
          <ChevronDown class="size-4 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" class="w-48">
        <DropdownMenuItem
          v-for="option in postedRangeOptions"
          :key="option.value"
          @select="store.setPostedRange(option.value)"
        >
          <span>{{ option.label }}</span>
          <Check v-if="store.filters.postedRange === option.value" class="size-4 ml-auto text-muted-foreground" />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>

    <!-- Duration (client-side bucket) -->
    <DropdownMenu>
      <DropdownMenuTrigger as-child>
        <button
          type="button"
          :class="[triggerClass, activeTriggerClass(store.filters.duration !== 'all')]"
        >
          <span>{{ durationTriggerLabel }}</span>
          <ChevronDown class="size-4 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" class="w-48">
        <DropdownMenuItem
          v-for="option in durationOptions"
          :key="option.value"
          @select="store.setDuration(option.value)"
        >
          <span>{{ option.label }}</span>
          <Check v-if="store.filters.duration === option.value" class="size-4 ml-auto text-muted-foreground" />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
    </div>
  </div>
</template>
