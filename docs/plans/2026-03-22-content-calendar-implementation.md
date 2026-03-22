# Content Calendar Demo — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a public demo page showcasing a content calendar for SMM planning with hardcoded data.

**Architecture:** Standalone module in `lib-modules/content-calendar/` with Vue components, composable for state, and static demo data. No backend integration.

**Tech Stack:** Vue 3, Nuxt 3, Tailwind CSS, shadcn-vue components

**Design Doc:** `docs/plans/2026-03-22-content-calendar-design.md`

---

## Task 1: Create module structure and types

**Files:**
- Create: `lib-modules/content-calendar/types/index.ts`
- Create: `lib-modules/content-calendar/index.ts`

**Step 1: Create types file**

```typescript
// lib-modules/content-calendar/types/index.ts

export type ContentType = 'post' | 'story' | 'reels'

export type SocialNetwork = 'vk' | 'youtube' | 'telegram' | 'instagram'

export type PostStatus = 'idea' | 'draft' | 'ready'

export interface SocialPreviewData {
  text: string
  image?: string
  likes?: number
  comments?: number
  shares?: number
  views?: number
}

export interface CalendarPost {
  id: string
  title: string
  description?: string
  type: ContentType
  status: PostStatus
  networks: SocialNetwork[]
  date: string // 'YYYY-MM-DD'
  image?: string
  previews: Partial<Record<SocialNetwork, SocialPreviewData>>
}

export interface InfoEvent {
  id: string
  title: string
  date: string
  description?: string
}

export interface NewsItem {
  id: string
  title: string
  source: string
  date: string
  url?: string
}

export interface DemoProject {
  id: string
  name: string
  posts: CalendarPost[]
  infoEvents: InfoEvent[]
  news: NewsItem[]
}
```

**Step 2: Create module index**

```typescript
// lib-modules/content-calendar/index.ts

export * from './types'
```

**Step 3: Verify TypeScript compiles**

Run: `yarn nuxi typecheck`
Expected: No errors related to content-calendar types

**Step 4: Commit**

```bash
git add lib-modules/content-calendar/
git commit -m "feat(content-calendar): add module structure and types"
```

---

## Task 2: Create demo data

**Files:**
- Create: `lib-modules/content-calendar/data/demoData.ts`
- Modify: `lib-modules/content-calendar/index.ts`

**Step 1: Create demo data file with 3 projects**

```typescript
// lib-modules/content-calendar/data/demoData.ts

import type { DemoProject } from '../types'

export const demoProjects: DemoProject[] = [
  {
    id: 'coffee-shop',
    name: 'Кофейня "Бодрость"',
    posts: [
      {
        id: 'cs-1',
        title: 'Весенняя акция -20%',
        description: 'Скидка на все латте до конца марта',
        type: 'post',
        status: 'ready',
        networks: ['vk', 'telegram'],
        date: '2026-03-15',
        image: '/demo/coffee-latte.jpg',
        previews: {
          vk: {
            text: 'Весна пришла — латте подешевел! Скидка 20% на все латте до конца марта. Ждём вас!',
            likes: 234,
            comments: 18,
            shares: 12
          },
          telegram: {
            text: 'Весенняя акция в Бодрости! Латте -20% весь март',
            views: 1520
          }
        }
      },
      {
        id: 'cs-2',
        title: 'Новый десерт: тирамису',
        type: 'story',
        status: 'draft',
        networks: ['instagram'],
        date: '2026-03-18',
        image: '/demo/tiramisu.jpg',
        previews: {
          instagram: {
            text: 'Новинка! Итальянский тирамису по авторскому рецепту',
            likes: 0,
            comments: 0
          }
        }
      },
      {
        id: 'cs-3',
        title: 'Как мы варим кофе',
        type: 'reels',
        status: 'idea',
        networks: ['instagram', 'youtube'],
        date: '2026-03-22',
        previews: {
          instagram: { text: 'Закулисье: от зерна до чашки' },
          youtube: { text: 'Как мы варим идеальный кофе | Бодрость' }
        }
      },
      {
        id: 'cs-4',
        title: 'Поздравление с 8 марта',
        type: 'post',
        status: 'ready',
        networks: ['vk', 'telegram', 'instagram'],
        date: '2026-03-08',
        image: '/demo/8march.jpg',
        previews: {
          vk: { text: 'Милые дамы! Поздравляем с 8 марта! Сегодня всем девушкам кофе в подарок', likes: 567, comments: 42, shares: 89 },
          telegram: { text: 'С 8 марта! Девушкам — кофе бесплатно', views: 3200 },
          instagram: { text: 'Happy 8th March! Free coffee for ladies today', likes: 892, comments: 56 }
        }
      },
      {
        id: 'cs-5',
        title: 'Пасхальные куличи',
        type: 'post',
        status: 'idea',
        networks: ['vk', 'instagram'],
        date: '2026-04-12',
        previews: {
          vk: { text: 'Принимаем заказы на пасхальные куличи!' },
          instagram: { text: 'Easter cakes pre-order is open!' }
        }
      }
    ],
    infoEvents: [
      { id: 'ie-1', title: '8 Марта', date: '2026-03-08', description: 'Международный женский день' },
      { id: 'ie-2', title: 'Пасха', date: '2026-04-12', description: 'Православная Пасха' },
      { id: 'ie-3', title: '1 Мая', date: '2026-05-01', description: 'День труда' }
    ],
    news: [
      { id: 'n-1', title: 'Цены на кофе выросли на 15%', source: 'РБК', date: '2026-03-20' },
      { id: 'n-2', title: 'Тренд: овсяное молоко обогнало миндальное', source: 'VC.ru', date: '2026-03-18' },
      { id: 'n-3', title: 'Starbucks открыл 100-ю кофейню в России', source: 'Коммерсант', date: '2026-03-15' }
    ]
  },
  {
    id: 'blogger-anya',
    name: 'Блогер Аня',
    posts: [
      {
        id: 'ba-1',
        title: 'Утренняя рутина',
        type: 'reels',
        status: 'ready',
        networks: ['instagram', 'youtube'],
        date: '2026-03-16',
        image: '/demo/morning.jpg',
        previews: {
          instagram: { text: 'Мое идеальное утро за 60 секунд', likes: 12400, comments: 342 },
          youtube: { text: 'Моя утренняя рутина 2026 | Продуктивное утро', likes: 8900, comments: 234 }
        }
      },
      {
        id: 'ba-2',
        title: 'Коллаб с брендом',
        type: 'post',
        status: 'draft',
        networks: ['instagram', 'telegram'],
        date: '2026-03-20',
        previews: {
          instagram: { text: 'Реклама нового бренда косметики' },
          telegram: { text: 'Новый пост о косметике', views: 0 }
        }
      },
      {
        id: 'ba-3',
        title: 'Q&A сессия',
        type: 'story',
        status: 'idea',
        networks: ['instagram'],
        date: '2026-03-25',
        previews: {
          instagram: { text: 'Отвечаю на ваши вопросы!' }
        }
      }
    ],
    infoEvents: [
      { id: 'ie-ba-1', title: '8 Марта', date: '2026-03-08' },
      { id: 'ie-ba-2', title: 'День блогера', date: '2026-04-17' }
    ],
    news: [
      { id: 'n-ba-1', title: 'Instagram тестирует новый алгоритм рекомендаций', source: 'TechCrunch', date: '2026-03-19' },
      { id: 'n-ba-2', title: 'YouTube Shorts обгоняет TikTok по просмотрам', source: 'The Verge', date: '2026-03-17' }
    ]
  },
  {
    id: 'electronics-store',
    name: 'Магазин электроники',
    posts: [
      {
        id: 'es-1',
        title: 'Обзор iPhone 17',
        type: 'reels',
        status: 'ready',
        networks: ['youtube', 'vk'],
        date: '2026-03-14',
        image: '/demo/iphone.jpg',
        previews: {
          youtube: { text: 'iPhone 17 — честный обзор | Стоит ли покупать?', likes: 4500, comments: 678 },
          vk: { text: 'Обзор нового iPhone 17 уже на канале!', likes: 890, comments: 123, shares: 45 }
        }
      },
      {
        id: 'es-2',
        title: 'Распродажа к 8 марта',
        type: 'post',
        status: 'ready',
        networks: ['vk', 'telegram', 'instagram'],
        date: '2026-03-07',
        image: '/demo/sale.jpg',
        previews: {
          vk: { text: 'Скидки до 30% на технику для любимых!', likes: 234, comments: 45, shares: 67 },
          telegram: { text: 'Распродажа к 8 марта — скидки до 30%!', views: 5600 },
          instagram: { text: 'Sale up to 30% off!', likes: 1200, comments: 89 }
        }
      },
      {
        id: 'es-3',
        title: 'Топ-5 наушников 2026',
        type: 'post',
        status: 'draft',
        networks: ['vk', 'youtube'],
        date: '2026-03-28',
        previews: {
          vk: { text: 'Какие наушники выбрать в 2026?' },
          youtube: { text: 'ТОП-5 наушников 2026 года | Сравнение' }
        }
      }
    ],
    infoEvents: [
      { id: 'ie-es-1', title: '8 Марта', date: '2026-03-08' },
      { id: 'ie-es-2', title: 'Чёрная пятница', date: '2026-11-27' }
    ],
    news: [
      { id: 'n-es-1', title: 'Apple представит новые MacBook в апреле', source: 'Bloomberg', date: '2026-03-21' },
      { id: 'n-es-2', title: 'Samsung выпустит складной планшет', source: 'The Verge', date: '2026-03-18' },
      { id: 'n-es-3', title: 'Xiaomi выходит на рынок электромобилей', source: 'Reuters', date: '2026-03-15' }
    ]
  }
]
```

