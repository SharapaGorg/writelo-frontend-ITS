# Add Post Button Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add "+" buttons to create posts directly in calendar cells and day detail panel.

**Architecture:** Add createPost emit to DayCell and DayDetailPanel, handle in ContentCalendarPage with existing createPost() from composable, auto-select new post to open editor.

**Tech Stack:** Vue 3, TypeScript, Tailwind CSS

---

### Task 1: Add "+" button to DayCell

**Files:**
- Modify: `lib-modules/content-calendar/components/DayCell.vue`

**Step 1: Add hover state ref**

In `<script setup>`, add:
```typescript
const isHovered = ref(false)
```

**Step 2: Add createPost emit**

Update emits:
```typescript
const emit = defineEmits<{
  select: [date: string]
  dropNews: [date: string, news: NewsItem]
  createPost: [date: string]
}>()
```

**Step 3: Add mouse event handlers to button**

On the root `<button>`, add:
```
@mouseenter="isHovered = true"
@mouseleave="isHovered = false"
```

**Step 4: Add "+" button in template**

In the top row div (after social network icons div), add the "+" button:
```vue
<!-- Add post button -->
<button
  v-if="isCurrentMonth"
  :class="[
    'w-5 h-5 rounded-full bg-zinc-700 hover:bg-purple-600 text-white flex items-center justify-center text-sm font-bold transition-all',
    isHovered ? 'opacity-100' : 'opacity-0'
  ]"
  @click.stop="emit('createPost', date)"
  title="Создать пост"
>
  +
</button>
```

**Step 5: Verify visually**

Run: `yarn dev`
Expected: "+" appears on hover in day cells, only for current month days.

**Step 6: Commit**

```bash
git add lib-modules/content-calendar/components/DayCell.vue
git commit -m "feat(content-calendar): add create post button to day cell"
```

---

### Task 2: Add "+" button to DayDetailPanel

**Files:**
- Modify: `lib-modules/content-calendar/components/DayDetailPanel.vue`

**Step 1: Add createPost emit**

Update emits:
```typescript
const emit = defineEmits<{
  selectPost: [postId: string]
  close: []
  createPost: []
}>()
```

**Step 2: Add "+" button in header**

In the header div, between the date/funDay container and close button, add:
```vue
<button
  class="w-7 h-7 rounded-full bg-purple-600 hover:bg-purple-500 text-white flex items-center justify-center text-lg font-bold transition-colors"
  @click="emit('createPost')"
  title="Создать пост"
>
  +
</button>
```

**Step 3: Verify visually**

Run: `yarn dev`
Expected: Purple "+" button visible in day detail panel header.

**Step 4: Commit**

```bash
git add lib-modules/content-calendar/components/DayDetailPanel.vue
git commit -m "feat(content-calendar): add create post button to day detail panel"
```

---

### Task 3: Wire up handlers in ContentCalendarPage

**Files:**
- Modify: `lib-modules/content-calendar/components/ContentCalendarPage.vue`

**Step 1: Add handleCreatePost function**

After `handleNewsDropOnDate` function, add:
```typescript
function handleCreatePost(date: string) {
  const newPost = createPost({
    title: 'Новый пост',
    type: 'post',
    status: 'idea',
    networks: ['vk', 'telegram'],
    tags: [],
    date: date,
    previews: {}
  })

  if (newPost) {
    selectDate(date)
    selectPost(newPost.id)
  }
}
```

**Step 2: Update CalendarGrid to forward createPost event**

The CalendarGrid passes events from DayCell. Check if it needs updating.

Read: `lib-modules/content-calendar/components/CalendarGrid.vue`

**Step 3: Add @create-post handler to CalendarGrid**

In template, update CalendarGrid:
```vue
<CalendarGrid
  ...
  @create-post="handleCreatePost"
/>
```

**Step 4: Add @create-post handler to DayDetailPanel**

In template, update DayDetailPanel:
```vue
<DayDetailPanel
  v-if="selectedDate"
  ...
  @create-post="handleCreatePost(selectedDate!)"
/>
```

**Step 5: Test full flow**

Run: `yarn dev`
1. Hover over day cell → click "+" → post created, panel opens
2. Click day → in detail panel click "+" → post created, editor opens

**Step 6: Commit**

```bash
git add lib-modules/content-calendar/components/ContentCalendarPage.vue
git commit -m "feat(content-calendar): wire up create post handlers"
```

---

### Task 4: Update CalendarGrid to forward createPost event

**Files:**
- Modify: `lib-modules/content-calendar/components/CalendarGrid.vue`

**Step 1: Add createPost emit**

Add to emits:
```typescript
createPost: [date: string]
```

**Step 2: Forward event from DayCell**

On DayCell component, add:
```
@create-post="emit('createPost', $event)"
```

**Step 3: Commit**

```bash
git add lib-modules/content-calendar/components/CalendarGrid.vue
git commit -m "feat(content-calendar): forward createPost event from grid"
```

---

### Task 5: Final verification and cleanup

**Step 1: Full flow test**

1. Open calendar page
2. Hover day cell → "+" appears → click → post created, editor opens
3. Click different day → detail panel opens → click "+" → post created
4. Verify post has correct date, status "idea", title "Новый пост"

**Step 2: Final commit if any fixes needed**

```bash
git add -A
git commit -m "fix(content-calendar): polish create post flow"
```
