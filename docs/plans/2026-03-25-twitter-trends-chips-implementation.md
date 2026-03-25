# Twitter Trends Chips Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add Twitter trends as draggable chips at the top of the News sidebar tab, allowing users to drag them onto calendar cells to create post ideas.

**Architecture:** Extend the existing NewsSidebar component by adding a TrendsSection at the top with horizontally scrollable TrendChip components. Reuse the existing drag-drop infrastructure from NewsCard/DayCell. Add TrendItem type and usedTrends tracking similar to existing usedNews pattern.

**Tech Stack:** Vue 3, TypeScript, Tailwind CSS, HTML5 Drag & Drop API

---

## Task 1: Add TrendItem Type

**Files:**
- Modify: `lib-modules/content-calendar/types/index.ts:48-55`

**Step 1: Add TrendItem interface after NewsItem**

In `lib-modules/content-calendar/types/index.ts`, add the new interface after `NewsItem`:

```typescript
export interface TrendItem {
  id: string
  name: string           // "#AI" or "Artificial Intelligence"
  hashtag?: string       // "#AI" (optional, if different from name)
  tweetsCount: number    // 12500
  category: string       // "Технологии", "Бизнес", etc.
  url: string            // Link to Twitter thread
}
```

**Step 2: Update DemoProject interface to include trends**

In the same file, add `trends` array to `DemoProject`:

```typescript
export interface DemoProject {
  id: string
  name: string
  tags: ContentTag[]
  posts: CalendarPost[]
  infoEvents: InfoEvent[]
  news: NewsItem[]
  trends: TrendItem[]  // Add this line
}
```

**Step 3: Commit**

```bash
git add lib-modules/content-calendar/types/index.ts
git commit -m "feat(content-calendar): add TrendItem type and extend DemoProject"
```

---

## Task 2: Add Mock Trend Data

**Files:**
- Modify: `lib-modules/content-calendar/data/demoData.ts`

**Step 1: Add trends array to each project**

For `coffee-shop` project, add after `news` array:

```typescript
trends: [
  {
    id: 'tr-cs-1',
    name: '#CoffeeTrends',
    hashtag: '#CoffeeTrends',
    tweetsCount: 15200,
    category: 'Еда и напитки',
    url: 'https://twitter.com/search?q=%23CoffeeTrends'
  },
  {
    id: 'tr-cs-2',
    name: '#SpecialtyCoffee',
    hashtag: '#SpecialtyCoffee',
    tweetsCount: 8400,
    category: 'Еда и напитки',
    url: 'https://twitter.com/search?q=%23SpecialtyCoffee'
  },
  {
    id: 'tr-cs-3',
    name: '#MorningRoutine',
    hashtag: '#MorningRoutine',
    tweetsCount: 42300,
    category: 'Лайфстайл',
    url: 'https://twitter.com/search?q=%23MorningRoutine'
  },
  {
    id: 'tr-cs-4',
    name: '#SmallBusiness',
    hashtag: '#SmallBusiness',
    tweetsCount: 28900,
    category: 'Бизнес',
    url: 'https://twitter.com/search?q=%23SmallBusiness'
  },
  {
    id: 'tr-cs-5',
    name: 'Латте арт',
    tweetsCount: 5600,
    category: 'Творчество',
    url: 'https://twitter.com/search?q=latte%20art'
  }
]
```

For `blogger-anya` project:

```typescript
trends: [
  {
    id: 'tr-ba-1',
    name: '#OOTD',
    hashtag: '#OOTD',
    tweetsCount: 89200,
    category: 'Мода',
    url: 'https://twitter.com/search?q=%23OOTD'
  },
  {
    id: 'tr-ba-2',
    name: '#ContentCreator',
    hashtag: '#ContentCreator',
    tweetsCount: 34500,
    category: 'Блогинг',
    url: 'https://twitter.com/search?q=%23ContentCreator'
  },
  {
    id: 'tr-ba-3',
    name: '#SkinCare',
    hashtag: '#SkinCare',
    tweetsCount: 67800,
    category: 'Красота',
    url: 'https://twitter.com/search?q=%23SkinCare'
  },
  {
    id: 'tr-ba-4',
    name: '#TravelBlogger',
    hashtag: '#TravelBlogger',
    tweetsCount: 23400,
    category: 'Путешествия',
    url: 'https://twitter.com/search?q=%23TravelBlogger'
  },
  {
    id: 'tr-ba-5',
    name: 'Весенний макияж',
    tweetsCount: 12100,
    category: 'Красота',
    url: 'https://twitter.com/search?q=spring%20makeup'
  }
]
```