**Step 2: Update module index**

```typescript
// lib-modules/content-calendar/index.ts

export * from './types'
export { demoProjects } from './data/demoData'
```

**Step 3: Verify no TypeScript errors**

Run: `yarn nuxi typecheck`
Expected: No errors

**Step 4: Commit**

```bash
git add lib-modules/content-calendar/
git commit -m "feat(content-calendar): add demo data for 3 projects"
```

---

## Task 3: Create useContentCalendar composable

**Files:**
- Create: `lib-modules/content-calendar/composables/useContentCalendar.ts`
- Modify: `lib-modules/content-calendar/index.ts`

**Step 1: Create composable with state and computed properties**

```typescript
// lib-modules/content-calendar/composables/useContentCalendar.ts

import { ref, computed } from 'vue'
import type { SocialNetwork, CalendarPost, InfoEvent, NewsItem } from '../types'
import { demoProjects } from '../data/demoData'

export function useContentCalendar() {
  // State
  const selectedProjectId = ref<string>('coffee-shop')
  const selectedDate = ref<string | null>(null)
  const selectedPostId = ref<string | null>(null)
  const activeNetworks = ref<SocialNetwork[]>(['vk', 'youtube', 'telegram', 'instagram'])
  const currentMonth = ref<Date>(new Date())

  // Current project
  const currentProject = computed(() =>
    demoProjects.find(p => p.id === selectedProjectId.value) ?? demoProjects[0]
  )

  // Filtered posts by active networks
  const filteredPosts = computed(() =>
    currentProject.value.posts.filter(post =>
      post.networks.some(n => activeNetworks.value.includes(n))
    )
  )

  // Posts for selected date
  const postsForSelectedDate = computed(() => {
    if (!selectedDate.value) return []
    return filteredPosts.value.filter(p => p.date === selectedDate.value)
  })

  // Info events for selected date
  const infoEventsForSelectedDate = computed(() => {
    if (!selectedDate.value) return []
    return currentProject.value.infoEvents.filter(e => e.date === selectedDate.value)
  })

  // Selected post object
  const selectedPost = computed(() => {
    if (!selectedPostId.value) return null
    return currentProject.value.posts.find(p => p.id === selectedPostId.value) ?? null
  })

  // Get posts for a specific date (for calendar grid)
  function getPostsForDate(date: string): CalendarPost[] {
    return filteredPosts.value.filter(p => p.date === date)
  }

  // Check if date has info event
  function hasInfoEvent(date: string): boolean {
    return currentProject.value.infoEvents.some(e => e.date === date)
  }

  // Get info event for date
  function getInfoEvent(date: string): InfoEvent | undefined {
    return currentProject.value.infoEvents.find(e => e.date === date)
  }

  // Actions
  function selectProject(projectId: string) {
    selectedProjectId.value = projectId
    selectedDate.value = null
    selectedPostId.value = null
  }

  function selectDate(date: string | null) {
    selectedDate.value = date
    selectedPostId.value = null
  }

  function selectPost(postId: string | null) {
    selectedPostId.value = postId
  }

  function toggleNetwork(network: SocialNetwork) {
    const index = activeNetworks.value.indexOf(network)
    if (index === -1) {
      activeNetworks.value.push(network)
    } else if (activeNetworks.value.length > 1) {
      activeNetworks.value.splice(index, 1)
    }
  }

  function nextMonth() {
    const next = new Date(currentMonth.value)
    next.setMonth(next.getMonth() + 1)
    currentMonth.value = next
  }

  function prevMonth() {
    const prev = new Date(currentMonth.value)
    prev.setMonth(prev.getMonth() - 1)
    currentMonth.value = prev
  }

  return {
    // State
    selectedProjectId,
    selectedDate,
    selectedPostId,
    activeNetworks,
    currentMonth,
    // Computed
    currentProject,
    filteredPosts,
    postsForSelectedDate,
    infoEventsForSelectedDate,
    selectedPost,
    // Methods
    getPostsForDate,
    hasInfoEvent,
    getInfoEvent,
    selectProject,
    selectDate,
    selectPost,
    toggleNetwork,
    nextMonth,
    prevMonth,
    // Data
    projects: demoProjects
  }
}
```

