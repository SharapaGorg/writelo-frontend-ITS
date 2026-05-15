<script setup lang="ts">
import { computed } from 'vue'
import {
  ChevronDown,
  Rocket,
  Calendar,
  Eye,
  Heart,
  MessageCircle,
  Send,
  Search,
  Check,
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
  { value: 'viral' as const, label: 'Самые вирусные', icon: Rocket, iconClass: 'text-orange-500' },
  { value: 'newest' as const, label: 'Сначала новые', icon: Calendar, iconClass: 'text-emerald-600' },
  { value: 'views' as const, label: 'Больше просмотров', icon: Eye, iconClass: 'text-blue-500' },
  { value: 'likes' as const, label: 'Больше лайков', icon: Heart, iconClass: 'text-rose-500' },
  { value: 'comments' as const, label: 'Больше комментариев', icon: MessageCircle, iconClass: 'text-amber-600' },
  { value: 'reposts' as const, label: 'Больше репостов', icon: Send, iconClass: 'text-sky-500' },
]

const durationOptions = [
  { value: 'all' as const, label: 'Любая длительность' },
  { value: 'short' as const, label: 'До 15 сек' },
  { value: 'medium' as const, label: '15–30 сек' },
  { value: 'long' as const, label: '30–60 сек' },
  { value: 'xlong' as const, label: 'Больше 60 сек' },
]

const languageOptions = [
  { value: 'all', label: 'Все языки' },
  { value: 'ru', label: 'Русский' },
  { value: 'en', label: 'Английский' },
  { value: 'es', label: 'Испанский' },
]

const activeSort = computed(() =>
  sortOptions.find(o => o.value === store.filters.sortBy) ?? sortOptions[0]
)
const activeDuration = computed(() =>
  durationOptions.find(o => o.value === store.filters.duration) ?? durationOptions[0]
)
const activeLanguage = computed(() =>
  languageOptions.find(o => o.value === store.filters.language) ?? languageOptions[0]
)

const durationTriggerLabel = computed(() =>
  store.filters.duration === 'all' ? 'Длительность' : activeDuration.value.label
)
const languageTriggerLabel = computed(() =>
  store.filters.language === 'all' ? 'Язык' : activeLanguage.value.label
)

const searchModel = computed({
  get: () => store.filters.search,
  set: (v: string | number) => store.setSearch(String(v))
})

const triggerClass =
  'group flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-sm font-medium text-foreground ' +
  'hover:bg-accent transition-colors data-[state=open]:bg-accent ' +
  'data-[state=open]:ring-1 data-[state=open]:ring-ring outline-none'
</script>

<template>
  <div class="flex flex-wrap items-center gap-3">
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

    <!-- Duration -->
    <DropdownMenu>
      <DropdownMenuTrigger as-child>
        <button type="button" :class="triggerClass">
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

    <!-- Language -->
    <DropdownMenu>
      <DropdownMenuTrigger as-child>
        <button type="button" :class="triggerClass">
          <span>{{ languageTriggerLabel }}</span>
          <ChevronDown class="size-4 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" class="w-44">
        <DropdownMenuItem
          v-for="option in languageOptions"
          :key="option.value"
          @select="store.setLanguage(option.value)"
        >
          <span>{{ option.label }}</span>
          <Check v-if="store.filters.language === option.value" class="size-4 ml-auto text-muted-foreground" />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
</template>