For `electronics-store` project:

```typescript
trends: [
  {
    id: 'tr-es-1',
    name: '#TechNews',
    hashtag: '#TechNews',
    tweetsCount: 156000,
    category: 'Технологии',
    url: 'https://twitter.com/search?q=%23TechNews'
  },
  {
    id: 'tr-es-2',
    name: '#AI',
    hashtag: '#AI',
    tweetsCount: 892000,
    category: 'Технологии',
    url: 'https://twitter.com/search?q=%23AI'
  },
  {
    id: 'tr-es-3',
    name: '#Gadgets',
    hashtag: '#Gadgets',
    tweetsCount: 45600,
    category: 'Технологии',
    url: 'https://twitter.com/search?q=%23Gadgets'
  },
  {
    id: 'tr-es-4',
    name: '#SmartHome',
    hashtag: '#SmartHome',
    tweetsCount: 34200,
    category: 'Технологии',
    url: 'https://twitter.com/search?q=%23SmartHome'
  },
  {
    id: 'tr-es-5',
    name: 'iPhone 17',
    tweetsCount: 234000,
    category: 'Гаджеты',
    url: 'https://twitter.com/search?q=iPhone%2017'
  }
]
```

**Step 2: Commit**

```bash
git add lib-modules/content-calendar/data/demoData.ts
git commit -m "feat(content-calendar): add mock Twitter trends data"
```

---

## Task 3: Add usedTrends Tracking to Composable

**Files:**
- Modify: `lib-modules/content-calendar/composables/useContentCalendar.ts`

**Step 1: Add usedTrends ref after usedNews**

At line ~19, add:

```typescript
// Track which trends have been used (trendId -> date)
const usedTrends = ref<Record<string, string>>({})
```

**Step 2: Reset usedTrends when project changes**

In the `watch(selectedProjectId, ...)` callback (~line 27), add:

```typescript
watch(selectedProjectId, () => {
  activeTags.value = []
  usedNews.value = {}
  usedTrends.value = {}  // Add this line
})
```

**Step 3: Add markTrendAsUsed function**

After `markNewsAsUsed` function (~line 165):

```typescript
function markTrendAsUsed(trendId: string, date: string) {
  usedTrends.value[trendId] = date
}

function getTrendUsedDate(trendId: string): string | null {
  return usedTrends.value[trendId] || null
}
```

**Step 4: Clear trend tracking on post delete**

In `deletePost` function, add after the news tracking check:

```typescript
// Clear trend tracking if this post was created from a trend
if (post.sourceTrendId && usedTrends.value[post.sourceTrendId]) {
  delete usedTrends.value[post.sourceTrendId]
}
```

**Step 5: Export new items**

Add to the return statement:

```typescript
return {
  // ... existing exports ...
  usedTrends,
  markTrendAsUsed,
  getTrendUsedDate
}
```

**Step 6: Commit**

```bash
git add lib-modules/content-calendar/composables/useContentCalendar.ts
git commit -m "feat(content-calendar): add usedTrends tracking"
```

---

## Task 4: Add sourceTrendId to CalendarPost Type

**Files:**
- Modify: `lib-modules/content-calendar/types/index.ts:22-39`

**Step 1: Add sourceTrendId field**

In `CalendarPost` interface, add after `sourceNewsId`:

```typescript
sourceTrendId?: string // Link to trend item this was created from
```

**Step 2: Commit**

```bash
git add lib-modules/content-calendar/types/index.ts
git commit -m "feat(content-calendar): add sourceTrendId to CalendarPost"
```