**Step 2: Update module index**

```typescript
// lib-modules/content-calendar/index.ts

export * from './types'
export { demoProjects } from './data/demoData'
export { useContentCalendar } from './composables/useContentCalendar'
```

**Step 3: Verify TypeScript compiles**

Run: `yarn nuxi typecheck`
Expected: No errors

**Step 4: Commit**

```bash
git add lib-modules/content-calendar/
git commit -m "feat(content-calendar): add useContentCalendar composable"
```

---

## Task 4: Create CalendarHeader component

**Files:**
- Create: `lib-modules/content-calendar/components/CalendarHeader.vue`

**Step 1: Create header with logo, project selector, and back link**

```vue
<!-- lib-modules/content-calendar/components/CalendarHeader.vue -->
<script setup lang="ts">
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select'
import { Button } from '~/components/ui/button'
import type { DemoProject } from '../types'

const props = defineProps<{
  projects: DemoProject[]
  selectedProjectId: string
}>()

const emit = defineEmits<{
  'update:selectedProjectId': [value: string]
}>()
</script>

<template>
  <header class="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-950">
    <!-- Logo -->
    <div class="flex items-center gap-2">
      <span class="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
        Writelo
      </span>
      <span class="text-zinc-500">/ Идеи</span>
    </div>

    <!-- Project selector -->
    <Select
      :model-value="selectedProjectId"
      @update:model-value="emit('update:selectedProjectId', $event)"
    >
      <SelectTrigger class="w-[220px] bg-zinc-900 border-zinc-700">
        <SelectValue placeholder="Выберите проект" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem v-for="project in projects" :key="project.id" :value="project.id">
          {{ project.name }}
        </SelectItem>
      </SelectContent>
    </Select>

    <!-- Back to landing -->
    <NuxtLink to="/landing">
      <Button variant="ghost" class="text-zinc-400 hover:text-white">
        ← На главную
      </Button>
    </NuxtLink>
  </header>
</template>
```

**Step 2: Verify no errors**

Run: `yarn nuxi typecheck`
Expected: No errors

**Step 3: Commit**

```bash
git add lib-modules/content-calendar/components/CalendarHeader.vue
git commit -m "feat(content-calendar): add CalendarHeader component"
```

---

## Task 5: Create SocialFilters component

**Files:**
- Create: `lib-modules/content-calendar/components/SocialFilters.vue`

**Step 1: Create chips toggles for social networks**

```vue
<!-- lib-modules/content-calendar/components/SocialFilters.vue -->
<script setup lang="ts">
import { Toggle } from '~/components/ui/toggle'
import type { SocialNetwork } from '../types'

const props = defineProps<{
  activeNetworks: SocialNetwork[]
}>()

const emit = defineEmits<{
  toggle: [network: SocialNetwork]
}>()

const networks: { id: SocialNetwork; label: string; color: string }[] = [
  { id: 'vk', label: 'VK', color: 'data-[state=on]:bg-blue-600' },
  { id: 'youtube', label: 'YouTube', color: 'data-[state=on]:bg-red-600' },
  { id: 'telegram', label: 'Telegram', color: 'data-[state=on]:bg-sky-500' },
  { id: 'instagram', label: 'Instagram', color: 'data-[state=on]:bg-gradient-to-r data-[state=on]:from-purple-500 data-[state=on]:to-pink-500' }
]

function isActive(network: SocialNetwork): boolean {
  return props.activeNetworks.includes(network)
}
</script>

<template>
  <div class="flex items-center gap-2 px-6 py-3 border-b border-zinc-800 bg-zinc-900/50">
    <span class="text-sm text-zinc-500 mr-2">Соцсети:</span>
    <Toggle
      v-for="network in networks"
      :key="network.id"
      :pressed="isActive(network.id)"
      :class="[
        'px-3 py-1.5 text-sm rounded-full border transition-all',
        isActive(network.id)
          ? `${network.color} border-transparent text-white`
          : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-white'
      ]"
      @click="emit('toggle', network.id)"
    >
      {{ network.label }}
    </Toggle>
  </div>
</template>
```

**Step 2: Verify no errors**

Run: `yarn nuxi typecheck`
Expected: No errors

**Step 3: Commit**

```bash
git add lib-modules/content-calendar/components/SocialFilters.vue
git commit -m "feat(content-calendar): add SocialFilters component"
```

---

## Task 6: Create DayCell component

**Files:**
- Create: `lib-modules/content-calendar/components/DayCell.vue`

**Step 1: Create day cell with post dots and info event marker**

