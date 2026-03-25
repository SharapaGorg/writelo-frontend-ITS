# Reels Research Feature Design

## Overview

Отдельная страница для исследования и анализа Instagram Reels с возможностью сохранения в закладки и переноса в контент-календарь.

## Requirements

- Отдельная страница `/reels-research`
- Демо данные (API позже)
- Категоризация и сортировка по метрикам (views, likes, comments)
- Минимум данных: ссылка, автор, описание, превью, метрики
- Закладки с персистенцией
- Интеграция с календарём: из закладок можно перенести рилс в календарь

## Module Structure

```
lib-modules/reels-research/
├── components/
│   ├── ReelsResearchPage.vue    # Main page
│   ├── ReelCard.vue             # Reel card component
│   ├── ReelsGrid.vue            # Grid with filtering
│   └── ReelsFilters.vue         # Filter controls
├── composables/
│   └── useReelsResearch.ts      # Business logic
├── stores/
│   └── reelsResearchStore.ts    # Pinia store (reels + bookmarks)
├── data/
│   └── demoReels.ts             # Demo data
├── types/
│   └── index.ts                 # TypeScript types
└── index.ts                     # Public API exports
```

## Types

```typescript
type ReelCategory = 'trending' | 'educational' | 'entertainment' | 'lifestyle' | 'business'

interface ReelItem {
  id: string
  url: string                    // Link to reel
  author: string                 // @username
  authorAvatar?: string          // Author avatar URL
  description: string            // Caption
  thumbnail: string              // Preview image
  views: number
  likes: number
  comments: number
  category: ReelCategory
}

interface BookmarkedReel extends ReelItem {
  bookmarkedAt: string           // ISO date when bookmarked
}
```

## Page Layout (ReelsResearchPage)

### Header
- Title: "Исследование Reels"
- Bookmark counter badge

### Filters (ReelsFilters)
- Category filter: all | trending | educational | entertainment | lifestyle | business
- Sort by: views | likes | comments (desc)

### Grid (ReelsGrid)
- 3-4 columns responsive grid
- ReelCard components

### ReelCard
- Vertical thumbnail (9:16 aspect ratio)
- Author + avatar
- Metrics row (views, likes, comments icons)
- Bookmark button (toggle)
- Click on card → opens URL in new tab

## Calendar Integration

### SidebarContainer Changes
Add new tab "Закладки" (Bookmarks) alongside existing tabs:
- Shows list of BookmarkedReel items
- Cards are draggable (same pattern as NewsSidebar)
- On drop to calendar → creates post with type 'reels'

### Post Creation from Reel
When reel is dropped on calendar date:
```typescript
{
  id: generateUUID(),
  title: reel.description.slice(0, 50),
  description: reel.description,
  type: 'reels',
  status: 'idea',
  networks: ['instagram'],
  tags: [],
  date: selectedDate,
  sourceReelId: reel.id,
  // ... other fields
}
```

## Store (reelsResearchStore)

```typescript
interface ReelsResearchState {
  reels: ReelItem[]              // All reels (demo data)
  bookmarks: BookmarkedReel[]    // Bookmarked reels
  filters: {
    category: ReelCategory | 'all'
    sortBy: 'views' | 'likes' | 'comments'
  }
}
```

Actions:
- `toggleBookmark(reelId)` - add/remove from bookmarks
- `setFilter(category)` - filter by category
- `setSortBy(field)` - change sort order

Persistence: pinia-plugin-persistedstate for bookmarks

## Demo Data

~15-20 demo reels across categories with realistic metrics:
- Trending: high views (100K+)
- Educational: moderate engagement
- Entertainment: high likes ratio
- Lifestyle: balanced metrics
- Business: lower views, targeted

## Future Considerations (not in scope)

- AI analysis of reels (hooks, structure, virality factors)
- Real Instagram API integration
- Collections/folders for bookmarks
- Notes/tags on bookmarked reels
