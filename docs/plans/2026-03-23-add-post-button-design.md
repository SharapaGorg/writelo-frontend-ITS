# Add Post Button Design

## Overview

Add a "+" button to create posts directly in the content calendar without dragging news items.

## Problem

Currently posts can only be created by dragging news from the sidebar onto a calendar day. Users need a direct way to create empty posts.

## Solution

Add "+" buttons in two locations:
1. In each calendar day cell (DayCell)
2. In the day detail panel header (DayDetailPanel)

## Design Details

### DayCell — "+" button in top-right corner

**Location:** Top row, left of social network icons (VK, YouTube, etc.)

**Appearance:**
- Circular button 20x20px (w-5 h-5)
- Color: `bg-zinc-700 hover:bg-purple-600`
- Icon: white "+"
- Visible only on hover (opacity-0 → opacity-100 transition)
- On mobile: always visible (no hover)

**Behavior:**
- `@click.stop` to prevent date selection
- Emits `createPost: [date: string]`

### DayDetailPanel — "+" button in header

**Location:** Header row, between date/fun day badge and close button "✕"

**Appearance:**
- Circular button 28x28px (w-7 h-7)
- Style: `bg-purple-600 hover:bg-purple-500 text-white rounded-full`
- Icon: "+"

**Behavior:**
- Emits `createPost: []` (date known from props)

### Post Creation Logic

When "+" is clicked:
1. Call `createPost()` with defaults:
   ```ts
   {
     title: 'Новый пост',
     type: 'post',
     status: 'idea',
     networks: ['vk', 'telegram'],
     tags: [],
     date: selectedDate,
     previews: {}
   }
   ```
2. Select created post via `selectPost(newPost.id)`
3. PostPreviewPanel opens for editing

### Data Flow

- DayCell emits `createPost` → ContentCalendarPage handles
- DayDetailPanel emits `createPost` → ContentCalendarPage handles
- Single function `handleCreatePost(date: string)` in ContentCalendarPage

## Files to Modify

1. `lib-modules/content-calendar/components/DayCell.vue` — add "+" button
2. `lib-modules/content-calendar/components/DayDetailPanel.vue` — add "+" button
3. `lib-modules/content-calendar/components/ContentCalendarPage.vue` — add handler