```vue
<!-- lib-modules/content-calendar/components/DayCell.vue -->
<script setup lang="ts">
import type { CalendarPost } from '../types'

const props = defineProps<{
  date: string
  dayNumber: number
  isCurrentMonth: boolean
  isToday: boolean
  isSelected: boolean
  posts: CalendarPost[]
  hasInfoEvent: boolean
}>()

const emit = defineEmits<{
  select: [date: string]
}>()

const contentTypeColors: Record<string, string> = {
  post: 'bg-blue-500',
  story: 'bg-purple-500',
  reels: 'bg-pink-500'
}

// Show max 3 dots
const visiblePosts = computed(() => props.posts.slice(0, 3))
const hasMore = computed(() => props.posts.length > 3)
</script>

<template>
  <button
    :class="[
      'relative h-24 p-2 text-left transition-all border rounded-lg',
      isCurrentMonth ? 'bg-zinc-900' : 'bg-zinc-950 opacity-40',
      isSelected ? 'border-purple-500 ring-1 ring-purple-500' : 'border-zinc-800 hover:border-zinc-600',
      isToday && !isSelected ? 'border-purple-500/50' : ''
    ]"
    @click="emit('select', date)"
  >
    <!-- Day number -->
    <span
      :class="[
        'text-sm font-medium',
        isToday ? 'text-purple-400' : isCurrentMonth ? 'text-zinc-300' : 'text-zinc-600'
      ]"
    >
      {{ dayNumber }}
    </span>

    <!-- Info event marker -->
    <span
      v-if="hasInfoEvent"
      class="absolute top-2 right-2 text-amber-400 text-xs"
      title="Инфоповод"
    >
      ★
    </span>

    <!-- Post dots -->
    <div class="absolute bottom-2 left-2 flex gap-1 flex-wrap">
      <span
        v-for="post in visiblePosts"
        :key="post.id"
        :class="['w-2 h-2 rounded-full', contentTypeColors[post.type]]"
        :title="post.title"
      />
      <span v-if="hasMore" class="text-xs text-zinc-500">+{{ posts.length - 3 }}</span>
    </div>
  </button>
</template>
```

**Step 2: Verify no errors**

Run: `yarn nuxi typecheck`
Expected: No errors

**Step 3: Commit**

```bash
git add lib-modules/content-calendar/components/DayCell.vue
git commit -m "feat(content-calendar): add DayCell component"
```

---

## Task 7: Create CalendarGrid component

**Files:**
- Create: `lib-modules/content-calendar/components/CalendarGrid.vue`

**Step 1: Create monthly grid with navigation**

```vue
<!-- lib-modules/content-calendar/components/CalendarGrid.vue -->
<script setup lang="ts">
import { Button } from '~/components/ui/button'
import DayCell from './DayCell.vue'
import type { CalendarPost } from '../types'

const props = defineProps<{
  currentMonth: Date
  selectedDate: string | null
  getPostsForDate: (date: string) => CalendarPost[]
  hasInfoEvent: (date: string) => boolean
}>()

const emit = defineEmits<{
  selectDate: [date: string]
  prevMonth: []
  nextMonth: []
}>()

const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

const monthName = computed(() => {
  return props.currentMonth.toLocaleString('ru', { month: 'long', year: 'numeric' })
})

interface DayInfo {
  date: string
  dayNumber: number
  isCurrentMonth: boolean
  isToday: boolean
}

const calendarDays = computed((): DayInfo[] => {
  const year = props.currentMonth.getFullYear()
  const month = props.currentMonth.getMonth()

  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)

  // Get Monday as first day of week (0 = Monday in our system)
  let startDay = firstDay.getDay() - 1
  if (startDay < 0) startDay = 6

  const days: DayInfo[] = []
  const today = new Date().toISOString().split('T')[0]

  // Previous month days
  const prevMonthLastDay = new Date(year, month, 0).getDate()
  for (let i = startDay - 1; i >= 0; i--) {
    const dayNum = prevMonthLastDay - i
    const date = new Date(year, month - 1, dayNum)
    days.push({
      date: date.toISOString().split('T')[0],
      dayNumber: dayNum,
      isCurrentMonth: false,
      isToday: false
    })
  }

  // Current month days
  for (let d = 1; d <= lastDay.getDate(); d++) {
    const date = new Date(year, month, d)
    const dateStr = date.toISOString().split('T')[0]
    days.push({
      date: dateStr,
      dayNumber: d,
      isCurrentMonth: true,
      isToday: dateStr === today
    })
  }

  // Next month days to fill 6 rows
  const remaining = 42 - days.length
  for (let d = 1; d <= remaining; d++) {
    const date = new Date(year, month + 1, d)
    days.push({
      date: date.toISOString().split('T')[0],
      dayNumber: d,
      isCurrentMonth: false,
      isToday: false
    })
  }

  return days
})
</script>

<template>
  <div class="flex flex-col h-full">
    <!-- Month navigation -->
    <div class="flex items-center justify-between px-4 py-3">
      <Button variant="ghost" size="sm" @click="emit('prevMonth')">
        ◄
      </Button>
      <h2 class="text-lg font-semibold capitalize text-zinc-100">
        {{ monthName }}
      </h2>
      <Button variant="ghost" size="sm" @click="emit('nextMonth')">
        ►
      </Button>
    </div>

    <!-- Week days header -->
    <div class="grid grid-cols-7 gap-1 px-2 pb-2">
      <div
        v-for="day in weekDays"
        :key="day"
        class="text-center text-xs font-medium text-zinc-500 py-2"
      >
        {{ day }}
      </div>
    </div>

    <!-- Calendar grid -->
    <div class="grid grid-cols-7 gap-1 px-2 flex-1">
      <DayCell
        v-for="day in calendarDays"
        :key="day.date"
        :date="day.date"
        :day-number="day.dayNumber"
        :is-current-month="day.isCurrentMonth"
        :is-today="day.isToday"
        :is-selected="selectedDate === day.date"
        :posts="getPostsForDate(day.date)"
        :has-info-event="hasInfoEvent(day.date)"
        @select="emit('selectDate', $event)"
      />
    </div>
  </div>
</template>
```

**Step 2: Verify no errors**

Run: `yarn nuxi typecheck`
Expected: No errors

**Step 3: Commit**

```bash
git add lib-modules/content-calendar/components/CalendarGrid.vue
git commit -m "feat(content-calendar): add CalendarGrid component"
```

---

## Task 8: Create PostCard component

