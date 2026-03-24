# Landing Calendar Showcase Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add an interactive content calendar showcase to the landing page after the Hero section, framed in a browser window mockup.

**Architecture:** Create a new `LandingCalendarShowcase` component with a browser mockup frame. Modify `ContentCalendarPage` to accept a `showcaseMode` prop that uses fixed height instead of `h-screen`. Add the showcase section to `LandingPage` after Hero.

**Tech Stack:** Vue 3, Tailwind CSS, vue-i18n for translations

---

### Task 1: Add showcaseMode prop to ContentCalendarPage

**Files:**
- Modify: `lib-modules/content-calendar/components/ContentCalendarPage.vue:1-10, 231`

**Step 1: Add props definition**

In ContentCalendarPage.vue, add props after the imports (around line 10):

```vue
const props = withDefaults(defineProps<{
  showcaseMode?: boolean
}>(), {
  showcaseMode: false
})
```

**Step 2: Update root div class**

Change line 231 from:
```vue
<div class="h-screen bg-zinc-950 text-zinc-100 flex flex-col overflow-hidden">
```

To:
```vue
<div :class="[
  'bg-zinc-950 text-zinc-100 flex flex-col overflow-hidden',
  props.showcaseMode ? 'h-[700px]' : 'h-screen'
]">
```

**Step 3: Verify change works**

Run: `yarn dev`
Navigate to /ideas and verify it still works with h-screen (default behavior).

**Step 4: Commit**

```bash
git add lib-modules/content-calendar/components/ContentCalendarPage.vue
git commit -m "feat(content-calendar): add showcaseMode prop for landing embed"
```

---

### Task 2: Add i18n translations for calendar showcase

**Files:**
- Modify: `i18n/locales/ru.json`
- Modify: `i18n/locales/en.json`

**Step 1: Add Russian translations**

In `i18n/locales/ru.json`, add inside the `landing` object (after the `features` block, around line 115):

```json
    "calendar": {
      "title": "Попробуй контент-календарь",
      "description": "Планируй посты, отслеживай статусы, находи инфоповоды. Прямо сейчас — без регистрации",
      "cta": "Открыть в полном окне"
    },
```

**Step 2: Add English translations**

In `i18n/locales/en.json`, add inside the `landing` object (same location):

```json
    "calendar": {
      "title": "Try the content calendar",
      "description": "Plan posts, track statuses, find content opportunities. Right now — no signup required",
      "cta": "Open full screen"
    },
```

**Step 3: Verify JSON is valid**

Run: `yarn dev`
Check console for JSON parse errors.

**Step 4: Commit**

```bash
git add i18n/locales/ru.json i18n/locales/en.json
git commit -m "feat(i18n): add landing calendar showcase translations"
```

---

### Task 3: Create LandingCalendarShowcase component

**Files:**
- Create: `components/landing/LandingCalendarShowcase.vue`

**Step 1: Create the component file**

Create `components/landing/LandingCalendarShowcase.vue`:

```vue
<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useScrollAnimation } from '~/composables/useScrollAnimation'
import { Button } from '~/components/ui/button'
import { ContentCalendarPage } from '~/lib-modules/content-calendar'

const { t } = useI18n()
const router = useRouter()
const { $trackGoal } = useNuxtApp()

const { elementRef, isVisible } = useScrollAnimation(0.1)

function handleCTA() {
  $trackGoal('landing_cta_click', { button: 'calendar_open_full' })
  router.push('/ideas')
}
</script>

<template>
  <section
    ref="elementRef"
    class="py-16 px-4"
  >
    <div
      class="max-w-7xl mx-auto transition-all duration-700 ease-out"
      :class="isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'"
    >
      <!-- Title and description -->
      <div class="text-center mb-8">
        <h2 class="text-3xl md:text-5xl font-bold mb-4 text-zinc-900 dark:text-zinc-50">
          {{ t('landing.calendar.title') }}
        </h2>
        <p class="text-lg md:text-xl text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto">
          {{ t('landing.calendar.description') }}
        </p>
      </div>

      <!-- Browser mockup -->
      <div class="rounded-xl overflow-hidden shadow-2xl shadow-purple-500/10 border border-zinc-200 dark:border-zinc-800">
        <!-- Browser top bar -->
        <div class="bg-zinc-100 dark:bg-zinc-800 px-4 py-3 flex items-center gap-4 border-b border-zinc-200 dark:border-zinc-700">
          <!-- Traffic lights -->
          <div class="flex items-center gap-2">
            <div class="w-3 h-3 rounded-full bg-red-500" />
            <div class="w-3 h-3 rounded-full bg-yellow-500" />
            <div class="w-3 h-3 rounded-full bg-green-500" />
          </div>
          <!-- Address bar -->
          <div class="flex-1 flex justify-center">
            <div class="bg-white dark:bg-zinc-900 rounded-md px-4 py-1.5 text-sm text-zinc-500 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
              writelo.app/ideas
            </div>
          </div>
          <!-- Spacer for symmetry -->
          <div class="w-[52px]" />
        </div>

        <!-- Calendar content -->
        <div class="bg-zinc-950">
          <ContentCalendarPage :showcase-mode="true" />
        </div>
      </div>

      <!-- CTA button -->
      <div class="text-center mt-8">
        <Button
          variant="outline"
          class="border-purple-500/50 text-purple-600 dark:text-purple-400 hover:bg-purple-500/10"
          @click="handleCTA"
        >
          {{ t('landing.calendar.cta') }}
        </Button>
      </div>
    </div>
  </section>
</template>
```

**Step 2: Verify component syntax**

Run: `yarn dev`
Check for compilation errors.

**Step 3: Commit**

```bash
git add components/landing/LandingCalendarShowcase.vue
git commit -m "feat(landing): add LandingCalendarShowcase component with browser mockup"
```

---

### Task 4: Add showcase section to LandingPage

**Files:**
- Modify: `components/landing/LandingPage.vue:1-12, 119-125`

**Step 1: Add import**

In `LandingPage.vue`, add after the other imports (around line 10):

```typescript
import LandingCalendarShowcase from '~/components/landing/LandingCalendarShowcase.vue'
```

**Step 2: Add showcase section after Hero**

In the template, after `<LandingHero/>` (around line 121) and before `<LandingPromoVideo/>`, add:

```vue
      <!-- Calendar Showcase -->
      <LandingCalendarShowcase />
```

**Step 3: Verify on landing page**

Run: `yarn dev`
Navigate to /landing and verify:
- Calendar showcase appears after Hero
- Browser mockup is rendered correctly
- Calendar is interactive (click days, change months, etc.)
- CTA button navigates to /ideas

**Step 4: Commit**

```bash
git add components/landing/LandingPage.vue
git commit -m "feat(landing): add calendar showcase section after hero"
```

---

### Task 5: Final verification and cleanup

**Step 1: Test full landing page flow**

Run: `yarn dev`
Navigate to /landing and verify:
- [ ] Hero section renders
- [ ] Calendar showcase appears directly after Hero
- [ ] Browser mockup has colored dots and address bar
- [ ] Calendar is fully interactive:
  - [ ] Can click on days
  - [ ] Can change months
  - [ ] Can switch projects
  - [ ] Can filter by networks/statuses/tags
  - [ ] Sidebar shows news or post details
- [ ] CTA button works and navigates to /ideas
- [ ] Other landing sections render below

**Step 2: Test mobile view**

In browser dev tools, switch to mobile viewport:
- Verify calendar section is usable (or consider hiding on mobile)

**Step 3: Test both languages**

Switch language to English and verify translations appear correctly.

**Step 4: Final commit**

```bash
git add -A
git commit -m "feat(landing): complete calendar showcase integration

- Add showcaseMode prop to ContentCalendarPage
- Create LandingCalendarShowcase with browser mockup
- Add i18n translations for ru/en
- Insert showcase section after Hero"
```

---

## Summary

| Task | Description | Files |
|------|-------------|-------|
| 1 | Add showcaseMode prop | ContentCalendarPage.vue |
| 2 | Add i18n translations | ru.json, en.json |
| 3 | Create showcase component | LandingCalendarShowcase.vue |
| 4 | Add to landing page | LandingPage.vue |
| 5 | Final verification | - |
