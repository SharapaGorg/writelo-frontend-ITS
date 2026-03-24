# Sidebar Tabs Design

## Overview

Move day details from bottom panel into the sidebar with tab-based navigation. Users can switch between day/post details and news feed.

## Problem

Currently, clicking a day opens `DayDetailPanel` at the bottom of the calendar, which requires scrolling to see. This is poor UX.

## Solution

Create a unified `SidebarContainer` component with dynamic tabs:

| State | Sidebar |
|-------|---------|
| Nothing selected | News only (no tabs) |
| Day selected | Tabs: **День** \| Новости |
| Post selected | Tabs: **Пост** \| Новости |

## Component Design

### New: SidebarContainer.vue

Location: `lib-modules/content-calendar/components/SidebarContainer.vue`

```
┌─────────────────────────────────┐
│  [День/Пост]  |  [Новости]      │  ← Tabs (only when day/post selected)
├─────────────────────────────────┤
│                                 │
│   Active tab content:           │
│   - DayDetailPanel (adapted)    │
│   - PostPreviewPanel            │
│   - NewsSidebar                 │
│                                 │
└─────────────────────────────────┘
```

### Props

```typescript
interface Props {
  // Selection state
  selectedDate: string | null
  selectedPost: CalendarPost | null

  // Day data
  postsForDate: CalendarPost[]
  infoEvents: InfoEvent[]

  // Project data
  projectTags: ContentTag[]
  news: NewsItem[]
  usedNews: Record<string, string>

  // Showcase mode (from landing page)
  showcaseMode?: boolean
}
```

### Emits

```typescript
interface Emits {
  selectPost: [postId: string]
  closeDate: []
  closePost: []
  createPost: []
  updatePost: [updates: Partial<CalendarPost>]
  deletePost: []
  createTag: [name: string]
  createChat: []
}
```

### Tab Logic

```typescript
const activeTab = ref<'context' | 'news'>('context')

// Show tabs only when something is selected
const showTabs = computed(() =>
  props.selectedDate !== null || props.selectedPost !== null
)

// First tab label depends on what's selected
const contextTabLabel = computed(() =>
  props.selectedPost ? 'Пост' : 'День'
)

// Auto-switch to context tab when selection changes
watch([() => props.selectedDate, () => props.selectedPost], () => {
  if (props.selectedDate || props.selectedPost) {
    activeTab.value = 'context'
  }
})
```

## Changes Required

### ContentCalendarPage.vue

1. **Remove** DayDetailPanel from main layout (currently below calendar grid)
2. **Replace** current sidebar logic with `<SidebarContainer />`
3. **Keep** resizable sidebar width logic (or move to SidebarContainer)

### DayDetailPanel.vue

Adapt for sidebar context:
- Remove bottom border styling
- Adjust grid layout for narrower width (1-2 columns instead of 4)
- Keep all existing functionality

## Files to Modify

| File | Action |
|------|--------|
| `SidebarContainer.vue` | Create new |
| `ContentCalendarPage.vue` | Remove DayDetailPanel, add SidebarContainer |
| `DayDetailPanel.vue` | Adapt styling for sidebar |
| `index.ts` | Export SidebarContainer (optional) |

## Behavior

1. **Initial state**: Only NewsSidebar visible, no tabs
2. **Click day**: Switch to context tab showing day details
3. **Click post**: Switch to context tab showing post preview
4. **Click News tab**: Show news, keep selection
5. **Close day/post**: Return to news-only state
