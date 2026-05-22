<script setup lang="ts">
import { computed } from 'vue'
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
  { value: 'most_viral' as const, label: 'Самые вирусные', icon: Rocket, iconClass: 'text-orange-500' },
  { value: 'newest' as const, label: 'Сначала новые', icon: Calendar, iconClass: 'text-emerald-600' },
  { value: 'most_plays' as const, label: 'Больше проигрываний', icon: Play, iconClass: 'text-blue-500' },
  { value: 'most_likes' as const, label: 'Больше лайков', icon: Heart, iconClass: 'text-rose-500' },
  { value: 'most_comments' as const, label: 'Больше комментариев', icon: MessageCircle, iconClass: 'text-amber-600' },
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

const searchModel = computed({
  get: () => store.filters.search,
  set: (v: string | number) => store.setSearch(String(v))
})

const triggerClass =
  'group flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-sm font-medium text-foreground ' +
  'hover:bg-accent transition-colors data-[state=open]:bg-accent ' +
  'data-[state=open]:ring-1 data-[state=open]:ring-ring outline-none'

const activeTriggerClass = (active: boolean) =>
  active ? 'ring-1 ring-ring bg-accent/60' : ''
</script>

<template>
  <div class="flex flex-wrap items-center gap-2">
    <!-- Search -->
    <div class="relative flex-1 min-w-[220px] max-w-sm">
      <Search class="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
      <Input
        v-model="searchModel"
        placeholder="Поиск по описанию или автору"
        class="pl-8"
      />
    </div>

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
</template>
