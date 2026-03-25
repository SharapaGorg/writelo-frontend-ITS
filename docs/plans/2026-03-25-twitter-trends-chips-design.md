# Twitter Trends Chips in News Sidebar

## Overview

Add Twitter trends as draggable chips at the top of the existing "News" tab in the calendar sidebar. Trends can be dragged to calendar cells to create post ideas.

## Requirements

- Display Twitter trends as horizontal scrollable chips
- Each chip shows: hashtag/name + tweet count
- Chips are draggable to calendar cells
- When dropped, creates a post with status "idea"
- Used trends show a checkmark indicator
- Mock data for demo purposes

## UI Structure

```
Tab "Новости"
├── TrendsSection (top)
│   └── Horizontal scroll with TrendChip components
│       [#AI 12K] [#Marketing 8K] [GPT-5 5K] ...
│
└── News list (below, existing)
    └── NewsCard components
```

## Data Model

```typescript
interface TrendItem {
  id: string
  name: string           // "#AI" or "Artificial Intelligence"
  hashtag?: string       // "#AI" (if applicable)
  tweetsCount: number    // 12500
  category: string       // "Технологии", "Бизнес", etc.
  url: string            // Link to Twitter thread
}
```

## New Components

### TrendChip.vue
- Compact chip component
- Draggable (HTML5 drag-drop)
- Shows name + formatted count (12.5K)
- Blue background by default
- Green background with checkmark when used
- Click opens URL in new tab

### TrendsSection.vue
- Horizontal scrollable container
- Contains TrendChip components
- Section header "Тренды Twitter"

## Component Changes

### NewsSidebar.vue
- Add TrendsSection at the top
- Pass trends data and used state

### useContentCalendar.ts
- Add `trends` array to project data
- Add `usedTrends` tracking (similar to `usedNews`)
- Add `markTrendAsUsed(trendId, date)` method

### DayCell.vue
- Handle trend drop (same as news drop)

### ContentCalendarPage.vue
- Handle trend-to-post conversion on drop

## Drag-Drop Behavior

1. User drags TrendChip to DayCell
2. DayCell emits drop event with trend data
3. ContentCalendarPage creates post:
   - title: trend name (with hashtag)
   - description: trend URL
   - status: 'idea'
   - date: target cell date
4. markTrendAsUsed(trendId, date) called
5. TrendChip updates to show green "used" state

## Chip Styling

```
Default state:
┌─────────────────┐
│ #AI       12.5K │  ← blue bg (bg-blue-500), white text
└─────────────────┘

Used state:
┌─────────────────┐
│ ✓ #AI     12.5K │  ← green bg (bg-emerald-500), white text
└─────────────────┘
```

## Mock Data

Add 10-15 example trends to demoData.ts:
- Technology: #AI, #GPT5, #WebDev
- Marketing: #ContentMarketing, #SEO
- Business: #Startup, #Funding
- General: trending topics

## Files to Modify/Create

**Create:**
- `components/TrendChip.vue`
- `components/TrendsSection.vue`

**Modify:**
- `types/index.ts` - add TrendItem interface
- `data/demoData.ts` - add mock trends
- `composables/useContentCalendar.ts` - add trends state/methods
- `components/NewsSidebar.vue` - integrate TrendsSection
- `components/DayCell.vue` - handle trend drops
- `components/ContentCalendarPage.vue` - trend-to-post conversion