---

## Task 5: Create TrendChip Component

**Files:**
- Create: `lib-modules/content-calendar/components/TrendChip.vue`

**Step 1: Create the component file**

```vue
<script setup lang="ts">
import { computed } from 'vue'
import type { TrendItem } from '../types'

const props = defineProps<{
  trend: TrendItem
  usedDate?: string
}>()

const formattedCount = computed(() => {
  const count = props.trend.tweetsCount
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`
  }
  return count.toString()
})

const formattedUsedDate = computed(() => {
  if (!props.usedDate) return null
  const d = new Date(props.usedDate)
  return d.toLocaleDateString('ru', { day: 'numeric', month: 'short' })
})

const displayName = computed(() => {
  return props.trend.hashtag || props.trend.name
})

function handleDragStart(e: DragEvent) {
  if (e.dataTransfer) {
    e.dataTransfer.effectAllowed = 'copy'
    e.dataTransfer.setData('application/json', JSON.stringify({
      ...props.trend,
      _type: 'trend'  // Mark as trend for drop handler
    }))
    e.dataTransfer.setData('text/plain', props.trend.name)
  }
}

function handleClick() {
  if (props.trend.url) {
    window.open(props.trend.url, '_blank')
  }
}
</script>

<template>
  <div
    :class="[
      'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium cursor-grab active:cursor-grabbing transition-all whitespace-nowrap',
      usedDate
        ? 'bg-emerald-500 text-white'
        : 'bg-blue-500 text-white hover:bg-blue-600'
    ]"
    draggable="true"
    :title="usedDate ? `Добавлено ${formattedUsedDate}` : `${trend.category} • ${trend.tweetsCount.toLocaleString()} твитов`"
    @dragstart="handleDragStart"
    @click="handleClick"
  >
    <!-- Checkmark for used state -->
    <svg
      v-if="usedDate"
      class="w-3.5 h-3.5 flex-shrink-0"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="3"
    >
      <path d="M5 13l4 4L19 7" />
    </svg>

    <span class="truncate max-w-[120px]">{{ displayName }}</span>
    <span class="text-white/80 text-xs">{{ formattedCount }}</span>
  </div>
</template>
```

**Step 2: Commit**

```bash
git add lib-modules/content-calendar/components/TrendChip.vue
git commit -m "feat(content-calendar): create TrendChip component"
```

---

## Task 6: Create TrendsSection Component

**Files:**
- Create: `lib-modules/content-calendar/components/TrendsSection.vue`

**Step 1: Create the component file**

```vue
<script setup lang="ts">
import TrendChip from './TrendChip.vue'
import type { TrendItem } from '../types'

defineProps<{
  trends: TrendItem[]
  usedTrends: Record<string, string>
}>()
</script>

<template>
  <div class="border-b border-zinc-200 dark:border-zinc-800">
    <div class="px-4 py-2">
      <div class="flex items-center gap-2 mb-2">
        <svg class="w-4 h-4 text-blue-400" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
        <h4 class="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
          Тренды Twitter
        </h4>
      </div>
      <div class="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-zinc-300 dark:scrollbar-thumb-zinc-600 scrollbar-track-transparent">
        <TrendChip
          v-for="trend in trends"
          :key="trend.id"
          :trend="trend"
          :used-date="usedTrends[trend.id]"
        />
      </div>
    </div>
  </div>
</template>
```

**Step 2: Commit**

```bash
git add lib-modules/content-calendar/components/TrendsSection.vue
git commit -m "feat(content-calendar): create TrendsSection component"
```

---

## Task 7: Integrate TrendsSection into NewsSidebar

**Files:**
- Modify: `lib-modules/content-calendar/components/NewsSidebar.vue`

**Step 1: Import TrendsSection and update props**

Replace the script section:

```vue
<script setup lang="ts">
import NewsCard from './NewsCard.vue'
import TrendsSection from './TrendsSection.vue'
import type { NewsItem, TrendItem } from '../types'