**Files:**
- Create: `lib-modules/content-calendar/components/PostCard.vue`

**Step 1: Create post card with type color, status icon, and network badges**

```vue
<!-- lib-modules/content-calendar/components/PostCard.vue -->
<script setup lang="ts">
import type { CalendarPost, SocialNetwork, PostStatus, ContentType } from '../types'

const props = defineProps<{
  post: CalendarPost
}>()

const emit = defineEmits<{
  select: [postId: string]
}>()

const typeStyles: Record<ContentType, string> = {
  post: 'bg-blue-500/20 border-blue-500',
  story: 'bg-purple-500/20 border-purple-500',
  reels: 'bg-pink-500/20 border-pink-500'
}

const typeLabels: Record<ContentType, string> = {
  post: 'Пост',
  story: 'Сторис',
  reels: 'Рилс'
}

const statusIcons: Record<PostStatus, { icon: string; class: string; label: string }> = {
  idea: { icon: '○', class: 'text-gray-400', label: 'Идея' },
  draft: { icon: '◐', class: 'text-yellow-500', label: 'Черновик' },
  ready: { icon: '●', class: 'text-green-500', label: 'Готов' }
}

const networkIcons: Record<SocialNetwork, string> = {
  vk: 'VK',
  youtube: 'YT',
  telegram: 'TG',
  instagram: 'IG'
}
</script>

<template>
  <button
    :class="[
      'w-full p-3 rounded-lg border text-left transition-all hover:scale-[1.02]',
      typeStyles[post.type]
    ]"
    @click="emit('select', post.id)"
  >
    <!-- Header: type + networks -->
    <div class="flex items-center justify-between mb-2">
      <span class="text-xs text-zinc-400">{{ typeLabels[post.type] }}</span>
      <div class="flex gap-1">
        <span
          v-for="network in post.networks"
          :key="network"
          class="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400"
        >
          {{ networkIcons[network] }}
        </span>
      </div>
    </div>

    <!-- Title -->
    <h4 class="text-sm font-medium text-zinc-100 mb-2 line-clamp-2">
      {{ post.title }}
    </h4>

    <!-- Status -->
    <div class="flex items-center gap-1.5">
      <span :class="statusIcons[post.status].class">
        {{ statusIcons[post.status].icon }}
      </span>
      <span class="text-xs text-zinc-500">
        {{ statusIcons[post.status].label }}
      </span>
    </div>
  </button>
</template>
```

**Step 2: Verify no errors**

Run: `yarn nuxi typecheck`
Expected: No errors

**Step 3: Commit**

```bash
git add lib-modules/content-calendar/components/PostCard.vue
git commit -m "feat(content-calendar): add PostCard component"
```

---

## Task 9: Create DayDetailPanel component

**Files:**
- Create: `lib-modules/content-calendar/components/DayDetailPanel.vue`

**Step 1: Create bottom panel showing posts and info events for selected day**

```vue
<!-- lib-modules/content-calendar/components/DayDetailPanel.vue -->
<script setup lang="ts">
import PostCard from './PostCard.vue'
import type { CalendarPost, InfoEvent } from '../types'

const props = defineProps<{
  date: string
  posts: CalendarPost[]
  infoEvents: InfoEvent[]
}>()

const emit = defineEmits<{
  selectPost: [postId: string]
  close: []
}>()

const formattedDate = computed(() => {
  const d = new Date(props.date)
  return d.toLocaleDateString('ru', { day: 'numeric', month: 'long', year: 'numeric' })
})
</script>

<template>
  <div class="border-t border-zinc-800 bg-zinc-900/80 backdrop-blur">
    <!-- Header -->
    <div class="flex items-center justify-between px-6 py-3 border-b border-zinc-800">
      <h3 class="text-sm font-medium text-zinc-100">
        {{ formattedDate }}
      </h3>
      <button
        class="text-zinc-500 hover:text-white transition-colors"
        @click="emit('close')"
      >
        ✕
      </button>
    </div>

    <!-- Content -->
    <div class="p-4">
      <!-- Info events -->
      <div v-if="infoEvents.length > 0" class="mb-4">
        <div
          v-for="event in infoEvents"
          :key="event.id"
          class="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/30"
        >
          <span class="text-amber-400">★</span>
          <span class="text-sm text-amber-200">{{ event.title }}</span>
          <span v-if="event.description" class="text-xs text-zinc-500">
            — {{ event.description }}
          </span>
        </div>
      </div>

      <!-- Posts -->
      <div v-if="posts.length > 0" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        <PostCard
          v-for="post in posts"
          :key="post.id"
          :post="post"
          @select="emit('selectPost', $event)"
        />
      </div>

      <!-- Empty state -->
      <div v-else-if="infoEvents.length === 0" class="text-center py-8 text-zinc-500">
        Нет постов на эту дату
      </div>
    </div>
  </div>
</template>
```

**Step 2: Verify no errors**

Run: `yarn nuxi typecheck`
Expected: No errors

**Step 3: Commit**

```bash
git add lib-modules/content-calendar/components/DayDetailPanel.vue
git commit -m "feat(content-calendar): add DayDetailPanel component"
```

---

## Task 10: Create NewsCard component

**Files:**
- Create: `lib-modules/content-calendar/components/NewsCard.vue`

**Step 1: Create news card for sidebar**

```vue
<!-- lib-modules/content-calendar/components/NewsCard.vue -->
<script setup lang="ts">
import type { NewsItem } from '../types'

const props = defineProps<{
  news: NewsItem
}>()

const formattedDate = computed(() => {
  const d = new Date(props.news.date)
  return d.toLocaleDateString('ru', { day: 'numeric', month: 'short' })
})
</script>

<template>
  <div
    class="p-3 rounded-lg bg-zinc-800/50 border border-zinc-700 hover:border-zinc-600 transition-all cursor-grab"
    draggable="true"
  >
    <h4 class="text-sm font-medium text-zinc-200 mb-1 line-clamp-2">
      {{ news.title }}
    </h4>
    <div class="flex items-center justify-between text-xs text-zinc-500">
      <span>{{ news.source }}</span>
      <span>{{ formattedDate }}</span>
    </div>
  </div>
</template>
```

**Step 2: Commit**

```bash
git add lib-modules/content-calendar/components/NewsCard.vue
git commit -m "feat(content-calendar): add NewsCard component"
```

