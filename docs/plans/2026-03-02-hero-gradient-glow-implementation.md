# Hero Gradient Glow Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Добавить градиенты, свечение и фоновый blob в Hero-секцию лендинга.

**Architecture:** Чистые CSS/Tailwind изменения в одном файле. Градиентный текст через bg-clip-text, glow через box-shadow, blob через absolute-positioned div с blur.

**Tech Stack:** Tailwind CSS, Vue 3

---

## Task 1: Add Gradient Text to Headline

**Files:**
- Modify: `pages/landing.vue:18-21`

**Step 1: Update the headline span with gradient classes**

Change line 20 from:
```vue
<span class="text-muted-foreground">за минуты, не часы</span>
```

To:
```vue
<span class="bg-gradient-to-r from-purple-500 to-indigo-500 bg-clip-text text-transparent">за минуты, не часы</span>
```

**Step 2: Verify in browser**

Run: `yarn dev`
Navigate to: `http://localhost:3000/landing`
Expected: Second line of headline shows purple→indigo gradient text

**Step 3: Commit**

```bash
git add pages/landing.vue
git commit -m "feat(landing): add gradient text to hero headline"
```

---

## Task 2: Add Glowing CTA Button

**Files:**
- Modify: `pages/landing.vue:29`

**Step 1: Replace Button with gradient and glow styles**

Change lines 29-31 from:
```vue
<Button size="lg" class="text-lg px-8 py-6" @click="navigateTo('/auth')">
  Попробовать бесплатно
</Button>
```

To:
```vue
<Button
  size="lg"
  class="text-lg px-8 py-6 bg-gradient-to-r from-purple-600 to-indigo-600 border-0 shadow-[0_0_20px_rgba(139,92,246,0.5)] hover:shadow-[0_0_30px_rgba(139,92,246,0.7)] hover:scale-[1.02] transition-all duration-200"
  @click="navigateTo('/auth')"
>
  Попробовать бесплатно
</Button>
```

**Step 2: Verify in browser**

Expected: Button has purple gradient background and purple glow. On hover, glow intensifies and button slightly scales up.

**Step 3: Commit**

```bash
git add pages/landing.vue
git commit -m "feat(landing): add glowing gradient CTA button"
```

---

## Task 3: Add Background Blob

**Files:**
- Modify: `pages/landing.vue:17` (Hero section)

**Step 1: Make Hero section relative positioned**

Change line 17 from:
```vue
<section class="py-20 md:py-32 text-center">
```

To:
```vue
<section class="py-20 md:py-32 text-center relative overflow-hidden">
```

**Step 2: Add blob div inside Hero section**

Add after the opening `<section>` tag (line 18):
```vue
<!-- Background blob -->
<div class="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-[400px] h-[400px] bg-gradient-to-br from-purple-500/30 to-indigo-500/20 rounded-full blur-[100px] pointer-events-none" />
```

**Step 3: Verify in browser**

Expected: Soft purple/indigo glow visible in top-right area behind the headline. Does not interfere with text selection.

**Step 4: Commit**

```bash
git add pages/landing.vue
git commit -m "feat(landing): add gradient blob to hero background"
```

---

## Task 4: Add Second Blob for Balance (Optional)

**Files:**
- Modify: `pages/landing.vue` (Hero section)

**Step 1: Add second smaller blob on left side**

Add after the first blob div:
```vue
<div class="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-[300px] h-[300px] bg-gradient-to-tr from-indigo-500/20 to-purple-500/10 rounded-full blur-[80px] pointer-events-none" />
```

**Step 2: Verify visual balance**

Expected: Second blob creates subtle balance, hero feels more immersive.

**Step 3: Commit**

```bash
git add pages/landing.vue
git commit -m "feat(landing): add secondary blob for visual balance"
```

---

## Task 5: Final Polish and Responsive Check

**Step 1: Test on mobile viewport (375px)**

Use browser devtools, check:
- Gradient text readable
- Button glow not too intense
- Blobs don't overflow awkwardly

**Step 2: Adjust blob sizes for mobile if needed**

If blobs are too large on mobile, add responsive classes:
```vue
class="... w-[200px] md:w-[400px] h-[200px] md:h-[400px] ..."
```

**Step 3: Final commit**

```bash
git add pages/landing.vue
git commit -m "fix(landing): responsive adjustments for hero effects"
```

---

## Summary

После выполнения:
- Заголовок с градиентным текстом purple→indigo
- CTA-кнопка со свечением и hover-эффектами
- Фоновые blob-элементы для глубины
- Адаптивный дизайн для мобильных