const props = defineProps<{
  news: NewsItem[]
  usedNews: Record<string, string>
  trends: TrendItem[]
  usedTrends: Record<string, string>
}>()
</script>
```

**Step 2: Add TrendsSection to template**

Replace the template:

```vue
<template>
  <aside class="w-full h-full bg-zinc-100/50 dark:bg-zinc-900/50 flex flex-col overflow-hidden">
    <!-- Trends Section -->
    <TrendsSection
      v-if="trends.length > 0"
      :trends="trends"
      :used-trends="usedTrends"
    />

    <!-- News Section -->
    <div class="px-4 py-3 border-b border-zinc-200 dark:border-zinc-800">
      <h3 class="text-sm font-medium text-zinc-700 dark:text-zinc-300">Новости отрасли</h3>
      <p class="text-xs text-zinc-500 mt-0.5">Перетащите в календарь для создания идеи</p>
    </div>
    <div class="flex-1 overflow-y-auto p-3 space-y-2 min-h-0 scrollbar-thin scrollbar-thumb-zinc-300 dark:scrollbar-thumb-zinc-600 scrollbar-track-transparent">
      <NewsCard
        v-for="item in news"
        :key="item.id"
        :news="item"
        :used-date="usedNews[item.id]"
      />
    </div>
  </aside>
</template>
```

**Step 3: Commit**

```bash
git add lib-modules/content-calendar/components/NewsSidebar.vue
git commit -m "feat(content-calendar): integrate TrendsSection into NewsSidebar"
```

---

## Task 8: Update DayCell to Handle Trend Drops

**Files:**
- Modify: `lib-modules/content-calendar/components/DayCell.vue`

**Step 1: Import TrendItem type**

Update the import:

```typescript
import type { CalendarPost, SocialNetwork, NewsItem, TrendItem } from '../types'
```

**Step 2: Add dropTrend emit**

Update emits:

```typescript
const emit = defineEmits<{
  select: [date: string]
  dropNews: [date: string, news: NewsItem]
  dropTrend: [date: string, trend: TrendItem]
  createPost: [date: string]
}>()
```

**Step 3: Update handleDrop to differentiate news vs trend**

Replace the handleDrop function:

```typescript
function handleDrop(e: DragEvent) {
  e.preventDefault()
  isDragOver.value = false

  if (e.dataTransfer) {
    const jsonData = e.dataTransfer.getData('application/json')
    if (jsonData) {
      try {
        const data = JSON.parse(jsonData)
        if (data._type === 'trend') {
          // Remove the _type marker before emitting
          const { _type, ...trend } = data
          emit('dropTrend', props.date, trend as TrendItem)
        } else {
          emit('dropNews', props.date, data as NewsItem)
        }
      } catch (err) {
        console.error('Failed to parse dropped data', err)
      }
    }
  }
}
```

**Step 4: Commit**

```bash
git add lib-modules/content-calendar/components/DayCell.vue
git commit -m "feat(content-calendar): handle trend drops in DayCell"
```

---

## Task 9: Update ContentCalendarPage to Wire Everything

**Files:**
- Modify: `lib-modules/content-calendar/components/ContentCalendarPage.vue`

**Step 1: Read the file to understand structure**

First, read the current ContentCalendarPage.vue to understand its structure before making changes.

**Step 2: Add trend handling**

In the script section, add the `handleDropTrend` function (similar to `handleDropNews`):

```typescript
function handleDropTrend(date: string, trend: TrendItem) {
  // Create a new post from the trend
  const newPost = createPost({
    title: trend.hashtag || trend.name,
    description: trend.url,
    type: 'post',
    status: 'idea',
    networks: [],
    tags: [],
    date: date,
    sourceTrendId: trend.id,
    previews: {}
  })

  if (newPost) {
    markTrendAsUsed(trend.id, date)
    selectDate(date)
    selectPost(newPost.id)
  }
}
```

**Step 3: Pass trends and usedTrends to NewsSidebar**

Update the NewsSidebar component usage in the template:

```vue
<NewsSidebar
  :news="currentProject.news"
  :used-news="usedNews"
  :trends="currentProject.trends"
  :used-trends="usedTrends"