---

## Task 11: Create NewsSidebar component

**Files:**
- Create: `lib-modules/content-calendar/components/NewsSidebar.vue`

**Step 1: Create right sidebar with news list**

```vue
<!-- lib-modules/content-calendar/components/NewsSidebar.vue -->
<script setup lang="ts">
import NewsCard from './NewsCard.vue'
import type { NewsItem } from '../types'

const props = defineProps<{
  news: NewsItem[]
}>()
</script>

<template>
  <aside class="w-72 border-l border-zinc-800 bg-zinc-900/50 flex flex-col">
    <!-- Header -->
    <div class="px-4 py-3 border-b border-zinc-800">
      <h3 class="text-sm font-medium text-zinc-300">Новости отрасли</h3>
      <p class="text-xs text-zinc-500 mt-0.5">Перетащите в календарь для создания идеи</p>
    </div>

    <!-- News list -->
    <div class="flex-1 overflow-y-auto p-3 space-y-2">
      <NewsCard v-for="item in news" :key="item.id" :news="item" />
    </div>
  </aside>
</template>
```

**Step 2: Commit**

```bash
git add lib-modules/content-calendar/components/NewsSidebar.vue
git commit -m "feat(content-calendar): add NewsSidebar component"
```

---

## Task 12: Create social preview components

**Files:**
- Create: `lib-modules/content-calendar/components/previews/InstagramPreview.vue`
- Create: `lib-modules/content-calendar/components/previews/VkPreview.vue`
- Create: `lib-modules/content-calendar/components/previews/YouTubePreview.vue`
- Create: `lib-modules/content-calendar/components/previews/TelegramPreview.vue`

**Step 1: Create Instagram preview mockup**

```vue
<!-- lib-modules/content-calendar/components/previews/InstagramPreview.vue -->
<script setup lang="ts">
import type { SocialPreviewData } from '../../types'

const props = defineProps<{
  preview: SocialPreviewData
  image?: string
}>()

function formatNumber(n: number | undefined): string {
  if (!n) return '0'
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`
  return n.toString()
}
</script>

<template>
  <div class="bg-black rounded-lg overflow-hidden max-w-[320px]">
    <!-- Header -->
    <div class="flex items-center gap-3 p-3">
      <div class="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500" />
      <span class="text-sm font-medium text-white">username</span>
      <span class="ml-auto text-zinc-500">•••</span>
    </div>

    <!-- Image (4:5 aspect ratio) -->
    <div class="aspect-[4/5] bg-zinc-800 flex items-center justify-center">
      <img
        v-if="image"
        :src="image"
        alt=""
        class="w-full h-full object-cover"
      />
      <span v-else class="text-zinc-600 text-sm">Изображение</span>
    </div>

    <!-- Actions -->
    <div class="p-3">
      <div class="flex items-center gap-4 mb-2">
        <span class="text-xl">❤️</span>
        <span class="text-xl">💬</span>
        <span class="text-xl">✈️</span>
        <span class="ml-auto text-xl">🔖</span>
      </div>
      <div class="text-sm font-medium text-white mb-1">
        {{ formatNumber(preview.likes) }} likes
      </div>
      <div class="text-sm text-zinc-300">
        <span class="font-medium">username</span> {{ preview.text }}
      </div>
      <div v-if="preview.comments" class="text-sm text-zinc-500 mt-1">
        View all {{ preview.comments }} comments
      </div>
    </div>
  </div>
</template>
```

**Step 2: Create VK preview mockup**

```vue
<!-- lib-modules/content-calendar/components/previews/VkPreview.vue -->
<script setup lang="ts">
import type { SocialPreviewData } from '../../types'

const props = defineProps<{
  preview: SocialPreviewData
  image?: string
}>()

function formatNumber(n: number | undefined): string {
  if (!n) return '0'
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`
  return n.toString()
}
</script>

<template>
  <div class="bg-zinc-900 rounded-lg overflow-hidden max-w-[400px] border border-zinc-700">
    <!-- Header -->
    <div class="flex items-center gap-3 p-3">
      <div class="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
        VK
      </div>
      <div>
        <div class="text-sm font-medium text-white">Название сообщества</div>
        <div class="text-xs text-zinc-500">сегодня в 12:00</div>
      </div>
    </div>

    <!-- Text -->
    <div class="px-3 pb-3 text-sm text-zinc-200">
      {{ preview.text }}
    </div>

    <!-- Image (1:1 aspect ratio) -->
    <div v-if="image" class="aspect-square bg-zinc-800">
      <img :src="image" alt="" class="w-full h-full object-cover" />
    </div>

    <!-- Actions -->
    <div class="flex items-center gap-6 p-3 border-t border-zinc-800 text-zinc-400 text-sm">
      <span class="flex items-center gap-1">
        ❤️ {{ formatNumber(preview.likes) }}
      </span>
      <span class="flex items-center gap-1">
        💬 {{ formatNumber(preview.comments) }}
      </span>
      <span class="flex items-center gap-1">
        ↗️ {{ formatNumber(preview.shares) }}
      </span>
    </div>
  </div>
</template>
```

**Step 3: Create YouTube preview mockup**

```vue
<!-- lib-modules/content-calendar/components/previews/YouTubePreview.vue -->
<script setup lang="ts">
import type { SocialPreviewData } from '../../types'

const props = defineProps<{
  preview: SocialPreviewData
  image?: string
}>()

function formatNumber(n: number | undefined): string {
  if (!n) return '0'
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`
  return n.toString()
}
</script>

<template>
  <div class="bg-zinc-900 rounded-lg overflow-hidden max-w-[400px] border border-zinc-700">
    <!-- Header -->
    <div class="flex items-center gap-3 p-3">
      <div class="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center text-white font-bold text-xs">
        YT
      </div>
      <div>
        <div class="text-sm font-medium text-white">Название канала</div>
        <div class="text-xs text-zinc-500">Community • 2 часа назад</div>
      </div>
    </div>

    <!-- Text -->
    <div class="px-3 pb-3 text-sm text-zinc-200">
      {{ preview.text }}
    </div>

    <!-- Image (16:9 aspect ratio) -->
    <div v-if="image" class="aspect-video bg-zinc-800">
      <img :src="image" alt="" class="w-full h-full object-cover" />
    </div>

    <!-- Actions -->
    <div class="flex items-center gap-4 p-3 border-t border-zinc-800 text-zinc-400 text-sm">
      <span class="flex items-center gap-1">
        👍 {{ formatNumber(preview.likes) }}
      </span>
      <span class="flex items-center gap-1">
        👎
      </span>
      <span class="flex items-center gap-1 ml-auto">
        💬 {{ formatNumber(preview.comments) }}
      </span>
    </div>
  </div>
</template>
```

**Step 4: Create Telegram preview mockup**

```vue
<!-- lib-modules/content-calendar/components/previews/TelegramPreview.vue -->
<script setup lang="ts">
import type { SocialPreviewData } from '../../types'

const props = defineProps<{
  preview: SocialPreviewData
  image?: string
}>()

function formatNumber(n: number | undefined): string {
  if (!n) return '0'
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`
  return n.toString()
}
</script>

<template>
  <div class="bg-zinc-900 rounded-lg overflow-hidden max-w-[380px] border border-zinc-700">
    <!-- Channel header -->
    <div class="flex items-center gap-3 p-3 border-b border-zinc-800">
      <div class="w-10 h-10 rounded-full bg-sky-500 flex items-center justify-center text-white font-bold">
        TG
      </div>
      <div class="text-sm font-medium text-white">Название канала</div>
    </div>

    <!-- Image (1:1 aspect ratio) -->
    <div v-if="image" class="aspect-square bg-zinc-800">
      <img :src="image" alt="" class="w-full h-full object-cover" />
    </div>

    <!-- Text -->
    <div class="p-3 text-sm text-zinc-200">
      {{ preview.text }}
    </div>

    <!-- Footer -->
    <div class="flex items-center justify-between px-3 pb-3 text-xs text-zinc-500">
      <span>👁 {{ formatNumber(preview.views) }}</span>
      <span>12:00</span>
    </div>
  </div>
</template>
```

**Step 5: Commit**

```bash
git add lib-modules/content-calendar/components/previews/
git commit -m "feat(content-calendar): add social preview components (IG, VK, YT, TG)"
```

---

## Task 13: Create PostPreviewPanel component

**Files:**
- Create: `lib-modules/content-calendar/components/PostPreviewPanel.vue`

**Step 1: Create side panel with tabbed previews**

```vue
<!-- lib-modules/content-calendar/components/PostPreviewPanel.vue -->
<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Button } from '~/components/ui/button'
import InstagramPreview from './previews/InstagramPreview.vue'
import VkPreview from './previews/VkPreview.vue'
import YouTubePreview from './previews/YouTubePreview.vue'
import TelegramPreview from './previews/TelegramPreview.vue'
import type { CalendarPost, SocialNetwork, PostStatus } from '../types'

const props = defineProps<{
  post: CalendarPost
}>()

const emit = defineEmits<{
  close: []
}>()

const activeTab = ref<SocialNetwork>(props.post.networks[0])

watch(() => props.post, (newPost) => {
  if (!newPost.networks.includes(activeTab.value)) {
    activeTab.value = newPost.networks[0]
  }
}, { immediate: true })

const previewComponents: Record<SocialNetwork, any> = {
  instagram: InstagramPreview,
  vk: VkPreview,
  youtube: YouTubePreview,
  telegram: TelegramPreview
}

const networkLabels: Record<SocialNetwork, string> = {
  vk: 'VK',
  youtube: 'YouTube',
  telegram: 'Telegram',
  instagram: 'Instagram'
}

const statusInfo: Record<PostStatus, { icon: string; class: string; label: string }> = {
  idea: { icon: '○', class: 'text-gray-400', label: 'Идея' },
  draft: { icon: '◐', class: 'text-yellow-500', label: 'Черновик' },
  ready: { icon: '●', class: 'text-green-500', label: 'Готов к публикации' }
}

const currentPreview = computed(() => props.post.previews[activeTab.value])
</script>

<template>
  <aside class="w-96 border-l border-zinc-800 bg-zinc-900 flex flex-col">
    <!-- Header -->
    <div class="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
      <h3 class="text-sm font-medium text-zinc-200">Превью поста</h3>
      <button
        class="text-zinc-500 hover:text-white transition-colors"
        @click="emit('close')"
      >
        ✕
      </button>
    </div>

    <!-- Tabs -->
    <div class="flex gap-1 px-4 py-2 border-b border-zinc-800">
      <Button
        v-for="network in post.networks"
        :key="network"
        :variant="activeTab === network ? 'default' : 'ghost'"
        size="sm"
        @click="activeTab = network"
      >
        {{ networkLabels[network] }}
      </Button>
    </div>

    <!-- Preview -->
    <div class="flex-1 overflow-y-auto p-4">
      <component
        :is="previewComponents[activeTab]"
        v-if="currentPreview"
        :preview="currentPreview"
        :image="post.image"
      />
      <div v-else class="text-center py-8 text-zinc-500">
        Превью недоступно
      </div>
    </div>

    <!-- Status footer -->
    <div class="px-4 py-3 border-t border-zinc-800 flex items-center gap-2">
      <span :class="statusInfo[post.status].class">
        {{ statusInfo[post.status].icon }}
      </span>
      <span class="text-sm text-zinc-400">
        {{ statusInfo[post.status].label }}
      </span>
    </div>
  </aside>
</template>
```

**Step 2: Commit**

```bash
git add lib-modules/content-calendar/components/PostPreviewPanel.vue
git commit -m "feat(content-calendar): add PostPreviewPanel component"
```

---

## Task 14: Create ContentCalendarPage component

**Files:**
- Create: `lib-modules/content-calendar/components/ContentCalendarPage.vue`
- Modify: `lib-modules/content-calendar/index.ts`

**Step 1: Create main page layout combining all components**

```vue
<!-- lib-modules/content-calendar/components/ContentCalendarPage.vue -->
<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import CalendarHeader from './CalendarHeader.vue'
import SocialFilters from './SocialFilters.vue'
import CalendarGrid from './CalendarGrid.vue'
import DayDetailPanel from './DayDetailPanel.vue'
import NewsSidebar from './NewsSidebar.vue'
import PostPreviewPanel from './PostPreviewPanel.vue'
import { useContentCalendar } from '../composables/useContentCalendar'

const {
  selectedProjectId,
  selectedDate,
  selectedPostId,
  activeNetworks,
  currentMonth,
  currentProject,
  postsForSelectedDate,
  infoEventsForSelectedDate,
  selectedPost,
  getPostsForDate,
  hasInfoEvent,
  selectProject,
  selectDate,
  selectPost,
  toggleNetwork,
  nextMonth,
  prevMonth,
  projects
} = useContentCalendar()

// ESC to close panels
function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    if (selectedPostId.value) {
      selectPost(null)
    } else if (selectedDate.value) {
      selectDate(null)
    }
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <div class="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
    <!-- Header -->
    <CalendarHeader
      :projects="projects"
      :selected-project-id="selectedProjectId"
      @update:selected-project-id="selectProject"
    />

    <!-- Filters -->
    <SocialFilters
      :active-networks="activeNetworks"
      @toggle="toggleNetwork"
    />

    <!-- Main content -->
    <div class="flex-1 flex overflow-hidden">
      <!-- Calendar area -->
      <div class="flex-1 flex flex-col">
        <!-- Calendar grid -->
        <div class="flex-1 p-4">
          <CalendarGrid
            :current-month="currentMonth"
            :selected-date="selectedDate"
            :get-posts-for-date="getPostsForDate"
            :has-info-event="hasInfoEvent"
            @select-date="selectDate"
            @prev-month="prevMonth"
            @next-month="nextMonth"
          />
        </div>

        <!-- Day detail panel -->
        <DayDetailPanel
          v-if="selectedDate"
          :date="selectedDate"
          :posts="postsForSelectedDate"
          :info-events="infoEventsForSelectedDate"
          @select-post="selectPost"
          @close="selectDate(null)"
        />
      </div>

      <!-- Right sidebar: News or Post Preview -->
      <PostPreviewPanel
        v-if="selectedPost"
        :post="selectedPost"
        @close="selectPost(null)"
      />
      <NewsSidebar
        v-else
        :news="currentProject.news"
      />
    </div>
  </div>
</template>
```

**Step 2: Update module index**

```typescript
// lib-modules/content-calendar/index.ts

export * from './types'
export { demoProjects } from './data/demoData'
export { useContentCalendar } from './composables/useContentCalendar'
export { default as ContentCalendarPage } from './components/ContentCalendarPage.vue'
```

**Step 3: Verify no errors**

Run: `yarn nuxi typecheck`
Expected: No errors

**Step 4: Commit**

```bash
git add lib-modules/content-calendar/
git commit -m "feat(content-calendar): add ContentCalendarPage main component"
```

---

## Task 15: Create page route

**Files:**
- Create: `pages/ideas.vue`

**Step 1: Create page that renders ContentCalendarPage**

```vue
<!-- pages/ideas.vue -->
<script setup lang="ts">
import { ContentCalendarPage } from '~/lib-modules/content-calendar'

// Desktop only - show message on mobile
const isMobile = ref(false)

onMounted(() => {
  isMobile.value = window.innerWidth < 1024
})

definePageMeta({
  layout: false
})

useSeoMeta({
  title: 'Идеи — Контент-календарь | Writelo',
  description: 'Планируйте контент для социальных сетей с помощью удобного календаря'
})
</script>

<template>
  <!-- Mobile blocker -->
  <div
    v-if="isMobile"
    class="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 text-center"
  >
    <div class="text-4xl mb-4">💻</div>
    <h1 class="text-xl font-bold text-zinc-100 mb-2">Откройте на компьютере</h1>
    <p class="text-zinc-400 max-w-xs">
      Контент-календарь оптимизирован для работы на большом экране
    </p>
    <NuxtLink
      to="/landing"
      class="mt-6 px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg text-white transition-colors"
    >
      На главную
    </NuxtLink>
  </div>

  <!-- Desktop view -->
  <ContentCalendarPage v-else />
</template>
```

**Step 2: Verify page renders**

Run: `yarn dev`
Navigate to: `http://localhost:3000/ideas`
Expected: Calendar page loads without errors

**Step 3: Commit**

```bash
git add pages/ideas.vue
git commit -m "feat: add /ideas page with content calendar"
```

---

## Task 16: Add link to landing header

**Files:**
- Modify: `components/landing/LandingPage.vue`

**Step 1: Find navigation links in landing header**

Read the file to locate the header navigation section.

**Step 2: Add "Идеи" link to navigation**

Add a link to `/ideas` in the header navigation, next to existing links like Features and Pricing.

Example addition:
```vue
<NuxtLink to="/ideas" class="text-zinc-400 hover:text-white transition-colors">
  Идеи
</NuxtLink>
```

**Step 3: Verify link works**

Navigate to landing page, click "Идеи" link.
Expected: Navigates to `/ideas` page.

**Step 4: Commit**

```bash
git add components/landing/LandingPage.vue
git commit -m "feat(landing): add Ideas link to navigation"
```

---

## Task 17: Add demo images (optional)

**Files:**
- Create: `public/demo/` directory with placeholder images

**Step 1: Create placeholder images or use external URLs**

For demo purposes, either:
- Add actual images to `public/demo/`
- Or update demoData.ts to use placeholder URLs like `https://placehold.co/600x400`

**Step 2: Update demo data if needed**

Replace image paths with working URLs.

**Step 3: Commit**

```bash
git add public/demo/ lib-modules/content-calendar/data/demoData.ts
git commit -m "feat(content-calendar): add demo images"
```

---

## Final verification

**Step 1: Run full typecheck**

```bash
yarn nuxi typecheck
```
Expected: No errors

**Step 2: Run dev server and test**

```bash
yarn dev
```

Test checklist:
- [ ] `/ideas` page loads
- [ ] Project selector works
- [ ] Social filters toggle correctly
- [ ] Calendar shows posts as colored dots
- [ ] Clicking day opens detail panel
- [ ] Clicking post opens preview panel
- [ ] Tabs in preview switch between networks
- [ ] ESC closes panels
- [ ] Month navigation works
- [ ] Mobile shows "Open on desktop" message

**Step 3: Final commit**

```bash
git add .
git commit -m "feat(content-calendar): complete demo implementation"
```