/>
```

**Step 4: Add dropTrend handler to DayCell**

Update DayCell usage in CalendarGrid or wherever it's rendered:

```vue
<DayCell
  ...existing-props...
  @drop-trend="handleDropTrend"
/>
```

**Step 5: Import TrendItem type and destructure new composable exports**

Add to imports:

```typescript
import type { TrendItem } from '../types'
```

Destructure from composable:

```typescript
const {
  // ...existing...
  usedTrends,
  markTrendAsUsed
} = useContentCalendar()
```

**Step 6: Commit**

```bash
git add lib-modules/content-calendar/components/ContentCalendarPage.vue
git commit -m "feat(content-calendar): wire trend drops in ContentCalendarPage"
```

---

## Task 10: Update CalendarGrid if Needed

**Files:**
- Check: `lib-modules/content-calendar/components/CalendarGrid.vue`

**Step 1: Check if CalendarGrid passes events from DayCell**

Read CalendarGrid.vue to see if it passes the dropTrend event from DayCell to parent. If it does, add the new event.

**Step 2: Add dropTrend emit if needed**

If CalendarGrid wraps DayCell, add:

```typescript
const emit = defineEmits<{
  // ...existing emits...
  dropTrend: [date: string, trend: TrendItem]
}>()
```

And pass it through:

```vue
<DayCell
  ...
  @drop-trend="(date, trend) => emit('dropTrend', date, trend)"
/>
```

**Step 3: Commit if changes made**

```bash
git add lib-modules/content-calendar/components/CalendarGrid.vue
git commit -m "feat(content-calendar): pass dropTrend event through CalendarGrid"
```

---

## Task 11: Export New Components from Index

**Files:**
- Modify: `lib-modules/content-calendar/index.ts`

**Step 1: Read current exports**

Check what's currently exported.

**Step 2: Add new component exports if using named exports**

```typescript
export { default as TrendChip } from './components/TrendChip.vue'
export { default as TrendsSection } from './components/TrendsSection.vue'
```

**Step 3: Export TrendItem type**

```typescript
export type { TrendItem } from './types'
```

**Step 4: Commit**

```bash
git add lib-modules/content-calendar/index.ts
git commit -m "feat(content-calendar): export TrendChip, TrendsSection, TrendItem"
```

---

## Task 12: Manual Testing

**Step 1: Start dev server**

```bash
yarn dev
```

**Step 2: Test checklist**

- [ ] Navigate to content calendar page
- [ ] Verify TrendsSection appears above news in the sidebar
- [ ] Check that chips display name + tweet count (e.g., "#AI 892K")
- [ ] Verify horizontal scroll works when many trends
- [ ] Drag a trend chip to a calendar cell
- [ ] Verify post is created with "idea" status
- [ ] Check that trend chip turns green with checkmark
- [ ] Click on a used trend chip tooltip shows date
- [ ] Click on unused trend opens Twitter URL in new tab
- [ ] Switch projects, verify trends change
- [ ] Delete a post created from trend, verify chip returns to blue

**Step 3: Final commit if any fixes needed**

```bash
git add -A
git commit -m "fix(content-calendar): address issues from manual testing"
```

---

## Summary

| Task | Description | Files |
|------|-------------|-------|
| 1 | Add TrendItem type | types/index.ts |
| 2 | Add mock trend data | data/demoData.ts |
| 3 | Add usedTrends tracking | composables/useContentCalendar.ts |
| 4 | Add sourceTrendId to CalendarPost | types/index.ts |
| 5 | Create TrendChip component | components/TrendChip.vue |
| 6 | Create TrendsSection component | components/TrendsSection.vue |
| 7 | Integrate into NewsSidebar | components/NewsSidebar.vue |
| 8 | Update DayCell for trend drops | components/DayCell.vue |
| 9 | Wire everything in ContentCalendarPage | components/ContentCalendarPage.vue |
| 10 | Update CalendarGrid if needed | components/CalendarGrid.vue |
| 11 | Export from index | index.ts |
| 12 | Manual testing | - |
